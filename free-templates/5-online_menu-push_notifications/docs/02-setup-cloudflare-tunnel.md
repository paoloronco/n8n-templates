# Expose ntfy with Cloudflare Tunnel

This guide shows **one possible way** to expose your self-hosted ntfy instance to the internet securely using a **Cloudflare Tunnel** — no open ports, free HTTPS included.

If you prefer, you can also expose ntfy through your own reverse proxy and open port setup, as long as the final result is a public HTTPS URL reachable by the ntfy mobile app.

---

## Why Cloudflare Tunnel (and NOT Cloudflare Access)

> **Important:** Do NOT put Cloudflare Access in front of ntfy.

Cloudflare Access requires a browser-based OAuth/OIDC login flow that **breaks the mobile app**: push notifications use SSE (Server-Sent Events) — long-lived HTTP connections that are incompatible with the Access authentication redirect.

The correct security model is:

```
Internet → Cloudflare Tunnel (HTTPS) → ntfy:8095
                                            ↓
                               auth-default-access: deny-all
                               (token/credentials required)
```

ntfy's own authentication (`auth-default-access: deny-all`) is enough. Every client must supply a valid Bearer token or username/password.

---

## Prerequisites

- A Cloudflare account with a domain
- `cloudflared` installed on your server

---

## Tunnel Configuration

Edit `/etc/cloudflared/config.yml` and add an ingress rule for ntfy:

```yaml
tunnel: YOUR_TUNNEL_NAME
credentials-file: /root/.cloudflared/tunnel-credentials.json

ingress:
  - hostname: n8n.YOUR_DOMAIN.com
    service: http://localhost:5678

  - hostname: ntfy.YOUR_DOMAIN.com
    service: http://localhost:8095       # ← ntfy port

  - service: http_status:404
```

Restart the tunnel:

```bash
systemctl restart cloudflared
```

---

## DNS Record

In Cloudflare DNS, add:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `ntfy` | `YOUR_TUNNEL_ID.cfargotunnel.com` | ON (orange cloud) |

---

## Verify

```bash
curl -u admin:your_password https://ntfy.YOUR_DOMAIN.com/v1/health
```

Expected response: `{"healthy":true}`
