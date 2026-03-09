-- Create enum for shared project/task workflow status
CREATE TYPE "api"."WorkStatus" AS ENUM ('todo', 'doing', 'blocked', 'done', 'dropped');

-- Add project status
ALTER TABLE "api"."projects"
ADD COLUMN "status" "api"."WorkStatus" NOT NULL DEFAULT 'todo';

-- Add task status and backfill from legacy done flag
ALTER TABLE "api"."tasks"
ADD COLUMN "status" "api"."WorkStatus" NOT NULL DEFAULT 'todo';

UPDATE "api"."tasks"
SET "status" = 'done'
WHERE "done" = true;

ALTER TABLE "api"."tasks"
DROP COLUMN "done";

-- Notes tables for many-notes-per-entity support
CREATE TABLE "api"."project_notes" (
  "id" SERIAL NOT NULL,
  "project_id" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api"."task_notes" (
  "id" SERIAL NOT NULL,
  "task_id" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_notes_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "project_notes_project_id_created_at_idx"
ON "api"."project_notes" ("project_id", "created_at");

CREATE INDEX "task_notes_task_id_created_at_idx"
ON "api"."task_notes" ("task_id", "created_at");

-- Foreign keys
ALTER TABLE "api"."project_notes"
ADD CONSTRAINT "project_notes_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "api"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "api"."task_notes"
ADD CONSTRAINT "task_notes_task_id_fkey"
FOREIGN KEY ("task_id") REFERENCES "api"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Non-empty note bodies
ALTER TABLE "api"."project_notes"
ADD CONSTRAINT "project_notes_body_not_blank" CHECK (char_length(trim(body)) > 0);

ALTER TABLE "api"."task_notes"
ADD CONSTRAINT "task_notes_body_not_blank" CHECK (char_length(trim(body)) > 0);
