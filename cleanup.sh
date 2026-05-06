#!/usr/bin/env bash
# =============================================================================
# undeploy.sh — Stop and remove all victory-apps Docker resources
# Usage: ./undeploy.sh [--volumes] [--images] [--all]
#
#   --volumes   Also remove named volumes  (postgres_data, pgadmin_data)
#   --images    Also remove built images   (api, web, migrator)
#   --all       Equivalent to --volumes --images
#
# Run from the repo root.
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Config  (must match deploy.sh)
# -----------------------------------------------------------------------------
COMPOSE_FILE="docker/docker-compose.yaml"
PROJECT_NAME="victory"

# Image names produced by `compose build`
IMAGES=(
  "victory-api"
  "victory-web"
  "victory-migrator"
)

# Named volumes defined in docker-compose.yaml
VOLUMES=(
  "${PROJECT_NAME}_postgres_data"
  "${PROJECT_NAME}_pgadmin_data"
)

# Networks created by Compose
NETWORKS=(
  "${PROJECT_NAME}_internal"
  "${PROJECT_NAME}_public"
)

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

log()     { echo -e "${BLUE}[undeploy]${RESET} $*"; }
success() { echo -e "${GREEN}[undeploy]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[undeploy]${RESET} $*"; }
error()   { echo -e "${RED}[undeploy]${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}${CYAN}==> $*${RESET}"; }

# -----------------------------------------------------------------------------
# Flags
# -----------------------------------------------------------------------------
REMOVE_VOLUMES=false
REMOVE_IMAGES=false

for arg in "$@"; do
  case $arg in
    --volumes) REMOVE_VOLUMES=true ;;
    --images)  REMOVE_IMAGES=true ;;
    --all)     REMOVE_VOLUMES=true; REMOVE_IMAGES=true ;;
    *)
      error "Unknown argument: $arg"
      echo "Usage: $0 [--volumes] [--images] [--all]"
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# Preflight checks
# -----------------------------------------------------------------------------
header "Preflight checks"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  error "Run this script from the repo root (docker/docker-compose.yaml not found)."
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

success "All preflight checks passed."

# Compose shorthand
compose() {
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" "$@"
}

# -----------------------------------------------------------------------------
# Step 1 — Stop & remove containers + default networks
# -----------------------------------------------------------------------------
header "Step 1/3 — Stopping containers"

RUNNING=$(compose ps -qa 2>/dev/null)

if [[ -n "$RUNNING" ]]; then
  log "Bringing down all containers (including exited)..."
  compose down --remove-orphans
  success "Containers stopped and removed."
else
  log "No containers found for project '${PROJECT_NAME}'. Ensuring clean state..."
  compose down --remove-orphans 2>/dev/null || true
  success "Done."
fi

log "Pruning stopped containers..."
docker container prune -f
success "Stopped containers pruned."

log "Pruning unused networks..."
docker network prune -f
success "Unused networks pruned."

# -----------------------------------------------------------------------------
# Step 2 — Remove named volumes  (opt-in: --volumes / --all)
# -----------------------------------------------------------------------------
header "Step 2/3 — Volumes"

if [[ "$REMOVE_VOLUMES" == true ]]; then
  for vol in "${VOLUMES[@]}"; do
    if docker volume ls -q | grep -q "^${vol}$"; then
      log "Removing volume: ${vol}"
      docker volume rm "$vol"
      success "Removed volume: ${vol}"
    else
      warn "Volume not found, skipping: ${vol}"
    fi
  done
else
  warn "Skipping volume removal (pass --volumes or --all to remove)."
fi

# -----------------------------------------------------------------------------
# Step 3 — Remove built images  (opt-in: --images / --all)
# -----------------------------------------------------------------------------
header "Step 3/3 — Images"

if [[ "$REMOVE_IMAGES" == true ]]; then
  for img in "${IMAGES[@]}"; do
    if docker image ls --format '{{.Repository}}' | grep -q "^${img}$"; then
      log "Removing image: ${img}"
      docker image rm "$img"
      success "Removed image: ${img}"
    else
      warn "Image not found, skipping: ${img}"
    fi
  done
else
  warn "Skipping image removal (pass --images or --all to remove)."
fi

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
header "Undeploy complete"

echo ""
if [[ "$REMOVE_VOLUMES" == true ]]; then
  echo -e "  ${GREEN}✓${RESET} Volumes removed  (data is gone)"
else
  echo -e "  ${YELLOW}–${RESET} Volumes kept     (re-run with --volumes to delete data)"
fi

if [[ "$REMOVE_IMAGES" == true ]]; then
  echo -e "  ${GREEN}✓${RESET} Images removed   (next deploy will rebuild from scratch)"
else
  echo -e "  ${YELLOW}–${RESET} Images kept      (re-run with --images to free disk space)"
fi
echo ""

log "To redeploy:            ./deploy.sh"
log "To nuke everything:     $0 --all"