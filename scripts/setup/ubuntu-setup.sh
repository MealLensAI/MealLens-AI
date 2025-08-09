#!/bin/bash

# 🐧 MealLens AI - Ubuntu/Linux Setup Script
# This script sets up the project on Ubuntu and other Debian-based Linux distributions

set -e  # Exit on any error

echo "🍽️ =========================================="
echo "🍽️  MealLens AI - Ubuntu/Linux Setup"
echo "🍽️ =========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
    elif [ -f /etc/debian_version ]; then
        DISTRO="debian"
    elif [ -f /etc/redhat-release ]; then
        DISTRO="redhat"
    else
        DISTRO="unknown"
    fi
    
    print_status "Detected distribution: $DISTRO"
}

# Update package lists
update_packages() {
    print_status "Updating package lists..."
    
    case $DISTRO in
        ubuntu|debian)
            sudo apt update
            ;;
        fedora|centos|rhel)
            sudo dnf update -y || sudo yum update -y
            ;;
        arch)
            sudo pacman -Sy
            ;;
        *)
            print_warning "Unknown distribution. You may need to install packages manually."
            ;;
    esac
    
    print_success "Package lists updated!"
}

# Install Node.js
install_nodejs() {
    print_status "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        
        case $DISTRO in
            ubuntu|debian)
                # Install Node.js 18.x
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            fedora|centos|rhel)
                # Install Node.js 18.x
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo dnf install -y nodejs npm || sudo yum install -y nodejs npm
                ;;
            arch)
                sudo pacman -S --noconfirm nodejs npm
                ;;
            *)
                print_error "Unsupported distribution for automatic Node.js installation."
                print_error "Please install Node.js manually from: https://nodejs.org/"
                return 1
                ;;
        esac
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION is installed!"
    print_success "npm $NPM_VERSION is installed!"
    
    # Install global packages
    print_status "Installing global npm packages..."
    sudo npm install -g npm@latest
    print_success "npm updated to latest version!"
}

# Install Python
install_python() {
    print_status "Checking Python installation..."
    
    if ! command -v python3 &> /dev/null; then
        print_status "Installing Python 3..."
        
        case $DISTRO in
            ubuntu|debian)
                sudo apt-get install -y python3 python3-pip python3-venv python3-dev
                ;;
            fedora|centos|rhel)
                sudo dnf install -y python3 python3-pip python3-venv python3-devel || \
                sudo yum install -y python3 python3-pip python3-venv python3-devel
                ;;
            arch)
                sudo pacman -S --noconfirm python python-pip
                ;;
            *)
                print_error "Unsupported distribution for automatic Python installation."
                print_error "Please install Python 3 manually."
                return 1
                ;;
        esac
    fi
    
    # Create python symlink if needed
    if ! command -v python &> /dev/null; then
        if command -v python3 &> /dev/null; then
            print_status "Creating python symlink..."
            sudo ln -sf $(which python3) /usr/local/bin/python
        fi
    fi
    
    PYTHON_VERSION=$(python3 --version)
    print_success "$PYTHON_VERSION is installed!"
    
    # Ensure pip is available
    if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
        print_status "Installing pip..."
        python3 -m ensurepip --default-pip
    fi
    
    # Update pip
    print_status "Updating pip..."
    python3 -m pip install --user --upgrade pip
    
    PIP_VERSION=$(python3 -m pip --version)
    print_success "pip $PIP_VERSION is installed!"
}

# Install additional dependencies
install_dependencies() {
    print_status "Installing additional dependencies..."
    
    case $DISTRO in
        ubuntu|debian)
            sudo apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                libssl-dev \
                libffi-dev \
                libpq-dev \
                postgresql-client \
                redis-tools
            ;;
        fedora|centos|rhel)
            sudo dnf install -y curl wget git gcc gcc-c++ make openssl-devel libffi-devel postgresql-devel redis || \
            sudo yum install -y curl wget git gcc gcc-c++ make openssl-devel libffi-devel postgresql-devel redis
            ;;
        arch)
            sudo pacman -S --noconfirm curl wget git base-devel openssl libffi postgresql-libs redis
            ;;
        *)
            print_warning "Additional dependencies may need to be installed manually."
            ;;
    esac
    
    print_success "Additional dependencies installed!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/env.production.example" ]; then
            cp backend/env.production.example backend/.env
            print_success "Created backend/.env from example"
        else
            cat > backend/.env << EOF
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
EOF
            print_success "Created basic backend/.env"
        fi
        print_warning "Please update backend/.env with your actual configuration!"
    else
        print_success "Backend .env file already exists"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
# Supabase Configuration (Replace with your values)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:5000

# Other frontend configurations
VITE_APP_NAME=MealLens AI
VITE_APP_VERSION=1.0.0
EOF
        print_success "Created frontend/.env.local"
        print_warning "Please update frontend/.env.local with your actual configuration!"
    else
        print_success "Frontend .env.local file already exists"
    fi
}

# Setup Python backend
setup_backend() {
    print_status "Setting up Python backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created!"
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    print_success "Backend dependencies installed!"
    
    cd ..
}

