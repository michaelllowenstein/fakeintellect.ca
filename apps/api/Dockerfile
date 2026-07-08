# ── Build stage ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root manifests
COPY package*.json ./
COPY packages/shared-types/package.json ./packages/shared-types/

# Copy API manifests
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspace=packages/shared-types --workspace=apps/api

# Build shared types first
COPY packages/shared-types/ ./packages/shared-types/
RUN npm run build --workspace=packages/shared-types

# Build API
COPY apps/api/ ./apps/api/
RUN npm run build --workspace=apps/api

# ── Production stage ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist     ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
# Copy schema.sql for migrate command
COPY --from=builder /app/apps/api/src/db/schema.sql ./dist/db/schema.sql

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
