# Race Conditions Audit — nova-rio-backend

**Date:** 2026-06-10
**Scope:** Full `src/` of the NestJS 11 + Prisma 7 + PostgreSQL backend (20 modules, 402 TS files).
**Stack facts:** Hexagonal layout (`application` / `domain` / `dto` / `infrastructure` per module). PostgreSQL default isolation = **READ COMMITTED** (no `isolationLevel` override anywhere). Prisma client built with no `transactionOptions`.
**Method:** 6 parallel module-focused finder passes → adversarial verification of every candidate (each verifier tried to _refute_ the race by finding an existing guard: DB unique/exclusion constraint, wrapping `$transaction`, `SELECT ... FOR UPDATE`, atomic `increment`/`updateMany`, idempotency key, or app mutex). Only races that survive every guard are reported as confirmed. 33 candidates → **25 confirmed**, 8 refuted. After de-duplication across lanes: **14 distinct issues**.

---

## Executive summary

The codebase has **no optimistic-concurrency control** (no `@version` columns on any model) and uses row locking in **exactly one place** (the appointment conflict check). The dominant systemic flaw is **check-then-act**: a status/uniqueness/counter condition is read in the use-case layer, then a _separate, unconditional_ `prisma.*.update({ where: { id } })` is issued in the repository — with nothing serializing the read and the write. Under READ COMMITTED this loses the race in every concurrent path.

| #     | Issue                                                                                                | Severity   | Primary location                                                    |
| ----- | ---------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| RC-01 | Employee/client appointment **double-booking** (FOR UPDATE does not gap-lock; no DB uniqueness)      | **High**   | `prisma-appointment.repository.ts:202,221,148`                      |
| RC-02 | **Duplicate gateway charge** — external Vindi bill created in the check→insert window                | **High**   | `create-client-payment.use-case.ts:53,82`                           |
| RC-03 | Payment status **lost-update / state flip** — unconditional `update where:{id}`, no status predicate | **High**   | `prisma-payment.repository.ts:147,155`                              |
| RC-04 | **Non-idempotent webhooks** — no event-dedup store, `@SkipThrottle`, status read is the only guard   | **High**   | `vindi-webhooks.controller.ts:48` + handlers                        |
| RC-05 | **Verification code consumed more than once** → password-reset account takeover                      | **High**   | `prisma-client.repository.ts:178`                                   |
| RC-06 | **Password-reset lockout bypass** — burst beats the 5-attempt cap                                    | **High**   | `reset-password.use-case.ts:76` / `prisma-client.repository.ts:224` |
| RC-07 | **Login lockout bypass** — burst snapshots pre-lock state, gets N guesses                            | **Medium** | `login.use-case.ts:94` / `prisma-client.repository.ts:92`           |
| RC-08 | **False login lockout** — split increment/lock-set races a concurrent reset                          | **Medium** | `prisma-client.repository.ts:92`                                    |
| RC-09 | **Refresh-token reuse-detection bypass** — read-compare-write not atomic                             | **Medium** | `refresh-token.use-case.ts:39`                                      |
| RC-10 | **Two default cards** — single-default invariant has no DB constraint or lock                        | **Medium** | `prisma-card.repository.ts:55`                                      |
| RC-11 | **Appointment status TOCTOU** — cancel/complete/reschedule overwrite each other                      | **Medium** | `cancel-appointment.use-case.ts:15` + repo                          |
| RC-12 | **Client approve/reject TOCTOU** — contradictory emails, non-deterministic status                    | **Medium** | `approve-client.use-case.ts:21`                                     |
| RC-13 | **Holidays cron overlap** — no run-lock; batch upsert aborts whole month on conflict                 | **Medium** | `prisma-holiday.repository.ts:59`                                   |
| RC-14 | **Receipt orphan PDF** — check-then-act writes a PDF on the losing path                              | **Low**    | `generate-receipt.use-case.ts:24`                                   |

**Severity totals (distinct):** High = 6, Medium = 7, Low = 1. (No `critical`: the `Payment.appointmentId @unique` and `Receipt.paymentId @unique` constraints bound the financial blast radius — duplicate _DB rows_ are blocked even where the duplicate _side effect_ is not.)

---

## Cross-cutting root causes

Fixing these three patterns resolves most of the findings:

