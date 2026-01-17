@echo off
echo ========================================
echo   TELEGRAM CLONE - PRODUCTION START
echo ========================================
echo.

echo [1/3] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
  echo ERROR: Frontend build failed!
  pause
  exit /b %errorlevel%
)
echo Frontend build completed!
echo.

echo [2/3] Checking backend dependencies...
cd ..\backend
if not exist node_modules (
  echo Installing backend dependencies...
  call npm install
)
echo.

echo [3/3] Starting server on port 5000...
echo.
echo ========================================
echo   Server will start in a moment...
echo   Open: http://localhost:5000
echo ========================================
echo.

call npm start

pause
