# syntax=docker/dockerfile:1

# ---------- deps: install dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --fetch-timeout=600000 --fetch-retries=5 --fetch-retry-maxtimeout=120000

# ---------- prod-deps: production-only node_modules for the Prisma CLI at runtime ----------
# Next's output tracing (.next/standalone) only captures what the server needs to
# handle requests (@prisma/client), not the `prisma` CLI used by `migrate deploy`
# below. The CLI's dependency tree (@prisma/config -> effect, c12, ...) is deep and
# shifts across Prisma releases, so install it properly here instead of hand-picking
# folders.
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --fetch-timeout=600000 --fetch-retries=5 --fetch-retry-maxtimeout=120000

# ---------- builder: generate prisma client + build the app ----------
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Only needed so `prisma generate` doesn't warn about a missing value —
# no DB connection is made at build time.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

# ---------- runner: minimal production image ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output — a pruned server + only the node_modules it traced.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Full production node_modules (Prisma CLI + its transitive deps) for `migrate
# deploy` at startup, then overlay the generated client/engine from the builder
# (only `prisma generate` ran at build time, against a dummy DATABASE_URL).
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/prisma ./src/prisma

USER nextjs
EXPOSE 3000

# Apply any pending migrations before starting — safe to run on every boot,
# it only applies migrations that haven't run yet and never touches data.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy --schema=src/prisma/schema.prisma && node server.js"]
