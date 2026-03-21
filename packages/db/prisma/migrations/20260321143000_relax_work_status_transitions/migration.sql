CREATE OR REPLACE FUNCTION "api"."is_valid_work_status_transition"(
  from_status "api"."WorkStatus",
  to_status "api"."WorkStatus"
) RETURNS boolean AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql;
