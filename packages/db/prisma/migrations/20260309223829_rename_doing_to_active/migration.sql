-- Rename WorkStatus value and update transition rules to use "active"
ALTER TYPE "api"."WorkStatus" RENAME VALUE 'doing' TO 'active';

CREATE OR REPLACE FUNCTION "api"."is_valid_work_status_transition"(
  from_status "api"."WorkStatus",
  to_status "api"."WorkStatus"
) RETURNS boolean AS $$
BEGIN
  RETURN CASE
    WHEN from_status = to_status THEN true
    WHEN from_status = 'todo' AND to_status IN ('active', 'blocked', 'dropped') THEN true
    WHEN from_status = 'active' AND to_status IN ('blocked', 'done', 'dropped', 'todo') THEN true
    WHEN from_status = 'blocked' AND to_status IN ('active', 'dropped', 'todo') THEN true
    WHEN from_status = 'done' AND to_status IN ('todo', 'active', 'dropped') THEN true
    WHEN from_status = 'dropped' AND to_status IN ('todo', 'active') THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql;
