CREATE TYPE "api"."TaskRelationType" AS ENUM ('blocked_by', 'has_subtask', 'related_to');

ALTER TABLE "api"."task_blockers"
RENAME TO "task_relations";

ALTER TABLE "api"."task_relations"
RENAME COLUMN "blocking_task_id" TO "related_task_id";

ALTER TABLE "api"."task_relations"
ADD COLUMN "relation_type" "api"."TaskRelationType" NOT NULL DEFAULT 'blocked_by',
ADD COLUMN "commentary" TEXT;

ALTER TABLE "api"."task_relations"
DROP CONSTRAINT IF EXISTS "task_blockers_no_self_reference";

ALTER TABLE "api"."task_relations"
ADD CONSTRAINT "task_relations_no_self_reference"
CHECK ("task_id" <> "related_task_id");

ALTER TABLE "api"."task_relations"
DROP CONSTRAINT IF EXISTS "task_blockers_task_id_fkey";

ALTER TABLE "api"."task_relations"
ADD CONSTRAINT "task_relations_task_id_fkey"
FOREIGN KEY ("task_id") REFERENCES "api"."tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "api"."task_relations"
DROP CONSTRAINT IF EXISTS "task_blockers_blocking_task_id_fkey";

ALTER TABLE "api"."task_relations"
ADD CONSTRAINT "task_relations_related_task_id_fkey"
FOREIGN KEY ("related_task_id") REFERENCES "api"."tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "api"."task_blockers_task_id_blocking_task_id_key";
DROP INDEX IF EXISTS "api"."task_blockers_task_id_idx";
DROP INDEX IF EXISTS "api"."task_blockers_blocking_task_id_idx";

CREATE UNIQUE INDEX "task_relations_task_id_related_task_id_relation_type_key"
ON "api"."task_relations" ("task_id", "related_task_id", "relation_type");

CREATE INDEX "task_relations_task_id_idx"
ON "api"."task_relations" ("task_id");

CREATE INDEX "task_relations_related_task_id_idx"
ON "api"."task_relations" ("related_task_id");

CREATE INDEX "task_relations_relation_type_idx"
ON "api"."task_relations" ("relation_type");

ALTER TABLE "api"."task_relations"
ALTER COLUMN "relation_type" DROP DEFAULT;

DROP TRIGGER IF EXISTS "task_blockers_touch_updated_at" ON "api"."task_relations";
DROP TRIGGER IF EXISTS "task_relations_touch_updated_at" ON "api"."task_relations";
CREATE TRIGGER "task_relations_touch_updated_at"
BEFORE UPDATE ON "api"."task_relations"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();

DROP TRIGGER IF EXISTS "task_blockers_cascade_task_and_project_updated_at" ON "api"."task_relations";
DROP TRIGGER IF EXISTS "task_relations_cascade_task_and_project_updated_at" ON "api"."task_relations";
DROP FUNCTION IF EXISTS "api"."cascade_task_and_project_updated_at_from_task_blocker"();

CREATE OR REPLACE FUNCTION "api"."cascade_task_and_project_updated_at_from_task_relation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  task_id integer;
  related_task_id integer;
  task_project_id integer;
  related_project_id integer;
BEGIN
  task_id := COALESCE(NEW.task_id, OLD.task_id);
  related_task_id := COALESCE(NEW.related_task_id, OLD.related_task_id);

  IF task_id IS NOT NULL THEN
    PERFORM "api"."touch_task_updated_at"(task_id);
  END IF;

  IF related_task_id IS NOT NULL THEN
    PERFORM "api"."touch_task_updated_at"(related_task_id);
  END IF;

  IF task_id IS NOT NULL THEN
    SELECT project_id
    INTO task_project_id
    FROM "api"."tasks"
    WHERE id = task_id;

    IF task_project_id IS NOT NULL THEN
      PERFORM "api"."touch_project_updated_at"(task_project_id);
    END IF;
  END IF;

  IF related_task_id IS NOT NULL THEN
    SELECT project_id
    INTO related_project_id
    FROM "api"."tasks"
    WHERE id = related_task_id;

    IF related_project_id IS NOT NULL AND related_project_id IS DISTINCT FROM task_project_id THEN
      PERFORM "api"."touch_project_updated_at"(related_project_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER "task_relations_cascade_task_and_project_updated_at"
AFTER INSERT OR UPDATE OR DELETE ON "api"."task_relations"
FOR EACH ROW
EXECUTE FUNCTION "api"."cascade_task_and_project_updated_at_from_task_relation"();
