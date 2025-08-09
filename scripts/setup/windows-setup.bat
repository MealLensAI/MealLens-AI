@echo off
REM 🪟 MealLens AI - Windows Batch Setup Script
REM Simple setup script for Windows users

echo.
echo 🍽️ ==========================================
echo 🍽️  MealLens AI - Windows Setup
echo 🍽️ ==========================================
echo.

REM Check if PowerShell is available and prefer it
where powershell >nul 2>nul
if %errorlevel% == 0 (
    echo [INFO] PowerShell detected. Using enhanced PowerShell setup script...
    echo.
    powershell -ExecutionPolicy Bypass -File "scripts\setup\windows-setup.ps1"
    goto :end
)

echo [INFO] Using basic batch setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    goto :end
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python from: https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo Then run this script again.
    echo.
    pause
    goto :end
)

echo [SUCCESS] Node.js and Python are installed!
echo.

REM Create environment files
echo [INFO] Setting up environment files...

if not exist "backend\.env" (
    if exist "backend\env.production.example" (
        copy "backend\env.production.example" "backend\.env" >nul
        echo [SUCCESS] Created backend\.env from example
    ) else (
        echo # Flask Configuration > "backend\.env"
        echo FLASK_ENV=development >> "backend\.env"
        echo FLASK_DEBUG=true >> "backend\.env"
        echo. >> "backend\.env"
        echo # Supabase Configuration (Replace with your values) >> "backend\.env"
        echo SUPABASE_URL=your_supabase_url_here >> "backend\.env"
        echo SUPABASE_ANON_KEY=your_supabase_anon_key_here >> "backend\.env"
        echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here >> "backend\.env"
        echo [SUCCESS] Created basic backend\.env
    )
    echo [WARNING] Please update backend\.env with your actual configuration!
)

if not exist "frontend\.env.local" (
    echo # Supabase Configuration (Replace with your values) > "frontend\.env.local"
    echo VITE_SUPABASE_URL=your_supabase_url_here >> "frontend\.env.local"
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here >> "frontend\.env.local"
    echo. >> "frontend\.env.local"
    echo # API Configuration >> "frontend\.env.local"
    echo VITE_API_URL=http://localhost:5000 >> "frontend\.env.local"
    echo [SUCCESS] Created frontend\.env.local
    echo [WARNING] Please update frontend\.env.local with your actual configuration!
)

REM Setup backend
echo.
echo [INFO] Setting up Python backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    echo [SUCCESS] Virtual environment created!
)

REM Activate virtual environment and install dependencies
echo [INFO] Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo [SUCCESS] Backend dependencies installed!

cd ..

REM Setup frontend
echo.
echo [INFO] Setting up React frontend...
cd frontend

echo [INFO] Installing Node.js dependencies...
npm install
echo [SUCCESS] Frontend dependencies installed!

cd ..

REM Start services
echo.
echo [INFO] Starting services...
echo [INFO] Backend and frontend will open in separate command windows...
echo.

REM Start backend in new window
start "MealLens Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python app.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend in new window  
start "MealLens Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo 🎉 ==========================================
echo 🎉  Setup Complete!
echo 🎉 ==========================================
echo.
echo [SUCCESS] MealLens AI is now running!
echo.
echo 📱 Access your application:
echo    • Frontend: http://localhost:5173
echo    • Backend API: http://localhost:5000
echo.
echo 🔧 Useful commands:
echo    • Backend: cd backend ^&^& venv\Scripts\activate.bat ^&^& python app.py
echo    • Frontend: cd frontend ^&^& npm run dev
echo    • Tests: npm test (frontend) or pytest (backend)
echo.
echo ⚠️  Important reminders:
echo    • Update backend\.env with your Supabase credentials
echo    • Update frontend\.env.local with your configuration
echo.
echo 📚 For more help, see README.md or CI_CD_SETUP.md
echo.

:end
pause