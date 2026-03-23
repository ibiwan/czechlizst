-- Bootstrap-only SQL for first database initialization.
-- Schema objects are managed by Prisma migrations in this reboot sandbox.

create schema if not exists api;
alter schema api owner to app_user;
grant usage, create on schema api to app_user;

create role web_anon nologin;
create role authenticator noinherit login password 'authenticator_password';
grant web_anon to authenticator;
