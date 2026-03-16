-- Add updated_at timestamps and auto-touch triggers

ALTER TABLE "api"."projects"
ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE "api"."tasks"
ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE "api"."project_notes"
ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE "api"."task_notes"
ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

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

