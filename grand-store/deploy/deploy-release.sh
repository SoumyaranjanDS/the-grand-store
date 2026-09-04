#!/usr/bin/env bash

set -Eeuo pipefail

if [[ $# -ne 4 ]]; then
  echo "Usage: deploy-release.sh RELEASE_ID APP_DIR ARCHIVE LEGACY_BACKEND_DIR" >&2
  exit 64
fi

release_id="$1"
app_dir="${2%/}"
archive="$3"
legacy_backend_dir="${4%/}"

[[ "$release_id" =~ ^[0-9a-f]{40}-[0-9]+$ ]] || { echo "Invalid release ID." >&2; exit 64; }
[[ "$app_dir" =~ ^/var/www/[A-Za-z0-9._/-]+$ ]] || { echo "APP_DIR must be below /var/www." >&2; exit 64; }
[[ "$legacy_backend_dir" =~ ^/var/www/[A-Za-z0-9._/-]+$ ]] || { echo "LEGACY_BACKEND_DIR must be below /var/www." >&2; exit 64; }
[[ "$archive" == "/tmp/grand-store-${release_id}.tar.gz" ]] || { echo "Unexpected archive path." >&2; exit 64; }
[[ -f "$archive" ]] || { echo "Release archive was not uploaded." >&2; exit 66; }

releases_dir="$app_dir/releases"
shared_dir="$app_dir/shared"
release_dir="$releases_dir/$release_id"
current_link="$app_dir/current"
temporary_link="$app_dir/.current-$release_id"

cleanup_archive() {
  rm -f -- "$archive"
}
trap cleanup_archive EXIT

if [[ -e "$release_dir" ]]; then
  echo "Release already exists: $release_dir" >&2
  exit 73
fi

install -d -m 755 "$releases_dir"
install -d -m 700 "$shared_dir"
install -d -m 755 "$shared_dir/uploads"

if [[ ! -s "$shared_dir/backend.env" ]]; then
  echo "Missing $shared_dir/backend.env. Complete the VPS bootstrap steps first." >&2
  exit 78
fi

for required_key in MONGO_URI JWT_SECRET; do
  if ! grep -Eq "^${required_key}=.+" "$shared_dir/backend.env"; then
    echo "Required setting ${required_key} is missing from backend.env." >&2
    exit 78
  fi
done

mkdir "$release_dir"
tar --extract --gzip --file "$archive" --directory "$release_dir" --no-same-owner

[[ -f "$release_dir/backend/server.js" ]] || { echo "Backend is missing from release." >&2; exit 65; }
[[ -f "$release_dir/backend/package-lock.json" ]] || { echo "Backend lockfile is missing from release." >&2; exit 65; }
[[ -f "$release_dir/frontend/index.html" ]] || { echo "Frontend build is missing from release." >&2; exit 65; }

ln -s "$shared_dir/backend.env" "$release_dir/backend/.env"
ln -s "$shared_dir/uploads" "$release_dir/backend/uploads"

echo "Installing production dependencies for $release_id..."
(
  cd "$release_dir/backend"
  npm ci --omit=dev --no-audit --no-fund
)

previous_release=""
if [[ -L "$current_link" ]]; then
  previous_release="$(readlink -f "$current_link")"
elif [[ -e "$current_link" ]]; then
  echo "$current_link exists but is not a symbolic link." >&2
  exit 73
fi

activate_release() {
  local target="$1"
  rm -f -- "$temporary_link"
  ln -s "$target" "$temporary_link"
  mv -Tf "$temporary_link" "$current_link"
}

restore_backend() {
  echo "Deployment failed; attempting backend rollback..." >&2

  if [[ -n "$previous_release" && -f "$previous_release/backend/ecosystem.config.cjs" ]]; then
    activate_release "$previous_release"
    pm2 startOrReload "$previous_release/backend/ecosystem.config.cjs" --update-env
    return
  fi

  rm -f -- "$current_link"
  if [[ -f "$legacy_backend_dir/ecosystem.config.cjs" ]]; then
    pm2 startOrReload "$legacy_backend_dir/ecosystem.config.cjs" --update-env
  elif [[ -f "$legacy_backend_dir/server.js" ]]; then
    pm2 delete grandstore-backend >/dev/null 2>&1 || true
    (
      cd "$legacy_backend_dir"
      NODE_ENV=production PORT=5015 pm2 start server.js --name grandstore-backend
    )
  else
    echo "No previous release or legacy backend was available for rollback." >&2
    return 1
  fi
}

activate_release "$release_dir"

if ! pm2 startOrReload "$release_dir/backend/ecosystem.config.cjs" --update-env; then
  restore_backend
  exit 1
fi

healthy=false
for attempt in $(seq 1 20); do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:5015/api/health >/dev/null; then
    healthy=true
    break
  fi
  echo "Health check attempt $attempt/20 failed; retrying..."
  sleep 3
done

if [[ "$healthy" != true ]]; then
  restore_backend
  exit 1
fi

pm2 save

mapfile -t installed_releases < <(
  find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -nr \
    | cut -d' ' -f2-
)

if (( ${#installed_releases[@]} > 5 )); then
  for old_release in "${installed_releases[@]:5}"; do
    if [[ "$old_release" == "$releases_dir/"* && "$old_release" != "$release_dir" ]]; then
      rm -rf -- "$old_release"
    fi
  done
fi

echo "Release $release_id is active and healthy."
