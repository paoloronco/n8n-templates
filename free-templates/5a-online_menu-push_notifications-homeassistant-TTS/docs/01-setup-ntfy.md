# Setup ntfy.sh (Self-Hosted)

## What is ntfy.sh?

[ntfy.sh](https://ntfy.sh) is an open-source, HTTP-based push notification service.
It lets you send notifications to your phone with a simple `POST` request — no external API key, no SDK, works with plain `curl`.

This file covers the **self-hosted** setup. If you prefer the hosted service, you can use `ntfy.sh` directly and skip the Docker deployment steps below.

---

## Cloud vs Self-Hosted

| | **ntfy.sh cloud** | **Self-hosted** |
|---|---|---|
| Public topics | Anyone who knows the URL can read | Private topics, access denied by default |
| Authentication | Paid Pro plan only | Built-in, configurable per user/topic |
| Privacy | Data on ntfy.sh servers | Data on your own server |
| HTTPS | Included | Via your own domain (Cloudflare Tunnel, reverse proxy, or similar) |
| Control | Limited | Full |
| Cost | Free (limited) / Pro paid | Free (self-hosted) |

**Recommendation:** self-hosted with `auth-default-access: deny-all` gives fully private topics, visible only to authenticated users.

---

## Docker Compose

Add this service to your `docker-compose.yml`:

```yaml
ntfy:
  image: binwiederhier/ntfy:latest
  container_name: ntfy
  command: serve
  ports:
    - "8095:80"
  volumes:
    - /opt/ntfy/config:/etc/ntfy:ro
    - /opt/ntfy/data:/var/lib/ntfy
    - /opt/ntfy/cache:/var/cache/ntfy
  networks:
    - n8n-net        # use the same network as n8n
  restart: unless-stopped
```

Start the container:

```bash
docker compose up -d ntfy
```

### Directory layout

```
/opt/ntfy/
  config/   → server.yml
  data/     → user.db (auth)
  cache/    → cache.db, attachments
```

---

## ntfy Configuration

File: `/opt/ntfy/config/server.yml`

```yaml
base-url: "https://ntfy.YOUR_DOMAIN.com"
listen-http: ":80"

cache-file: "/var/cache/ntfy/cache.db"
cache-duration: "12h"

auth-file: "/var/lib/ntfy/user.db"
auth-default-access: "deny-all"     # ← blocks all anonymous access

behind-proxy: true

attachment-cache-dir: "/var/cache/ntfy/attachments"
attachment-total-size-limit: "2G"
attachment-file-size-limit: "15M"

log-level: info
```

---

## User Management

```bash
# Create admin user
docker exec -e NTFY_PASSWORD="your_password" ntfy ntfy user add --role=admin admin

# Change password
docker exec -e NTFY_PASSWORD="new_password" ntfy ntfy user change-pass admin

# List users
docker exec ntfy ntfy user list

# Create a dedicated token for n8n (no expiry)
docker exec ntfy ntfy token add admin
```

> Keep the generated token — you will need it as the n8n credential.
