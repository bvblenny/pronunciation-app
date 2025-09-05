# Multi-stage build for Angular app

# Stage 1: Use locally built dist folder
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.standalone.conf /etc/nginx/conf.d/default.conf

# Copy the pre-built application 
COPY dist/pronunciation-app/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]