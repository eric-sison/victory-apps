# =============================================================================
# victory-apps — Production Dockerfile
# pnpm + Turborepo monorepo (Node >=22, pnpm 11.3.0)
# =============================================================================

# -----------------------------------------------------------------------------
# BASE — build tooling (Debian slim / glibc)
# -----------------------------------------------------------------------------
FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN corepack enable && corepack prepare pnpm@11.3.0 --activate
RUN pnpm add -g turbo@2

WORKDIR /app

# -----------------------------------------------------------------------------
# PRUNER
# -----------------------------------------------------------------------------

FROM base AS pruner-api
COPY . .
RUN turbo prune api --docker

FROM base AS pruner-admin
COPY . .
RUN turbo prune admin --docker

FROM base AS pruner-migrator
COPY . .
RUN turbo prune @workspace/auth --docker

# -----------------------------------------------------------------------------
# INSTALLER
# -----------------------------------------------------------------------------

FROM base AS installer-api
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

FROM base AS installer-admin
COPY --from=pruner-admin /app/out/json/ .
# Hoist only lightningcss (and its platform-specific binary) to the root node_modules/
# so that @tailwindcss/vite can resolve the native addon via standard Node.js module
# resolution. Using public-hoist-pattern keeps pnpm's default isolated linker for all
# other packages — including vite — which correctly exposes per-package binaries via
# pnpm's own PATH extension when running workspace scripts.
# --no-lockfile forces fresh platform binary resolution (lockfile was generated on macOS).
RUN echo 'public-hoist-pattern[]=lightningcss' >> .npmrc \
  && echo 'public-hoist-pattern[]=lightningcss-*' >> .npmrc \
  && pnpm install --no-lockfile

FROM base AS installer-migrator
COPY --from=pruner-migrator /app/out/json/ .
COPY --from=pruner-migrator /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# -----------------------------------------------------------------------------
# BUILDER
# -----------------------------------------------------------------------------

FROM base AS builder-api
ARG NODE_ENV=production
WORKDIR /app
COPY --from=installer-api /app .
COPY --from=pruner-api /app/out/full/ .
COPY --from=pruner-api /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm turbo build --filter=api

FROM base AS builder-admin
# VITE_API_URL is a client-side env var baked into the bundle at build time.
# BETTER_AUTH_URL / BETTER_AUTH_SECRET / DATABASE_URL are server-side runtime
# vars and must NOT be baked in — pass them via docker-compose environment: instead.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN test -n "$VITE_API_URL" || { echo "ERROR: VITE_API_URL build arg is empty"; exit 1; }
WORKDIR /app
COPY --from=installer-admin /app .
COPY --from=pruner-admin /app/out/full/ .
# Re-apply the lightningcss hoist pattern in case COPY from pruner overwrote .npmrc.
RUN echo 'public-hoist-pattern[]=lightningcss' >> .npmrc \
  && echo 'public-hoist-pattern[]=lightningcss-*' >> .npmrc
RUN pnpm turbo build --filter=admin

# -----------------------------------------------------------------------------
# DEPLOYER
# -----------------------------------------------------------------------------

FROM base AS deployer-api
WORKDIR /app
COPY --from=builder-api /app .
# Strip supportedArchitectures so only the current platform's native binaries
# are bundled (not darwin + linux + arm64 + x64 variants of everything).
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('./package.json','utf8'));if(p.pnpm)delete p.pnpm.supportedArchitectures;fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
RUN pnpm deploy --filter=api --prod --legacy /deploy/api
# Remove packages that leaked in as resolved peer deps of better-auth.
# better-auth lists next/react/@tanstack/react-start as peer deps; pnpm
# resolves them from the monorepo even though the Hono API never uses them.
RUN cd /deploy/api && rm -rf \
  node_modules/.pnpm/next@* \
  node_modules/.pnpm/@next+* \
  node_modules/.pnpm/react@* \
  node_modules/.pnpm/react-dom@* \
  node_modules/.pnpm/@tanstack+react-start* \
  node_modules/.pnpm/msw@* \
  node_modules/.pnpm/jsdom@* \
  node_modules/.pnpm/caniuse-lite@* \
  node_modules/.pnpm/@rolldown+* \
  node_modules/.pnpm/@img+sharp* \
  node_modules/next \
  node_modules/react \
  node_modules/react-dom \
  node_modules/msw \
  node_modules/jsdom

