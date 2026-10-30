# syntax=docker/dockerfile:1
#
# Image de production en 4 étapes :
#   deps     → installe les dépendances (mise en cache tant que le lockfile ne change pas)
#   builder  → compile Next.js en mode "standalone"
#   migrate  → image outillée pour `prisma migrate deploy`, le seed et make-admin
#   runner   → image finale minimale, lancée sans droits root
#
# Les variables NEXT_PUBLIC_* et celles de la CSP (S3_*) sont figées au BUILD :
# elles doivent être passées en --build-arg (voir docker-compose.prod.yml et deploy.yml).

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# DATABASE_URL factice : `prisma generate` (postinstall) ne se connecte pas à la base.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    HUSKY=0
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- builder ----------
FROM base AS builder
ARG NEXT_PUBLIC_APP_URL
ARG S3_ENDPOINT
ARG S3_PUBLIC_ORIGIN
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    S3_ENDPOINT=${S3_ENDPOINT} \
    S3_PUBLIC_ORIGIN=${S3_PUBLIC_ORIGIN} \
    DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    SKIP_ENV_VALIDATION=1 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .
RUN pnpm build

# ---------- migrate ----------
FROM base AS migrate
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY package.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY scripts ./scripts
CMD ["pnpm", "db:deploy"]

# ---------- runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
