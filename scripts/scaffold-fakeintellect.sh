#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# scaffold-fakeintellect.sh
# Full project bootstrap for fakeintellect.ca
#
# Usage:
#   chmod +x scaffold-fakeintellect.sh
#   ./scaffold-fakeintellect.sh [--target ~/projects/fakeintellect]
#
# What it does:
#   1. Verifies prerequisites (node, npm, docker)
#   2. Copies this repo's files to target directory
#   3. Installs all npm dependencies
#   4. Spins up Docker services (postgres, redis)
#   5. Runs DB migrations + seed
#   6. Prints dev startup instructions
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colours ────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}▸${RESET} $*"; }
ok()   { echo -e "${GREEN}✓${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET}  $*"; }
fail() { echo -e "${RED}✗${RESET} $*"; exit 1; }
header() {
  echo ""
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${RESET}"
  echo -e "${BOLD}${CYAN}  $*${RESET}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${RESET}"
}

# ── Parse args ─────────────────────────────────────────────────────────────
TARGET="${HOME}/projects/fakeintellect"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET="$2"; shift 2 ;;
    *) fail "Unknown arg: $1" ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Banner ─────────────────────────────────────────────────────────────────
header "FakeIntellect — Project Scaffold"
echo ""
echo -e "  ${BOLD}Target:${RESET} ${TARGET}"
echo -e "  ${BOLD}Stack:${RESET}  Angular 20 · React Islands · Fastify · PostgreSQL · Firebase"
echo ""

# ── Prerequisites ──────────────────────────────────────────────────────────
header "1. Checking prerequisites"

check_cmd() {
  local cmd="$1"; local min_ver="$2"; local label="${3:-$cmd}"
  if command -v "$cmd" &>/dev/null; then
    local ver; ver=$("$cmd" --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
    ok "${label} found (${ver})"
  else
    fail "${label} not found — please install ${label} ${min_ver}+"
  fi
}

check_cmd node  "20"  "Node.js"
check_cmd npm   "10"  "npm"
check_cmd docker "24" "Docker"
check_cmd git   "2"   "git"

NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  fail "Node.js 20+ required (found ${NODE_MAJOR})"
fi

# ── Verify WSL2 path safety ────────────────────────────────────────────────
if [[ "$TARGET" == /mnt/c/* || "$TARGET" == /mnt/d/* ]]; then
  warn "⚠  Target is on a Windows-mounted drive (/mnt/c or /mnt/d)."
  warn "   npm and Angular CLI are extremely slow on WSL2 cross-filesystem paths."
  warn "   Strongly recommended: use ~/projects/ on the native WSL2 filesystem."
  read -rp "   Continue anyway? [y/N] " choice
  [[ "$choice" == "y" || "$choice" == "Y" ]] || fail "Aborted."
fi

# ── Create target directory ────────────────────────────────────────────────
header "2. Setting up target directory"
mkdir -p "$TARGET"
ok "Directory ready: ${TARGET}"

# ── Copy project files ─────────────────────────────────────────────────────
header "3. Copying project files"
rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' \
  "${SCRIPT_DIR}/" "${TARGET}/"
ok "Files copied"

cd "$TARGET"

# ── Install dependencies ───────────────────────────────────────────────────
header "4. Installing npm dependencies"
log "Installing workspace root + all packages (this may take 2–3 minutes)..."
npm install
ok "Dependencies installed"

# ── Build shared types ─────────────────────────────────────────────────────
header "5. Building shared types"
npm run build --workspace=packages/shared-types
ok "Shared types built"

# ── Environment files ──────────────────────────────────────────────────────
header "6. Setting up environment files"

if [[ ! -f "apps/api/.env" ]]; then
  cp apps/api/.env.example apps/api/.env
  ok "Created apps/api/.env (from example)"
  warn "Edit apps/api/.env to add your Firebase credentials"
else
  ok "apps/api/.env already exists — skipping"
fi

# ── Docker services ────────────────────────────────────────────────────────
header "7. Starting Docker services (postgres + redis)"
docker compose -f docker/docker-compose.yml up -d postgres redis

log "Waiting for PostgreSQL to be healthy..."
MAX_RETRIES=30; RETRY=0
until docker compose -f docker/docker-compose.yml exec -T postgres \
    pg_isready -U fakeintellect -d fakeintellect &>/dev/null; do
  RETRY=$((RETRY+1))
  [[ "$RETRY" -ge "$MAX_RETRIES" ]] && fail "PostgreSQL never became ready"
  sleep 2
done
ok "PostgreSQL is ready"

# ── Run migrations ─────────────────────────────────────────────────────────
header "8. Running database migrations"
npm run migrate --workspace=apps/api
ok "Migrations complete"

# ── Seed database ──────────────────────────────────────────────────────────
header "9. Seeding database with sample content"
npm run seed --workspace=apps/api
ok "Database seeded"

# ── Done ───────────────────────────────────────────────────────────────────
header "✅  Scaffold complete!"
echo ""
echo -e "  ${BOLD}Next steps:${RESET}"
echo ""
echo -e "  1. Edit Firebase credentials in ${CYAN}apps/api/.env${RESET}"
echo -e "     and ${CYAN}apps/web/src/environments/environment.ts${RESET}"
echo ""
echo -e "  2. Start development servers:"
echo -e "     ${CYAN}cd ${TARGET}${RESET}"
echo -e "     ${CYAN}npm run dev${RESET}    # starts API (port 3000) + Angular (port 4200)"
echo ""
echo -e "  3. Open in browser:"
echo -e "     ${CYAN}http://localhost:4200${RESET}    — Angular frontend"
echo -e "     ${CYAN}http://localhost:3000/health${RESET}  — API health check"
echo ""
echo -e "  4. Admin login:"
echo -e "     Email:    ${CYAN}ghost@fakeintellect.ca${RESET}"
echo -e "     Password: ${CYAN}fakeintellect2024!${RESET}"
echo ""
echo -e "  ${BOLD}Useful commands:${RESET}"
echo -e "    ${CYAN}npm run docker:logs${RESET}   — tail all container logs"
echo -e "    ${CYAN}npm run docker:down${RESET}   — stop all Docker services"
echo -e "    ${CYAN}npm run migrate${RESET}       — re-run migrations"
echo -e "    ${CYAN}npm run seed${RESET}          — re-seed sample data"
echo ""
