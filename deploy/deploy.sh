#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/q-app
cd "$APP_DIR"

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing PHP dependencies"
composer install --no-dev --optimize-autoloader --no-interaction

# Run migrations only when you pass --migrate (needs a configured database)
if [[ "${1:-}" == "--migrate" ]]; then
  echo "==> Running migrations"
  php artisan migrate --force
fi

echo "==> Fixing permissions"
mkdir -p storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache
sudo chown -R ec2-user:nginx storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo "==> Refreshing caches"
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Health check"
code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1)
echo "HTTP $code"
[[ "$code" == "200" ]] || { echo "Site did not return 200. Check storage/logs/laravel.log"; exit 1; }

echo "==> Deploy finished"