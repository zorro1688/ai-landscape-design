-- Drop tables left over from the original Chinese Name Generator product.
-- These were confirmed unused by any remaining application code as of
-- the AI Landscape Design migration (no .from(...) references found in
-- app/, components/, lib/, or utils/).
--
-- NOT included here (still in active use, do not drop):
--   - ip_usage_logs        (used by the check_ip_rate_limit RPC, which the
--                            landscape generate API still relies on)
--   - customers, credits_history, subscriptions (core billing tables)
--   - generated_designs    (the new landscape design table)
--
-- This is a destructive, irreversible operation. Any data still sitting in
-- these tables (e.g. old test names, old test credit logs) will be lost.
-- Make sure you actually want this before running it against production.

-- generated_names has a FK to generation_batches, so CASCADE handles the
-- drop order automatically, but we drop the child table explicitly first
-- for clarity anyway.
drop table if exists public.generated_names cascade;
drop table if exists public.generation_batches cascade;

drop table if exists public.saved_names cascade;
drop table if exists public.popular_names cascade;
drop table if exists public.name_generation_logs cascade;

-- Legacy pre-starter-kit credit system, superseded by customers/credits_history.
drop table if exists public.credit_transactions cascade;
drop table if exists public.user_credits cascade;

-- One-time migration helper function tied to the now-dropped user_credits /
-- credit_transactions tables. Safe to remove since the migration it
-- performed has already run (or never applied, if this is a fresh project).
drop function if exists migrate_chinesename_credits();
