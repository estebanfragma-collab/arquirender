-- Isolated pilot: stores scene plans only. No video-generation spending is enabled.
create table public.video_projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 name text not null check(length(btrim(name)) between 1 and 120),
 scenes jsonb not null check(jsonb_typeof(scenes)='array' and jsonb_array_length(scenes) between 1 and 24 and octet_length(scenes::text)<250000),
 revision integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.video_projects enable row level security;
revoke all on public.video_projects from public,anon,authenticated;
grant select,insert,update,delete on public.video_projects to authenticated;
create policy video_projects_owner on public.video_projects for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create index video_projects_owner_updated on public.video_projects(user_id,updated_at desc);
create function public.video_projects_touch() returns trigger language plpgsql set search_path='' as $$
begin new.revision:=old.revision+1;new.updated_at:=now();return new;end;
$$;
create trigger video_projects_touch before update on public.video_projects for each row execute function public.video_projects_touch();
create table public.video_prompt_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 usage_day date not null,
 attempts integer not null default 0 check(attempts between 0 and 30),
 last_request timestamptz not null default '-infinity',
 primary key(user_id,usage_day)
);
alter table public.video_prompt_usage enable row level security;
revoke all on public.video_prompt_usage from public,anon,authenticated;
create function public.reserve_video_prompt(p_user_id uuid) returns text language plpgsql security definer set search_path='' as $$
declare v_day date:=(now() at time zone 'UTC')::date; v_row public.video_prompt_usage%rowtype;
begin
 insert into public.video_prompt_usage(user_id,usage_day) values(p_user_id,v_day) on conflict do nothing;
 select * into v_row from public.video_prompt_usage where user_id=p_user_id and usage_day=v_day for update;
 if v_row.attempts>=30 then return 'daily';end if;
 if v_row.last_request>now()-interval '10 seconds' then return 'wait';end if;
 update public.video_prompt_usage set attempts=attempts+1,last_request=now() where user_id=p_user_id and usage_day=v_day;
 return 'ok';
end;
$$;
revoke all on function public.reserve_video_prompt(uuid) from public,anon,authenticated;
grant execute on function public.reserve_video_prompt(uuid) to service_role;
