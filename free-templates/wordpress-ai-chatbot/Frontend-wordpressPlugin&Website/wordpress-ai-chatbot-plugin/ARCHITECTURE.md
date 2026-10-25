# WP AI Chatbot - Architecture

This plugin uses a WordPress REST API proxy so the browser never talks directly to your external n8n webhook. The server forwards requests and keeps your token secret.

---

## Key Points

- Token never leaves the server
- Public REST endpoint, no cookies, no `X-WP-Nonce`
- Optional same-site Origin/Referer check
- Per-IP rate limiting (60 req / 10 min)

---

## Request Flow

```
Browser → POST /wp-json/wpaicb/v1/chat
            ↳ Server → wp_remote_post(n8n webhook with secret headers)
            ↳ Server → returns n8n response (status, content-type, body)
```

---

## Endpoints

### Chat
- Route: `/wp-json/wpaicb/v1/chat`
- Method: `POST`
- Permission: `__return_true` (public)
- Request body: `{ message: string, sessionId?: string }`
- Response body: `{ status, contentType, body, sessionId }`

### Test (Admin)
- Route: `/wp-json/wpaicb/v1/test`
- Method: `POST`
- Permission: `__return_true` (admin checked in handler)

---

## Security

- Origin/Referer check (same-site) enforced by default; disable with filter `wpaicb_enforce_origin_check` returning `false`
- Rate limiting via transients per IP: 60 requests / 10 minutes
- n8n token stored in options; only used server-side headers

---

## Frontend

The widget posts JSON to the REST endpoint with credentials omitted (no cookies):

```js
fetch(WPAICB.restUrl, {
  method: 'POST',
  credentials: 'omit',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, sessionId })
});
```

Globals injected by shortcode:
- `WPAICB.restUrl`
- `WPAICB.siteHome`

---

## Admin

Settings → WP AI Chatbot:
- Webhook URL
- Auth header name
- Auth header value (token)
- Site home URL (optional)

Admin page includes a “Test webhook” button that calls `/wpaicb/v1/test` without nonce/cookies.

---

## Troubleshooting

- 403 on chat: likely failed Origin/Referer check; disable via `wpaicb_enforce_origin_check` if needed
- 429: per-IP rate limit exceeded; wait 10 minutes
- 500/502: webhook not configured or upstream error

---

Updated: February 2026 · Version 1.1.0

1. **includes/class-wpaicb-plugin.php** - Core refactoring with REST API
2. **assets/wpaicb.js** - Updated to use REST endpoints
3. **wp-ai-chatbot.php** - No changes needed

---

## Support

For issues or questions about the new architecture, check:

1. Browser console for JavaScript errors
2. WordPress debug.log (if enabled)
3. Browser Network tab to inspect REST API calls
4. Settings page test webhook functionality

---

**Refactored**: February 2026  
**Version**: 1.1.0  
**Plugin Slug**: wp-ai-chatbot-pov
