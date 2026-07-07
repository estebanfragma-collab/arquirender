-- Columnas para gestión de suscripciones Paddle en profiles
alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  add column if not exists paddle_subscription_id text;

-- Índice para buscar rápido por subscription id (usado al cancelar)
create index if not exists profiles_paddle_subscription_id_idx
  on public.profiles (paddle_subscription_id);
