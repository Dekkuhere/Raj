-- Run this whole file once in Supabase → SQL Editor.
-- IMPORTANT: change the admin email below (2 places: function is_admin) to the email you will log in with.

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'notraj2006@gmail.com'
$$;

-- ---------- site settings (single row) ----------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  name text default 'Raj Sharma',
  tagline text default '3rd year aspiring MERN developer',
  resume_url text default '/resume.pdf',
  resume_preview_url text default '/assets/resume-preview.jpg',
  resume_filename text default 'Raj-Sharma-Resume.pdf'
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ---------- connect links ----------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null default '#',
  icon text not null default 'link',
  sort_order int not null default 0
);

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year text, role text, location text, summary text, stack text,
  live text default '#', code text default '#',
  bullets text[] not null default '{}',
  sort_order int not null default 0
);

-- ---------- visitors / votes / wins (only reachable through the functions below) ----------
create table if not exists public.visitors (
  vid text primary key,
  vote smallint not null default 0,
  won boolean not null default false,
  created_at timestamptz default now()
);

-- ---------- row level security ----------
alter table public.site_settings enable row level security;
alter table public.social_links  enable row level security;
alter table public.projects      enable row level security;
alter table public.visitors      enable row level security;

create policy "public read settings" on public.site_settings for select using (true);
create policy "public read links"    on public.social_links  for select using (true);
create policy "public read projects" on public.projects      for select using (true);
create policy "admin write settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write links"    on public.social_links  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write projects" on public.projects      for all using (public.is_admin()) with check (public.is_admin());
-- visitors: no policies = nobody can touch it directly

-- ---------- bug sweeper / stats functions ----------
create or replace function public.register_visit(p_vid text) returns void
language sql security definer set search_path = public as $$
  insert into visitors (vid) values (left(p_vid, 64)) on conflict do nothing;
$$;

create or replace function public.get_stats(p_vid text) returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'visitors', (select count(*) from visitors),
    'contributions', (select count(*) from visitors where won),
    'likes', (select count(*) from visitors where vote = 1),
    'dislikes', (select count(*) from visitors where vote = -1),
    'myVote', coalesce((select vote from visitors where vid = p_vid), 0),
    'won', coalesce((select won from visitors where vid = p_vid), false));
$$;

create or replace function public.cast_vote(p_vid text, p_vote int) returns void
language sql security definer set search_path = public as $$
  insert into visitors (vid, vote) values (left(p_vid, 64), greatest(-1, least(1, p_vote)))
  on conflict (vid) do update set vote = excluded.vote;
$$;

create or replace function public.record_win(p_vid text) returns void
language sql security definer set search_path = public as $$
  insert into visitors (vid, won) values (left(p_vid, 64), true)
  on conflict (vid) do update set won = true;
$$;

grant execute on function public.register_visit(text), public.get_stats(text),
  public.cast_vote(text, int), public.record_win(text) to anon, authenticated;

-- ---------- storage bucket for resume PDF / preview image ----------
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict do nothing;
create policy "public read files" on storage.objects for select using (bucket_id = 'portfolio');
create policy "admin upload files" on storage.objects for insert with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admin update files" on storage.objects for update using (bucket_id = 'portfolio' and public.is_admin());
create policy "admin delete files" on storage.objects for delete using (bucket_id = 'portfolio' and public.is_admin());

-- ---------- starter content ----------
insert into public.social_links (label, href, icon, sort_order) values
  ('Twitter',   '#', 'twitter', 1),
  ('LinkedIn',  '#', 'linkedin', 2),
  ('GitHub',    'https://github.com/Dekkuhere', 'github', 3),
  ('Instagram', '#', 'instagram', 4),
  ('Email',     'mailto:notraj2006@gmail.com', 'email', 5);

insert into public.projects (name, year, role, location, summary, stack, live, code, bullets, sort_order) values
  ('Project Name', '2025', 'Frontend Developer', 'Remote',
   'A short description of what the project does, the problem it solves and what you built.',
   'React · Node.js · Express · MongoDB', '#', '#',
   array['Built the complete frontend of the project, from the layout to the interactive features.',
         'Created the backend API and connected it to a MongoDB database.',
         'Deployed the project and improved its performance and responsiveness.'], 1);
