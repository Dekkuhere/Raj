create table if not exists public.visitors (
  vid text primary key check (length(vid) between 1 and 64),
  vote smallint not null default 0 check (vote in (-1, 0, 1)),
  won boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.visitors enable row level security;
revoke all on table public.visitors from anon, authenticated;

create or replace function public.register_visit(p_vid text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_vid is null or length(btrim(p_vid)) not between 1 and 64 then
    raise exception 'Invalid visitor id';
  end if;

  insert into public.visitors (vid) values (btrim(p_vid))
  on conflict (vid) do nothing;
end;
$$;

create or replace function public.get_stats(p_vid text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if p_vid is null or length(btrim(p_vid)) not between 1 and 64 then
    raise exception 'Invalid visitor id';
  end if;

  insert into public.visitors (vid) values (btrim(p_vid))
  on conflict (vid) do nothing;

  select jsonb_build_object(
    'visitors', (select count(*) from public.visitors),
    'contributions', (select count(*) from public.visitors where won),
    'likes', (select count(*) from public.visitors where vote = 1),
    'dislikes', (select count(*) from public.visitors where vote = -1),
    'myVote', coalesce((select vote from public.visitors where vid = p_vid), 0),
    'won', coalesce((select won from public.visitors where vid = p_vid), false)
  ) into result;

  return result;
end;
$$;

create or replace function public.cast_vote(p_vid text, p_vote integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_vid is null or length(btrim(p_vid)) not between 1 and 64 then
    raise exception 'Invalid visitor id';
  end if;
  if p_vote is null or p_vote not in (-1, 0, 1) then
    raise exception 'Invalid vote';
  end if;

  insert into public.visitors (vid, vote) values (btrim(p_vid), p_vote)
  on conflict (vid) do update set vote = excluded.vote;
end;
$$;

create or replace function public.record_win(p_vid text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_vid is null or length(btrim(p_vid)) not between 1 and 64 then
    raise exception 'Invalid visitor id';
  end if;

  insert into public.visitors (vid, won) values (btrim(p_vid), true)
  on conflict (vid) do update set won = true;
end;
$$;

revoke all on function public.register_visit(text) from public, anon, authenticated;
revoke all on function public.get_stats(text) from public, anon, authenticated;
revoke all on function public.cast_vote(text, integer) from public, anon, authenticated;
revoke all on function public.record_win(text) from public, anon, authenticated;
grant execute on function public.register_visit(text), public.get_stats(text),
  public.cast_vote(text, integer), public.record_win(text) to anon, authenticated;
