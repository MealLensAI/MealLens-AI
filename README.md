# 🍽️ MealLens AI

**Smart Food Detection & Meal Planning Platform**

MealLens AI is an intelligent food detection and meal planning application that uses computer vision and AI to help users identify foods, track nutrition, and create personalized meal plans. The platform combines cutting-edge AI technology with an intuitive user experience to revolutionize how people interact with food and nutrition.

## ✨ Features

### 🔍 **AI-Powered Food Detection**
- **Smart Image Recognition**: Upload photos of your meals and get instant food identification
- **Nutritional Analysis**: Automatic calculation of calories, macros, and micronutrients
- **Multi-Food Detection**: Identify multiple food items in a single image
- **Real-time Processing**: Fast and accurate food recognition powered by advanced AI models

### 📋 **Intelligent Meal Planning**
- **Personalized Plans**: Custom meal plans based on your dietary preferences and health goals
- **Weekly Planning**: Comprehensive weekly meal scheduling and organization
- **Recipe Suggestions**: AI-curated recipe recommendations based on detected foods
- **Cooking Tutorials**: Step-by-step cooking instructions with video guides

### 👤 **User Profile & Health Tracking**
- **Comprehensive Profiles**: Detailed user profiles with health conditions, allergies, and preferences
- **Dietary Restrictions**: Support for various dietary needs (vegetarian, vegan, keto, etc.)
- **Health Monitoring**: Track health conditions and medical history
- **Emergency Contacts**: Secure storage of emergency contact information

### 📊 **Analytics & History**
- **Detection History**: Complete history of all food detections and analyses
- **Usage Dashboard**: Detailed analytics and usage statistics
- **Progress Tracking**: Monitor your nutrition goals and achievements
- **Export Data**: Download your data for personal records

### 💳 **Subscription & Payments**
- **Flexible Plans**: Multiple subscription tiers to fit different needs
- **Secure Payments**: Integrated payment processing with multiple payment methods
- **Usage Limits**: Fair usage policies with subscription-based access

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first design that works on all devices
- **Component Library**: Custom UI components with shadcn/ui
- **State Management**: Efficient state management with React hooks
- **Routing**: Client-side routing with React Router

### **Backend (Python + Flask)**
- **RESTful API**: Clean and well-documented API endpoints
- **Authentication**: Secure user authentication with Firebase
- **Database**: PostgreSQL with Supabase for real-time capabilities
- **File Storage**: Secure image storage with Supabase Storage
- **AI Integration**: Integration with AI/ML services for food detection

### **Database (Supabase + PostgreSQL)**
- **Real-time**: Real-time data synchronization
- **Scalable**: PostgreSQL for robust data management
- **Secure**: Row-level security and data encryption
- **Backup**: Automated backups and data recovery

## 🚀 Quick Start

### 🎯 One-Command Setup (Recommended)

**For all platforms, simply run:**

```bash
# Clone the repository
git clone https://github.com/MealLensAI/MealLens-AI.git
cd MealLens-AI

# Run the universal setup script
./setup.sh
```

**On Windows:**
```cmd
# Clone and setup
git clone https://github.com/MealLensAI/MealLens-AI.git
cd MealLens-AI
setup.bat
```

The setup script will:
- ✅ Detect your platform automatically
- ✅ Install all required dependencies
- ✅ Configure environment files
- ✅ Start the application
- ✅ Open it in your browser

### 🐳 Docker Setup (Universal)

**Works on all platforms with Docker:**

```bash
git clone https://github.com/MealLensAI/MealLens-AI.git
cd MealLens-AI
./setup.sh --docker
```

Or run the Docker setup directly:
```bash
./scripts/setup/docker-setup.sh
```

### 📋 Platform-Specific Setup

Choose your platform for detailed instructions:

<details>
<summary>🪟 <strong>Windows Setup</strong></summary>

**Prerequisites:** Windows 10/11 with PowerShell

**Option 1: Automatic Setup**
```cmd
setup.bat
```

**Option 2: Manual PowerShell Setup**
```powershell
.\scripts\setup\windows-setup.ps1
```

**Option 3: Docker Setup**
```cmd
setup.bat --docker
```

**What gets installed:**
- Node.js (via Chocolatey)
- Python 3
- All project dependencies
- Environment files

</details>

<details>
<summary>🍎 <strong>macOS Setup</strong></summary>

**Prerequisites:** macOS 10.15+ with Terminal

**Automatic Setup:**
```bash
./setup.sh
```

