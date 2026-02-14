# Database migrations

Migrations in `supabase/migrations/` are applied to the linked Supabase project via the Supabase CLI (`supabase db push`) or the Supabase dashboard.

**No pending migrations:** After applying any new migration (e.g. `20260213230000_feature_flags_allow_platform_admin_update.sql`), ensure it is run against the project so the repo and database stay in sync. The Supabase MCP or dashboard lists applied migrations.

**Note:** The project may have migrations that were applied outside this repo (e.g. from another branch or dashboard). When adding a new migration, use a timestamped filename and apply it once.
