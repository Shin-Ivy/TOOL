-- PIXEL.TOOLS — Phase 1 Supabase schema (idempotent)
-- Run in Supabase Dashboard → SQL Editor

-- ── Tables ─────────────────────────────────────────────────────

create table if not exists public.tool_usage_logs (
  id         uuid primary key default gen_random_uuid(),
  tool_name  text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_history (
  id              uuid primary key default gen_random_uuid(),
  platform        text not null,
  generated_text  text not null,
  created_at      timestamptz not null default now()
);

-- ── Indexes (lightweight analytics / history queries) ───────────

create index if not exists tool_usage_logs_created_at_idx
  on public.tool_usage_logs (created_at desc);

create index if not exists tool_usage_logs_tool_name_idx
  on public.tool_usage_logs (tool_name);

create index if not exists content_history_created_at_idx
  on public.content_history (created_at desc);

create index if not exists content_history_platform_idx
  on public.content_history (platform);

-- ── Row Level Security ───────────────────────────────────────────

alter table public.tool_usage_logs enable row level security;
alter table public.content_history enable row level security;

-- Allow anonymous + authenticated clients to INSERT usage logs
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tool_usage_logs'
      and policyname = 'allow_insert_tool_usage_logs'
  ) then
    create policy "allow_insert_tool_usage_logs"
      on public.tool_usage_logs
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

-- Allow INSERT for generated content (Phase 2 tools will use this)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'content_history'
      and policyname = 'allow_insert_content_history'
  ) then
    create policy "allow_insert_content_history"
      on public.content_history
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
