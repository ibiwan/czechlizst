-- Add task-to-task blocker relationships

CREATE TABLE "api"."task_blockers" (
  "id" SERIAL NOT NULL,
  "task_id" INTEGER NOT NULL,
  "blocking_task_id" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "task_blockers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_blockers_task_id_blocking_task_id_key"
ON "api"."task_blockers" ("task_id", "blocking_task_id");

CREATE INDEX "task_blockers_task_id_idx"
ON "api"."task_blockers" ("task_id");

CREATE INDEX "task_blockers_blocking_task_id_idx"
ON "api"."task_blockers" ("blocking_task_id");

ALTER TABLE "api"."task_blockers"
ADD CONSTRAINT "task_blockers_task_id_fkey"
FOREIGN KEY ("task_id") REFERENCES "api"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "api"."task_blockers"
ADD CONSTRAINT "task_blockers_blocking_task_id_fkey"
FOREIGN KEY ("blocking_task_id") REFERENCES "api"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "api"."task_blockers"
ADD CONSTRAINT "task_blockers_no_self_reference"
CHECK ("task_id" <> "blocking_task_id");

DROP TRIGGER IF EXISTS "task_blockers_touch_updated_at" ON "api"."task_blockers";
CREATE TRIGGER "task_blockers_touch_updated_at"
BEFORE UPDATE ON "api"."task_blockers"
FOR EACH ROW
EXECUTE FUNCTION "api"."touch_updated_at"();
