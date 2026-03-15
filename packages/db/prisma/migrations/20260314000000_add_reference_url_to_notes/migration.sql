-- Add optional reference URL to notes
ALTER TABLE "api"."project_notes"
ADD COLUMN "reference_url" TEXT;

ALTER TABLE "api"."task_notes"
ADD COLUMN "reference_url" TEXT;
