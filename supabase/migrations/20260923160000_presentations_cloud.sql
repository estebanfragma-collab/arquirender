-- Additive only: existing renders, profiles and credits are unchanged.
begin;
create table public.presentations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 name text not null check (length(trim(name)) between 1 and 120),
 document jsonb not null check (jsonb_typeof(document) = 'object' and octet_length(document::text) <= 1048576),
 revision integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index presentations_user_updated on public.presentations(user_id,updated_at desc);
alter table public.presentations enable row level security;
revoke all on public.presentations from anon, authenticated;
grant select, insert, update, delete on public.presentations to authenticated;
create policy presentations_owner on public.presentations for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.presentations_touch() returns trigger language plpgsql set search_path = '' as $$
begin
 new.updated_at = now();
 new.revision = old.revision + 1;
 return new;
end;
$$;
create trigger presentations_touch before update on public.presentations for each row execute function public.presentations_touch();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('presentation-images','presentation-images',false,20971520,array['image/png','image/jpeg','image/webp']);
create policy presentation_images_read on storage.objects for select to authenticated
using (bucket_id='presentation-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy presentation_images_insert on storage.objects for insert to authenticated
with check (bucket_id='presentation-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
