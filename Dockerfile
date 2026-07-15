# syntax=docker/dockerfile:1

# ---------- deps: install dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --fetch-timeout=600000 --fetch-retries=5 --fetch-retry-maxtimeout=120000

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

# Prisma's query engine binary is sometimes missed by Next's output tracing —
# copy it explicitly so the standalone server can reach the database.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/src/prisma/schema.prisma ./src/prisma/schema.prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
