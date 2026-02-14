-- Add organization_id and user_id to workflow tables if missing (for RLS and scoping)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workflow_definitions' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE workflow_definitions ADD COLUMN organization_id uuid REFERENCES organizations(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workflow_definitions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workflow_definitions ADD COLUMN user_id uuid REFERENCES users(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workflow_executions' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE workflow_executions ADD COLUMN organization_id uuid REFERENCES organizations(id);
  END IF;
END $$;
