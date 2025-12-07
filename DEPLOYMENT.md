# Deployment Guide

This guide covers deploying the Collaborative Coding Interview Platform to production.

## Table of Contents
- [Quick Start](#quick-start)
- [Local Production Build](#local-production-build)
- [Deployment Options](#deployment-options)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git repository access
- Production environment variables configured

### Build and Run Locally

```bash
# Build production image
make prod-build

# Start production container
make prod-start

# View logs
make prod-logs

# Stop production
make prod-stop
```

Or use the combined command:
```bash
make prod
```

The application will be available at **http://localhost:3000**

## Local Production Build

### 1. Set Up Environment

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit production environment variables
nano .env.production
```

### 2. Build Production Image

```bash
docker-compose -f docker-compose.prod.yml build
```

This creates a multi-stage optimized build:
- Client: Vite production build with optimizations
- Server: Node.js with production dependencies only
- Combined: Single container serving both client and server

### 3. Run Production Container

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-07T..."}
```

## Deployment Options

### Option 1: Railway

[Railway](https://railway.app/) offers easy Docker deployments with automatic HTTPS.

#### Steps:
1. Create a Railway account
2. Create new project from GitHub repository
3. Railway will auto-detect the Dockerfile
4. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT=3000` (Railway will override this)
5. Deploy!

#### Railway Configuration

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/Dockerfile"
  },
  "deploy": {
    "startCommand": "node server/src/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### Option 2: Render

[Render](https://render.com/) provides free Docker hosting with automatic deployments.

#### Steps:
1. Create Render account
2. New Web Service from Git repository
3. Configure:
   - **Environment**: Docker
   - **Dockerfile Path**: `docker/Dockerfile`
   - **Port**: 3000
4. Add environment variables
5. Deploy!

### Option 3: Fly.io

[Fly.io](https://fly.io/) offers global edge deployments.

#### Steps:
1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Initialize: `fly launch`
4. Configure `fly.toml`:

```toml
app = "coding-interview-platform"

[build]
  dockerfile = "docker/Dockerfile"

[[services]]
  http_checks = []
  internal_port = 3000
  processes = ["app"]
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

5. Deploy: `fly deploy`

### Option 4: DigitalOcean App Platform

1. Create DigitalOcean account
2. Apps → Create App → From GitHub
3. Select repository
4. Configure:
   - **Type**: Web Service
   - **Dockerfile**: `docker/Dockerfile`
   - **Port**: 3000
5. Add environment variables
6. Deploy!

### Option 5: Self-Hosted (VPS)

For VPS deployment (AWS EC2, DigitalOcean Droplet, etc.):

```bash
# On your server
git clone <your-repo-url>
cd ai-dev-tools-zoomcamp-hw-02

# Set up environment
cp .env.production.example .env.production
nano .env.production

# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Set up reverse proxy (Nginx)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/coding-interview
```

Nginx configuration:
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

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/coding-interview /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

### Production Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `3000` | No |

### Optional Variables (for future scaling)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string for session storage |
| `SESSION_SECRET` | Secret for session encryption |

## Health Checks

The application includes a health check endpoint at `/health`.

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2024-12-07T12:00:00.000Z"
}
```

### Docker Health Check

The production Dockerfile includes an automatic health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', ...)"
```

## CI/CD

See `.github/workflows/ci-cd.yml` for automated testing and deployment.

## Troubleshooting

### Port Already in Use

```bash
# Stop all Docker containers
docker-compose -f docker-compose.prod.yml down

# Check what's using port 3000
lsof -i :3000
```

### Container Won't Start

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

### Build Fails

```bash
# Clean rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
```

## Performance Optimization

### Recommendations:
1. Use a CDN for static assets
2. Enable gzip compression
3. Add Redis for session storage at scale
4. Use PostgreSQL for persistent room state
5. Implement rate limiting
6. Add monitoring (Sentry, DataDog, etc.)

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env.production`
3. **CORS**: Configure proper CORS origins
4. **Rate Limiting**: Add rate limiting for API endpoints
5. **Updates**: Keep dependencies updated

## Monitoring

### Recommended Tools:
- **Uptime**: UptimeRobot, Better Uptime
- **Errors**: Sentry
- **Analytics**: Plausible, PostHog
- **Logs**: Papertrail, Logtail

## Support

For issues or questions:
- Check [README.md](./README.md)
- Review [AGENTS.md](./AGENTS.md) for development guidelines
- Open an issue on GitHub

---

**Ready to deploy!** Choose your deployment platform and follow the steps above.
