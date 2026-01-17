@echo off
REM Build frontend and start backend for the Telegram clone

setlocal enabledelayedexpansion

echo === Cleaning npm cache and removing corrupted modules ===
npm cache clean --force

echo === Installing frontend dependencies ===
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
call npm install
if %errorlevel% neq 0 (
  echo Frontend npm install failed with exit code %errorlevel%.
  pause
  exit /b %errorlevel%
)

echo === Building frontend ===
call npm run build
if %errorlevel% neq 0 (
  echo Frontend build failed with exit code %errorlevel%.
  pause
  exit /b %errorlevel%
)

echo === Installing backend dependencies ===
cd ..\backend
call npm install
if %errorlevel% neq 0 (
  echo Backend npm install failed with exit code %errorlevel%.
  pause
  exit /b %errorlevel%
)

echo === Starting backend server on port 5000 ===
call npm start

pause
