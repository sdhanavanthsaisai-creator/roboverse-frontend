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

-- ──────────────── optional: seed the 8 members ─────────────
insert into public.members (id, name, role, photo, instagram, github, email, bio) values
  (1, 'Member One',   'Team Lead · Navigation',   'photos/member1.jpg', 'https://instagram.com/', 'https://github.com/', 'member1@teamroboto.dev', 'Owns the planner stack and the daily commit streak.'),
  (2, 'Member Two',   'Sensor Fusion',            'photos/member2.jpg', 'https://instagram.com/', 'https://github.com/', 'member2@teamroboto.dev', 'Kalman filters, ultrasonic rigs, and noisy data.'),
  (3, 'Member Three', 'Embedded Systems',         'photos/member3.jpg', 'https://instagram.com/', 'https://github.com/', 'member3@teamroboto.dev', 'Firmware, motor drivers, and the 5 kg weight budget.'),
  (4, 'Member Four',  'CAD & Mechanical',         'photos/member4.jpg', 'https://instagram.com/', 'https://github.com/', 'member4@teamroboto.dev', 'Chassis, mounts, and printable sensor brackets.'),
  (5, 'Member Five',  'Computer Vision',          'photos/member5.jpg', 'https://instagram.com/', 'https://github.com/', 'member5@teamroboto.dev', 'Detecting walls, exits, and things that moved.'),
  (6, 'Member Six',   'Reinforcement Learning',   'photos/member6.jpg', 'https://instagram.com/', 'https://github.com/', 'member6@teamroboto.dev', 'Q-learning so attempt 50 beats attempt 1.'),
  (7, 'Member Seven', 'Power & Electronics',      'photos/member7.jpg', 'https://instagram.com/', 'https://github.com/', 'member7@teamroboto.dev', 'Battery, PCB, and keeping the magic smoke inside.'),
  (8, 'Member Eight', 'Web & Documentation',      'photos/member8.jpg', 'https://instagram.com/', 'https://github.com/', 'member8@teamroboto.dev', 'This website, the reports, and the slide deck.')
on conflict (id) do nothing;
