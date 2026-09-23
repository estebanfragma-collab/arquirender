-- Separate from render credits. Only the authenticated Edge Function may reserve attempts.
create table public.presentation_analysis_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  attempts integer not null default 0 check(attempts between 0 and 30),
  last_request timestamptz not null default '-infinity',
  primary key(user_id, usage_day)
);
alter table public.presentation_analysis_usage enable row level security;
revoke all on public.presentation_analysis_usage from public, anon, authenticated;
create function public.reserve_presentation_analysis(p_user_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_day date := (now() at time zone 'UTC')::date;
  v_row public.presentation_analysis_usage%rowtype;
begin
  insert into public.presentation_analysis_usage(user_id,usage_day) values(p_user_id,v_day) on conflict do nothing;
  select * into v_row from public.presentation_analysis_usage where user_id=p_user_id and usage_day=v_day for update;
  if v_row.attempts >= 30 then return 'daily'; end if;
  if v_row.last_request > now() - interval '10 seconds' then return 'wait'; end if;
  update public.presentation_analysis_usage set attempts=attempts+1,last_request=now() where user_id=p_user_id and usage_day=v_day;
  return 'ok';
end;
$$;
revoke all on function public.reserve_presentation_analysis(uuid) from public, anon, authenticated;
grant execute on function public.reserve_presentation_analysis(uuid) to service_role;
