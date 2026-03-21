-- Remove BLOCKED from the stored enum. Existing blocked rows fall back to STARTED;
-- effective blocked display now comes from task_blockers instead of persisted status.

UPDATE "api"."tasks"
SET status = 'started'
WHERE status = 'blocked';

UPDATE "api"."projects"
SET status = 'started'
WHERE status = 'blocked';

DROP TRIGGER IF EXISTS "tasks_status_transition_guard" ON "api"."tasks";
DROP TRIGGER IF EXISTS "projects_status_transition_guard" ON "api"."projects";
DROP FUNCTION IF EXISTS "api"."enforce_task_status_transition"();
DROP FUNCTION IF EXISTS "api"."enforce_project_status_transition"();
DROP FUNCTION IF EXISTS "api"."is_valid_work_status_transition"("api"."WorkStatus", "api"."WorkStatus");

CREATE TYPE "api"."WorkStatus_next" AS ENUM ('todo', 'started', 'active', 'done', 'dropped');

ALTER TABLE "api"."projects"
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE "api"."tasks"
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE "api"."projects"
  ALTER COLUMN status TYPE "api"."WorkStatus_next"
  USING (
    CASE
      WHEN status::text = 'blocked' THEN 'started'
      ELSE status::text
    END
  )::"api"."WorkStatus_next";

ALTER TABLE "api"."tasks"
  ALTER COLUMN status TYPE "api"."WorkStatus_next"
  USING (
    CASE
      WHEN status::text = 'blocked' THEN 'started'
      ELSE status::text
    END
  )::"api"."WorkStatus_next";

DROP TYPE "api"."WorkStatus";
ALTER TYPE "api"."WorkStatus_next" RENAME TO "WorkStatus";

ALTER TABLE "api"."projects"
  ALTER COLUMN status SET DEFAULT 'todo';

ALTER TABLE "api"."tasks"
  ALTER COLUMN status SET DEFAULT 'todo';

CREATE OR REPLACE FUNCTION "api"."is_valid_work_status_transition"(
  from_status "api"."WorkStatus",
  to_status "api"."WorkStatus"
) RETURNS boolean AS $$
BEGIN
  RETURN CASE
    WHEN from_status = to_status THEN true
    WHEN from_status = 'todo' AND to_status IN ('started', 'active', 'dropped') THEN true
    WHEN from_status = 'started' AND to_status IN ('active', 'done', 'dropped', 'todo') THEN true
    WHEN from_status = 'active' AND to_status IN ('started', 'done', 'dropped', 'todo') THEN true
    WHEN from_status = 'done' AND to_status IN ('todo', 'started', 'active', 'dropped') THEN true
    WHEN from_status = 'dropped' AND to_status IN ('todo', 'started', 'active') THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "api"."enforce_task_status_transition"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT "api"."is_valid_work_status_transition"(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid task status transition from % to %', OLD.status, NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "api"."enforce_project_status_transition"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  has_tasks boolean;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT EXISTS (
      SELECT 1
      FROM "api"."tasks"
      WHERE project_id = NEW.id
    )
    INTO has_tasks;

    IF has_tasks THEN
      RAISE EXCEPTION
        'Project status cannot be changed manually while tasks exist for project %',
        NEW.id
        USING ERRCODE = 'check_violation';
    END IF;

    IF NOT "api"."is_valid_work_status_transition"(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid project status transition from % to %', OLD.status, NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "tasks_status_transition_guard" ON "api"."tasks";
CREATE TRIGGER "tasks_status_transition_guard"
BEFORE UPDATE OF status ON "api"."tasks"
FOR EACH ROW
EXECUTE FUNCTION "api"."enforce_task_status_transition"();

DROP TRIGGER IF EXISTS "projects_status_transition_guard" ON "api"."projects";
CREATE TRIGGER "projects_status_transition_guard"
BEFORE UPDATE OF status ON "api"."projects"
FOR EACH ROW
EXECUTE FUNCTION "api"."enforce_project_status_transition"();
