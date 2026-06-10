CREATE TABLE IF NOT EXISTS "job_locks" (
  "name" TEXT PRIMARY KEY,
  "lockedUntil" TIMESTAMP(3) NOT NULL
);

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointments_employee_scheduled_time_excl'
  ) THEN
    ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_employee_scheduled_time_excl"
    EXCLUDE USING gist (
      "employeeId" WITH =,
      "date" WITH =,
      int4range(
        split_part("startTime", ':', 1)::int * 60 + split_part("startTime", ':', 2)::int,
        split_part("startTime", ':', 1)::int * 60 + split_part("startTime", ':', 2)::int + "duration",
        '[)'
      ) WITH &&
    )
    WHERE ("status" = 'SCHEDULED' AND "employeeId" IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointments_client_scheduled_time_excl'
  ) THEN
    ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_client_scheduled_time_excl"
    EXCLUDE USING gist (
      "clientId" WITH =,
      "date" WITH =,
      int4range(
        split_part("startTime", ':', 1)::int * 60 + split_part("startTime", ':', 2)::int,
        split_part("startTime", ':', 1)::int * 60 + split_part("startTime", ':', 2)::int + "duration",
        '[)'
      ) WITH &&
    )
    WHERE ("status" = 'SCHEDULED');
  END IF;
END $$;
