-- Run after the video_clips migration. All test writes roll back.
begin;
do $$
declare u uuid; j uuid; j2 uuid; result text;
begin
 u:=gen_random_uuid();
 insert into auth.users(id,email) values(u,'video-pilot-test-'||u::text||'@example.invalid');
 insert into public.video_pilot_accounts(user_id,budget_usd) values(u,1.00);
 insert into public.video_clip_jobs(user_id,scene_id,name,payload,estimated_usd) values(u,gen_random_uuid(),'test','{}',0.6) returning id into j;
 if public.claim_video_clip(u,j)<>'claimed' then raise exception 'claim failed'; end if;
 if public.claim_video_clip(u,j)<>'existing' then raise exception 'duplicate protection failed'; end if;
 insert into public.video_clip_jobs(user_id,scene_id,name,payload,estimated_usd) values(u,gen_random_uuid(),'test2','{}',0.6) returning id into j2;
 if public.claim_video_clip(u,j2)<>'active' then raise exception 'active protection failed'; end if;
 update public.video_clip_jobs set state='completed' where id=j;
 if public.claim_video_clip(u,j2)<>'budget' then raise exception 'budget failed'; end if;
 update public.video_clip_jobs set state='failed' where id=j;
 update public.video_clip_jobs set expires_at=now()-interval '1 hour' where id=j2;
 if public.claim_video_clip(u,j2)<>'expired' then raise exception 'expiry failed'; end if;
 if public.claim_video_clip(gen_random_uuid(),j)<>'disabled' then raise exception 'owner failed'; end if;
 if has_table_privilege('authenticated','public.video_clip_jobs','select') or has_table_privilege('authenticated','public.video_clip_jobs','insert') then raise exception 'private table grants failed'; end if;
 if has_function_privilege('authenticated','public.claim_video_clip(uuid,uuid)','execute') then raise exception 'rpc grants failed'; end if;
end $$;

rollback;
