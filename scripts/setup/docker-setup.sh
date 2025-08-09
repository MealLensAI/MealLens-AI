#!/bin/bash

# 🐳 MealLens AI - Docker Setup Script
# This script sets up the entire project using Docker

set -e  # Exit on any error

echo "🍽️ =========================================="
echo "🍽️  MealLens AI - Docker Setup"
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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo ""
        echo "Please install Docker from: https://docs.docker.com/get-docker/"
        echo ""
        echo "Installation guides:"
        echo "• Windows: https://docs.docker.com/desktop/windows/install/"
        echo "• macOS: https://docs.docker.com/desktop/mac/install/"
        echo "• Ubuntu: https://docs.docker.com/engine/install/ubuntu/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        echo ""
        echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed!"
}

# Check if Docker daemon is running
check_docker_daemon() {
    print_status "Checking if Docker daemon is running..."
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running!"
        echo ""
        echo "Please start Docker Desktop or the Docker daemon:"
        echo "• Windows/macOS: Start Docker Desktop application"
        echo "• Linux: sudo systemctl start docker"
        exit 1
    fi
    
    print_success "Docker daemon is running!"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/env.production.example" ]; then
            cp backend/env.production.example backend/.env
            print_success "Created backend/.env from example"
            print_warning "Please update backend/.env with your actual configuration!"
        else
            print_warning "No backend environment example found. Creating basic .env..."
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
            print_warning "Created basic backend/.env - please update with your actual values!"
        fi
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
        print_warning "Please update frontend/.env.local with your actual Supabase configuration!"
    else
        print_success "Frontend .env.local file already exists"
    fi
}

# Build and start containers
start_containers() {
    print_status "Building and starting Docker containers..."
    
    # Check if we should use production or development compose
    if [ -f "docker-compose.yml" ]; then
        COMPOSE_FILE="docker-compose.yml"
    elif [ -f "docker-compose.prod.yml" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        print_error "No docker-compose file found!"
        exit 1
    fi
    
    print_status "Using compose file: $COMPOSE_FILE"
    
    # Stop any existing containers
    print_status "Stopping any existing containers..."
    docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    # Build and start containers
    print_status "Building containers (this may take a few minutes)..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    print_status "Starting containers..."
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "Containers started successfully!"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for backend
    print_status "Waiting for backend service..."
    timeout=60
    counter=0
    while [ $counter -lt $timeout ]; do
        if curl -f http://localhost:5000/health 2>/dev/null || curl -f http://localhost:5000/ 2>/dev/null; then
            print_success "Backend service is ready!"
            break
        fi
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge $timeout ]; then
            print_warning "Backend service might not be ready yet. Check docker logs if needed."
            break
        fi
    done
    
    # Wait for frontend
    print_status "Waiting for frontend service..."
    counter=0
    while [ $counter -lt $timeout ]; do
        if curl -f http://localhost:3000 2>/dev/null || curl -f http://localhost:5173 2>/dev/null; then
            print_success "Frontend service is ready!"
            break
        fi
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge $timeout ]; then
            print_warning "Frontend service might not be ready yet. Check docker logs if needed."
            break
        fi
    done
}

# Show status and next steps
show_completion() {
    echo ""
    echo "🎉 =========================================="
    echo "🎉  Setup Complete!"
    echo "🎉 =========================================="
    echo ""
    print_success "MealLens AI is now running with Docker!"
    echo ""
    echo "📱 Access your application:"
    echo "   • Frontend: http://localhost:3000 or http://localhost:5173"
    echo "   • Backend API: http://localhost:5000"
    echo ""
    echo "🔧 Useful Docker commands:"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Stop services: docker-compose down"
    echo "   • Restart services: docker-compose restart"
    echo "   • Rebuild: docker-compose build --no-cache"
    echo ""
    echo "⚠️  Important reminders:"
    echo "   • Update backend/.env with your Supabase credentials"
    echo "   • Update frontend/.env.local with your configuration"
    echo "   • Check docker-compose logs if services aren't working"
    echo ""
    echo "📚 For more help, see README.md or CI_CD_SETUP.md"
    echo ""
}

# Main execution
main() {
    check_docker
    check_docker_daemon
    setup_environment
    start_containers
    wait_for_services
    show_completion
}

# Run main function
main "$@"