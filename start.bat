@echo off
echo ============================================
echo    PlaySchool - Starting Servers
echo ============================================
echo.

echo [1/3] Killing any process on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /PID %%a /F 2>nul
echo       Done.
echo.

echo [2/3] Starting Backend (Spring Boot)...
cd /d %~dp0backend
start "PlaySchool Backend" cmd /k "mvn spring-boot:run"
echo       Backend launching in new window...
echo.

echo [3/3] Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak
echo.

echo [3/3] Starting Frontend (Vite)...
cd /d %~dp0frontend
start "PlaySchool Frontend" cmd /k "npm run dev"
echo       Frontend launching in new window...
echo.

echo ============================================
echo    Both servers are starting!
echo    Backend:  http://localhost:8080
echo    Frontend: http://localhost:3000
echo ============================================
echo.
pause
