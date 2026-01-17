@echo off
REM Start development server with both frontend and backend

setlocal enabledelayedexpansion

echo === Installing dependencies if needed ===
call npm run install-all

echo === Starting development servers ===
echo Frontend will start on http://localhost:3000
echo Backend will start on http://localhost:5000
echo.

call npm run dev

pause
