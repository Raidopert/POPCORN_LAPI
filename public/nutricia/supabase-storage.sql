-- ============================================================
--  ПАТЧ: Storage bucket + RLS-политики для фото в чате
--  Выполнить ОДИН РАЗ в SQL Editor (https://supabase.com/dashboard)
--  в проекте utxcjvgskntcfnjoxixs.
--
--  Зачем: приложение отправляет фото блюд/документов в чате.
--  Раньше фото хранилось как base64 прямо в таблице kv (вместе с
--  текстом сообщений) — это распухает БД и ломает realtime-синхронизацию
--  (payload обновления становится слишком большим).
--  Теперь фото грузится в Storage, в kv хранится только короткий URL.
--
--  Что делает этот скрипт:
--    1. Создаёт публичный bucket "chat-photos" (если ещё нет)
--    2. Разрешает anon: INSERT (загрузка), SELECT (чтение публичных URL)
--       DELETE не даём anon (безопасность — удалить может только владелец
--       через service_role, это не нужно для MVP)
-- ============================================================

-- 1. Bucket (public — чтобы фото открывались по прямой ссылке)
insert into storage.buckets (id, name, public)
values ('chat-photos', 'chat-photos', true)
on conflict (id) do nothing;

-- 2. RLS-политика: anon может загружать файлы (insert)
drop policy if exists "anon upload chat-photos" on storage.objects;
create policy "anon upload chat-photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'chat-photos');

-- 3. RLS-политика: anon может читать (select) — нужен для отображения
drop policy if exists "anon read chat-photos" on storage.objects;
create policy "anon read chat-photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'chat-photos');

-- 4. Проверка: должны увидеть 2 политики для bucket chat-photos
select policyname, cmd from pg_policies
where tablename = 'objects' and schemaname = 'storage'
  and qual like '%chat-photos%';

-- Ожидаемый результат (2 строки):
--   anon read chat-photos   | SELECT
--   anon upload chat-photos | INSERT

-- ============================================================
--  После выполнения:
--    - Клиент/врач загружают фото → они появляются в Storage
--    - В kv хранится только короткий URL (вид: https://...supabase.co/storage/v1/object/public/chat-photos/...)
--    - Realtime-синхронизация перестаёт тормозить (payload маленький)
--    - Фото доступны по прямой ссылке (bucket публичный)
--
--  Размер: каждый файл до ~5 МБ (лимит Storage на free-плане — 1 ГБ всего,
--  этого хватит на ~200-400 фото при сжатии).
-- ============================================================
