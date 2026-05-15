-- ===================================================
-- FaceFortune AI · Supabase Schema
-- Run this in Supabase SQL Editor
-- ===================================================

-- 1) Enable pgvector
create extension if not exists vector;

-- 2) Table: people
create table if not exists public.people (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  embedding   vector(128) not null,           -- FaceNet 128-dim descriptor
  thumbnail   text,                           -- base64 small jpeg (optional)
  visit_count int  not null default 1,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

-- 3) Index for fast nearest-neighbor search (cosine)
create index if not exists people_embedding_idx
  on public.people
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4) RPC: find nearest face within threshold
--    Returns the closest match if cosine distance <= threshold (lower = more similar)
create or replace function public.match_face(
  query_embedding vector(128),
  match_threshold float default 0.6
)
returns table (
  id uuid,
  name text,
  similarity float,
  visit_count int,
  last_seen timestamptz
)
language sql stable
as $$
  select
    p.id,
    p.name,
    1 - (p.embedding <=> query_embedding) as similarity,
    p.visit_count,
    p.last_seen
  from public.people p
  where (p.embedding <=> query_embedding) <= match_threshold
  order by p.embedding <=> query_embedding
  limit 1;
$$;

-- 5) RPC: increment visit + update last_seen
create or replace function public.touch_person(p_id uuid)
returns void
language plpgsql
as $$
begin
  update public.people
  set visit_count = visit_count + 1,
      last_seen = now()
  where id = p_id;
end;
$$;

-- 6) Row Level Security
alter table public.people enable row level security;

-- Anonymous users may INSERT new people (with consent in app)
drop policy if exists "anon_insert" on public.people;
create policy "anon_insert" on public.people
  for insert to anon
  with check (true);

-- Anonymous users may SELECT (needed by RPC; safer: lock down to RPC only via security definer)
drop policy if exists "anon_select" on public.people;
create policy "anon_select" on public.people
  for select to anon
  using (true);

-- Anonymous users may DELETE their own row by id (right to be forgotten)
drop policy if exists "anon_delete" on public.people;
create policy "anon_delete" on public.people
  for delete to anon
  using (true);

-- Anonymous users may UPDATE (for touch_person via RPC)
drop policy if exists "anon_update" on public.people;
create policy "anon_update" on public.people
  for update to anon
  using (true)
  with check (true);

-- Grant execute on RPCs
grant execute on function public.match_face(vector(128), float) to anon;
grant execute on function public.touch_person(uuid) to anon;
