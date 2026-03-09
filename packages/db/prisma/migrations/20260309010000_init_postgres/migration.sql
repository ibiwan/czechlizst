-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "api";

-- CreateTable
CREATE TABLE "api"."projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."tasks" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "api"."tasks"("project_id");

-- AddForeignKey
ALTER TABLE "api"."tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "api"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enforce non-empty values
ALTER TABLE "api"."projects" ADD CONSTRAINT "projects_name_not_blank" CHECK (char_length(trim(name)) > 0);
ALTER TABLE "api"."tasks" ADD CONSTRAINT "tasks_title_not_blank" CHECK (char_length(trim(title)) > 0);

-- Grant PostgREST anonymous role access when bootstrap roles exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_anon') THEN
    GRANT USAGE ON SCHEMA api TO web_anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA api TO web_anon;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA api TO web_anon;

    ALTER DEFAULT PRIVILEGES IN SCHEMA api
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO web_anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA api
      GRANT USAGE, SELECT ON SEQUENCES TO web_anon;
  END IF;
END $$;