1. **Unconditional status writes (TOCTOU everywhere).** Repository transition methods do `update({ where: { id }, data: { status: X } })` with no `status` in the `WHERE`. The guard `if (row.status !== expected)` lives in the use-case on a _prior, unlocked read_. **Fix pattern:** replace with a compare-and-set `updateMany({ where: { id, status: expected }, data: {...} })`, branch on `count`, and fire side effects (emails/receipts) **only when `count === 1`**. This single pattern fixes RC-03, RC-04, RC-11, RC-12 and the second half of RC-05.

2. **No DB-enforced invariants for concurrency-sensitive uniqueness.** Double-booking (RC-01) and two-default-cards (RC-10) are app-maintained invariants with no DB constraint. `SELECT ... FOR UPDATE` cannot lock a row that does not exist yet (no gap/predicate lock under READ COMMITTED), so first-vs-first inserts both pass. **Fix pattern:** add Postgres **partial unique indexes** / **`EXCLUDE` constraints** (raw migrations — Prisma cannot express partial unique in schema) so the second commit fails atomically; catch `P2002`/`23505`/`23P01` and map to the existing domain error.

3. **External side effects sequenced outside any lock/transaction.** Payment creation (RC-02) calls the Vindi gateway _between_ a non-atomic duplicate check and the insert, and webhooks (RC-04) re-run side effects with no event-dedup. **Fix pattern:** reserve the DB row **first** (let `@unique` reject the second request before any external call), and add a `ProcessedWebhookEvent` table keyed on the gateway event id.

---

## High-severity findings

### RC-01 — Appointment double-booking (employee and client)

**Location:** `src/appointments/infrastructure/repositories/prisma-appointment.repository.ts:202` (employee), `:221` (client), `:148` (admin update). Confirmed verbatim.
**Guard present:** `$transaction` wrapping `SELECT ... FOR UPDATE` on `(employeeId|clientId, date, status='SCHEDULED')`. **Insufficient.**
**Why it fails:** PostgreSQL `SELECT ... FOR UPDATE` locks **only rows that already match** the predicate; it takes no gap/predicate lock under READ COMMITTED. There is **no `@@unique` on `(employeeId,date,startTime)`** (only `@@index([employeeId,date,status])`; migration `20260211161807_init` has only `appointments_uuid_key` and `appointments_rescheduledFromId_key`).
**Interleaving:** Employee E has no SCHEDULED appointment overlapping 09:00 on date D. Request A and Request B both target E/D/09:00. A's `FOR UPDATE` query returns ∅ (locks nothing); B's returns ∅ (not blocked — no row to lock). `assertNoTimeConflict` passes in both. Both `create`. Both commit. → two appointments in one slot. Same hole for the client path (`:221`) and for admin updates moving two appointments onto the same empty destination slot (`:148`, cross-employee case).
**Impact:** Employee/client double-booked. The conflict lock only protects the narrow case where an overlapping SCHEDULED row _already exists and stays locked_ — i.e. it adds nothing for the first booking in a slot.
**Fix:** Add a DB-enforced guarantee. Preferred for interval correctness: a `btree_gist` `EXCLUDE` constraint over `(employeeId WITH =, date WITH =, [start,end) WITH &&)` (and the same for `clientId`). If only exact-slot collisions matter: a partial unique index `CREATE UNIQUE INDEX appointments_employee_slot ON appointments("employeeId", date, "startTime") WHERE status='SCHEDULED';`. Keep the create/update inside the existing `$transaction`; catch `P2002`/`23505`/`23P01` → existing `'Employee already has an appointment at this time'`. The current `FOR UPDATE` can stay but is not sufficient alone.

### RC-02 — Duplicate gateway charge (external call in the check→insert window)

**Location:** `src/payments/application/use-cases/payment/create-client-payment.use-case.ts:53` (check) → `:82` (`createGatewayBill`) → `:107` (`createPayment`).
**Guard present:** `Payment.appointmentId @unique` + `P2002` catch. **Guards only the DB row, not the external charge.**
**Interleaving:** A and B both POST a payment for `appointmentId=42` (double-click / retry). Both pass the `findPaymentByAppointmentId → null` check (no tx, no lock). A `createGatewayBill` → Vindi bill #1 (real charge). B `createGatewayBill` → Vindi bill #2 (**second real charge**). A `createPayment` inserts. B `createPayment` hits `@unique` → `P2002` → `BadRequestException`. Net: **two Vindi bills / two PIX codes for one appointment, one DB Payment row** — the second charge is orphaned, never reconciled, never refunded.
**Impact:** Client double-charged at the gateway; the duplicate charge is invisible to the system.
**Fix:** Reserve first. Insert a `PENDING` Payment row **before** `createGatewayBill`, relying on `appointmentId @unique` to reject the second concurrent request with `P2002` _before_ any gateway call; only the winner proceeds, then updates the row with `gatewayTransactionId`/`pixCode`. Add a reconciliation job that voids Vindi bills with no matching Payment row.

