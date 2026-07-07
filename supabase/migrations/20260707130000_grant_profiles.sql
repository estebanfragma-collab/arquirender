-- Otorga privilegios de tabla al rol authenticated sobre profiles.
-- La RLS ya restringe por fila (auth.uid() = id); esto solo concede el
-- privilegio de tabla que faltaba y que Postgres exige antes de evaluar la RLS.
grant select, update on public.profiles to authenticated;
