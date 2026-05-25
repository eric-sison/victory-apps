#!/usr/bin/env bash
# =============================================================================
# undeploy.sh — Stop and remove all victory-apps Docker resources
# Usage: ./undeploy.sh [--volumes] [--images] [--all]
#
#   --volumes   Also remove named volumes  (postgres_data, pgadmin_data)
#   --images    Also remove built images   (api, admin)
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
  "victory-admin"
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

# -----------------------------------------------------------------------------
# Stop and remove containers + networks
# -----------------------------------------------------------------------------
header "Stopping containers"

docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down --remove-orphans
success "Containers and networks removed."

# -----------------------------------------------------------------------------
# Volumes (optional)
# -----------------------------------------------------------------------------
if [[ "$REMOVE_VOLUMES" == true ]]; then
  header "Removing volumes"
  for vol in "${VOLUMES[@]}"; do
    if docker volume inspect "$vol" &>/dev/null; then
      docker volume rm "$vol"
      success "Removed volume: $vol"
    else
      warn "Volume not found, skipping: $vol"
    fi
  done
fi

# -----------------------------------------------------------------------------
# Images (optional)
# -----------------------------------------------------------------------------
if [[ "$REMOVE_IMAGES" == true ]]; then
  header "Removing images"
  for img in "${IMAGES[@]}"; do
    if docker image inspect "$img" &>/dev/null; then
      docker image rm -f "$img"
      success "Removed image: $img"
    else
      warn "Image not found, skipping: $img"
    fi
  done
fi

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
header "Done"
success "All requested resources have been removed."