DROP TRIGGER IF EXISTS "projects_status_transition_guard" ON "api"."projects";
DROP FUNCTION IF EXISTS "api"."enforce_project_status_transition"();

ALTER TABLE "api"."projects"
DROP COLUMN "status";