### RC-03 — Payment status lost-update / state flip

**Location:** `src/payments/infrastructure/repositories/prisma-payment.repository.ts:147` (`approvePaymentById`), `:155` (`cancelPaymentById`). Confirmed verbatim — both are `prisma.payment.update({ where: { id }, data: { status } })`, **zero** `updateMany` in the repo.
**Guard present:** none for the status transition (`Receipt.paymentId @unique` only de-dupes receipt rows).
**Interleaving (flip):** Payment id=9 PENDING. `bill_paid` webhook reads PENDING; `charge_rejected`/`bill_canceled` webhook reads PENDING (neither committed yet). One writes APPROVED, the other writes CANCELLED — **last writer wins**. A genuinely-paid payment can end CANCELLED (and a cancellation email is sent for money actually charged), or a rejected charge ends APPROVED with `paidAt` set + receipt generated. Also: admin Approve racing the webhook double-applies the transition.
**Impact:** Authoritative payment state corrupted; wrong customer notifications.
**Fix:** Compare-and-set. `approvePaymentById` → `updateMany({ where: { id, status: 'PENDING' }, data: { status: 'APPROVED', paidAt: new Date() } })`; same predicate for `cancelPaymentById`. Branch on `count`; fire email/receipt only when `count === 1`. An already-terminal payment then matches 0 rows and cannot be flipped.

### RC-04 — Non-idempotent Vindi webhooks (no event-dedup boundary)

**Location:** `src/payment-gateway/vindi-webhooks.controller.ts:48` (dispatch) + `handle-vindi-bill-paid.use-case.ts:27` / `handle-vindi-charge-rejected.use-case.ts:24`.
**Guard present:** in-memory `if (status !== 'PENDING') return` on an unlocked `findFirst`; controller is `@SkipThrottle()`; `gatewayTransactionId` is **not** `@unique`; **no** `ProcessedEvent`/`IdempotencyKey` table exists.
**Interleaving:** Gateways deliver at-least-once. Two concurrent deliveries of the same `bill_paid` both read PENDING (neither committed), both approve → **two approval emails**, `paidAt` overwritten, two receipt jobs (second collides with `Receipt.paymentId @unique`, logged via the fire-and-forget `.catch`). The status guard only catches strictly _sequential_ re-delivery, not concurrent/overlapping.
**Impact:** Duplicate customer-facing financial notifications, timestamp drift, log noise. (Receipt rows are de-duped by `@unique`.)
**Fix:** (1) The RC-03 compare-and-set makes side effects fire once. (2) Add a `ProcessedWebhookEvent` model with `@@unique` on the gateway event id; insert-or-skip in `receiveVindiWebhook` before dispatch; return 200 on duplicates. (3) Make `Payment.gatewayTransactionId @unique`. **Note:** the finder's claim that a `P2002` rethrow forces redelivery was _refuted_ — receipt/email are `.catch`-swallowed and never reach the controller.

### RC-05 — Verification code consumed more than once (password-reset ATO)

**Location:** `src/auth/infrastructure/repositories/prisma-client.repository.ts:178` (`markVerificationCodeAsUsed`). Confirmed verbatim — `update({ where: { id }, data: { usedAt: new Date() } })`, no `usedAt: null` predicate. `findActiveVerificationCodes` filters `usedAt: null` at **read** time only; no `@@unique`/partial constraint on `VerificationCode`.
**Interleaving:** A and B arrive concurrently with the same valid code+email. Both `findActiveVerificationCodes` → code #7. The window between read and consume includes a **bcrypt compare + bcrypt hash (tens–hundreds of ms)** — wide and practically exploitable. Both compares match; both apply the state change. For `reset-password`, `completePasswordReset` doesn't even call `markVerificationCodeAsUsed` (it only `deleteMany`s, which can't detect a winner), so the password is set **twice** — an attacker racing a victim's legitimate reset, as last writer, sets the password to an attacker-chosen value using the victim's single code.
**Impact:** One-time-code guarantee void; account takeover surface on the reset flow.
**Fix:** Atomic compare-and-swap consume: `const { count } = updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date() } }); return count === 1;`. Callers treat `count !== 1` as `'Invalid or expired code'` and **abort before** applying the password/email change. For reset-password, track `matchedCodeId` and run the conditional consume + credential update inside one `$transaction`.

