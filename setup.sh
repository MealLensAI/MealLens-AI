#!/bin/bash

# 🚀 MealLens AI - Universal Setup Script
# This script automatically detects your platform and runs the appropriate setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo ""
    echo -e "${CYAN}🍽️ ============================================${NC}"
    echo -e "${CYAN}🍽️  MealLens AI - Universal Setup Script${NC}"
    echo -e "${CYAN}🍽️ ============================================${NC}"
    echo ""
}

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

# Show help
show_help() {
    echo "🚀 MealLens AI Universal Setup Script"
    echo ""
    echo "This script automatically detects your platform and sets up the project."
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --docker              Use Docker setup (works on all platforms)"
    echo "  --platform PLATFORM   Force specific platform (windows|macos|ubuntu|docker)"
    echo "  --skip-deps           Skip dependency installation"
    echo "  --help               Show this help message"
    echo ""
    echo "Supported Platforms:"
    echo "  🐳 Docker        - Universal container-based setup"
    echo "  🪟 Windows       - PowerShell and Batch scripts"
    echo "  🍎 macOS         - Homebrew-based setup"
    echo "  🐧 Ubuntu/Linux  - APT/DNF/Pacman package managers"
    echo ""
    echo "Examples:"
    echo "  $0                    # Auto-detect platform and setup"
    echo "  $0 --docker          # Force Docker setup"
    echo "  $0 --platform macos  # Force macOS setup"
    echo ""
}

# Detect operating system
detect_platform() {
    print_status "Detecting platform..."
    
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]]; then
        PLATFORM="windows"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Detect specific Linux distribution
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            case $ID in
                ubuntu|debian)
                    PLATFORM="ubuntu"
                    ;;
                fedora|centos|rhel)
                    PLATFORM="ubuntu"  # Use ubuntu script for now
                    ;;
                arch)
                    PLATFORM="ubuntu"  # Use ubuntu script for now
                    ;;
                *)
                    PLATFORM="ubuntu"  # Default to ubuntu script
                    ;;
            esac
        else
            PLATFORM="ubuntu"  # Default to ubuntu for unknown Linux
        fi
    else
        PLATFORM="unknown"
    fi
    
    print_success "Detected platform: $PLATFORM"
}

# Check if Docker is available
check_docker_available() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        if docker info &> /dev/null; then
            return 0  # Docker is available and running
        fi
    fi
    return 1  # Docker is not available
}

