CREATE OR REPLACE FUNCTION "api"."is_valid_work_status_transition"(
  from_status "api"."WorkStatus",
  to_status "api"."WorkStatus"
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN from_status = to_status THEN true
    WHEN from_status = 'todo' AND to_status IN ('doing', 'blocked', 'dropped') THEN true
    WHEN from_status = 'doing' AND to_status IN ('blocked', 'done', 'dropped', 'todo') THEN true
    WHEN from_status = 'blocked' AND to_status IN ('doing', 'dropped', 'todo') THEN true
    WHEN from_status = 'done' AND to_status IN ('todo', 'doing', 'dropped') THEN true
    WHEN from_status = 'dropped' AND to_status IN ('todo', 'doing') THEN true
    ELSE false
  END;
$$;

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

DROP TRIGGER IF EXISTS "tasks_status_transition_guard" ON "api"."tasks";
CREATE TRIGGER "tasks_status_transition_guard"
BEFORE UPDATE OF status ON "api"."tasks"
FOR EACH ROW
EXECUTE FUNCTION "api"."enforce_task_status_transition"();

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

DROP TRIGGER IF EXISTS "projects_status_transition_guard" ON "api"."projects";
CREATE TRIGGER "projects_status_transition_guard"
BEFORE UPDATE OF status ON "api"."projects"
FOR EACH ROW
EXECUTE FUNCTION "api"."enforce_project_status_transition"();
