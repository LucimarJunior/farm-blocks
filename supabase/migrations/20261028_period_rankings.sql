-- Execute uma vez no SQL Editor do Supabase antes de ativar rankings por período.
create table if not exists public.farm_blocks_matches (
  id uuid primary key,
  player_id uuid not null references auth.users(id) on delete cascade,
  player_name varchar(20) not null,
  score integer not null check (score >= 0),
  finished_at timestamptz not null default now()
);
create index if not exists farm_blocks_matches_period_idx on public.farm_blocks_matches (finished_at, player_id);
alter table public.farm_blocks_matches enable row level security;
revoke all on public.farm_blocks_matches from anon, authenticated;
create or replace function public.farm_blocks_submit_match(p_match_id uuid, p_player_name text, p_score integer)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_name text := trim(p_player_name);
begin
  if auth.uid() is null then raise exception 'Jogador não autenticado'; end if;
  if length(v_name) not between 1 and 20 or p_score is null or p_score < 0 then
    raise exception 'Dados inválidos';
  end if;
  insert into public.farm_blocks_matches(id,player_id,player_name,score)
  values(p_match_id,auth.uid(),v_name,p_score)
  on conflict (id) do nothing;
  -- Somente uma partida realmente inserida pode atualizar o recorde.
  if found then
    perform public.farm_blocks_submit_score(v_name,p_score);
  end if;
end; $$;
revoke all on function public.farm_blocks_submit_match(uuid,text,integer) from public, anon;
grant execute on function public.farm_blocks_submit_match(uuid,text,integer) to authenticated;

create or replace function public.farm_blocks_period_ranking(p_period text)
returns table(player_name text, score bigint) language plpgsql security definer set search_path = public, pg_temp as $$
declare v_start timestamptz;
declare v_end timestamptz;
begin
  if p_period = 'weekly' then
    v_start := (date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo');
    v_end := v_start + interval '7 days';
  elsif p_period = 'monthly' then
    v_start := (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo');
    v_end := (date_trunc('month', (now() at time zone 'America/Sao_Paulo') + interval '1 month') at time zone 'America/Sao_Paulo');
  else
    raise exception 'Período inválido';
  end if;
  return query
  select (array_agg(m.player_name order by m.finished_at desc))[1]::text, sum(m.score)::bigint
  from public.farm_blocks_matches m
  where m.finished_at >= v_start and m.finished_at < v_end
  group by m.player_id
  order by sum(m.score) desc
  limit 10;
end; $$;
revoke all on function public.farm_blocks_period_ranking(text) from public;
grant execute on function public.farm_blocks_period_ranking(text) to anon, authenticated;
