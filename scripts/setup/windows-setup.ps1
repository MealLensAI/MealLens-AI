# 🪟 MealLens AI - Windows PowerShell Setup Script
# This script sets up the project on Windows using PowerShell

param(
    [switch]$UseDocker = $false,
    [switch]$SkipNodeInstall = $false,
    [switch]$SkipPythonInstall = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$White = [System.ConsoleColor]::White

function Write-ColorOutput($ForegroundColor) {
    if ($Host.UI.RawUI.ForegroundColor) {
        $fc = $host.UI.RawUI.ForegroundColor
        $host.UI.RawUI.ForegroundColor = $ForegroundColor
        if ($args) {
            Write-Output $args
        }
        else {
            $input | Write-Output
        }
        $host.UI.RawUI.ForegroundColor = $fc
    }
    else {
        if ($args) {
            Write-Output $args
        }
        else {
            $input | Write-Output
        }
    }
}

function Print-Status($Message) {
    Write-ColorOutput $Blue "[INFO] $Message"
}

function Print-Success($Message) {
    Write-ColorOutput $Green "[SUCCESS] $Message"
}

function Print-Warning($Message) {
    Write-ColorOutput $Yellow "[WARNING] $Message"
}

function Print-Error($Message) {
    Write-ColorOutput $Red "[ERROR] $Message"
}

function Print-Header() {
    Write-Host ""
    Write-ColorOutput $Blue "🍽️ =========================================="
    Write-ColorOutput $Blue "🍽️  MealLens AI - Windows Setup"
    Write-ColorOutput $Blue "🍽️ =========================================="
    Write-Host ""
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Install Chocolatey package manager
function Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Print-Status "Installing Chocolatey package manager..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Print-Success "Chocolatey installed successfully!"
    } else {
        Print-Success "Chocolatey is already installed!"
    }
}

# Install Node.js
function Install-NodeJS {
    if (!$SkipNodeInstall) {
        Print-Status "Checking Node.js installation..."
        
        if (!(Get-Command node -ErrorAction SilentlyContinue)) {
            Print-Status "Installing Node.js..."
            if (Get-Command choco -ErrorAction SilentlyContinue) {
                choco install nodejs -y
            } else {
                Print-Warning "Please install Node.js manually from: https://nodejs.org/"
                Print-Warning "Or run this script as administrator to use Chocolatey"
                return $false
            }
        }
        
        $nodeVersion = node --version
        Print-Success "Node.js $nodeVersion is installed!"
        
        if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
            Print-Error "npm is not available! Please reinstall Node.js"
            return $false
        }
        
        $npmVersion = npm --version
        Print-Success "npm $npmVersion is installed!"
    }
    return $true
}

# Install Python
function Install-Python {
    if (!$SkipPythonInstall) {
        Print-Status "Checking Python installation..."
        
        if (!(Get-Command python -ErrorAction SilentlyContinue)) {
            Print-Status "Installing Python..."
            if (Get-Command choco -ErrorAction SilentlyContinue) {
                choco install python -y
            } else {
                Print-Warning "Please install Python manually from: https://www.python.org/"
                Print-Warning "Or run this script as administrator to use Chocolatey"
                return $false
            }
        }
        
        $pythonVersion = python --version
        Print-Success "$pythonVersion is installed!"
        
        # Install pip if not available
        if (!(Get-Command pip -ErrorAction SilentlyContinue)) {
            Print-Status "Installing pip..."
            python -m ensurepip --upgrade
        }
        
        $pipVersion = pip --version
        Print-Success "pip $pipVersion is installed!"
    }
    return $true
}

