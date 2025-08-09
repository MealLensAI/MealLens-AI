@echo off
REM 🚀 MealLens AI - Universal Windows Setup Script
REM This script automatically sets up the project on Windows

echo.
echo 🍽️ ==========================================
echo 🍽️  MealLens AI - Windows Setup
echo 🍽️ ==========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% == 0 (
    echo [INFO] PowerShell detected. Using enhanced setup...
    echo.
    powershell -ExecutionPolicy Bypass -File "scripts\setup\windows-setup.ps1" %*
    goto :end
)

REM Check if we're in the right directory
if not exist "frontend\package.json" (
    echo [ERROR] This doesn't appear to be the MealLens AI project directory!
    echo [ERROR] Please run this script from the project root directory.
    echo.
    pause
    goto :end
)

echo [INFO] Using basic Windows setup...
echo.

REM Check command line arguments for Docker option
set USE_DOCKER=false
:parse_args
if "%1"=="--docker" set USE_DOCKER=true
if "%1"=="/docker" set USE_DOCKER=true
shift
if not "%1"=="" goto parse_args

REM If Docker requested, try to use it
if "%USE_DOCKER%"=="true" (
    echo [INFO] Docker setup requested...
    where docker >nul 2>nul
    if %errorlevel% == 0 (
        echo [INFO] Docker found! Using Docker setup...
        scripts\setup\docker-setup.sh
        goto :end
    ) else (
        echo [ERROR] Docker not found! Please install Docker or use native setup.
        echo.
        pause
        goto :end
    )
)

REM Ask user for setup preference
echo Choose your setup method:
echo.
echo 1. Native Windows setup (Node.js + Python)
echo 2. Docker setup (requires Docker Desktop)
echo 3. View help and exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto native_setup
if "%choice%"=="2" goto docker_setup
if "%choice%"=="3" goto show_help
echo Invalid choice. Using native setup...

:native_setup
echo.
echo [INFO] Starting native Windows setup...
echo.
call "scripts\setup\windows-setup.bat"
goto :end

:docker_setup
echo.
echo [INFO] Starting Docker setup...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed!
    echo.
    echo Please install Docker Desktop from: https://docs.docker.com/desktop/windows/install/
    echo Then run this script again.
    echo.
    pause
    goto :end
)
bash scripts/setup/docker-setup.sh
goto :end

:show_help
echo.
echo 🚀 MealLens AI Setup Options:
echo.
echo Native Setup:
echo   • Installs Node.js and Python directly on Windows
echo   • Uses npm and pip for package management
echo   • Services run directly on your system
echo   • Best for development and debugging
echo.
echo Docker Setup:
echo   • Uses containers for all services
echo   • Consistent environment across platforms
echo   • Requires Docker Desktop
echo   • Best for production-like environment
echo.
echo Usage:
echo   setup.bat                 # Interactive setup
echo   setup.bat --docker        # Force Docker setup
echo   setup.bat --help          # Show this help
echo.
echo Next Steps:
echo   1. Choose your preferred setup method
echo   2. Update environment files with your configuration
echo   3. Review README.md for detailed instructions
echo.
goto :end

:end
if "%1" neq "--no-pause" pause