**Manual Setup:**
```bash
./scripts/setup/macos-setup.sh
```

**What gets installed:**
- Xcode Command Line Tools
- Homebrew package manager
- Node.js and Python via Homebrew
- PostgreSQL and Redis (optional)
- Development tools (optional)

</details>

<details>
<summary>🐧 <strong>Ubuntu/Linux Setup</strong></summary>

**Prerequisites:** Ubuntu 18.04+ or compatible Linux distribution

**Automatic Setup:**
```bash
./setup.sh
```

**Manual Setup:**
```bash
./scripts/setup/ubuntu-setup.sh
```

**What gets installed:**
- Node.js (latest LTS)
- Python 3 and pip
- Build tools and dependencies
- PostgreSQL and Redis (optional)

**Supported distributions:**
- Ubuntu/Debian (apt)
- Fedora/CentOS/RHEL (dnf/yum)
- Arch Linux (pacman)

</details>

### 🔧 Manual Installation

<details>
<summary>Manual setup instructions (if automatic setup fails)</summary>

**Prerequisites:**
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git**

**Steps:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/MealLensAI/MealLens-AI.git
   cd MealLens-AI
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Backend
   cp backend/env.production.example backend/.env
   # Edit .env with your configuration

   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit .env.local with your configuration
   ```

5. **Run the Application**
   ```bash
   # Backend (Terminal 1)
   cd backend
   source venv/bin/activate
   python app.py

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

</details>

**🌐 Access Your Application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
MealLens-AI/
├── backend/                 # Python Flask backend
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── scripts/            # Database scripts
│   └── app.py              # Main application entry
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
├── nginx/                  # Nginx configuration
├── deploy.sh              # Deployment script
└── docker-compose.prod.yml # Production Docker config
```

## 🔧 Configuration

### Environment Variables

**Backend (`backend/.env`)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FIREBASE_CREDENTIALS_PATH=path_to_firebase_credentials
FLASK_ENV=development
```

**Frontend (`frontend/.env.local`)**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

## 🤝 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Food Detection Endpoints
- `POST /detect-food` - Detect food in uploaded image
- `GET /detection-history` - Get user's detection history
- `GET /detection-history/<id>` - Get specific detection details

### Meal Planning Endpoints
- `GET /meal-plans` - Get user's meal plans
- `POST /meal-plans` - Create new meal plan
- `PUT /meal-plans/<id>` - Update meal plan
- `DELETE /meal-plans/<id>` - Delete meal plan

### Payment Endpoints
- `POST /payments/create-subscription` - Create subscription
- `POST /payments/update-subscription` - Update subscription
- `GET /payments/subscription-status` - Check subscription status

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Performance

- **Fast Response Times**: Optimized API responses under 200ms
- **Efficient Image Processing**: Compressed image uploads and processing
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Static asset delivery via CDN
- **Database Optimization**: Indexed queries and connection pooling

## 🔒 Security

- **Authentication**: Firebase Authentication with secure tokens
- **Authorization**: Role-based access control
- **Data Encryption**: All data encrypted in transit and at rest
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse

## 🌍 Deployment

The application is designed for easy deployment on various platforms:

- **Local Development**: Docker Compose setup
- **Cloud Platforms**: AWS, Google Cloud, Azure compatible
- **Container Orchestration**: Kubernetes ready
- **CI/CD**: GitHub Actions integration ready

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/MealLens-AI/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 👥 Team

**MealLens AI** is developed by a passionate team dedicated to revolutionizing nutrition technology:

- **🎯 CEO & AI Engineer**: [Daniel Etekudo](https://github.com/danieletekudo) - Leading AI innovation and strategic vision
- **💻 CTO & Full-Stack Developer**: [Oluu Graham](https://github.com/oluugraham) - Technical leadership and full-stack development
- **🤖 AI Engineering**: Advanced machine learning and computer vision for food detection
- **🏗️ Full-Stack Development**: Complete end-to-end application architecture

### 🌟 Mission
Making nutrition tracking more accessible and intelligent through cutting-edge AI technology.

## 🙏 Acknowledgments

- Thanks to **Daniel Etekudo** for AI vision and leadership
- Thanks to **Oluu Graham** for technical excellence and architecture
- Special thanks to the open-source community for the amazing tools and libraries
- Inspired by the need to make nutrition tracking more accessible and intelligent

---

**Built with ❤️ by Daniel Etekudo & Oluu Graham**

*MealLens AI - Where Technology Meets Nutrition*