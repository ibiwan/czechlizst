create or replace function "api"."handle_task_touch"()
returns trigger
language plpgsql
as $$
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;

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
