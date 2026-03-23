-- Anchor Task Reboot
-- Canonical sketch for integrity behavior.
--
-- The reboot intentionally keeps the graph permissive.
-- Only the constraints that clearly protect product semantics belong here.

create or replace function api.ensure_task_relation_not_self_link()
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

create or replace function api.ensure_anchor_null_means_false()
returns trigger
language plpgsql
as $$
begin
  -- Migration/rollout convenience:
  -- null remains acceptable in storage for now.
  -- The application treats null the same as false.
  return new;
end;
$$;

-- Constraint sketch:
-- alter table api.task_relations
--   add constraint task_relations_unique_edge
--   unique (task_id, related_task_id, relation_type);
--
-- create trigger task_relations_reject_self_links
-- before insert or update on api.task_relations
-- for each row execute function api.ensure_task_relation_not_self_link();
--
-- Notes:
-- - We are not doing cycle detection here.
-- - We are not preventing multiple anchors in an ancestor chain.
-- - We are not requiring every task to be reachable from an anchor.
-- - We are not preventing an anchor from also having a parent.
