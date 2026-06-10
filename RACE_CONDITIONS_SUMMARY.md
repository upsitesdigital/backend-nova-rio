# Race Conditions — Summary

**Date:** 2026-06-10 · **Backend:** nova-rio-backend (NestJS 11 + Prisma 7 + PostgreSQL)
**Full report:** [`RACE_CONDITIONS_AUDIT.md`](./RACE_CONDITIONS_AUDIT.md)

## Method

6 parallel finder lanes → adversarial verification (each verifier tried to _refute_ the finding by locating an existing guard). 33 candidates → 25 confirmed → **14 distinct** (deduped). 3 load-bearing claims re-checked directly against source.

## Score

**6 high · 7 medium · 1 low. No critical** — `@unique` on payment/receipt rows bounds the money blast radius (blocks duplicate _rows_, not duplicate _side effects_).

## 3 Systemic Root Causes

Fix these and most findings die:

1. **Check-then-act** — repos do `update({ where:{id}, data:{status} })` with no status predicate; the guard sits on a prior _unlocked_ read.
   → compare-and-set `updateMany({ where:{id,status:expected} })`, fire side effects only on `count === 1`.
2. **No DB invariants** — zero `@version` columns; `SELECT ... FOR UPDATE` (only in appointments repo) can't gap-lock under READ COMMITTED → first-vs-first inserts both pass.
   → Postgres partial unique indexes / `EXCLUDE` constraints (raw migrations).
3. **External calls outside locks** — Vindi `createGatewayBill` runs between dup-check and insert → double charge; webhooks have no event-dedup + `@SkipThrottle`.
   → reserve DB row before the gateway call + a `ProcessedWebhookEvent` table.

## Top 3 — Fix First

| ID        | Issue                                                                             | Location                                   |
| --------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| **RC-02** | Duplicate gateway charge — client double-charged, second bill orphaned            | `create-client-payment.use-case.ts:53,82`  |
| **RC-05** | Verification code reused → **password-reset account takeover**                    | `prisma-client.repository.ts:178`          |
| **RC-01** | Appointment double-booking — `FOR UPDATE` defeated for empty slots, no `@@unique` | `prisma-appointment.repository.ts:202,221` |

## All 14 Distinct Issues

| #     | Issue                                                           | Severity | Location                                                            |
| ----- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| RC-01 | Employee/client appointment double-booking                      | High     | `prisma-appointment.repository.ts:202,221,148`                      |
| RC-02 | Duplicate gateway charge (external call in check→insert window) | High     | `create-client-payment.use-case.ts:53,82`                           |
| RC-03 | Payment status lost-update / state flip                         | High     | `prisma-payment.repository.ts:147,155`                              |
| RC-04 | Non-idempotent webhooks (no event-dedup, `@SkipThrottle`)       | High     | `vindi-webhooks.controller.ts:48`                                   |
| RC-05 | Verification code consumed more than once → ATO                 | High     | `prisma-client.repository.ts:178`                                   |
| RC-06 | Password-reset lockout bypass (burst)                           | High     | `reset-password.use-case.ts:76` / `prisma-client.repository.ts:224` |
| RC-07 | Login lockout bypass (burst)                                    | Medium   | `login.use-case.ts:94` / `prisma-client.repository.ts:92`           |
| RC-08 | False login lockout (split increment / lock-set)                | Medium   | `prisma-client.repository.ts:92`                                    |
| RC-09 | Refresh-token reuse-detection bypass                            | Medium   | `refresh-token.use-case.ts:39`                                      |
| RC-10 | Two default cards (no DB constraint or lock)                    | Medium   | `prisma-card.repository.ts:55,30`                                   |
| RC-11 | Appointment status TOCTOU (cancel/complete/reschedule)          | Medium   | `cancel-appointment.use-case.ts:15` + repo                          |
| RC-12 | Client approve/reject TOCTOU                                    | Medium   | `approve-client.use-case.ts:21`                                     |
| RC-13 | Holidays cron overlap + batch-upsert abort                      | Medium   | `prisma-holiday.repository.ts:59`                                   |
| RC-14 | Receipt orphan PDF (check-then-act on losing path)              | Low      | `generate-receipt.use-case.ts:24`                                   |

## Refuted (8) — verified safe, recorded so they aren't re-raised

1. Reschedule into an _occupied_ slot — `FOR UPDATE` _does_ serialize (same partition rows locked).
2. Bare-create path skips lock — dead code (callers always pass `clientConflictCheck`).
3. Gateway-bill-before-row as a "race" — it's a dual-write/saga gap, not concurrency (concurrent variant = RC-02).
4. Receipt duplicate-row race — closed by `Receipt.paymentId @unique` (residue = orphan PDF, RC-14).
5. `setDefaultCard` zero-defaults / cross-client — impossible (one `$transaction`; `clientId` immutable).
6. Email-change duplicate — closed by `Client.email @unique` (residue = 500-instead-of-409).
7. Employee-less booking skips employee lock — `clientConflictCheck` still runs the locked tx.
8. Receipt PDF non-idempotent filename — same as RC-14; integrity closed by unique constraint.

## Remediation Order

1. **RC-02, RC-05** — financial double-charge + account-takeover.
2. **RC-03 + RC-04** — one payment-repo compare-and-set refactor + `ProcessedWebhookEvent` fixes both.
3. **RC-01** — partial unique index / `EXCLUDE` migration.
4. **RC-06–RC-09** — auth hardening (tx+lock or compare-and-swap; add `@nestjs/throttler` to login/reset).
5. **RC-10, RC-11, RC-12** — apply compare-and-set / partial-unique.
6. **RC-13, RC-14** — operational robustness.
