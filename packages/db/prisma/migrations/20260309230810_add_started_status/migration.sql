-- Add STARTED status and relax project status enforcement
ALTER TYPE "api"."WorkStatus" ADD VALUE 'started' BEFORE 'active';

CREATE OR REPLACE FUNCTION "api"."is_valid_work_status_transition"(
  from_status "api"."WorkStatus",
  to_status "api"."WorkStatus"
) RETURNS boolean AS $$
BEGIN
  RETURN CASE
    WHEN from_status = to_status THEN true
    WHEN from_status = 'todo' AND to_status IN ('started', 'active', 'blocked', 'dropped') THEN true
    WHEN from_status = 'started' AND to_status IN ('active', 'blocked', 'done', 'dropped', 'todo') THEN true
    WHEN from_status = 'active' AND to_status IN ('started', 'blocked', 'done', 'dropped', 'todo') THEN true
    WHEN from_status = 'blocked' AND to_status IN ('started', 'active', 'dropped', 'todo') THEN true
    WHEN from_status = 'done' AND to_status IN ('todo', 'started', 'active', 'dropped') THEN true
    WHEN from_status = 'dropped' AND to_status IN ('todo', 'started', 'active') THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "api"."enforce_project_status_transition"()
RETURNS trigger AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT "api"."is_valid_work_status_transition"(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid project status transition from % to %', OLD.status, NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
