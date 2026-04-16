# Travel Tracker - Deployment Guide

## Deployment Options

### 1. **Heroku Deployment** (Easiest for beginners)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create your-travel-tracker-app
```

3. **Add PostgreSQL Database**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Deploy Code**
```bash
git push heroku main
```

5. **Run Database Setup**
```bash
heroku run npm run db:setup
```

6. **Open Application**
```bash
heroku open
```

**Cost**: Free tier available (limited resources)
**Scalability**: Easy to scale
**Best For**: Small projects, quick deployment

---

### 2. **Render Deployment** (Recommended for startups)

#### Prerequisites
- Render account (free tier available)
- GitHub repository

#### Steps

1. **Connect GitHub to Render**
   - Go to Render Dashboard
   - Click "New+" → "Web Service"
   - Select your GitHub repository

2. **Configure Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

3. **Add PostgreSQL Database**
   - Click "New+" → "PostgreSQL"
   - Note the connection URL

4. **Set Environment Variables**
   ```
   DATABASE_URL=<from PostgreSQL service>
   NODE_ENV=production
   LOG_LEVEL=warn
   ```

5. **Deploy**
   - Push to GitHub
   - Render automatically deploys

6. **Initialize Database**
   ```bash
   render-deploy bash -c "npm run db:setup"
   ```

**Cost**: Free tier available
**Scalability**: Good
**Best For**: Modern deployment, easy GitHub integration

---

### 3. **AWS EC2 Deployment** (Most control)

#### Prerequisites
- AWS Account
- EC2 instance running Ubuntu/Amazon Linux
- SSH access to instance

#### Steps

1. **SSH into Instance**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

3. **Install PostgreSQL Client**
```bash
sudo yum install -y postgresql-client
```

4. **Clone Repository**
```bash
git clone https://github.com/yourusername/travel-tracker.git
cd travel-tracker
```

5. **Install Dependencies**
```bash
npm install
```

6. **Configure Environment**
```bash
cp .env.example .env
nano .env  # Edit with your settings
```

7. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

8. **Start Application**
```bash
pm2 start server.js --name "travel-tracker"
pm2 startup
pm2 save
```

9. **Setup Nginx Reverse Proxy**
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Create `/etc/nginx/conf.d/travel-tracker.conf`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

10. **Setup SSL with Certbot**
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Cost**: Starts at ~$5/month
**Scalability**: Excellent
**Best For**: Production apps, custom configurations

---

### 4. **Docker Deployment**

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: travel_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      PGHOST: postgres
      PGUSER: postgres
      PGPASSWORD: your_password
      PGDATABASE: travel_tracker
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### Run with Docker
```bash
docker-compose up -d
docker-compose exec app npm run db:setup
```

**Cost**: Depends on hosting platform
**Scalability**: Excellent
**Best For**: Containerized deployments, microservices

---

### 5. **DigitalOcean Deployment**

#### Steps

1. **Create Droplet**
   - Choose Ubuntu 22.04
   - Select at least 1GB RAM
   - Add SSH key

2. **Connect and Update**
```bash
ssh root@your_droplet_ip
apt update && apt upgrade -y
```

3. **Install Requirements**
```bash
apt install -y nodejs npm postgresql postgresql-contrib
```

4. **Setup PostgreSQL**
```bash
sudo -u postgres createdb travel_tracker
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_password';"
```

5. **Clone and Setup Application**
```bash
cd /home
git clone https://github.com/yourusername/travel-tracker.git
cd travel-tracker
npm install
cp .env.example .env
# Edit .env
npm run db:setup
```

6. **Install Supervisor for Process Management**
```bash
apt install -y supervisor
```

Create `/etc/supervisor/conf.d/travel-tracker.conf`:
```ini
[program:travel-tracker]
directory=/home/travel-tracker
command=/usr/bin/node /home/travel-tracker/server.js
autostart=true
autorestart=true
stderr_logfile=/var/log/travel-tracker.err.log
stdout_logfile=/var/log/travel-tracker.out.log
user=root
```

7. **Start Service**
```bash
supervisorctl reread
supervisorctl update
supervisorctl start travel-tracker
```

**Cost**: $6/month minimum
**Scalability**: Good
**Best For**: Affordable, reliable hosting

---

## Deployment Checklist

- [ ] Create production `.env` file with secure passwords
- [ ] Set `NODE_ENV=production`
- [ ] Set `LOG_LEVEL=warn` in production
- [ ] Enable SSL/HTTPS
- [ ] Setup database backups
- [ ] Configure monitoring and alerts
- [ ] Setup error tracking (Sentry)
- [ ] Optimize database indexes
- [ ] Test all API endpoints
- [ ] Verify security headers
- [ ] Setup health check monitoring
- [ ] Document deployment process

## Post-Deployment

### 1. **Monitor Application**
```bash
curl https://your-domain.com/health
```

### 2. **Setup Logs**
- Configure centralized logging
- Setup log rotation
- Monitor for errors

### 3. **Database Backups**
```bash
# Daily automated backup (cron job)
0 2 * * * /path/to/travel-tracker/database/backup.sh >> /var/log/backup.log 2>&1
```

### 4. **Update Monitoring**
- Setup uptime monitoring
- Configure alerts
- Track performance metrics

## Security Best Practices for Production

1. **Use Strong Passwords**
   - Generate 32-character random passwords
   - Never hardcode credentials

2. **Use Environment Variables**
   - Load from secure vaults
   - Rotate regularly

3. **Enable SSL/TLS**
   - Use free certificates (Let's Encrypt)
   - Force HTTPS redirects

4. **Database Security**
   - Enable SSL for database connections
   - Use private database endpoints
   - Implement row-level security

5. **Application Security**
   - Update dependencies regularly
   - Implement rate limiting
   - Add request validation

6. **Monitoring & Logging**
   - Centralized logging
   - Performance monitoring
   - Alert on anomalies

## Scaling Considerations

For high-traffic applications:

1. **Database**
   - Use read replicas
   - Implement caching (Redis)
   - Optimize queries

2. **Application**
   - Use load balancer
   - Horizontal scaling
   - Container orchestration (Kubernetes)

3. **CDN**
   - Serve static assets from CDN
   - Cache API responses

## Troubleshooting Deployments

### Application won't start
```bash
# Check logs
pm2 logs travel-tracker
# or
docker logs container_name
```

### Database connection failed
- Verify DATABASE_URL
- Check network access
- Verify credentials

### Performance issues
```sql
-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM visited_countries;
-- Create indexes
CREATE INDEX idx_country_code ON visited_countries(country_code);
```

---

For more detailed instructions, see [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
