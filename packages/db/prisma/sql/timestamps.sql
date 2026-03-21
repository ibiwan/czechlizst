-- Canonical current-state SQL for updated_at touch/cascade functions and triggers.
-- Migrations should implement changes that keep deployed DB logic aligned with this file.

CREATE OR REPLACE FUNCTION "api"."touch_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "projects_touch_updated_at" ON "api"."projects";
CREATE TRIGGER "projects_touch_updated_at"
BEFORE UPDATE ON "api"."projects"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();

DROP TRIGGER IF EXISTS "tasks_touch_updated_at" ON "api"."tasks";
CREATE TRIGGER "tasks_touch_updated_at"
BEFORE UPDATE ON "api"."tasks"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();

DROP TRIGGER IF EXISTS "project_notes_touch_updated_at" ON "api"."project_notes";
CREATE TRIGGER "project_notes_touch_updated_at"
BEFORE UPDATE ON "api"."project_notes"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();

DROP TRIGGER IF EXISTS "task_notes_touch_updated_at" ON "api"."task_notes";
CREATE TRIGGER "task_notes_touch_updated_at"
BEFORE UPDATE ON "api"."task_notes"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();

DROP TRIGGER IF EXISTS "task_blockers_touch_updated_at" ON "api"."task_blockers";
CREATE TRIGGER "task_blockers_touch_updated_at"
BEFORE UPDATE ON "api"."task_blockers"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();

CREATE OR REPLACE FUNCTION "api"."touch_project_updated_at"(target_project_id integer)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE "api"."projects"
  SET "updated_at" = NOW()
  WHERE "id" = target_project_id;
$$;

CREATE OR REPLACE FUNCTION "api"."touch_task_updated_at"(target_task_id integer)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE "api"."tasks"
  SET "updated_at" = NOW()
  WHERE "id" = target_task_id;
$$;

CREATE OR REPLACE FUNCTION "api"."cascade_project_updated_at_from_task"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  touched_project_id integer;
BEGIN
  touched_project_id := COALESCE(NEW.project_id, OLD.project_id);
  PERFORM "api"."touch_project_updated_at"(touched_project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION "api"."cascade_project_updated_at_from_project_note"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  touched_project_id integer;
BEGIN
  touched_project_id := COALESCE(NEW.project_id, OLD.project_id);
  PERFORM "api"."touch_project_updated_at"(touched_project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION "api"."cascade_task_and_project_updated_at_from_task_note"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  touched_task_id integer;
  touched_project_id integer;
BEGIN
  touched_task_id := COALESCE(NEW.task_id, OLD.task_id);
  PERFORM "api"."touch_task_updated_at"(touched_task_id);

  SELECT project_id
  INTO touched_project_id
  FROM "api"."tasks"
  WHERE id = touched_task_id;

  IF touched_project_id IS NOT NULL THEN
    PERFORM "api"."touch_project_updated_at"(touched_project_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION "api"."cascade_task_and_project_updated_at_from_task_blocker"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  blocked_task_id integer;
  blocking_task_id integer;
  blocked_project_id integer;
  blocking_project_id integer;
BEGIN
  blocked_task_id := COALESCE(NEW.task_id, OLD.task_id);
  blocking_task_id := COALESCE(NEW.blocking_task_id, OLD.blocking_task_id);

  IF blocked_task_id IS NOT NULL THEN
    PERFORM "api"."touch_task_updated_at"(blocked_task_id);
  END IF;

  IF blocking_task_id IS NOT NULL THEN
    PERFORM "api"."touch_task_updated_at"(blocking_task_id);
  END IF;

  IF blocked_task_id IS NOT NULL THEN
    SELECT project_id
    INTO blocked_project_id
    FROM "api"."tasks"
    WHERE id = blocked_task_id;

    IF blocked_project_id IS NOT NULL THEN
      PERFORM "api"."touch_project_updated_at"(blocked_project_id);
    END IF;
  END IF;

  IF blocking_task_id IS NOT NULL THEN
    SELECT project_id
    INTO blocking_project_id
    FROM "api"."tasks"
    WHERE id = blocking_task_id;

    IF blocking_project_id IS NOT NULL AND blocking_project_id IS DISTINCT FROM blocked_project_id THEN
      PERFORM "api"."touch_project_updated_at"(blocking_project_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS "tasks_cascade_project_updated_at" ON "api"."tasks";
CREATE TRIGGER "tasks_cascade_project_updated_at"
AFTER INSERT OR UPDATE OR DELETE ON "api"."tasks"
FOR EACH ROW
EXECUTE FUNCTION "api"."cascade_project_updated_at_from_task"();

DROP TRIGGER IF EXISTS "project_notes_cascade_project_updated_at" ON "api"."project_notes";
CREATE TRIGGER "project_notes_cascade_project_updated_at"
AFTER INSERT OR UPDATE OR DELETE ON "api"."project_notes"
FOR EACH ROW
EXECUTE FUNCTION "api"."cascade_project_updated_at_from_project_note"();

DROP TRIGGER IF EXISTS "task_notes_cascade_task_and_project_updated_at" ON "api"."task_notes";
CREATE TRIGGER "task_notes_cascade_task_and_project_updated_at"
AFTER INSERT OR UPDATE OR DELETE ON "api"."task_notes"
FOR EACH ROW
EXECUTE FUNCTION "api"."cascade_task_and_project_updated_at_from_task_note"();

DROP TRIGGER IF EXISTS "task_blockers_cascade_task_and_project_updated_at" ON "api"."task_blockers";
CREATE TRIGGER "task_blockers_cascade_task_and_project_updated_at"
AFTER INSERT OR UPDATE OR DELETE ON "api"."task_blockers"
FOR EACH ROW
EXECUTE FUNCTION "api"."cascade_task_and_project_updated_at_from_task_blocker"();
