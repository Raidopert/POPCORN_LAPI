# 🐱🍿 Docker: «Кошачий попкорнный Беспредел»

Инструкция по запуску игры в Docker на **своей машине**. Игра собрана из
репозитория [Raidopert/POPCORN_LAPI](https://github.com/Raidopert/POPCORN_LAPI),
версия **pre-alpha 0.0.3**.

---

## Требования

- [Docker](https://docs.docker.com/get-docker/) 20.10+ (Docker Desktop, Docker Engine или Podman с compose-совместимостью)
- Docker Compose v2 (`docker compose ...` — команда с пробелом, плагин)
- ~2 ГБ свободного места на диске

> ⚠️ Важно про образ: базовый образ — `oven/bun:1` на **Debian** (не alpine,
> потому что Prisma и драйвер Postgres требуют glibc). Готовый образ
> **~1 ГБ**, а **первая сборка занимает несколько минут** (установка
> зависимостей + `next build`). Последующие сборки быстрее за счёт
> кеша Docker-слоёв.

---

## Быстрый старт

```bash
# 1. Клонируем репозиторий (если ещё не склонирован)
git clone https://github.com/Raidopert/POPCORN_LAPI.git
cd POPCORN_LAPI

# 2. Собираем и запускаем
docker compose up --build
```

Игра будет доступна на **http://localhost:3000** 🎮

Остановить: `Ctrl+C` (в foreground-режиме) или:

```bash
docker compose down
```

Запуск в фоне:

```bash
docker compose up --build -d
docker compose logs -f game   # смотреть логи
docker compose down           # остановить
```

Без базы данных игра работает **полностью оффлайн**: лидерборд ведётся
локально на устройстве игрока.

---

## Лидерборд: локальный и мировой

| Режим | Условие | Как работает |
|---|---|---|
| **Локальный** | `DATABASE_URL` не задан | Топ сохраняется на устройстве, игра работает оффлайн |
| **Мировой** | задан `DATABASE_URL` (Postgres) | Общий топ игроков со всего мира |

### Вариант 1: мировой лидерборд через Neon (рекомендуется)

Игра создавалась в связке с [Neon](https://neon.tech) — там есть бесплатный
тариф:

1. Создайте проект на neon.tech и скопируйте connection string
   (`postgresql://...neon.tech/neondb?sslmode=require`).
2. В корне проекта создайте файл `.env` и добавьте строку:

   ```env
   DATABASE_URL=postgresql://<логин>:<пароль>@<хост>/<база>?sslmode=require
   ```

   Docker Compose автоматически читает `.env` из корня проекта и передаёт
   переменную в контейнер.
3. Пересоздайте контейнер игры:

   ```bash
   docker compose up -d --force-recreate game
   ```

Таблица лидерборда (`leaders`) создаётся **автоматически** при первом
обращении к `/api/leaders` — ничего вручную создавать не нужно.

### Вариант 2: локальная Postgres через профиль `db`

В compose-файле есть сервис `db` (postgres:16-alpine), который по умолчанию
**не запускается** — он спрятан за профилем `db`:

```bash
# Запускаем игру И базу вместе
docker compose --profile db up --build -d
```

Затем в `.env` в корне проекта укажите строку подключения к контейнерной базе:

```env
DATABASE_URL=postgresql://popcorn:popcorn@db:5432/popcorn
```

И перезапустите игру, чтобы она подхватила переменную:

```bash
docker compose up -d --force-recreate game
```

Подсказки:

- Сервис `db` стартует с healthcheck (`pg_isready`), данные лежат в named
  volume `popcorn-db` и переживают `docker compose down`. Полностью стереть
  базу: `docker compose --profile db down -v`.
- Игровой контейнер **жёстко не привязан** к базе: сервисы независимы,
  соединение идёт через переменную `DATABASE_URL`. Если база была запущена
  позже игры, достаточно `docker compose restart game`.
- Пароль `popcorn`/`popcorn` подходит только для локальной разработки. Не
  выставляйте порт базы наружу без необходимости.

---

## Запуск без compose (docker run)

```bash
docker build -t popcorn-lapi .
docker run -p 3000:3000 popcorn-lapi

# с базой:
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." popcorn-lapi
```

---

## Как устроен образ (кратко)

- **3 стадии** (`deps` → `builder` → `runner`), база — `oven/bun:1` (Debian).
- `deps`: `bun install --frozen-lockfile` по `bun.lock`.
- `builder`: `bun run build` (= `next build`).
- `runner`: только `node_modules`, `.next`, `public`, `prisma`, `package.json`;
  работает от non-root пользователя `bun`.
- **Entrypoint** (`docker-entrypoint.sh`): если задан `DATABASE_URL` — делает
  best-effort `bunx prisma db push --skip-generate --accept-data-loss`
  (падение не критично и не останавливает игру), затем запускает
  `exec bun run start` (порт `3000`, `NODE_ENV=production`).

> Примечание: `prisma db push` в контейнере — «мягкая» попытка: схема в
> репозитории описана для sqlite, а лидерборд игры использует Postgres
> напрямую и сам создаёт нужную таблицу. Поэтому возможное предупреждение в
> логах на старте — это нормально.

---

## Частые вопросы

**Порт 3000 занят.** Поменяйте левую часть маппинга в `docker-compose.yml`
или запустите с другой переменной: `"3001:3000"` → игра на
http://localhost:3001.

**Собрать заново после правок кода:**

```bash
docker compose up --build -d
```

**Где посмотреть логи игры?**

```bash
docker compose logs -f game
```

---

Автор игры — **Raidopert** · Прод: <https://popcorn-lapi.vercel.app> ·
Лицензия — см. [LICENSE](./LICENSE) · Об авторе — см. [AUTHORS.md](./AUTHORS.md)
