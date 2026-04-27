#!/usr/bin/env bash
# =============================================================================
# run.sh — DesignATradingJournal project runner
#
# Usage:
#   ./run.sh <command>
#
# Commands:
#   docker    Start the app + PostgreSQL with Docker Compose (recommended)
#   local     Run the dev server locally (requires local PostgreSQL)
#   install   Install Python dependencies (pip install -e ".[dev]")
#   migrate   Run Alembic database migrations (upgrade head)
#   test      Run the pytest test suite
#   lint      Run the ruff linter
#   format    Auto-format code with ruff
#   stop      Stop and remove Docker containers
#   help      Show this help message
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}${BOLD}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}${BOLD}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}${BOLD}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}${BOLD}[ERROR]${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }

# ── Banner ───────────────────────────────────────────────────────────────────
banner() {
  echo -e "${CYAN}${BOLD}"
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║   DesignATradingJournal  run.sh      ║"
  echo "  ╚══════════════════════════════════════╝"
  echo -e "${RESET}"
}

# ── Prereq checks ─────────────────────────────────────────────────────────────
require_cmd() {
  command -v "$1" &>/dev/null || die "'$1' is not installed. $2"
}

# ── .env loading ─────────────────────────────────────────────────────────────
load_env() {
  if [[ -f ".env" ]]; then
    info "Loading environment from .env"
    set -o allexport
    # shellcheck source=/dev/null
    source .env
    set +o allexport
  else
    warn ".env file not found. Copy .env.example → .env and fill in your values."
  fi
}

# ── Commands ──────────────────────────────────────────────────────────────────

cmd_docker() {
  require_cmd docker  "Install Docker from https://docs.docker.com/get-docker/"
  require_cmd docker  "Docker Compose is bundled with Docker Desktop."

  info "Building and starting app + PostgreSQL with Docker Compose..."
  docker compose up --build "$@"
}

cmd_stop() {
  require_cmd docker "Install Docker from https://docs.docker.com/get-docker/"

  info "Stopping Docker containers..."
  docker compose down
  success "Containers stopped."
}

cmd_install() {
  require_cmd python3 "Install Python 3.10+ from https://www.python.org/"
  require_cmd pip    "pip should come with your Python install."

  info "Installing Python dependencies (including dev extras)..."
  pip install -e ".[dev]"
  success "Dependencies installed."
}

cmd_migrate() {
  require_cmd alembic "Run './run.sh install' first to install dependencies."

  load_env
  info "Running Alembic migrations (upgrade head)..."
  alembic upgrade head
  success "Migrations applied."
}

cmd_local() {
  require_cmd uvicorn "Run './run.sh install' first to install dependencies."

  load_env
  info "Starting development server on http://localhost:8000"
  info "Swagger UI available at http://localhost:8000/docs  (DEBUG=true only)"
  info "Press Ctrl+C to stop."
  echo ""
  uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
}

cmd_test() {
  require_cmd pytest "Run './run.sh install' first to install dependencies."

  load_env
  info "Running test suite..."
  pytest -v --cov=src --cov-report=term-missing "$@"
}

cmd_lint() {
  load_env
  if command -v ruff &>/dev/null; then
    info "Running ruff linter..."
    ruff check src tests
  elif command -v flake8 &>/dev/null; then
    info "Running flake8 linter..."
    flake8 src tests
  else
    die "No linter found. Run './run.sh install' to install dev dependencies."
  fi
  success "Lint passed."
}

cmd_format() {
  load_env
  if command -v ruff &>/dev/null; then
    info "Formatting code with ruff..."
    ruff format src tests
  elif command -v black &>/dev/null; then
    info "Formatting code with black..."
    black src tests
    isort src tests
  else
    die "No formatter found. Run './run.sh install' to install dev dependencies."
  fi
  success "Code formatted."
}

cmd_help() {
  echo -e "${BOLD}Usage:${RESET}  ./run.sh <command> [options]"
  echo ""
  echo -e "${BOLD}Commands:${RESET}"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "docker"  "Start app + PostgreSQL with Docker Compose (recommended)"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "local"   "Run dev server locally (needs local PostgreSQL + .env)"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "install" "pip install -e '.[dev]'  — install all dependencies"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "migrate" "Run Alembic migrations: alembic upgrade head"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "test"    "Run pytest test suite with coverage"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "lint"    "Run ruff (or flake8) linter"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "format"  "Auto-format code with ruff (or black + isort)"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "stop"    "docker compose down — stop and remove containers"
  printf "  ${CYAN}%-10s${RESET}  %s\n" "help"    "Show this help message"
  echo ""
  echo -e "${BOLD}Examples:${RESET}"
  echo "  ./run.sh docker           # Full stack via Docker (first time or preferred)"
  echo "  ./run.sh install          # Install deps locally"
  echo "  ./run.sh migrate          # Apply DB migrations locally"
  echo "  ./run.sh local            # Start dev server locally"
  echo "  ./run.sh test             # Run tests"
  echo "  ./run.sh test -k health   # Run only tests matching 'health'"
  echo "  ./run.sh stop             # Stop Docker containers"
  echo ""
}

# ── Entrypoint ────────────────────────────────────────────────────────────────
main() {
  # Must be run from project root
  if [[ ! -f "pyproject.toml" ]]; then
    die "Please run this script from the project root directory (where pyproject.toml lives)."
  fi

  local cmd="${1:-help}"
  shift || true   # remaining args passed through

  banner

  case "$cmd" in
    docker)   cmd_docker  "$@" ;;
    local)    cmd_local   "$@" ;;
    install)  cmd_install "$@" ;;
    migrate)  cmd_migrate "$@" ;;
    test)     cmd_test    "$@" ;;
    lint)     cmd_lint    "$@" ;;
    format)   cmd_format  "$@" ;;
    stop)     cmd_stop    "$@" ;;
    help|--help|-h) cmd_help ;;
    *)
      error "Unknown command: '$cmd'"
      echo ""
      cmd_help
      exit 1
      ;;
  esac
}

main "$@"
