# Production Dockerfile for Collaborative Coding Interview Platform
# Multi-stage build for optimized production images

# Stage 1: Build client
FROM node:20-bullseye-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Build server (no build step needed, but prepare deps)
FROM node:20-bullseye-slim AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ .

# Stage 3: Production server image
FROM node:20-bullseye-slim AS production
WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy server files and dependencies
COPY --from=server-builder /app/server /app/server

# Copy built client files to be served by the server
COPY --from=client-builder /app/client/dist /app/client/dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Run the server
WORKDIR /app/server
CMD ["node", "src/index.js"]
