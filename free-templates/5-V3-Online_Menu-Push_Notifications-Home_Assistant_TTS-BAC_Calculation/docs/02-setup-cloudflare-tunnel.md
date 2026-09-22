# 02 — Expose ntfy with Cloudflare Tunnel

Expose your self-hosted ntfy (and optionally n8n) over HTTPS using a Cloudflare Tunnel — no open ports, no reverse proxy configuration needed.

---

## Prerequisites

- A domain managed by **Cloudflare DNS**
- A Cloudflare account (free tier is sufficient)
- Docker running on the same host as ntfy

---

## Create the Tunnel

1. Go to **Cloudflare Zero Trust** → **Networks** → **Tunnels** → **Create a tunnel**
2. Choose **Cloudflared** as the connector type
3. Give it a name (e.g. `homelab`)
4. Copy the tunnel token shown in the setup instructions

---

## Add cloudflared to Docker Compose

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
    restart: unless-stopped
    networks:
      - n8n_network

networks:
  n8n_network:
    external: true
```

Replace `YOUR_TUNNEL_TOKEN` with the token copied from the Cloudflare dashboard.

---

## Configure the Public Hostname

Back in the Cloudflare dashboard, add a **Public Hostname** for the tunnel:

| Field | Value |
|---|---|
| Subdomain | `ntfy` |
| Domain | `yourdomain.com` |
| Type | HTTP |
| URL | `ntfy:80` (internal Docker service name + port) |

This makes ntfy accessible at `https://ntfy.yourdomain.com`.

---

## Update ntfy Base URL

In your ntfy Docker Compose environment, update:

```yaml
- NTFY_BASE_URL=https://ntfy.yourdomain.com
```

Restart ntfy after this change:

```bash
docker compose restart ntfy
```

---

## Verify HTTPS Access

From any device outside your network:

```bash
curl -H "Authorization: Bearer YOUR_NTFY_TOKEN" \
     -d "Test from outside" \
     https://ntfy.yourdomain.com/paoloronco-menu
```

The ntfy mobile app should also be configured to use `https://ntfy.yourdomain.com` as the server URL.

---

## Notes

- The **n8n → ntfy** connection uses the internal Docker network URL (`http://ntfy/paoloronco-menu`), so it never goes through the Cloudflare Tunnel — this keeps internal traffic fast and avoids tunnel rate limits.
- The Cloudflare Tunnel is used only for mobile app access and external access from the menu website if it is hosted outside your LAN.
