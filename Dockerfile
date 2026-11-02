# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=cloud-ca,required=false \
    if [ -f /run/secrets/cloud-ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/cloud-ca; fi; npm ci
COPY . .
RUN npm run build
RUN node_modules/.bin/esbuild src/worker.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/worker.mjs

FROM node:24-bookworm-slim AS web
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 APP_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/assets ./assets
USER node
EXPOSE 3000
CMD ["node","server.js"]

FROM build AS worker-build
RUN npm prune --omit=dev
FROM node:24-bookworm-slim AS worker
ENV NODE_ENV=production APP_ENV=production WORKER_PORT=3001
WORKDIR /app
COPY --from=worker-build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/assets ./assets
USER node
EXPOSE 3001
CMD ["node","dist/worker.mjs"]

# One-off migration image: tooling is isolated from web/worker runtime images.
FROM build AS operations
ENV NODE_ENV=production
USER node
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]