# Setup React frontend
setup_frontend() {
    print_status "Setting up React frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    print_success "Frontend dependencies installed!"
    
    cd ..
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Check if tmux is available for better session management
    if command -v tmux &> /dev/null; then
        print_status "Using tmux for session management..."
        
        # Create new tmux session
        tmux new-session -d -s meallens-dev
        
        # Split window
        tmux split-window -h
        
        # Start backend in first pane
        tmux send-keys -t meallens-dev:0.0 'cd backend && source venv/bin/activate && python app.py' Enter
        
        # Start frontend in second pane
        tmux send-keys -t meallens-dev:0.1 'cd frontend && npm run dev' Enter
        
        print_success "Services started in tmux session 'meallens-dev'"
        print_status "Attach to session with: tmux attach -t meallens-dev"
        print_status "Detach from session with: Ctrl+B then D"
        
    elif command -v screen &> /dev/null; then
        print_status "Using screen for session management..."
        
        # Start backend in screen
        screen -dmS meallens-backend bash -c 'cd backend && source venv/bin/activate && python app.py'
        
        # Start frontend in screen
        screen -dmS meallens-frontend bash -c 'cd frontend && npm run dev'
        
        print_success "Services started in screen sessions"
        print_status "Backend session: screen -r meallens-backend"
        print_status "Frontend session: screen -r meallens-frontend"
        
    else
        print_status "Starting services in background..."
        
        # Start backend
        cd backend
        source venv/bin/activate
        nohup python app.py > ../backend.log 2>&1 &
        BACKEND_PID=$!
        cd ..
        
        # Start frontend
        cd frontend
        nohup npm run dev > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        cd ..
        
        print_success "Services started in background"
        print_status "Backend PID: $BACKEND_PID (log: backend.log)"
        print_status "Frontend PID: $FRONTEND_PID (log: frontend.log)"
        print_status "Stop with: kill $BACKEND_PID $FRONTEND_PID"
    fi
}

# Install optional services
install_optional_services() {
    print_status "Would you like to install optional local services? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        case $DISTRO in
            ubuntu|debian)
                print_status "Installing PostgreSQL and Redis..."
                sudo apt-get install -y postgresql postgresql-contrib redis-server
                
                # Start services
                sudo systemctl start postgresql redis-server
                sudo systemctl enable postgresql redis-server
                ;;
            fedora|centos|rhel)
                print_status "Installing PostgreSQL and Redis..."
                sudo dnf install -y postgresql postgresql-server redis || \
                sudo yum install -y postgresql postgresql-server redis
                
                # Initialize and start PostgreSQL
                sudo postgresql-setup --initdb
                sudo systemctl start postgresql redis
                sudo systemctl enable postgresql redis
                ;;
            arch)
                print_status "Installing PostgreSQL and Redis..."
                sudo pacman -S --noconfirm postgresql redis
                
                # Initialize and start services
                sudo -u postgres initdb -D /var/lib/postgres/data
                sudo systemctl start postgresql redis
                sudo systemctl enable postgresql redis
                ;;
        esac
        
        print_success "Optional services installed and started!"
    else
        print_status "Skipping optional services installation"
    fi
}

# Show completion message
show_completion() {
    echo ""
    echo "🎉 =========================================="
    echo "🎉  Setup Complete!"
    echo "🎉 =========================================="
    echo ""
    print_success "MealLens AI is now running on Ubuntu/Linux!"
    echo ""
    echo "📱 Access your application:"
    echo "   • Frontend: http://localhost:5173"
    echo "   • Backend API: http://localhost:5000"
    echo ""
    echo "🔧 Useful commands:"
    echo "   • Backend: cd backend && source venv/bin/activate && python app.py"
    echo "   • Frontend: cd frontend && npm run dev"
    echo "   • Tests: npm test (frontend) or pytest (backend)"
    echo ""
    if command -v tmux &> /dev/null; then
        echo "🖥️  Session management:"
        echo "   • Attach to tmux: tmux attach -t meallens-dev"
        echo "   • List sessions: tmux list-sessions"
        echo "   • Kill session: tmux kill-session -t meallens-dev"
    elif command -v screen &> /dev/null; then
        echo "🖥️  Session management:"
        echo "   • Backend session: screen -r meallens-backend"
        echo "   • Frontend session: screen -r meallens-frontend"
        echo "   • List sessions: screen -ls"
    fi
    echo ""
    echo "⚠️  Important reminders:"
    echo "   • Update backend/.env with your Supabase credentials"
    echo "   • Update frontend/.env.local with your configuration"
    echo ""
    echo "📚 For more help, see README.md or CI_CD_SETUP.md"
    echo ""
}

# Main execution
main() {
    # Parse command line arguments
    USE_DOCKER=false
    SKIP_OPTIONAL=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker)
                USE_DOCKER=true
                shift
                ;;
            --skip-optional)
                SKIP_OPTIONAL=true
                shift
                ;;
            --help)
                echo "Usage: $0 [--docker] [--skip-optional] [--help]"
                echo "  --docker         Use Docker setup instead"
                echo "  --skip-optional  Skip optional services installation"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                print_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    if [ "$USE_DOCKER" = true ]; then
        print_status "Using Docker setup..."
        exec ./scripts/setup/docker-setup.sh
        return
    fi
    
    # Main setup flow
    detect_distro
    update_packages
    install_nodejs
    install_python
    install_dependencies
    setup_environment
    setup_backend
    setup_frontend
    
    if [ "$SKIP_OPTIONAL" = false ]; then
        install_optional_services
    fi
    
    start_services
    show_completion
}

# Run main function
main "$@"