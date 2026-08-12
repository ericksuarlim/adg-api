# Multi-stage Dockerfile for adg-api.
#
# AWS ECS Fargate (default final stage = production):
#   docker build -t adg-api .
#   docker build --target production -t adg-api .
#
# Local docker-compose.yml is unchanged: it bind-mounts the source, overrides
# the command with `npm run dev:debug`, and uses a named volume for node_modules.
# On a fresh node_modules volume, run once: docker compose run --rm api npm ci
# Or build the development stage: docker build --target development -t adg-api .

# -----------------------------------------------------------------------------
# Base: current Node.js Active LTS (Alpine)
# -----------------------------------------------------------------------------
FROM node:24-alpine AS base

WORKDIR /app

# -----------------------------------------------------------------------------
# Dependencies: install all deps (incl. TypeScript) and native build toolchain
# (sqlite3 and similar packages need compilers on Alpine)
# -----------------------------------------------------------------------------
FROM base AS dependencies

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

RUN npm ci

# -----------------------------------------------------------------------------
# Build: compile TypeScript (`npm run build` → tsc → dist/)
# -----------------------------------------------------------------------------
FROM dependencies AS build

COPY . .

RUN npm run build

# -----------------------------------------------------------------------------
# Development: full dependencies for local Compose (ts-node-dev, etc.)
# Not the default image; use --target development when needed.
# -----------------------------------------------------------------------------
FROM base AS development

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3010

CMD ["npm", "run", "dev"]

# -----------------------------------------------------------------------------
# Production: runtime image for ECS Fargate (default stage)
# Contains package metadata, production node_modules, and compiled dist/
# -----------------------------------------------------------------------------
FROM base AS production

COPY package.json package-lock.json ./

# Reuse compiled native modules from the dependencies stage, then drop devDeps
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3010

CMD ["npm", "start"]