FROM base AS deployer-migrator
WORKDIR /app
COPY --from=installer-migrator /app .
COPY --from=pruner-migrator /app/out/full/ .
COPY --from=pruner-migrator /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('./package.json','utf8'));if(p.pnpm)delete p.pnpm.supportedArchitectures;fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
# No --prod: drizzle-kit + tsx are devDeps but needed to run migrations/seeds
RUN pnpm deploy --filter=@workspace/auth --legacy /deploy/auth
# pnpm deploy --legacy does not rewrite workspace: protocol refs. Strip any
# remaining workspace: entries (e.g. @workspace/typescript-config) — they are
# compile-time-only packages with no runtime value and cannot be resolved
# inside a container that has no monorepo workspace.
RUN node -e "   const fs=require('fs');   const pkg=JSON.parse(fs.readFileSync('/deploy/auth/package.json','utf8'));   for(const s of['dependencies','devDependencies','peerDependencies','optionalDependencies']){     if(!pkg[s])continue;     for(const[k,v]of Object.entries(pkg[s])){if(v.startsWith('workspace:'))delete pkg[s][k];}   }   fs.writeFileSync('/deploy/auth/package.json',JSON.stringify(pkg,null,2)); "
RUN cd /deploy/auth && rm -rf \
  node_modules/.pnpm/next@* \
  node_modules/.pnpm/@next+* \
  node_modules/.pnpm/react@* \
  node_modules/.pnpm/react-dom@* \
  node_modules/.pnpm/@tanstack+react-start* \
  node_modules/.pnpm/msw@* \
  node_modules/.pnpm/jsdom@* \
  node_modules/.pnpm/caniuse-lite@* \
  node_modules/next \
  node_modules/react \
  node_modules/react-dom \
  node_modules/msw \
  node_modules/jsdom

# -----------------------------------------------------------------------------
# RUNNERS
# -----------------------------------------------------------------------------

### API — distroless + cleaned deploy output
FROM gcr.io/distroless/nodejs22-debian12 AS api

WORKDIR /app

# dist/ from builder-api (pnpm deploy respects .gitignore which excludes dist/)
# node_modules from deployer-api (prod-only, peer dep leak cleaned up)
COPY --from=builder-api  /app/apps/api/dist       ./dist
COPY --from=deployer-api /deploy/api/node_modules ./node_modules

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["dist/src/index.js"]

### Admin — distroless + Nitro self-contained server bundle
# TanStack Start (via Nitro) outputs to .output/ by default.
# The server entry point is .output/server/index.mjs.
FROM gcr.io/distroless/nodejs22-debian12 AS admin

WORKDIR /app

COPY --from=builder-admin /app/apps/admin/.output ./output

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["output/server/index.mjs"]

### Migrator — slim node (needs shell to run drizzle-kit + tsx directly)
FROM node:22-slim AS migrator

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs migrator

WORKDIR /app
# WORKDIR creates /app owned by root; give the migrator user write access
# so drizzle-kit can write migration state files at runtime.
RUN chown migrator:nodejs /app

COPY --from=deployer-migrator --chown=migrator:nodejs /deploy/auth .

USER migrator

# Call binaries directly instead of via `pnpm run` to bypass pnpm 11's
# verify-deps-before-run pre-script hook, which tries to rerun `pnpm install`
# and fails because there is no registry access inside the container.
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit migrate && node_modules/.bin/tsx src/seed-admin.ts"]