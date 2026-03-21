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
