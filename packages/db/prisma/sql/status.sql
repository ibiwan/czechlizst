-- Canonical current-state SQL for database status policy functions.
-- Migrations should implement changes that keep deployed DB logic aligned with this file.

CREATE OR REPLACE FUNCTION "api"."is_valid_work_status_transition"(
  from_status "api"."WorkStatus",
  to_status "api"."WorkStatus"
) RETURNS boolean AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql;
