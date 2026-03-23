-- Anchor Task Reboot
-- Canonical sketch for timestamp propagation behavior.
--
-- Intent:
-- - tasks own the primary recency signal
-- - task notes and task relations touch the involved task rows
-- - parent-chain propagation follows parent_task_id only
-- - generic relations do not create recursive timestamp fan-out

create or replace function api.touch_task_updated_at(task_id_to_touch integer)
returns void
language plpgsql
as $$
begin
  update api.tasks
  set updated_at = now()
  where id = task_id_to_touch;
end;
$$;

create or replace function api.touch_task_ancestor_chain(start_task_id integer)
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

    perform api.touch_task_updated_at(current_task_id);

    select parent_task_id
    into next_parent_id
    from api.tasks
    where id = current_task_id;

    current_task_id := next_parent_id;
  end loop;
end;
$$;

create or replace function api.handle_task_note_touch()
returns trigger
language plpgsql
as $$
declare
  touched_task_id integer;
begin
  touched_task_id := coalesce(new.task_id, old.task_id);
  perform api.touch_task_ancestor_chain(touched_task_id);
  return coalesce(new, old);
end;
$$;

create or replace function api.handle_task_relation_touch()
returns trigger
language plpgsql
as $$
declare
  left_task_id integer := coalesce(new.task_id, old.task_id);
  right_task_id integer := coalesce(new.related_task_id, old.related_task_id);
begin
  perform api.touch_task_ancestor_chain(left_task_id);
  perform api.touch_task_ancestor_chain(right_task_id);
  return coalesce(new, old);
end;
$$;

create or replace function api.handle_task_touch()
returns trigger
language plpgsql
as $$
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    if new.updated_at is null then
      new.updated_at := now();
    end if;
    return new;
  end if;

  if new.parent_task_id is distinct from old.parent_task_id then
    if old.parent_task_id is not null then
      perform api.touch_task_ancestor_chain(old.parent_task_id);
    end if;
  end if;

  perform api.touch_task_ancestor_chain(new.id);
  return new;
end;
$$;

-- Trigger sketch:
-- create trigger tasks_touch_updated_at
-- after insert or update on api.tasks
-- for each row execute function api.handle_task_touch();
--
-- create trigger task_notes_touch_task_chain
-- after insert or update or delete on api.task_notes
-- for each row execute function api.handle_task_note_touch();
--
-- create trigger task_relations_touch_task_chains
-- after insert or update or delete on api.task_relations
-- for each row execute function api.handle_task_relation_touch();
