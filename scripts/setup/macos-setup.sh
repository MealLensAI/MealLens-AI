#!/bin/bash

# 🍎 MealLens AI - macOS Setup Script
# This script sets up the project on macOS using Homebrew

set -e  # Exit on any error

echo "🍽️ =========================================="
echo "🍽️  MealLens AI - macOS Setup"
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

# Check if Xcode Command Line Tools are installed
check_xcode_tools() {
    print_status "Checking Xcode Command Line Tools..."
    
    if ! xcode-select -p &> /dev/null; then
        print_status "Installing Xcode Command Line Tools..."
        xcode-select --install
        
        print_warning "Please complete the Xcode Command Line Tools installation and run this script again."
        exit 1
    fi
    
    print_success "Xcode Command Line Tools are installed!"
}

# Install Homebrew
install_homebrew() {
    print_status "Checking Homebrew installation..."
    
    if ! command -v brew &> /dev/null; then
        print_status "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for M1 Macs
        if [[ $(uname -m) == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        else
            echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/usr/local/bin/brew shellenv)"
        fi
        
        print_success "Homebrew installed!"
    else
        print_success "Homebrew is already installed!"
    fi
    
    # Update Homebrew
    print_status "Updating Homebrew..."
    brew update
    print_success "Homebrew updated!"
}

# Install Node.js
install_nodejs() {
    print_status "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        brew install node
    else
        # Check if we need to update
        CURRENT_VERSION=$(node --version | cut -d 'v' -f 2)
        MAJOR_VERSION=$(echo $CURRENT_VERSION | cut -d '.' -f 1)
        
        if [ "$MAJOR_VERSION" -lt 16 ]; then
            print_status "Updating Node.js to a newer version..."
            brew upgrade node
        fi
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION is installed!"
    print_success "npm $NPM_VERSION is installed!"
    
    # Update npm to latest
    print_status "Updating npm to latest version..."
    npm install -g npm@latest
    print_success "npm updated!"
}

# Install Python
install_python() {
    print_status "Checking Python installation..."
    
    if ! command -v python3 &> /dev/null; then
        print_status "Installing Python 3..."
        brew install python
    else
        # Check Python version
        PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
        MAJOR_VERSION=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
        MINOR_VERSION=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
        
        if [ "$MAJOR_VERSION" -lt 3 ] || [ "$MAJOR_VERSION" -eq 3 -a "$MINOR_VERSION" -lt 8 ]; then
            print_status "Updating Python to a newer version..."
            brew upgrade python
        fi
    fi
    
    # Create python symlink if needed
    if ! command -v python &> /dev/null; then
        if command -v python3 &> /dev/null; then
            print_status "Creating python symlink..."
            ln -sf $(which python3) /usr/local/bin/python 2>/dev/null || true
        fi
    fi
    
    PYTHON_VERSION=$(python3 --version)
    print_success "$PYTHON_VERSION is installed!"
    
    # Ensure pip is available and updated
    print_status "Updating pip..."
    python3 -m pip install --upgrade pip
    
    PIP_VERSION=$(python3 -m pip --version)
    print_success "pip $PIP_VERSION is installed!"
}

# Install additional dependencies
install_dependencies() {
    print_status "Installing additional dependencies..."
    
    # Essential tools
    brew_packages=(
        "curl"
        "wget"
        "git"
        "postgresql@14"
        "redis"
        "openssl"
        "libffi"
        "pkg-config"
    )
    
    for package in "${brew_packages[@]}"; do
        if ! brew list "$package" &> /dev/null; then
            print_status "Installing $package..."
            brew install "$package"
        fi
    done
    
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

# Start local services
start_local_services() {
    print_status "Would you like to start local PostgreSQL and Redis services? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Starting local services..."
        
        # Start PostgreSQL
        if brew services list | grep postgresql@14 | grep -q stopped; then
            brew services start postgresql@14
            print_success "PostgreSQL started!"
        else
            print_success "PostgreSQL is already running!"
        fi
        
        # Start Redis
        if brew services list | grep redis | grep -q stopped; then
            brew services start redis
            print_success "Redis started!"
        else
            print_success "Redis is already running!"
        fi
        
        # Create database if it doesn't exist
        print_status "Setting up database..."
        if ! psql -lqt | cut -d \| -f 1 | grep -qw meallens; then
            createdb meallens
            print_success "Database 'meallens' created!"
        else
            print_success "Database 'meallens' already exists!"
        fi
    else
        print_status "Skipping local services startup"
    fi
}

# Start application services
start_services() {
    print_status "Starting application services..."
    
    # Check if tmux is available for better session management
    if command -v tmux &> /dev/null; then
        print_status "Using tmux for session management..."
        
        # Kill existing session if it exists
        tmux kill-session -t meallens-dev 2>/dev/null || true
        
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
        
    else
        print_status "Installing tmux for better session management..."
        brew install tmux
        
        # Restart this function with tmux now available
        start_services
        return
    fi
}

# Install optional development tools
install_dev_tools() {
    print_status "Would you like to install optional development tools? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Installing development tools..."
        
        dev_tools=(
            "gh"              # GitHub CLI
            "tree"            # Directory tree viewer
            "htop"            # Process viewer
            "jq"              # JSON processor
            "httpie"          # HTTP client
            "docker"          # Docker
        )
        
        for tool in "${dev_tools[@]}"; do
            if ! command -v "$tool" &> /dev/null; then
                print_status "Installing $tool..."
                brew install "$tool"
            fi
        done
        
        # Install Docker Desktop if Docker was installed
        if ! brew list --cask docker &> /dev/null; then
            print_status "Installing Docker Desktop..."
            brew install --cask docker
            print_warning "Please start Docker Desktop manually after installation."
        fi
        
        print_success "Development tools installed!"
    else
        print_status "Skipping development tools installation"
    fi
}

# Configure shell environment
setup_shell_environment() {
    print_status "Setting up shell environment..."
    
    # Detect shell
    CURRENT_SHELL=$(basename "$SHELL")
    
    case $CURRENT_SHELL in
        zsh)
            SHELL_CONFIG="$HOME/.zshrc"
            ;;
        bash)
            SHELL_CONFIG="$HOME/.bash_profile"
            ;;
        *)
            SHELL_CONFIG="$HOME/.profile"
            ;;
    esac
    
    # Add useful aliases for the project
    if ! grep -q "# MealLens AI aliases" "$SHELL_CONFIG" 2>/dev/null; then
        cat >> "$SHELL_CONFIG" << EOF