### RC-06 — Password-reset lockout bypass (burst)

**Location:** `src/auth/application/use-cases/client/reset-password.use-case.ts:76` (`checkBruteForce`) / `prisma-client.repository.ts:224` (`incrementResetAttempts`).
**Guard present:** atomic `{ increment: 1 }` keeps the counter accurate but **does not gate** concurrent requests — the decision is made on a snapshot read at request start.
**Interleaving:** Attacker fires 6+ concurrent reset requests with guessed codes for a known email. All read `failedResetAttempts < 5` / `resetLockedUntil = null`, all pass the gate, all run the bcrypt compare loop. Increments serialize _after_ all guesses are processed. The reset code is `randomInt(100000, 1000000)` (900k space, 15-min expiry) and the lockout is the only throttle.
**Impact:** Materially more than 5 guesses per window against the code space → weakened ATO control.
**Fix:** Make the gate atomic with accounting — wrap check + verify + increment in a `$transaction` with `SELECT ... FOR UPDATE` on the client row so attempts serialize and the (N+1)th sees the updated count. Add a per-IP/email `@nestjs/throttler` limit on the endpoint as defense-in-depth.

---

## Medium-severity findings

### RC-07 — Login lockout bypass (burst)

**Location:** `src/auth/application/use-cases/.../login.use-case.ts:94` / `prisma-client.repository.ts:92`.
**Interleaving:** N concurrent wrong-password logins for one email all read `lockedUntil = null`, `failedLoginAttempts = 0` via `findByEmail` at request top, all pass the gate, all run bcrypt. The lock engages only for the _next_ batch, so a single burst yields N guesses regardless of the 5-cap. Atomic increment keeps the count correct but the gate uses the stale snapshot.
**Impact:** Per-burst overshoot of the attempt cap (bounded — the 15-min lock does engage afterward).
**Fix:** `$transaction` + `SELECT ... FOR UPDATE` on the client row across read-gate-increment, or a Redis per-email mutex, plus endpoint rate limiting.

### RC-08 — False login lockout (split increment / lock-set)

