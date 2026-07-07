-- Tabla de perfiles con créditos por usuario
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  creditos integer not null default 3,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

-- Cada usuario solo ve su propio perfil
create policy "Usuarios pueden ver su propio perfil"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Cada usuario solo actualiza su propio perfil
create policy "Usuarios pueden actualizar su propio perfil"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Crea automáticamente el perfil al registrarse un usuario nuevo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, creditos)
  values (new.id, new.email, 3)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger: ejecuta handle_new_user después de crear el usuario
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Descuenta 1 crédito si hay disponibles; devuelve true/false
create or replace function public.descontar_credito(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  actualizado integer;
begin
  update public.profiles
  set creditos = creditos - 1
  where id = user_id
    and creditos > 0;

  get diagnostics actualizado = row_count;

  return actualizado > 0;
end;
$$;