# MealLens AI aliases
alias ml-backend='cd backend && source venv/bin/activate && python app.py'
alias ml-frontend='cd frontend && npm run dev'
alias ml-test='cd frontend && npm test'
alias ml-tmux='tmux attach -t meallens-dev'
alias ml-logs='tail -f backend.log frontend.log'
EOF
        print_success "Aliases added to $SHELL_CONFIG"
        print_status "Restart your terminal or run 'source $SHELL_CONFIG' to use aliases"
    fi
}

# Show completion message
show_completion() {
    echo ""
    echo "🎉 =========================================="
    echo "🎉  Setup Complete!"
    echo "🎉 =========================================="
    echo ""
    print_success "MealLens AI is now running on macOS!"
    echo ""
    echo "📱 Access your application:"
    echo "   • Frontend: http://localhost:5173"
    echo "   • Backend API: http://localhost:5000"
    echo ""
    echo "🔧 Useful commands:"
    echo "   • Backend: ml-backend (or cd backend && source venv/bin/activate && python app.py)"
    echo "   • Frontend: ml-frontend (or cd frontend && npm run dev)"
    echo "   • Tests: ml-test (or cd frontend && npm test)"
    echo "   • Tmux session: ml-tmux (or tmux attach -t meallens-dev)"
    echo ""
    echo "🖥️  Session management:"
    echo "   • Attach to tmux: tmux attach -t meallens-dev"
    echo "   • List sessions: tmux list-sessions"
    echo "   • Kill session: tmux kill-session -t meallens-dev"
    echo ""
    echo "🍺 Services management:"
    echo "   • PostgreSQL: brew services start/stop postgresql@14"
    echo "   • Redis: brew services start/stop redis"
    echo "   • All services: brew services list"
    echo ""
    echo "⚠️  Important reminders:"
    echo "   • Update backend/.env with your Supabase credentials"
    echo "   • Update frontend/.env.local with your configuration"
    echo "   • Restart your terminal to use new aliases"
    echo ""
    echo "📚 For more help, see README.md or CI_CD_SETUP.md"
    echo ""
}

# Main execution
main() {
    # Parse command line arguments
    USE_DOCKER=false
    SKIP_OPTIONAL=false
    SKIP_DEV_TOOLS=false
    
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
            --skip-dev-tools)
                SKIP_DEV_TOOLS=true
                shift
                ;;
            --help)
                echo "Usage: $0 [--docker] [--skip-optional] [--skip-dev-tools] [--help]"
                echo "  --docker           Use Docker setup instead"
                echo "  --skip-optional    Skip optional services installation"
                echo "  --skip-dev-tools   Skip development tools installation"
                echo "  --help            Show this help message"
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
    check_xcode_tools
    install_homebrew
    install_nodejs
    install_python
    install_dependencies
    setup_environment
    setup_backend
    setup_frontend
    
    if [ "$SKIP_OPTIONAL" = false ]; then
        start_local_services
    fi
    
    if [ "$SKIP_DEV_TOOLS" = false ]; then
        install_dev_tools
    fi
    
    setup_shell_environment
    start_services
    show_completion
}

# Run main function
main "$@"