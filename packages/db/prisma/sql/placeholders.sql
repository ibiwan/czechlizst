-- Canonical current-state SQL for placeholder-task invariants.
-- Migrations should implement changes that keep deployed DB logic aligned with this file.

CREATE OR REPLACE FUNCTION "api"."ensure_project_has_placeholder_task"(target_project_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "api"."projects"
    WHERE id = target_project_id
  ) AND NOT EXISTS (
    SELECT 1
    FROM "api"."tasks"
    WHERE project_id = target_project_id
  ) THEN
    INSERT INTO "api"."tasks" ("project_id", "title", "is_placeholder", "status")
    VALUES (target_project_id, '•', true, 'todo');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "api"."seed_placeholder_task_for_new_project"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM "api"."ensure_project_has_placeholder_task"(NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "api"."restore_placeholder_task_after_last_task_delete"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM "api"."ensure_project_has_placeholder_task"(OLD.project_id);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS "projects_seed_placeholder_task" ON "api"."projects";
CREATE TRIGGER "projects_seed_placeholder_task"
AFTER INSERT ON "api"."projects"
FOR EACH ROW
EXECUTE FUNCTION "api"."seed_placeholder_task_for_new_project"();

DROP TRIGGER IF EXISTS "tasks_restore_placeholder_after_last_delete" ON "api"."tasks";
CREATE TRIGGER "tasks_restore_placeholder_after_last_delete"
AFTER DELETE ON "api"."tasks"
FOR EACH ROW
EXECUTE FUNCTION "api"."restore_placeholder_task_after_last_task_delete"();
