# Docker Setup for Pronunciation App

This Angular 20 app has been dockerized for easy deployment and development.

## Quick Start

### Option 1: Standalone Frontend (Development)
Run just the frontend without the backend:

```bash
# Build and run standalone
docker build -t pronunciation-app .
docker run -p 4200:80 pronunciation-app

# Or use docker-compose
docker-compose -f docker-compose.dev.yml up
```

The app will be available at http://localhost:4200

### Option 2: With Backend (Production)
Run with the pronunciation-service backend:

```bash
# When pronunciation-service is available, build both services
docker-compose up --build
```

## Docker Files Overview

- `Dockerfile` - Production-ready container using pre-built dist folder
- `Dockerfile.multistage` - Multi-stage build that compiles from source (for CI/CD)
- `nginx.conf` - Nginx config with backend proxy for docker-compose
- `nginx.standalone.conf` - Nginx config for standalone deployment
- `docker-compose.yml` - Full stack with frontend + backend
- `docker-compose.dev.yml` - Frontend only for development

## Building Options

### 1. Using Pre-built Assets (Fastest)
```bash
# First build the Angular app
npm run build

# Then build Docker image
docker build -t pronunciation-app .
```

### 2. Multi-stage Build (For CI/CD)
```bash
# Builds everything from source inside Docker
docker build -f Dockerfile.multistage -t pronunciation-app .
```

## Nginx Configuration

### Standalone Mode
- Serves Angular static files
- Returns helpful error messages for API calls
- Handles Angular routing with fallback to index.html

### With Backend Mode
- Proxies `/api/*` requests to `pronunciation-service:8080`
- Includes CORS headers for cross-origin requests
- Graceful error handling when backend is unavailable

## Environment Variables

- `NODE_ENV=production` - Set in docker-compose files
- Backend service URL is configured in nginx proxy settings

## Ports

- **Frontend**: 4200 (mapped to internal port 80)
- **Backend**: 8080 (when using docker-compose)

## Development Workflow

1. **Local Development**: Use `npm run start:proxy`
2. **Docker Testing**: Use `docker-compose -f docker-compose.dev.yml up`
3. **Full Stack**: Use `docker-compose up` (when backend is ready)

## Connecting to Backend

When the pronunciation-service is ready:

1. Update `docker-compose.yml`:
   ```yaml
   pronunciation-service:
     image: pronunciation-service:latest  # Your actual image
     ports:
       - "8080:8080"
     environment:
       - SPRING_PROFILES_ACTIVE=docker
   ```

2. Use the multi-stage Dockerfile:
   ```bash
   docker-compose up --build
   ```

## Security Features

- Uses Alpine Linux base images for smaller attack surface
- Health checks included
- Proper nginx configuration with security headers
- Static asset caching with appropriate headers

## Troubleshooting

### Build Issues
- Ensure `dist/` folder exists when using main Dockerfile
- Use multi-stage build if you need to build from source
- Check Docker build context excludes node_modules

### Runtime Issues
- Check port conflicts (4200, 8080)
- Verify backend service is running when using docker-compose
- Check nginx logs: `docker logs <container_name>`

### API Connection Issues
- In standalone mode, API calls will return 404 (expected)
- In compose mode, ensure backend service name resolution works
- Check network connectivity between containers

## Production Deployment

For production deployment:

1. Use the multi-stage Dockerfile for consistent builds
2. Set up proper environment variables
3. Configure backend service URLs
4. Use docker-compose for orchestration
5. Consider using Docker Swarm or Kubernetes for scaling