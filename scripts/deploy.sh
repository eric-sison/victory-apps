#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Build and deploy victory-apps
# Usage: ./deploy.sh [--no-cache] [--build-only] [--skip-build]
# Run from the repo root.
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------
COMPOSE_FILE="docker/docker-compose.yaml"
ENV_FILE="docker/.env"
PROJECT_NAME="victory"

# -----------------------------------------------------------------------------
# Colours
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log()     { echo -e "${BLUE}[deploy]${RESET} $*"; }
success() { echo -e "${GREEN}[deploy]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[deploy]${RESET} $*"; }
error()   { echo -e "${RED}[deploy]${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}${CYAN}==> $*${RESET}"; }

# -----------------------------------------------------------------------------
# Flags
# -----------------------------------------------------------------------------
NO_CACHE=""
BUILD_ONLY=false
SKIP_BUILD=false

for arg in "$@"; do
  case $arg in
    --no-cache)   NO_CACHE="--no-cache" ;;
    --build-only) BUILD_ONLY=true ;;
    --skip-build) SKIP_BUILD=true ;;
    *)
      error "Unknown argument: $arg"
      echo "Usage: $0 [--no-cache] [--build-only] [--skip-build]"
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# Preflight checks
# -----------------------------------------------------------------------------
header "Preflight checks"

# Must be run from repo root
if [[ ! -f "$COMPOSE_FILE" ]]; then
  error "Run this script from the repo root (docker/docker-compose.yaml not found)."
  exit 1
fi

# Docker running?
if ! docker info &>/dev/null; then
  error "Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

# .env present?
if [[ ! -f "$ENV_FILE" ]]; then
  error "$ENV_FILE not found. Copy docker/.env.example to docker/.env and fill in the values."
  exit 1
fi

success "All preflight checks passed."

# Compose shorthand (always targets our file + project name)
compose() {
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" "$@"
}

# -----------------------------------------------------------------------------
# Step 1 — Build images
# -----------------------------------------------------------------------------
if [[ "$SKIP_BUILD" == false ]]; then
  header "Step 1/4 — Building images"
  log "Building api, web, migrator... (this may take a few minutes)"

  DOCKER_BUILDKIT=1 compose build $NO_CACHE api web migrator

  success "Images built successfully."
else
  warn "Skipping build (--skip-build passed)."
fi

if [[ "$BUILD_ONLY" == true ]]; then
  success "Build complete. Exiting (--build-only passed)."
  exit 0
fi

# -----------------------------------------------------------------------------
# Step 2 — Start infrastructure (postgres + pgadmin)
# -----------------------------------------------------------------------------
header "Step 2/4 — Starting infrastructure"
log "Starting postgres and pgadmin..."

compose up -d postgres pgadmin

# Wait for postgres to be healthy
log "Waiting for postgres to be ready..."
RETRIES=30
until compose exec -T postgres pg_isready -U "${POSTGRES_USER:-appuser}" &>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -eq 0 ]]; then
    error "Postgres did not become healthy in time."
    compose logs postgres
    exit 1
  fi
  sleep 2
done

success "Postgres is ready."

# -----------------------------------------------------------------------------
# Step 3 — Run migrator (db:migrate + seed:admin)
# -----------------------------------------------------------------------------
header "Step 3/4 — Running migrator"
log "Running database migrations and seeding admin account..."

# Remove any previous migrator container so it runs fresh
compose rm -f migrator 2>/dev/null || true

# Run migrator and tail its logs until it exits
compose run --rm \
  --no-deps \
  migrator

EXIT_CODE=$?
if [[ $EXIT_CODE -ne 0 ]]; then
  error "Migrator failed with exit code $EXIT_CODE."
  error "Check logs above for details."
  exit $EXIT_CODE
fi

success "Migrations and seeding completed."

# -----------------------------------------------------------------------------
# Step 4 — Start API and Web
# -----------------------------------------------------------------------------
header "Step 4/4 — Starting API and Web"
log "Starting api and web services..."

compose up -d api web

# Wait for API health check using docker inspect (no wget/jq/sh needed — works with distroless)
log "Waiting for API to be healthy..."
RETRIES=20
until [[ "$(docker inspect --format='{{.State.Health.Status}}' victory-api 2>/dev/null)" == "healthy" ]]; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -eq 0 ]]; then
    warn "API health check timed out — it may still be starting up."
    break
  fi
  sleep 3
done

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
header "Deployment complete"

echo ""
echo -e "  ${GREEN}✓${RESET} Web app   → http://localhost:3000"
echo -e "  ${GREEN}✓${RESET} API       → http://localhost:3001"
echo -e "  ${GREEN}✓${RESET} API docs  → http://localhost:3001/api/docs"
echo -e "  ${GREEN}✓${RESET} pgAdmin   → http://localhost:5050"
echo ""

log "To tail all logs:       docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
log "To tail a service:      docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f api"
log "To stop everything:     docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down"
log "To rebuild from scratch: $0 --no-cache"

# -----------------------------------------------------------------------------
# Cleanup — Remove migrator image
# -----------------------------------------------------------------------------
header "Cleanup"

if docker image ls --format '{{.Repository}}' | grep -q "^victory-migrator$"; then
  log "Removing migrator image (no longer needed)..."
  docker image rm -f victory-migrator
  success "Migrator image removed."
else
  warn "Migrator image not found, skipping."
fi