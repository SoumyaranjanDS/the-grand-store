# Grand Store production deployment

The GitHub Actions workflow tests the backend, builds the frontend, uploads a
release over SSH, installs production dependencies on the VPS, atomically moves
the `current` symlink, reloads the PM2 process, and checks `/api/health`. If a
health check fails, it switches PM2 back to the preceding release. Five releases
are retained on the VPS.

The VPS password is intentionally not used by the workflow. GitHub receives a
dedicated SSH private key; application secrets remain only in
`/var/www/grand-store/shared/backend.env` on the VPS.

## 1. Rotate exposed credentials

Before enabling deployment, rotate the VPS root password and every credential
that has ever been committed to Git. This repository currently contains MongoDB
credentials in tracked maintenance scripts, a Cloudinary secret in a tracked
comment, and fallback passwords for privileged staff accounts. Removing those
strings in a later commit does not invalidate them; rotate the provider
credentials and the affected staff passwords.

Do not commit the generated deployment key, `backend.env`, or any copied secret.
The current legacy `.env` and `.env.backup-*` files are readable more broadly
than necessary. Restrict them on the VPS with:

```bash
chmod 600 /var/www/grandstore-all/grand-store/backend/.env
chmod 600 /var/www/grandstore-all/grand-store/backend/.env.backup-*
```

## 2. Create a dedicated CI SSH key

Run these commands in PowerShell on a trusted computer:

```powershell
ssh-keygen -t ed25519 -a 100 -C "github-actions-grand-store" -f .\grand-store-deploy
Get-Content .\grand-store-deploy.pub | ssh root@191.215.37.241 "umask 077; mkdir -p /root/.ssh; cat >> /root/.ssh/authorized_keys"
ssh -i .\grand-store-deploy root@191.215.37.241 "echo SSH key works"
```

Keep the password session open until the final key test succeeds. The current
ED25519 VPS host-key fingerprint observed during setup was:

```text
SHA256:+4/NrcUj3ezEYzzvEcaIatRAdGsjZ3pBv5UgX2GnbuI
```

Verify it from the VPS provider console with:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Then collect the known-hosts record in PowerShell and verify the same
fingerprint:

```powershell
ssh-keyscan -t ed25519 191.215.37.241 | Out-File -Encoding ascii .\grandstore-known-hosts
ssh-keygen -lf .\grandstore-known-hosts
```

## 3. Prepare persistent VPS files

Run once on the VPS as root. The copy commands preserve the current production
environment and legacy uploaded files:

```bash
install -d -m 755 /var/www/grand-store/releases
install -d -m 700 /var/www/grand-store/shared
install -d -m 755 /var/www/grand-store/shared/uploads
cp /var/www/grandstore-all/grand-store/backend/.env /var/www/grand-store/shared/backend.env
cp -an /var/www/grandstore-all/grand-store/backend/uploads/. /var/www/grand-store/shared/uploads/
chmod 600 /var/www/grand-store/shared/backend.env
```

Review `backend.env` against `backend/.env.production.example`. The deployment
requires `MONGO_URI` and `JWT_SECRET`. Set `PORT=5015`, use production URLs,
include every frontend origin in `ALLOWED_ORIGINS`, and keep PayFast in test mode
until a real end-to-end test succeeds.

## 4. Configure the GitHub production environment

In the repository, open **Settings > Environments**, create `production`, and
add these environment secrets:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `VPS_SSH_PRIVATE_KEY` | Entire contents of `grand-store-deploy` (the private key) |
| Secret | `VPS_KNOWN_HOSTS` | Entire line from `grandstore-known-hosts` |

Add these environment variables:

| Name | Value |
| --- | --- |
| `VPS_HOST` | `191.215.37.241` |
| `VPS_PORT` | `22` |
| `VPS_USER` | `root` |
| `VPS_APP_DIR` | `/var/www/grand-store` |
| `VPS_LEGACY_BACKEND_DIR` | `/var/www/grandstore-all/grand-store/backend` |
| `PRODUCTION_URL` | `https://grandstore.co.za` |
| `VITE_API_URL` | `https://grandstore.co.za` |
| `VITE_FRONTEND_URL` | `https://grandstore.co.za` |
| `VITE_APP_URL` | `https://grandstore.co.za` |
| `VITE_GOOGLE_CLIENT_ID` | Browser OAuth client ID (optional if login is disabled) |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser Maps key (optional if maps are disabled) |

Values prefixed with `VITE_` are compiled into browser JavaScript and are not
secrets. Restrict the Google browser credentials to the production domains in
Google Cloud Console.

The workflow uses a root key only because the existing Grand Store PM2 process
runs under root alongside the other apps on this VPS. Treat that key as highly
sensitive. A later hardening step should migrate this app to its own Unix user
and PM2 systemd service; do not change the owner of the other applications while
doing that migration.

Optionally require manual approval for the `production` environment and protect
`main` so the `Test and build` check must pass before merging.

## 5. Run the first deployment

Push the workflow and deployment files to `main`, then run **Grand Store CI/CD**
from the Actions tab. The first successful run creates
`/var/www/grand-store/current` and moves the PM2 process from the legacy checkout
to the release directory. It does not modify Nginx.

Verify on the VPS:

```bash
readlink -f /var/www/grand-store/current
pm2 describe grandstore-backend
curl --fail http://127.0.0.1:5015/api/health
```

## 6. Point Nginx at the atomic release

After the first workflow succeeds, either adapt `nginx.conf.example` or update
the existing Grand Store server block so its frontend root is:

```nginx
root /var/www/grand-store/current/frontend;
```

If `VITE_API_URL` is `https://grandstore.co.za`, the same server block must also
proxy `/api/` and `/uploads/` to `http://127.0.0.1:5015`, as shown in the example.
Test before applying:

```bash
nginx -t
systemctl reload nginx
curl --fail https://grandstore.co.za/api/health
```

The VPS currently has multiple Grand Store Nginx files and domains. Keep only
the domains you actively use, but do not remove an existing API-domain proxy
until clients have been migrated to the same-origin `/api` route.

## 7. Disable password-based SSH after key login works

Use the VPS console or an existing SSH session to set these values in a file
under `/etc/ssh/sshd_config.d/`:

```text
PermitRootLogin prohibit-password
PasswordAuthentication no
```

Then run `sshd -t` and `systemctl reload ssh`. Open a second terminal and verify
key login before closing the original session. Store an offline copy of the key,
or be prepared to use the VPS provider console for recovery.
