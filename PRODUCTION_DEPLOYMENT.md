# MealLens AI - Production Deployment Guide

## 🚀 Quick Production Deployment

### Prerequisites

- **Server**: Ubuntu 20.04+ or similar Linux distribution
- **Docker**: Docker and Docker Compose (recommended)
- **Node.js**: 18+ (for frontend build)
- **Python**: 3.12+ (if not using Docker)
- **Domain**: A registered domain name with SSL certificate
- **Database**: Supabase project setup

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Application Setup

```bash
# Clone your repository
git clone https://github.com/your-username/MealLens-Beta.git
cd MealLens-Beta

# Copy and configure environment variables
cp backend/env.production.example backend/.env
nano backend/.env  # Edit with your production values
```

### 3. Environment Configuration

Edit `backend/.env` with your production values:

```bash
# Required Settings
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
FRONTEND_URL=https://your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional Settings
PAYSTACK_SECRET_KEY=sk_live_your-key
OPENAI_API_KEY=your-openai-key
```

### 4. SSL Certificate Setup

```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

### 5. Deploy

```bash
# Run the automated deployment script
./deploy.sh
```

Or manually:

```bash
# Build frontend
cd Frontend
npm ci --production
npm run build
cd ..

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d --build
```

### 6. Verify Deployment

```bash
# Check services status
docker-compose -f docker-compose.prod.yml ps

# Test backend
curl https://your-domain.com/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Production Management

### Starting/Stopping Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart meallens-backend

# View logs
docker-compose -f docker-compose.prod.yml logs -f meallens-backend
```

### Database Migrations

```bash
# Run database migrations
cd backend
source venv/bin/activate
python3 -c "
from services.supabase_service import SupabaseService
import os
from dotenv import load_dotenv
load_dotenv()

supabase_service = SupabaseService(
    os.environ.get('SUPABASE_URL'),
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
)
print('Database connection successful')
"
```

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Monitoring and Logs

```bash
# System resources
docker stats

# Application logs
docker-compose -f docker-compose.prod.yml logs --tail=100 -f

# Nginx logs
docker exec nginx tail -f /var/log/nginx/access.log

# Backend logs
docker exec meallens-backend tail -f /app/logs/app.log
```

## 🔒 Security Checklist

- ✅ Use HTTPS with valid SSL certificates
- ✅ Configure proper CORS origins
- ✅ Set strong SECRET_KEY
- ✅ Use production database credentials
- ✅ Enable rate limiting
- ✅ Configure proper firewall rules
- ✅ Regular security updates
- ✅ Monitor access logs

## 🏗️ Alternative Deployment Options

### Option 1: VPS with Nginx + Systemd

```bash
# Install application
sudo mkdir -p /opt/meallens
sudo cp -r . /opt/meallens/
sudo chown -R www-data:www-data /opt/meallens

# Deploy using systemd service
./deploy.sh  # Choose option 2
```

### Option 2: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI and deploy
heroku create your-app-name
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-key
git push heroku main
```

#### DigitalOcean App Platform
```bash
# Use the included app.yaml for DigitalOcean deployment
doctl apps create --spec app.yaml
```

#### AWS EC2 / Google Cloud / Azure
- Use the Docker Compose setup
- Configure load balancer and auto-scaling
- Set up managed database if needed

## 📊 Performance Optimization

### Backend Optimization
- Use Gunicorn with multiple workers
- Enable Redis caching
- Configure database connection pooling
- Implement request rate limiting

### Frontend Optimization
- Enable Nginx gzip compression
- Configure proper cache headers
- Use CDN for static assets
- Optimize images and assets

### Database Optimization
- Configure Supabase for production
- Enable Row Level Security (RLS)
- Optimize queries and indexes
- Regular database maintenance

## 🆘 Troubleshooting

### Common Issues

1. **Backend not starting**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs meallens-backend
   
   # Verify environment variables
   docker exec meallens-backend env | grep SUPABASE
   ```

2. **Frontend not loading**
   ```bash
   # Check nginx logs
   docker-compose -f docker-compose.prod.yml logs nginx
   
   # Verify build
   ls -la Frontend/dist/
   ```

3. **Database connection issues**
   ```bash
   # Test Supabase connection
   curl -H "apikey: your-anon-key" https://your-project.supabase.co/rest/v1/
   ```

4. **SSL certificate issues**
   ```bash
   # Renew Let's Encrypt certificates
   sudo certbot renew
   
   # Update nginx configuration
   sudo nginx -t && sudo nginx -s reload
   ```

### Support

- Check the logs first: `docker-compose -f docker-compose.prod.yml logs`
- Verify environment configuration
- Test individual components
- Check firewall and network settings

## 📈 Scaling for High Traffic

1. **Horizontal Scaling**
   - Multiple backend instances behind load balancer
   - Database read replicas
   - CDN for static content

2. **Vertical Scaling**
   - Increase server resources
   - Optimize application performance
   - Database optimization

3. **Monitoring**
   - Set up application monitoring (Prometheus/Grafana)
   - Log aggregation (ELK stack)
   - Error tracking (Sentry)
   - Uptime monitoring

---

**🎉 Your MealLens AI application is now ready for production!**

For questions or issues, check the logs and documentation above.