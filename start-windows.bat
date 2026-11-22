@echo off
chcp 65001 >nul
title Кошачий попкорнный Беспредел
echo.
echo   ==========================================
echo    КОШАЧИЙ ПОПКОРННЫЙ БЕСПРЕДЕЛ
echo    8-битный рогалик-аркада
echo   ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js не найден.
  echo     Установи его с https://nodejs.org ^(версия LTS^)
  echo     и запусти этот файл снова.
  echo.
  pause
  exit /b
)

if not exist node_modules (
  echo [1/3] Первая установка зависимостей ^(2-4 минуты^)...
  call npm install
  if errorlevel 1 (
    echo [!] Ошибка установки. Проверь интернет и запусти снова.
    pause
    exit /b
  )
) else (
  echo [1/3] Зависимости уже установлены.
)

if not exist ".next\BUILD_ID" (
  echo [2/3] Сборка игры ^(1-2 минуты^)...
  call npm run build
  if errorlevel 1 (
    echo [!] Ошибка сборки. Запусти снова или удали папку .next
    pause
    exit /b
  )
) else (
  echo [2/3] Игра уже собрана.
)

echo [3/3] Запускаю сервер: http://localhost:3000
echo.
echo   Закроешь это окно — игра остановится.
echo   Чтобы пересобрать после обновления — удали папку .next
echo.
start "" "http://localhost:3000"
call npm run start
