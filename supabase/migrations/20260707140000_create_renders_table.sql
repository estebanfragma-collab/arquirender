-- Historial de renders generados por cada usuario
create table if not exists public.renders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  imagen_generada_url text not null,
  imagen_original_url text,
  prompt text,
  estilo text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.renders enable row level security;

-- Cada usuario solo ve sus propios renders
create policy "Usuarios pueden ver sus propios renders"
  on public.renders
  for select
  using (auth.uid() = user_id);

-- Privilegios de tabla para el rol del API (la RLS restringe por fila)
grant select, insert on public.renders to authenticated;

-- Índice para listar rápido el historial por usuario
create index if not exists renders_user_id_idx on public.renders (user_id);
