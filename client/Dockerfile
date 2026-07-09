# ── Build stage ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/web/package.json              ./apps/web/

RUN npm ci --workspace=packages/shared-types --workspace=apps/web

COPY packages/shared-types/ ./packages/shared-types/
RUN npm run build --workspace=packages/shared-types

COPY apps/web/ ./apps/web/
RUN npm run build --workspace=apps/web

# ── Production: nginx ─────────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Inject SPA-aware nginx config
COPY apps/web/nginx-spa.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/web/dist/web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
