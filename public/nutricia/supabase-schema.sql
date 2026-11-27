-- ============================================================
--  РАЦИОН — схема Supabase для приложения нутрициолога
--  Запустить один раз в SQL Editor: https://supabase.com/dashboard
--  После выполнения вставьте Project URL + anon key в приложение.
-- ============================================================

-- 1. Хранилище ключ-значение (одна таблица для всех данных)
create table if not exists kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- авто-обновление updated_at при изменении
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_kv_touch on kv;
create trigger trg_kv_touch
  before update on kv
  for each row execute function touch_updated_at();

-- 2. Row Level Security
-- ВАРИАНТ A (по умолчанию, для одного врача + 20 клиентов):
--   полный доступ по anon-ключу. Ключ встроен в приложение.
--   Достаточно безопасно для не-чувствительных данных (меню, вес, чат).
--   Не храните здесь диагнозы, анализы, ФИО полностью.
alter table kv enable row level security;

drop policy if exists "all_access" on kv;
create policy "all_access" on kv
  for all
  using (true)
  with check (true);

-- 2b. GRANT-привилегии для ролей anon и service_role.
--     create table + enable RLS НЕ выдаёт права автоматически в свежих
--     проектах Supabase — без GRANT REST API вернёт 42501 "permission
--     denied for table kv" даже при корректной RLS-политике.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kv TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kv TO service_role;

-- ------------------------------------------------------------
-- ВАРИАНТ B (если позже захотите ужесточить доступ):
--   добавьте колонку owner и проверяйте её через JWT-клеймы.
--   Тогда каждому пользователю нужен свой аккаунт (Supabase Auth).
--
--   alter table kv add column owner text;
--   create policy "own_rows" on kv
--     for all using (auth.uid()::text = owner)
--     with check (auth.uid()::text = owner);
-- ------------------------------------------------------------

-- 3. Realtime — включаем вещание изменений таблицы kv
--    Это нужно, чтобы чат обновлялся мгновенно без перезагрузки.
alter publication supabase_realtime add table kv;

-- 4. Индекс для быстрых префиксных запросов (список клиентов и т.п.)
create index if not exists kv_key_prefix_idx on kv (key text_pattern_ops);

-- 5. (Опционально) авто-очистка записей старше 1 года
--    Раскомментируйте, если хотите, чтобы старые данные удалялись сами.
--    create or replace function cleanup_old_kv() returns void as $$
--      delete from kv where updated_at < now() - interval '1 year';
--    $$ language sql;
--    select cron.schedule('cleanup_kv', '0 3 * * *', 'select cleanup_old_kv()');
--    (для cron нужна активация pg_cron в Supabase Dashboard → Database → Extensions)

-- ============================================================
--  Готово. Проверка:
--    select * from kv limit 5;
--  Должно вернуться 0 строк (пока приложение ничего не записало).
-- ============================================================
