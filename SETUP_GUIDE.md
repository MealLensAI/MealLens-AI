# 🚀 MealLens AI - Complete Setup Guide

This comprehensive guide covers all setup methods and troubleshooting for MealLens AI across all platforms.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Platform-Specific Setup](#-platform-specific-setup)
- [Docker Setup](#-docker-setup)
- [Development Setup](#-development-setup)
- [Environment Configuration](#-environment-configuration)
- [Troubleshooting](#-troubleshooting)
- [Advanced Configuration](#-advanced-configuration)

## 🚀 Quick Start

### One-Command Setup (Recommended)

**For all platforms:**
```bash
git clone https://github.com/MealLensAI/MealLens-AI.git
cd MealLens-AI
./setup.sh
```

**Windows users:**
```cmd
git clone https://github.com/MealLensAI/MealLens-AI.git
cd MealLens-AI
setup.bat
```

## 🖥️ Platform-Specific Setup

### 🪟 Windows Setup

#### Prerequisites
- Windows 10/11
- PowerShell 5.1+ or PowerShell Core 7+
- Administrator privileges (for installing dependencies)

#### Setup Options

**Option 1: Interactive Setup**
```cmd
setup.bat
```

**Option 2: PowerShell Script**
```powershell
# Run as Administrator for best results
Set-ExecutionPolicy Bypass -Scope Process
.\scripts\setup\windows-setup.ps1
```

**Option 3: Manual Setup**
```cmd
# Install Chocolatey (as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install nodejs python git -y

# Setup project
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt

cd ..\frontend
npm install
```

#### Windows-Specific Notes
- **PowerShell Execution Policy**: May need to run `Set-ExecutionPolicy RemoteSigned`
- **Chocolatey**: Automatically installs package manager for easy dependency management
- **Windows Terminal**: Recommended for better experience
- **WSL2**: Consider for Docker support

### 🍎 macOS Setup

#### Prerequisites
- macOS 10.15+ (Catalina or later)
- Xcode Command Line Tools
- Terminal access

#### Setup Options

**Option 1: Automatic Setup**
```bash
./setup.sh
```

**Option 2: Manual Setup**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node python postgresql@14 redis

# Setup project
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install
```

#### macOS-Specific Features
- **Homebrew Integration**: Automatic package management
- **Shell Configuration**: Automatic alias setup for zsh/bash
- **Service Management**: Automatic PostgreSQL/Redis startup
- **Development Tools**: Optional installation of gh, docker, etc.

### 🐧 Ubuntu/Linux Setup

#### Prerequisites
- Ubuntu 18.04+ or compatible Linux distribution
- sudo privileges
- curl/wget for downloads

#### Setup Options

**Option 1: Automatic Setup**
```bash
./setup.sh
```

**Option 2: Manual Setup**
```bash
# Update package lists
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and dependencies
sudo apt-get install -y python3 python3-pip python3-venv build-essential

# Setup project
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install
```

#### Supported Distributions
- **Ubuntu/Debian**: APT package manager
- **Fedora/CentOS/RHEL**: DNF/YUM package manager  
- **Arch Linux**: Pacman package manager
- **Other**: Basic compatibility with most Linux distributions

## 🐳 Docker Setup

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM

### Setup Commands

**Quick Docker Setup:**
```bash
./setup.sh --docker
```

**Manual Docker Setup:**
```bash
# Ensure Docker is running
docker info

# Build and start services
docker-compose up --build

# Or use production configuration
docker-compose -f docker-compose.prod.yml up --build
```

### Docker Services
- **Backend**: Flask API server
- **Frontend**: React development server
- **PostgreSQL**: Database service
- **Redis**: Caching service
- **Nginx**: Reverse proxy (production)

### Docker Commands
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild containers
docker-compose build --no-cache

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🔧 Development Setup

### IDE Configuration

#### Visual Studio Code
```bash
# Install recommended extensions
code --install-extension ms-python.python
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

#### PyCharm/WebStorm
- Python interpreter: `backend/venv/bin/python`
- Node.js: Auto-detected from `frontend/`
- Run configurations provided in `.run/` directory

### Testing Setup

**Backend Tests:**
```bash
cd backend
source venv/bin/activate
pytest --cov=. --cov-report=html
```

**Frontend Tests:**
```bash
cd frontend
npm test
npm run test:coverage
```

### Code Quality Tools

**Backend:**
```bash
# Linting
flake8 .

# Formatting
black .

# Type checking (if using)
mypy .
```

**Frontend:**
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

## ⚙️ Environment Configuration

### Backend Environment (`.env`)
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./path/to/firebase-credentials.json

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/meallens

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here

# External APIs
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Frontend Environment (`.env.local`)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=MealLens AI
VITE_APP_VERSION=1.0.0

# External Services
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

## 🚨 Troubleshooting

### Common Issues

#### "Command not found" errors
```bash
# Node.js not in PATH
export PATH="/usr/local/bin:$PATH"

# Python not found
ln -s $(which python3) /usr/local/bin/python

# Windows: Add to System PATH
# Control Panel > System > Advanced > Environment Variables
```

#### Permission Denied
```bash
# Make scripts executable
chmod +x setup.sh scripts/setup/*.sh

# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>

# Or use different ports
VITE_PORT=3001 npm run dev  # Frontend
FLASK_PORT=5001 python app.py  # Backend
```

#### Docker Issues
```bash
# Docker daemon not running
sudo systemctl start docker  # Linux
# Start Docker Desktop  # Windows/macOS

# Permission denied
sudo usermod -aG docker $USER  # Linux
# Logout and login again

# Clear Docker cache
docker system prune -a
```

### Platform-Specific Issues

#### Windows
- **PowerShell Execution Policy**: `Set-ExecutionPolicy RemoteSigned`
- **Chocolatey Issues**: Run PowerShell as Administrator
- **Git Line Endings**: `git config --global core.autocrlf true`
- **Node-gyp Issues**: `npm install --global windows-build-tools`

#### macOS
- **Xcode License**: `sudo xcodebuild -license accept`
- **Homebrew Permissions**: Check ownership of `/usr/local`
- **Python Path Issues**: Use `python3` explicitly
- **M1 Mac Issues**: Ensure ARM64 compatible packages

#### Linux
- **Snap vs APT**: Prefer APT packages for Node.js
- **Python Versions**: Ensure python3-venv is installed
- **Build Tools**: Install build-essential package
- **PostgreSQL Authentication**: Configure pg_hba.conf if needed

### Environment Issues

#### Supabase Connection
```bash
# Test connection
curl -H "apikey: YOUR_ANON_KEY" "https://your-project.supabase.co/rest/v1/"

# Check environment variables
echo $SUPABASE_URL
echo $VITE_SUPABASE_URL
```

#### Database Issues
```bash
# PostgreSQL not starting
sudo systemctl start postgresql
brew services start postgresql@14

# Connection refused
sudo -u postgres psql -c "SELECT version();"

# Create database
createdb meallens
```

### Getting Help

1. **Check logs**:
   ```bash
   # Backend logs
   tail -f backend.log
   
   # Frontend logs  
   npm run dev  # Watch for errors
   
   # Docker logs
   docker-compose logs -f
   ```

2. **Verify installation**:
   ```bash
   node --version
   npm --version
   python --version
   pip --version
   ```

3. **Reset and retry**:
   ```bash
   # Clean installation
   rm -rf node_modules backend/venv
   ./setup.sh
   ```

## 🔬 Advanced Configuration

### Custom Development Setup

#### Using Different Ports
```bash
# Backend
export FLASK_PORT=5001

# Frontend  
export VITE_PORT=3001
```

#### Using External Databases
```env
# Use external PostgreSQL
DATABASE_URL=postgresql://user:pass@external-host:5432/db

# Use external Redis
REDIS_URL=redis://external-host:6379
```

#### SSL/HTTPS Setup
```nginx
# nginx configuration for HTTPS
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5173;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

### Production Deployment

#### Environment Variables
```env
# Production backend
FLASK_ENV=production
FLASK_DEBUG=false
DATABASE_URL=postgresql://prod-db-url
REDIS_URL=redis://prod-redis-url

# Production frontend
VITE_API_URL=https://api.yourdomain.com
```

#### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with proper secrets
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring and Logging

#### Application Monitoring
```python
# Add to backend/app.py
import logging
logging.basicConfig(level=logging.INFO)

# Health check endpoint
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow()}
```

#### Performance Monitoring
```javascript
// Add to frontend/src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

---

## 👥 MealLens AI Team

**Developed by:**
- **🎯 CEO & AI Engineer**: Daniel Etekudo - AI innovation and strategic vision
- **💻 CTO & Full-Stack Developer**: Oluu Graham - Technical leadership and architecture

## 📞 Support

- **Documentation**: README.md, CI_CD_SETUP.md
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Project wiki for additional guides
- **Team Contact**: Reach out to Daniel Etekudo or Oluu Graham for technical questions

**Happy coding with MealLens AI!** 🍽️✨

---

**Built with ❤️ by Daniel Etekudo & Oluu Graham**