-- Finished, locally rendered fusions are private media, separate from paid jobs/budgets.
create table public.video_fusions (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 80),
 duration integer not null check (duration in (5,10)),
 storage_path text not null unique,
 created_at timestamptz not null default now(),
 check (storage_path = user_id::text || '/' || id::text || '.mp4')
);
alter table public.video_fusions enable row level security;
grant select,insert on public.video_fusions to authenticated;
create policy "Read own fusions" on public.video_fusions for select to authenticated using (user_id=auth.uid());
create policy "Save own fusions" on public.video_fusions for insert to authenticated with check (user_id=auth.uid());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('video-fusions','video-fusions',false,52428800,array['video/mp4']);
create policy "Read own fusion files" on storage.objects for select to authenticated
using(bucket_id='video-fusions' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Upload own fusion files" on storage.objects for insert to authenticated
with check(bucket_id='video-fusions' and (storage.foldername(name))[1]=auth.uid()::text);