# Make scripts executable
make_scripts_executable() {
    print_status "Making setup scripts executable..."
    
    chmod +x scripts/setup/*.sh 2>/dev/null || true
    
    print_success "Scripts are now executable!"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
        print_error "This doesn't appear to be the MealLens AI project directory!"
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed. Some features may not work properly."
    fi
    
    print_success "Prerequisites check passed!"
}

# Show platform-specific recommendations
show_recommendations() {
    echo ""
    print_status "Platform-specific recommendations:"
    echo ""
    
    case $PLATFORM in
        windows)
            echo "🪟 Windows Setup:"
            echo "   • For best experience, use Windows Terminal or PowerShell"
            echo "   • Consider enabling WSL2 for Docker support"
            echo "   • Git Bash or PowerShell recommended for running scripts"
            ;;
        macos)
            echo "🍎 macOS Setup:"
            echo "   • Xcode Command Line Tools will be installed automatically"
            echo "   • Homebrew will be used for package management"
            echo "   • Terminal or iTerm2 recommended"
            ;;
        ubuntu)
            echo "🐧 Ubuntu/Linux Setup:"
            echo "   • Package manager (apt/dnf/pacman) will be used"
            echo "   • sudo privileges may be required for installations"
            echo "   • Terminal with bash/zsh recommended"
            ;;
        docker)
            echo "🐳 Docker Setup:"
            echo "   • Docker and Docker Compose required"
            echo "   • Works consistently across all platforms"
            echo "   • Recommended for production-like environment"
            ;;
    esac
    echo ""
}

# Run the appropriate setup script
run_setup() {
    print_status "Starting $PLATFORM setup..."
    echo ""
    
    case $PLATFORM in
        windows)
            if command -v powershell &> /dev/null; then
                print_status "Using PowerShell setup script..."
                powershell -ExecutionPolicy Bypass -File "scripts/setup/windows-setup.ps1" $SCRIPT_ARGS
            else
                print_status "Using batch setup script..."
                cmd //c "scripts\setup\windows-setup.bat"
            fi
            ;;
        macos)
            print_status "Using macOS setup script..."
            ./scripts/setup/macos-setup.sh $SCRIPT_ARGS
            ;;
        ubuntu)
            print_status "Using Ubuntu/Linux setup script..."
            ./scripts/setup/ubuntu-setup.sh $SCRIPT_ARGS
            ;;
        docker)
            print_status "Using Docker setup script..."
            ./scripts/setup/docker-setup.sh $SCRIPT_ARGS
            ;;
        *)
            print_error "Unsupported platform: $PLATFORM"
            echo ""
            echo "Supported platforms:"
            echo "  • Windows (with PowerShell or Git Bash)"
            echo "  • macOS (with Homebrew)"
            echo "  • Ubuntu/Debian Linux"
            echo "  • Docker (universal)"
            echo ""
            echo "You can force a specific platform with --platform option"
            echo "or use Docker with --docker option"
            exit 1
            ;;
    esac
}

# Show completion and next steps
show_completion() {
    echo ""
    echo -e "${GREEN}🎉 ============================================${NC}"
    echo -e "${GREEN}🎉  Universal Setup Complete!${NC}"
    echo -e "${GREEN}🎉 ============================================${NC}"
    echo ""
    
    print_success "MealLens AI has been set up successfully!"
    echo ""
    echo "🔗 Quick Access URLs:"
    echo "   • Frontend: http://localhost:5173 or http://localhost:3000"
    echo "   • Backend API: http://localhost:5000"
    echo "   • API Documentation: http://localhost:5000/docs (if available)"
    echo ""
    echo "📱 Mobile App (Future):"
    echo "   • React Native app will use the same backend API"
    echo "   • Development setup will be similar to frontend"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Update environment files with your actual configurations"
    echo "   2. Set up your Supabase project and database"
    echo "   3. Configure Firebase for authentication"
    echo "   4. Review the README.md for detailed instructions"
    echo "   5. Check CI_CD_SETUP.md for deployment information"
    echo ""
    echo "🛠️  Development Workflow:"
    echo "   • Make changes to code"
    echo "   • Test locally"
    echo "   • Create pull requests"
    echo "   • Automated CI/CD will handle testing and deployment"
    echo ""
    echo "🆘 Need Help?"
    echo "   • Check README.md for detailed documentation"
    echo "   • Review CI_CD_SETUP.md for advanced setup"
    echo "   • Create an issue on GitHub for bugs or questions"
    echo ""
}

# Main execution
main() {
    # Default values
    PLATFORM=""
    USE_DOCKER=false
    SKIP_DEPS=false
    SCRIPT_ARGS=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker)
                USE_DOCKER=true
                PLATFORM="docker"
                SCRIPT_ARGS="$SCRIPT_ARGS $1"
                shift
                ;;
            --platform)
                PLATFORM="$2"
                shift 2
                ;;
            --skip-deps)
                SKIP_DEPS=true
                SCRIPT_ARGS="$SCRIPT_ARGS $1"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                SCRIPT_ARGS="$SCRIPT_ARGS $1"
                shift
                ;;
        esac
    done
    
    # Show header
    print_header
    
    # Check prerequisites
    check_prerequisites
    
    # Auto-detect platform if not specified
    if [ -z "$PLATFORM" ]; then
        if [ "$USE_DOCKER" = true ]; then
            PLATFORM="docker"
        else
            detect_platform
        fi
    fi
    
    # Override with Docker if requested and available
    if [ "$USE_DOCKER" = true ] || [ "$PLATFORM" = "docker" ]; then
        if check_docker_available; then
            PLATFORM="docker"
            print_success "Docker is available and will be used for setup!"
        else
            if [ "$USE_DOCKER" = true ]; then
                print_error "Docker was requested but is not available!"
                print_error "Please install Docker or use native setup."
                exit 1
            else
                print_warning "Docker is not available, falling back to native setup."
                detect_platform
            fi
        fi
    fi
    
    # Show recommendations
    show_recommendations
    
    # Ask for confirmation unless using Docker
    if [ "$PLATFORM" != "docker" ]; then
        echo -n "Proceed with $PLATFORM setup? (y/N): "
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo ""
            print_status "Setup cancelled by user."
            echo ""
            echo "You can:"
            echo "  • Run with --docker for container-based setup"
            echo "  • Run with --platform <platform> to force a specific platform"
            echo "  • Run with --help for more options"
            echo ""
            exit 0
        fi
    fi
    
    # Make scripts executable
    make_scripts_executable
    
    # Run the setup
    run_setup
    
    # Show completion message
    show_completion
}

# Handle Ctrl+C gracefully
trap 'print_warning "Setup interrupted by user"; exit 1' INT

# Run main function
main "$@"