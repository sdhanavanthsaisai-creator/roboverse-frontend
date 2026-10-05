-- ROBOVERSE · Team Roboto — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Policy model: public can read members/code_snippets/maze_attempts,
-- public can insert messages and maze_attempts. No anonymous writes to members.

-- ───────────────────────── members ─────────────────────────
create table if not exists public.members (
  id bigint primary key,
  name text not null,
  role text not null,
  photo text not null default '',
  instagram text not null default '',
  github text not null default '',
  linkedin text not null default '',
  email text not null default '',
  bio text not null default ''
);

alter table public.members enable row level security;
drop policy if exists "members are publicly readable" on public.members;
create policy "members are publicly readable"
  on public.members for select
  using (true);

-- ─────────────────────── code_snippets ─────────────────────
create table if not exists public.code_snippets (
  id bigint generated always as identity primary key,
  module text not null,
  language text not null default 'Python',
  source text
);

alter table public.code_snippets enable row level security;
drop policy if exists "snippets are publicly readable" on public.code_snippets;
create policy "snippets are publicly readable"
  on public.code_snippets for select
  using (true);

-- ─────────────────────── maze_attempts ─────────────────────
create table if not exists public.maze_attempts (
  id bigint generated always as identity primary key,
  path_cost int not null,
  attempts int not null default 1,
  duration_ms int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.maze_attempts enable row level security;
drop policy if exists "attempts are publicly readable" on public.maze_attempts;
create policy "attempts are publicly readable"
  on public.maze_attempts for select
  using (true);
drop policy if exists "anyone can log an attempt" on public.maze_attempts;
create policy "anyone can log an attempt"
  on public.maze_attempts for insert
  with check (true);

-- ───────────────────────── messages ────────────────────────
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
drop policy if exists "messages are publicly readable" on public.messages;
create policy "messages are publicly readable"
  on public.messages for select
  using (true);
drop policy if exists "anyone can leave a message" on public.messages;
create policy "anyone can leave a message"
  on public.messages for insert
  with check (true);

-- ──────────────── optional: seed the 5 members ─────────────
insert into public.members (id, name, role, photo, instagram, github, linkedin, email, bio) values
  (1, 'M. Swastii',     '1st Year ECE · Cyber Physical Systems',        'photos/member1.jpg', 'https://instagram.com/mswastii_75',   '',                         'https://www.linkedin.com/in/m-swastii-murugesan-00717a429', '',                          '1st year ECE — Cyber Physical Systems team member.'),
  (2, 'Ishani Garg',    'Member · Team Roboto',                          'photos/member2.jpg', 'https://instagram.com/stfuishani_',   '',                         'https://www.linkedin.com/in/ishani-garg-b1a339425',         'ishanigarg2@gmail.com',     'Reports, slide deck, and keeping the crew on schedule.'),
  (3, 'Dhanavanthsai',  'Web & Documentation',                           'photos/member3.jpg', 'https://instagram.com/dhanavanth_17', '',                         'https://www.linkedin.com/in/dhanavanth-sai-16a272414',      'dhanavanthsai.s@gmail.com', 'This website and the project documentation.'),
  (4, 'Muhammed Nehan', 'Electronics & Computer Engineering (EKE)',      'photos/member4.jpg', 'https://instagram.com/nvm.nehan',     'https://github.com/K1llaloe', 'https://www.linkedin.com/in/muhammed-nehan-472694368',   'ciphertrooper@gmail.com',   'Electronics and computer engineering, class of 2030.'),
  (5, 'Nipun Gaur',     '1st Year B.Tech CSE (IT)',                      'photos/member5.jpg', 'https://instagram.com/nipun2908',     '',                         'https://www.linkedin.com/in/nipun-gaur-b42408429',          'nipungaur2008@gmail.com',   '1st year B.Tech CSE (IT) team member.')
on conflict (id) do nothing;
