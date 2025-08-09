#!/bin/bash

# MealLens AI - Production Deployment Script

set -e  # Exit on any error

echo "🚀 MealLens AI Production Deployment"
echo "===================================="

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    if [ ! -f "backend/.env" ]; then
        echo "❌ backend/.env file not found!"
        echo "💡 Copy backend/env.production.example to backend/.env and configure it"
        exit 1
    fi
    
    source backend/.env
    
    required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "SECRET_KEY")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ Required environment variable $var is not set"
            exit 1
        fi
    done
    
    echo "✅ Environment variables configured"
}

# Build frontend for production
build_frontend() {
    echo "🏗️  Building frontend for production..."
    
    cd Frontend
    
    # Install dependencies
    npm ci --production
    
    # Build the project
    npm run build
    
    # Check if build was successful
    if [ ! -d "dist" ]; then
        echo "❌ Frontend build failed - dist directory not found"
        exit 1
    fi
    
    echo "✅ Frontend built successfully"
    cd ..
}

# Test backend
test_backend() {
    echo "🧪 Testing backend..."
    
    cd backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Run basic tests
    python3 -c "
import app
try:
    test_app = app.create_app()
    print('✅ Backend imports successfully')
except Exception as e:
    print(f'❌ Backend test failed: {e}')
    exit(1)
"
    
    cd ..
}

# Deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up --build -d
    
    # Wait for services to be healthy
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check if backend is responding
    for i in {1..30}; do
        if curl -s http://localhost:5001/api/health > /dev/null; then
            echo "✅ Backend is responding"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo "❌ Backend health check failed"
            docker-compose -f docker-compose.prod.yml logs meallens-backend
            exit 1
        fi
        
        sleep 2
    done
    
    echo "✅ Deployment completed successfully"
}

# Deploy without Docker (systemd)
deploy_systemd() {
    echo "🔧 Deploying with systemd..."
    
    # Create systemd service file
    cat > /tmp/meallens-backend.service << EOF
[Unit]
Description=MealLens AI Backend
After=network.target

[Service]
Type=exec
User=www-data
WorkingDirectory=/opt/meallens/backend
Environment=PATH=/opt/meallens/backend/venv/bin
ExecStart=/opt/meallens/backend/venv/bin/gunicorn --bind 0.0.0.0:5001 --workers 4 wsgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    # Install service (requires sudo)
    echo "💡 Installing systemd service (requires sudo)..."
    sudo cp /tmp/meallens-backend.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable meallens-backend
    sudo systemctl start meallens-backend
    
    echo "✅ Systemd service installed and started"
}

# Show deployment info
show_info() {
    echo ""
    echo "🎉 Deployment Information"
    echo "========================"
    echo "🌐 Frontend: http://localhost (if using nginx)"
    echo "🔗 Backend API: http://localhost:5001/api"
    echo "📊 Health Check: http://localhost:5001/api/health"
    echo ""
    echo "📁 Log Files:"
    echo "   - Backend: docker logs meallens-backend (Docker) or journalctl -u meallens-backend (systemd)"
    echo "   - Nginx: docker logs nginx (Docker) or /var/log/nginx/ (system)"
    echo ""
    echo "🔧 Management Commands:"
    echo "   - Stop: docker-compose -f docker-compose.prod.yml down"
    echo "   - Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    
    # Check environment
    check_env_vars
    
    # Build frontend
    build_frontend
    
    # Test backend
    test_backend
    
    # Ask deployment method
    echo ""
    echo "🚀 Choose deployment method:"
    echo "1) Docker Compose (recommended)"
    echo "2) Systemd service"
    echo -n "Enter choice [1-2]: "
    read -r choice
    
    case $choice in
        1)
            deploy_docker
            ;;
        2)
            deploy_systemd
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
    
    # Show deployment info
    show_info
    
    echo "✅ MealLens AI deployed successfully!"
}

# Run main function
main "$@"