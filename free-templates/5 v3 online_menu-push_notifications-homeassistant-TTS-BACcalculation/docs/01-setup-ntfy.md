# 01 — Setup ntfy.sh (Self-Hosted)

Deploy a self-hosted [ntfy](https://ntfy.sh) push notification server using Docker, secured with user authentication.

---

## Prerequisites

- Docker and Docker Compose installed on your server
- ntfy will run on the same Docker network as n8n so that n8n can reach it via `http://ntfy/YOUR_TOPIC` (internal network URL)

---

## docker-compose.yml

Add ntfy to your existing Docker Compose file, or create a standalone one:

```yaml
services:
  ntfy:
    image: binwiederhier/ntfy
    container_name: ntfy
    command: serve
    environment:
      - NTFY_BASE_URL=https://ntfy.yourdomain.com
      - NTFY_CACHE_FILE=/var/lib/ntfy/cache.db
      - NTFY_AUTH_FILE=/var/lib/ntfy/auth.db
      - NTFY_AUTH_DEFAULT_ACCESS=deny-all
      - NTFY_BEHIND_PROXY=true
    volumes:
      - ./ntfy-data:/var/lib/ntfy
    ports:
      - "8080:80"
    restart: unless-stopped
    networks:
      - n8n_network

networks:
  n8n_network:
    external: true
```

> `NTFY_AUTH_DEFAULT_ACCESS=deny-all` ensures no anonymous reads. All topic access requires authentication.

---

## Create the Admin User

After starting the container, create an admin user with a password:

```bash
docker exec -e NTFY_PASSWORD="your_strong_password" ntfy ntfy user add --role=admin admin
```

This creates a user named `admin` with the given password. This username/password is what you enter in the **ntfy mobile app**.

---

## Generate the n8n Token

n8n uses a Bearer token (not username/password) to publish to ntfy:

```bash
docker exec ntfy ntfy token add admin
```

Copy the token that is printed — you will use it in the n8n Header Auth credential.

---

## Create the n8n Credential

In n8n, create a **Header Auth** credential:

| Field | Value |
|---|---|
| Name | `HeaderAuth ntfy` (or any name you prefer) |
| Header Name | `Authorization` |
| Header Value | `Bearer YOUR_NTFY_TOKEN` |

Attach this credential to the **ntfy notification** HTTP Request node.

---

## Verify ntfy is Running

```bash
# Check the container is up
docker ps | grep ntfy

# Test publish (from server, using internal URL)
curl -H "Authorization: Bearer YOUR_NTFY_TOKEN" \
     -d "Test message" \
     http://localhost:8080/paoloronco-menu
```

---

## Receive Notifications on Your Phone

1. Install the **ntfy** app (Android / iOS)
2. Open the app → add your ntfy server URL (e.g. `https://ntfy.yourdomain.com`)
3. Log in with the `admin` username and password you created above
4. Subscribe to the topic you configured in n8n (e.g. `paoloronco-menu`)

Test orders from the menu website will now arrive as push notifications.
