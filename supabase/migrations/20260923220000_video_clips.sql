-- Private, capped owner pilot. Clients cannot create jobs or alter billing state.
create table public.video_pilot_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 budget_usd numeric(10,4) not null check(budget_usd>0),
 enabled boolean not null default true
);
alter table public.video_pilot_accounts enable row level security;
revoke all on public.video_pilot_accounts from public,anon,authenticated;
insert into public.video_pilot_accounts(user_id,budget_usd)
select id,1.00 from auth.users where lower(email)='estebanfragma@gmail.com';
create table public.video_clip_jobs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 scene_id uuid not null,
 name text not null,
 payload jsonb not null,
 estimated_usd numeric(10,4) not null check(estimated_usd>0 and estimated_usd<=1),
 state text not null default 'quoted' check(state in ('quoted','submitting','queued','in_progress','completed','failed','nsfw','canceled','unknown')),
 expires_at timestamptz not null default now()+interval '10 minutes',
 request_id text,
 provider_url text,
 storage_path text,
 created_at timestamptz not null default now()
);
alter table public.video_clip_jobs enable row level security;
revoke all on public.video_clip_jobs from public,anon,authenticated;
create index video_clip_jobs_owner on public.video_clip_jobs(user_id,created_at desc);
grant all on public.video_clip_jobs, public.video_pilot_accounts to service_role;
create function public.claim_video_clip(p_user_id uuid,p_job_id uuid) returns text
language plpgsql security definer set search_path='' as $$
declare a public.video_pilot_accounts%rowtype; j public.video_clip_jobs%rowtype; spent numeric;
begin
 select * into a from public.video_pilot_accounts where user_id=p_user_id for update;
 if not found or not a.enabled then return 'disabled'; end if;
 select * into j from public.video_clip_jobs where id=p_job_id and user_id=p_user_id for update;
 if not found then return 'missing'; end if;
 if j.state<>'quoted' then return 'existing'; end if;
 if j.expires_at<now() then return 'expired'; end if;
 if exists(select 1 from public.video_clip_jobs where user_id=p_user_id and state in ('submitting','queued','in_progress','unknown')) then return 'active'; end if;
 select coalesce(sum(estimated_usd),0) into spent from public.video_clip_jobs where user_id=p_user_id and state not in ('quoted','failed','nsfw','canceled');
 if spent+j.estimated_usd>a.budget_usd then return 'budget'; end if;
 update public.video_clip_jobs set state='submitting' where id=j.id;
 return 'claimed';
end;
$$;
revoke all on function public.claim_video_clip(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_video_clip(uuid,uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('video-clips','video-clips',false,52428800,array['video/mp4']);
-- Clips are served only through short-lived links created after online owner validation.
