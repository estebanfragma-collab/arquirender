-- Créditos iniciales del plan free: 3 → 4
-- Motivo: las variaciones de estilo cuestan 3 generaciones. Con 3 créditos
-- iniciales un usuario free podía usarlas, pero se quedaba sin nada para
-- probar el render simple. Con 4 puede hacer ambas cosas.
--
-- El valor vive en dos sitios y ambos deben cambiar o quedan desincronizados:
--   1. el default de la columna
--   2. el insert del trigger handle_new_user()

-- 1) Default de la columna
alter table public.profiles
  alter column creditos set default 4;

-- 2) Trigger de alta de usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, creditos)
  values (new.id, new.email, 4)
  on conflict (id) do nothing;
  return new;
end;
$$;
