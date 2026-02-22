-- Denormalize min/max price on apis for search and listing. Kept in sync by trigger.

ALTER TABLE apis ADD COLUMN IF NOT EXISTS min_price_cached numeric;
ALTER TABLE apis ADD COLUMN IF NOT EXISTS max_price_cached numeric;

-- Trigger function: after api_pricing_plans change, recompute cached min/max for that api.
CREATE OR REPLACE FUNCTION sync_apis_cached_pricing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_id uuid;
BEGIN
  v_api_id := COALESCE(NEW.api_id, OLD.api_id);
  UPDATE apis
  SET
    min_price_cached = (SELECT MIN(pp.price_monthly) FROM api_pricing_plans pp WHERE pp.api_id = v_api_id),
    max_price_cached = (SELECT MAX(pp.price_monthly) FROM api_pricing_plans pp WHERE pp.api_id = v_api_id)
  WHERE id = v_api_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_apis_cached_pricing ON api_pricing_plans;
CREATE TRIGGER trg_sync_apis_cached_pricing
  AFTER INSERT OR UPDATE OR DELETE ON api_pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION sync_apis_cached_pricing();

-- Backfill existing apis
UPDATE apis
SET
  min_price_cached = (SELECT MIN(pp.price_monthly) FROM api_pricing_plans pp WHERE pp.api_id = apis.id),
  max_price_cached = (SELECT MAX(pp.price_monthly) FROM api_pricing_plans pp WHERE pp.api_id = apis.id);
