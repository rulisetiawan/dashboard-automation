# Multi-stage build for PT SMM Digital Automation Dashboard

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig*.json ./
RUN npm ci

# Copy source code and build assets
COPY server ./server
COPY build.mjs ./
COPY index.html styles.css app.js backend-worker.js ai-assistant.css ai-assistant.js ./
COPY assets ./assets

# Build backend and frontend artifacts
RUN npm run build:backend && npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

# Copy dependency manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled backend and frontend bundles
COPY --from=builder /app/dist-backend ./dist-backend
COPY --from=builder /app/dist ./dist

# Copy static assets, migration scripts, and maintenance scripts
COPY index.html styles.css app.js backend-worker.js ai-assistant.css ai-assistant.js VERSION ./
COPY assets ./assets
COPY postgres ./postgres
COPY scripts ./scripts

# Expose HTTP / WebSocket port
EXPOSE 8787

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8787/ || exit 1

# Start the NestJS + PostgreSQL application
CMD ["node", "dist-backend/server/nest/main.js"]
