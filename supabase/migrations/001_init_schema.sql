create extension if not exists pgcrypto;

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  website_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  provider_id uuid not null references providers(id) on delete restrict,
  source text not null check (source in ('paid', 'free_api')),
  context_window text not null,
  speed_score smallint not null check (speed_score between 1 and 5),
  cost_label text not null,
  capability_tags text[] not null default '{}',
  is_new_2026 boolean not null default false,
  status text not null default 'active' check (status in ('active', 'retired', 'unverified')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_models_provider_id on models(provider_id);
create index if not exists idx_models_source on models(source);
create index if not exists idx_models_speed on models(speed_score desc);

create table if not exists chatbots (
  id uuid primary key default gen_random_uuid(),
  rank smallint not null unique check (rank between 1 and 10),
  slug text not null unique,
  name text not null,
  provider_id uuid not null references providers(id) on delete restrict,
  best_for text not null,
  free_model_name text not null,
  context_window text not null,
  signup_required text not null check (signup_required in ('none', 'email', 'phone')),
  web_search_free boolean not null default false,
  limit_note text not null,
  url text not null,
  use_case_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chatbots_provider_id on chatbots(provider_id);
create index if not exists idx_chatbots_signup_required on chatbots(signup_required);

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  input_text text not null,
  rec1_source text not null check (rec1_source in ('model', 'chatbot')),
  rec1_slug text not null,
  rec1_reason text not null,
  rec2_source text not null check (rec2_source in ('model', 'chatbot')),
  rec2_slug text not null,
  rec2_reason text not null,
  used_model text not null,
  fallback boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_suggestions_created_at on suggestions(created_at desc);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references chatbots(id) on delete cascade,
  user_id uuid not null,
  vote_value smallint not null check (vote_value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, chatbot_id)
);

create index if not exists idx_votes_chatbot_id on votes(chatbot_id);

alter table providers enable row level security;
alter table models enable row level security;
alter table chatbots enable row level security;
alter table suggestions enable row level security;
alter table votes enable row level security;

drop policy if exists providers_public_read on providers;
create policy providers_public_read on providers for select using (true);

drop policy if exists models_public_read on models;
create policy models_public_read on models for select using (true);

drop policy if exists chatbots_public_read on chatbots;
create policy chatbots_public_read on chatbots for select using (true);

drop policy if exists suggestions_public_insert on suggestions;
create policy suggestions_public_insert on suggestions for insert to anon, authenticated with check (true);

drop policy if exists votes_authenticated_rw on votes;
create policy votes_authenticated_rw on votes
  for all
  to authenticated
  using (auth.uid()::text = user_id::text)
  with check (auth.uid()::text = user_id::text);
