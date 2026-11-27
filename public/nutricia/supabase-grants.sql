-- ============================================================
--  ПАТЧ: GRANT-привилегии для таблицы kv (роль anon + service_role)
--  Выполнить ОДИН РАЗ в SQL Editor (https://supabase.com/dashboard)
--  в проекте utxcjvgskntcfnjoxixs.
--
--  Симптом: REST API возвращает 42501 "permission denied for table kv"
--           при попытке чтения/записи через anon public key.
--  Причина: create table + enable RLS НЕ выдаёт автоматически права
--           ролям anon/service_role в свежих проектах Supabase.
--  Решение: явно выдать GRANT.
-- ============================================================

-- 1. Полные права для публичной роли (фронтенд с anon public key).
--    RLS-политика "all_access" уже разрешает все строки — теперь
--    добавляем права на сами операции с таблицей.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kv TO anon;

-- 2. Полные права для сервисной роли (серверный код, бэкапы).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kv TO service_role;

-- 3. Право на использование последовательности (если позже добавим id serial).
--    Сейчас primary key — text, последовательности нет, но на будущее:
--    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, service_role;

-- 4. Проверка: должны увидеть обе роли с нужными правами.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'kv' AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- Ожидаемый результат (6 строк):
--   anon          | DELETE
--   anon          | INSERT
--   anon          | SELECT
--   anon          | UPDATE
--   service_role  | DELETE
--   service_role  | INSERT
--   service_role  | SELECT
--   service_role  | UPDATE

-- ============================================================
--  После выполнения:
--    - REST API с anon public key начнёт читать и писать kv
--    - Приложение «Рацион» заработает синхронизация врач↔клиент
--    - Realtime-подписки заработают (publication уже добавлена в основной схеме)
-- ============================================================
