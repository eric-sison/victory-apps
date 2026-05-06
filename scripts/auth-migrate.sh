#!/usr/bin/env bash
# =============================================================================
# migrate.sh — Start the database, run migrations, and seed the admin user
# Usage: ./migrate.sh
# Run from the repo root.
# =============================================================================

set -euo pipefail

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

log()     { echo -e "${BLUE}[migrate]${RESET} $*"; }
success() { echo -e "${GREEN}[migrate]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[migrate]${RESET} $*"; }
error()   { echo -e "${RED}[migrate]${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}${CYAN}==> $*${RESET}"; }

# -----------------------------------------------------------------------------
# Preflight checks
# -----------------------------------------------------------------------------
header "Preflight checks"

if [[ ! -f ".env" ]]; then
  error ".env not found. Copy .env.example to .env and fill in the values."
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker is not running. Start Docker and try again."
  exit 1
fi

success "All preflight checks passed."

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
header "Starting database"

if docker compose ps --services --filter status=running 2>/dev/null | grep -q "^postgres$"; then
  success "Postgres is already running."
else
  log "Postgres is not running. Starting..."
  docker compose up -d

  log "Waiting for postgres to be ready..."
  RETRIES=30
  until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-appuser}" &>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [[ $RETRIES -eq 0 ]]; then
      error "Postgres did not become healthy in time."
      docker compose logs postgres
      exit 1
    fi
    sleep 2
  done

  success "Postgres is ready."
fi

# -----------------------------------------------------------------------------
# Migrations
# -----------------------------------------------------------------------------
header "Running migrations"

log "Applying pending migrations..."
pnpm --filter @workspace/auth db:migrate
success "Migrations complete."

# -----------------------------------------------------------------------------
# Seed
# -----------------------------------------------------------------------------
header "Seeding admin user"

log "Creating default admin user..."
pnpm --filter @workspace/auth seed:admin
success "Admin user seeded."

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
log "Done. You can now start the app with: pnpm dev"