-- Bootstrap-only SQL for first database initialization.
-- Schema objects are managed by Prisma migrations.

-- App schema used by Prisma/PostgREST
create schema if not exists api;

-- Roles for PostgREST connection and anonymous API access
create role web_anon nologin;
create role authenticator noinherit login password 'authenticator_password';
grant web_anon to authenticator;