**Location:** `src/auth/infrastructure/repositories/prisma-client.repository.ts:92`.
**Interleaving:** `incrementFailedLoginAttempts` does the atomic increment, reads back the count, then sets `lockedUntil` in a **separate** update. Request A (failed login) increments to 5, pauses. Request V (valid login, another tab) runs `resetFailedLoginAttempts` → count 0, `lockedUntil = null`, login succeeds. A resumes and writes `lockedUntil = now + 15min`. → `failedLoginAttempts = 0` but account locked for 15 min after a successful auth.
**Impact:** Self-inflicted DoS of a legitimate user (recoverable, auto-clears). Never _weakens_ lockout. (The finder's "lock never gets set" and "window double-extension" sub-claims were _refuted_.)
**Fix:** Single-statement raw `UPDATE ... SET failed_login_attempts = failed_login_attempts + 1, locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END WHERE id = $1` so a concurrent reset runs fully before or after. Same fix for `incrementResetAttempts` (`:224`) and `prisma-admin.repository.ts:53`.

### RC-09 — Refresh-token reuse-detection bypass

**Location:** `src/auth/application/use-cases/auth/refresh-token.use-case.ts:39`.
**Interleaving:** `getRefreshTokenAndFamily` (findUnique) → compare → `updateRefreshTokenWithFamily` (unconditional `update`, prev hash not in `WHERE`) — not atomic, not transactional. Two presentations of the same `RT0` both read the stored hash, both compare true, both rotate → two valid token pairs, neither hits `revokeTokenFamily`. Reuse detection bypassed; the legit party's new token is silently clobbered.
**Impact:** A stolen/shared refresh token survives the victim's next rotation (defense-in-depth degraded; requires an already-captured token + winning a race).
**Fix:** Compare-and-swap: `updateMany({ where: { id, refreshToken: storedHash, tokenFamily }, data: { refreshToken: newHash, tokenFamily } })`; if `count === 0` → `revokeTokenFamily` + `Unauthorized`. Wrap verify + swap in one `$transaction`. Apply in both client and admin repos.

### RC-10 — Two default cards (single-default invariant)

**Location:** `src/cards/infrastructure/repositories/prisma-card.repository.ts:55` (`switchDefaultCardById`), `:30` (`createDefaultCard`).
**Guard present:** `$transaction` gives atomicity, **not isolation**. `isDefault` is a plain Boolean; only `@@index([clientId])`, no partial unique.
**Interleaving:** Client owns A and B, neither default. R1 `switchDefault(A)`: `updateMany WHERE isDefault=true` matches 0 rows (locks nothing). R2 `switchDefault(B)`: same, 0 rows. R1 sets A=true; R2 sets B=true. → **both default**. Because the two requests set _different_ rows, row locks on the shared current-default don't serialize them.
**Impact:** Non-deterministic "default card" resolution for billing/recurrence. (Single-actor, narrow window.)
**Fix:** `CREATE UNIQUE INDEX cards_one_default_per_client ON cards("clientId") WHERE "isDefault" = true;` (raw migration). Catch `P2002`/`23505` and retry. Optionally `SELECT id FROM cards WHERE "clientId"=$1 FOR UPDATE` at the top of both methods. Apply to `createDefaultCard` too.

### RC-11 — Appointment status TOCTOU (cancel / complete / reschedule)

**Location:** `src/appointments/application/use-cases/appointment/cancel-appointment.use-case.ts:15`, `reschedule-appointment.use-case.ts:28`; repo `cancelAppointmentById`/`completeAppointmentById`/`rescheduleAppointment` (no `status` predicate in `WHERE`).
**Interleaving:** Appt id=1 SCHEDULED. Concurrent `/cancel` and `/complete` both read SCHEDULED, both pass their guards, both write unconditionally → last writer wins (e.g. ends COMPLETED after being CANCELLED) and **both** side effects fire (a cancellation email for a now-completed appointment). Cancel-vs-reschedule can resurrect a cancelled row with a new date/time — its `FOR UPDATE` locks only _other_ employee/client rows for time-conflict, never row id=1's status.
**Impact:** Status-machine corruption + contradictory client emails. (No money/oversell → medium.)
**Fix:** Status-guarded `updateMany({ where: { id, status: 'SCHEDULED' }, data: {...} })` in all three; `count === 0` → 409/400; email only on `count === 1`. Wrap cancel/complete in a `$transaction`.

### RC-12 — Client approve/reject TOCTOU

**Location:** `src/clients/application/use-cases/client/approve-client.use-case.ts:21` (+ `reject-client.use-case.ts`); repo `approveClientById`/`rejectClientById` unconditional update.
**Interleaving:** Two admins approve the same PENDING client → both pass `status === 'PENDING'`, both write ACTIVE, **two approval emails**. Approve-vs-reject → both fire, final status decided by commit order, client gets contradictory emails.
**Impact:** Duplicate/contradictory notifications; persisted status ≠ operator intent. (Admin-only, behind `JwtAuthGuard`+`RolesGuard` → medium.)
**Fix:** `updateMany({ where: { id, status: 'PENDING' }, data: { status: 'ACTIVE'|'INACTIVE' } })`; `count === 0` → `BadRequestException`; email only on `count === 1`.

### RC-13 — Holidays cron overlap + batch-upsert abort

**Location:** `src/holidays/infrastructure/repositories/prisma-holiday.repository.ts:59` (`bulkUpsertHolidays` = `$transaction([...upserts])`), `holidays-sync.cron.ts:26` (`@Cron`, monthly).
**Guard present:** `Holiday.date @@unique` prevents duplicate _rows_ — but it's what _causes_ the failure here.
**Interleaving:** The monthly `@Cron` and an admin `syncHolidaysByYear` both fetch the external Brasil API (slow → wide window), then run a **batch** of `upsert`s. Prisma `upsert` is SELECT-then-INSERT (not atomic vs a concurrent insert). For a shared date, one INSERT commits, the other hits `@@unique` → `P2002`, which **rolls back the entire `$transaction([...])`** — the whole month's sync is lost (swallowed by the cron's `try/catch`). Multi-replica deploys also allow cron-vs-cron self-overlap (`@nestjs/schedule` registers the job in every instance, no distributed lock).
**Impact:** Transient full-month sync failures; holiday-flag drift. (No money/booking → medium; confidence medium.)
**Fix:** Replace the batch with `createMany({ data, skipDuplicates: true })` (+ a separate `updateMany` for refreshable fields), or drop the wrapping `$transaction` and `try/catch` each `upsert` with a retry-on-`P2002`. Guard the cron with `pg_try_advisory_lock` for multi-replica safety. Separately, make `CreateHolidayUseCase` catch `P2002` → `ConflictException`.