# Setup environment files
function Setup-Environment {
    Print-Status "Setting up environment files..."
    
    # Backend environment
    if (!(Test-Path "backend\.env")) {
        if (Test-Path "backend\env.production.example") {
            Copy-Item "backend\env.production.example" "backend\.env"
            Print-Success "Created backend\.env from example"
        } else {
            @"
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true

# Supabase Configuration (Replace with your values)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./meallensai-40f6f-firebase-adminsdk-fbsvc-0f6274190b.json

# Other configurations
DATABASE_URL=postgresql://localhost:5432/meallens
REDIS_URL=redis://localhost:6379
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
            Print-Success "Created basic backend\.env"
        }
        Print-Warning "Please update backend\.env with your actual configuration!"
    } else {
        Print-Success "Backend .env file already exists"
    }
    
    # Frontend environment
    if (!(Test-Path "frontend\.env.local")) {
        @"
# Supabase Configuration (Replace with your values)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:5000

# Other frontend configurations
VITE_APP_NAME=MealLens AI
VITE_APP_VERSION=1.0.0
"@ | Out-File -FilePath "frontend\.env.local" -Encoding UTF8
        Print-Success "Created frontend\.env.local"
        Print-Warning "Please update frontend\.env.local with your actual configuration!"
    } else {
        Print-Success "Frontend .env.local file already exists"
    }
}

# Setup Python virtual environment and install dependencies
function Setup-Backend {
    Print-Status "Setting up Python backend..."
    
    Set-Location "backend"
    
    # Create virtual environment
    if (!(Test-Path "venv")) {
        Print-Status "Creating Python virtual environment..."
        python -m venv venv
        Print-Success "Virtual environment created!"
    }
    
    # Activate virtual environment
    Print-Status "Activating virtual environment..."
    & ".\venv\Scripts\Activate.ps1"
    
    # Install dependencies
    Print-Status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    Print-Success "Backend dependencies installed!"
    
    Set-Location ".."
}

# Setup frontend dependencies
function Setup-Frontend {
    Print-Status "Setting up React frontend..."
    
    Set-Location "frontend"
    
    # Install dependencies
    Print-Status "Installing Node.js dependencies..."
    npm install
    
    Print-Success "Frontend dependencies installed!"
    
    Set-Location ".."
}

# Start services
function Start-Services {
    Print-Status "Starting services..."
    
    # Start backend
    Print-Status "Starting backend server..."
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python app.py"
    
    # Wait a moment
    Start-Sleep -Seconds 3
    
    # Start frontend
    Print-Status "Starting frontend server..."
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    
    Print-Success "Services started in separate windows!"
}

# Show completion message
function Show-Completion {
    Write-Host ""
    Write-ColorOutput $Green "🎉 =========================================="
    Write-ColorOutput $Green "🎉  Setup Complete!"
    Write-ColorOutput $Green "🎉 =========================================="
    Write-Host ""
    Print-Success "MealLens AI is now running!"
    Write-Host ""
    Write-Host "📱 Access your application:"
    Write-Host "   • Frontend: http://localhost:5173"
    Write-Host "   • Backend API: http://localhost:5000"
    Write-Host ""
    Write-Host "🔧 Useful commands:"
    Write-Host "   • Backend: cd backend && .\venv\Scripts\Activate.ps1 && python app.py"
    Write-Host "   • Frontend: cd frontend && npm run dev"
    Write-Host "   • Tests: npm test (frontend) or pytest (backend)"
    Write-Host ""
    Write-Host "⚠️  Important reminders:"
    Write-Host "   • Update backend\.env with your Supabase credentials"
    Write-Host "   • Update frontend\.env.local with your configuration"
    Write-Host ""
    Write-Host "📚 For more help, see README.md or CI_CD_SETUP.md"
    Write-Host ""
}

# Main execution
function Main {
    Print-Header
    
    if ($UseDocker) {
        Print-Status "Using Docker setup..."
        & ".\scripts\setup\docker-setup.sh"
        return
    }
    
    # Check if running as admin for package installations
    if (!(Test-Administrator) -and !$SkipNodeInstall -and !$SkipPythonInstall) {
        Print-Warning "Not running as administrator. Some installations may fail."
        Print-Warning "Run as administrator or use -SkipNodeInstall -SkipPythonInstall if you have these installed."
        Write-Host ""
    }
    
    try {
        # Install package manager
        if (Test-Administrator) {
            Install-Chocolatey
        }
        
        # Install required software
        if (!(Install-NodeJS)) { return }
        if (!(Install-Python)) { return }
        
        # Setup project
        Setup-Environment
        Setup-Backend
        Setup-Frontend
        Start-Services
        Show-Completion
        
    } catch {
        Print-Error "Setup failed: $($_.Exception.Message)"
        Print-Error "Please check the error above and try again."
        exit 1
    }
}

# Run main function
Main