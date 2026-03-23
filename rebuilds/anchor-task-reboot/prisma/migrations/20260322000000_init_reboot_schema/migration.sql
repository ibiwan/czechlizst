create schema if not exists "api";

create type "api"."WorkStatus" as enum (
  'todo',
  'started',
  'active',
  'done',
  'dropped'
);

create type "api"."TaskRelationType" as enum (
  'blocked_by',
  'related_to'
);

create table "api"."tasks" (
  "id" serial not null,
  "title" text not null,
  "status" "api"."WorkStatus" not null default 'todo',
  "is_anchor" boolean,
  "parent_task_id" integer,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),

  constraint "tasks_pkey" primary key ("id"),
  constraint "tasks_parent_task_id_fkey"
    foreign key ("parent_task_id")
    references "api"."tasks" ("id")
    on delete set null
    on update cascade
);

create table "api"."task_notes" (
  "id" serial not null,
  "task_id" integer not null,
  "body" text not null,
  "reference_url" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),

  constraint "task_notes_pkey" primary key ("id"),
  constraint "task_notes_task_id_fkey"
    foreign key ("task_id")
    references "api"."tasks" ("id")
    on delete cascade
    on update cascade
);

create table "api"."task_relations" (
  "id" serial not null,
  "task_id" integer not null,
  "related_task_id" integer not null,
  "relation_type" "api"."TaskRelationType" not null,
  "commentary" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),

  constraint "task_relations_pkey" primary key ("id"),
  constraint "task_relations_task_id_fkey"
    foreign key ("task_id")
    references "api"."tasks" ("id")
    on delete cascade
    on update cascade,
  constraint "task_relations_related_task_id_fkey"
    foreign key ("related_task_id")
    references "api"."tasks" ("id")
    on delete cascade
    on update cascade
);

create unique index "task_relations_task_id_related_task_id_relation_type_key"
  on "api"."task_relations" ("task_id", "related_task_id", "relation_type");

create index "tasks_is_anchor_idx" on "api"."tasks" ("is_anchor");
create index "tasks_parent_task_id_idx" on "api"."tasks" ("parent_task_id");
create index "task_notes_task_id_created_at_idx" on "api"."task_notes" ("task_id", "created_at");
create index "task_relations_task_id_idx" on "api"."task_relations" ("task_id");
create index "task_relations_related_task_id_idx" on "api"."task_relations" ("related_task_id");
create index "task_relations_relation_type_idx" on "api"."task_relations" ("relation_type");

create or replace function "api"."set_updated_at"()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function "api"."ensure_task_relation_not_self_link"()
returns trigger
language plpgsql
as $$
begin
  if new.task_id = new.related_task_id then
    raise exception 'task relations may not link a task to itself';
  end if;

  return new;
end;
$$;

create or replace function "api"."touch_task_updated_at"(task_id_to_touch integer)
returns void
language plpgsql
as $$
begin
  update "api"."tasks"
  set "updated_at" = now()
  where "id" = task_id_to_touch;
end;
$$;

create or replace function "api"."touch_task_ancestor_chain"(start_task_id integer)
returns void
language plpgsql
as $$
declare
  current_task_id integer := start_task_id;
  next_parent_id integer;
  visited_ids integer[] := '{}';
begin
  while current_task_id is not null loop
    if current_task_id = any(visited_ids) then
      exit;
    end if;

    visited_ids := array_append(visited_ids, current_task_id);
    perform "api"."touch_task_updated_at"(current_task_id);

    select "parent_task_id"
    into next_parent_id
    from "api"."tasks"
    where "id" = current_task_id;

    current_task_id := next_parent_id;
  end loop;
end;
$$;

create or replace function "api"."handle_task_touch"()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform "api"."touch_task_ancestor_chain"(new."id");
    return new;
  end if;

  if new."parent_task_id" is distinct from old."parent_task_id" and old."parent_task_id" is not null then
    perform "api"."touch_task_ancestor_chain"(old."parent_task_id");
  end if;

  perform "api"."touch_task_ancestor_chain"(new."id");
  return new;
end;
$$;

create or replace function "api"."handle_task_note_touch"()
returns trigger
language plpgsql
as $$
declare
  touched_task_id integer := coalesce(new."task_id", old."task_id");
begin
  perform "api"."touch_task_ancestor_chain"(touched_task_id);
  return coalesce(new, old);
end;
$$;

create or replace function "api"."handle_task_relation_touch"()
returns trigger
language plpgsql
as $$
declare
  left_task_id integer := coalesce(new."task_id", old."task_id");
  right_task_id integer := coalesce(new."related_task_id", old."related_task_id");
begin
  perform "api"."touch_task_ancestor_chain"(left_task_id);
  perform "api"."touch_task_ancestor_chain"(right_task_id);
  return coalesce(new, old);
end;
$$;

create trigger "tasks_set_updated_at"
before update on "api"."tasks"
for each row
execute function "api"."set_updated_at"();

create trigger "task_notes_set_updated_at"
before update on "api"."task_notes"
for each row
execute function "api"."set_updated_at"();

create trigger "task_relations_set_updated_at"
before update on "api"."task_relations"
for each row
execute function "api"."set_updated_at"();

create trigger "task_relations_reject_self_links"
before insert or update on "api"."task_relations"
for each row
execute function "api"."ensure_task_relation_not_self_link"();

create trigger "tasks_touch_ancestor_chain"
after insert or update on "api"."tasks"
for each row
execute function "api"."handle_task_touch"();

create trigger "task_notes_touch_ancestor_chain"
after insert or update or delete on "api"."task_notes"
for each row
execute function "api"."handle_task_note_touch"();

create trigger "task_relations_touch_ancestor_chains"
after insert or update or delete on "api"."task_relations"
for each row
execute function "api"."handle_task_relation_touch"();

grant usage on schema "api" to "web_anon";
grant select, insert, update, delete on "api"."tasks" to "web_anon";
grant select, insert, update, delete on "api"."task_notes" to "web_anon";
grant select, insert, update, delete on "api"."task_relations" to "web_anon";
grant usage, select on all sequences in schema "api" to "web_anon";
