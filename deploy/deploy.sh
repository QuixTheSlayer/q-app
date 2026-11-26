#!/usr/bin/env bash
# deploy.sh - build the landing-page-builder in Kali, upload it, then deploy Laravel on the server.
#
# Run this in KALI (prompt: quix@DESKTOP-...), NOT on the server.
#
# Usage:
#   ./deploy.sh                 build + upload + deploy
#   ./deploy.sh --migrate       same, and run "php artisan migrate --force"
#   ./deploy.sh --skip-build    skip npm install/build (upload the last local build)
#   ./deploy.sh --no-frontend   deploy server code only (no npm, no upload)

set -euo pipefail

# ---------- Settings (edit these) ----------
SERVER_USER="ec2-user"
SERVER_HOST="54.254.223.65"
SSH_KEY="$HOME/.ssh/server.pem"
LOCAL_DIR="$HOME/pj/q-app"
REMOTE_DIR="/var/www/q-app"
FRONTEND_SUBDIR="react-dev/landing-page-builder"   # where "npm run build" runs
BUILD_OUT="public/js/landing-page-builder"         # vite output (ROOT in vite.config.ts)
KEEP_BUILDS=3                                      # same as KEEP in vite.config.ts
# -------------------------------------------

MIGRATE=0
SKIP_BUILD=0
NO_FRONTEND=0
for arg in "$@"; do
  case "$arg" in
    --migrate)     MIGRATE=1 ;;
    --skip-build)  SKIP_BUILD=1 ;;
    --no-frontend) NO_FRONTEND=1 ;;
    -h|--help)
      sed -n '2,10p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

log()  { printf '\n==> %s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)
TARGET="${SERVER_USER}@${SERVER_HOST}"
FRONTEND_DIR="$LOCAL_DIR/$FRONTEND_SUBDIR"
OUT_DIR="$LOCAL_DIR/$BUILD_OUT"

# ---------- Safety checks ----------
if [[ "$(hostname)" == ip-* ]]; then
  fail "This looks like the server. Run deploy.sh from Kali, not on the server."
fi

[[ -f "$SSH_KEY" ]]      || fail "SSH key not found at $SSH_KEY (copy it into Kali and run: chmod 600 $SSH_KEY)"
[[ -d "$LOCAL_DIR" ]]    || fail "Project folder not found: $LOCAL_DIR"
chmod 600 "$SSH_KEY"

if [[ $NO_FRONTEND -eq 0 ]]; then
  [[ -d "$FRONTEND_DIR" ]] || fail "Frontend folder not found: $FRONTEND_DIR"
  if [[ $SKIP_BUILD -eq 0 ]]; then
    command -v npm >/dev/null 2>&1 || fail "npm not found. Install Node in Kali first (and: sudo apt install -y libatomic1)."
    [[ -f "$LOCAL_DIR/.env" ]] || fail "Missing $LOCAL_DIR/.env (the build script reads ../../.env). Ask your team for the values."
  fi
fi

log "Checking SSH connection"
ssh "${SSH_OPTS[@]}" -o ConnectTimeout=10 "$TARGET" "echo connected to \$(hostname)" \
  || fail "Cannot connect. Check the security group (port 22), the key, and the username."

# ---------- 1. Local: pull and build ----------
cd "$LOCAL_DIR"

log "Pulling latest code locally"
git pull --ff-only

if [[ $NO_FRONTEND -eq 0 && $SKIP_BUILD -eq 0 ]]; then
  log "Installing npm dependencies and building the landing-page-builder"
  cd "$FRONTEND_DIR"
  npm install
  npm run build
  cd "$LOCAL_DIR"
fi

# ---------- 2. Upload the build ----------
if [[ $NO_FRONTEND -eq 0 ]]; then
  [[ -f "$OUT_DIR/current.txt" ]] || fail "No build found: $OUT_DIR/current.txt is missing. Run without --skip-build."
  BUILD_ID="$(tr -d '[:space:]' < "$OUT_DIR/current.txt")"
  [[ -d "$OUT_DIR/$BUILD_ID" ]]   || fail "Build folder $OUT_DIR/$BUILD_ID is missing."

  log "Uploading build $BUILD_ID"
  ssh "${SSH_OPTS[@]}" "$TARGET" "mkdir -p '$REMOTE_DIR/$BUILD_OUT'"
  # 1) the new build folder first (old builds on the server are left alone)
  scp "${SSH_OPTS[@]}" -r "$OUT_DIR/$BUILD_ID" "${TARGET}:${REMOTE_DIR}/${BUILD_OUT}/"
  # 2) current.txt last, swapped in atomically, so visitors never point at a missing build
  scp "${SSH_OPTS[@]}" "$OUT_DIR/current.txt" "${TARGET}:${REMOTE_DIR}/${BUILD_OUT}/current.txt.upload"
  ssh "${SSH_OPTS[@]}" "$TARGET" "mv -f '$REMOTE_DIR/$BUILD_OUT/current.txt.upload' '$REMOTE_DIR/$BUILD_OUT/current.txt'"
fi

# ---------- 3. Remote: deploy Laravel ----------
log "Deploying on the server"
ssh "${SSH_OPTS[@]}" "$TARGET" bash -s -- "$REMOTE_DIR" "$MIGRATE" "$BUILD_OUT" "$KEEP_BUILDS" <<'REMOTE'
set -euo pipefail
APP_DIR="$1"
MIGRATE="$2"
BUILD_OUT="$3"
KEEP="$4"

cd "$APP_DIR"

echo "--> git pull"
git pull --ff-only

echo "--> composer install"
composer install --no-dev --optimize-autoloader --no-interaction

if [[ "$MIGRATE" == "1" ]]; then
  echo "--> migrations"
  php artisan migrate --force
fi

echo "--> prune old frontend builds (keep newest $KEEP)"
if [[ -d "$BUILD_OUT" ]]; then
  ( cd "$BUILD_OUT" \
    && { ls -1 | grep -E '^[a-z0-9]+-[a-f0-9]{6}$' || true; } \
    | sort -r | tail -n +"$((KEEP + 1))" | xargs -r rm -rf -- )
  chmod -R o+rX "$BUILD_OUT"
fi

echo "--> permissions"
mkdir -p storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache
sudo chown -R ec2-user:nginx storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo "--> caches"
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "--> health check"
code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1)
echo "HTTP $code"
if [[ "$code" != "200" ]]; then
  echo "Site did not return 200. Last error:" >&2
  grep -m1 "production.ERROR" storage/logs/laravel.log >&2 || true
  exit 1
fi
REMOTE

log "Deploy finished: http://${SERVER_HOST}"