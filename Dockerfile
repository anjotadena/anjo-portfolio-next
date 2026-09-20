# syntax=docker/dockerfile:1.7
# Multi-stage production image for the Anjo AI portfolio.
#   deps    -> install exact dependencies from the lockfile
#   build   -> validate content + next build (standalone output)
#   runtime -> minimal Node image, non-root user, no dev deps, no secrets
#
# Secrets (OPENAI_API_KEY, DATABASE_URL) are supplied at runtime via the
# environment; nothing is baked into the image. `.env*` files are excluded
# by .dockerignore.

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 DOCKER_BUILD=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p data
# NEXT_PUBLIC_SITE_URL is inlined into client bundles at build time.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run content:validate && npx next build

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# Standalone output contains only the files needed to run the server.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# Markdown content is read at runtime by the knowledge repository.
COPY --from=build --chown=nextjs:nodejs /app/content ./content
# Committed vector index (data/knowledge-index.json) when present.
COPY --from=build --chown=nextjs:nodejs /app/data ./data
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