---

## Low-severity findings

### RC-14 — Receipt generation orphan PDF

**Location:** `src/receipts/application/use-cases/receipt/generate-receipt.use-case.ts:24`.
**Interleaving:** `generateReceiptForPayment` fires from both the `bill_paid` webhook and admin Approve (both fire-and-forget). Both `findReceiptByPaymentId → null`, both `generateReceiptPdf` (two files written), both `createReceipt`; the loser hits `Receipt.paymentId @unique` → `P2002`, swallowed by `.catch`.
**Impact:** Exactly one Receipt row (integrity preserved), but **one orphaned PDF on disk** never linked/cleaned + wasted work. (Low — no data corruption.)
**Fix:** Reserve the row first: `receipt.upsert({ where: { paymentId }, create: { paymentId, fileUrl }, update: {} })`, generate the PDF only for the path that created the row; or catch `P2002`, `unlink` the orphan file, return the existing receipt.

---

## Refuted candidates (verified safe — recorded for confidence)

These were flagged by finders but **dismissed** after reading the actual code; documented so they aren't re-raised:

1. **Reschedule into a shared _occupied_ slot** — `FOR UPDATE` _does_ serialize here: both reschedules lock the **same** `(employeeId,date,status)` partition rows; EvalPlanQual re-reads the relocated row, so the second is correctly rejected. (Note: this is the _occupied-destination_ case; the _empty-slot_ first-vs-first case is the genuine RC-01.)
2. **Bare-create path skips the lock** (`prisma-appointment.repository.ts:45`) — **dead code**: both callers always build a non-optional `clientConflictCheck`, so the `$transaction`+`FOR UPDATE` branch always runs. Latent footgun, not a live race.
3. **Gateway-bill-before-DB-row as a "race"** — real _dual-write/saga_ gap but **not concurrency** (reproduces single-threaded on process crash). The concurrent variant _is_ real and covered by RC-02.
4. **Receipt duplicate-row race** — closed by `Receipt.paymentId @unique`; residue is the orphan PDF (RC-14), not row duplication.
5. **`setDefaultCard` zero-defaults / cross-client update** — impossible: both writes are in one `$transaction` (rolls back together), and `Card.clientId` is never mutated anywhere. (The _two-defaults_ variant is the real RC-10.)
6. **Email-change duplicate email** — closed by `Client.email @unique`; residue is a 500-instead-of-409 + burned code (error-mapping, not data integrity).
7. **Employee-less booking skips employee lock** — `clientConflictCheck` still runs the locked tx; a no-employee appointment can't oversell an employee slot.
8. **Receipt PDF non-idempotent filename** — same as RC-14; integrity closed by unique constraint, residue is disk housekeeping.

---

## Recommended remediation order

1. **RC-02, RC-05** first — direct financial double-charge and account-takeover surfaces.
2. **RC-03 + RC-04** together — one compare-and-set refactor of the payment repo + a `ProcessedWebhookEvent` table fixes both.
3. **RC-01** — add the partial unique index / `EXCLUDE` constraint migration; highest user-visible integrity bug.
4. **RC-06, RC-07, RC-08, RC-09** — auth hardening (transaction+lock or compare-and-swap; add `@nestjs/throttler` to login/reset).
5. **RC-10, RC-11, RC-12** — apply the compare-and-set / partial-unique pattern.
6. **RC-13, RC-14** — operational robustness.

**Systemic recommendations:**

- Adopt the **compare-and-set `updateMany` + branch-on-count** pattern for _every_ status transition; gate side effects on `count === 1`.
- Add **partial unique indexes / `EXCLUDE` constraints** (raw migrations) for every app-maintained uniqueness invariant.
- Add **webhook idempotency** (event-id dedup table) and remove `@SkipThrottle` from gateway controllers (or replace with a signature-gated throttle).
- Consider an **`@version` optimistic-lock column** on `Payment` and `Appointment` for defense-in-depth.
- Reserve DB rows **before** external gateway calls so `@unique` gates the side effect, not trails it.
