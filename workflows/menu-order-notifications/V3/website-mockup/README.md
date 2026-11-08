# Website Mockup — Menu Order Notifications V3

A static menu frontend and browser-based editor supplied as an **example** alongside the n8n workflow. No build step is required.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Redirects to the menu |
| `menu.html` | Customer-facing menu and order form |
| `admin.html` | Browser-based menu editor |
| `menu-data.js` | Example menu data and webhook URL |

## Run locally

Serve this folder with any static HTTP server (for example, `python -m http.server 8000`), then open `http://localhost:8000/`. Keep all four files in the same directory. Edit `menu-data.js` to change menu items and set `orderWebhook` to your n8n endpoint. The admin page can export an updated `menu-data.js` file.

## Integration notes

**This is a UI mockup, not a production-ready V3 client.** The files are preserved as supplied. Before connecting them to the current workflow:

- The V3 workflow uses Webhook Header Auth, but this frontend only sends `Content-Type: application/json`. Do not put a reusable webhook secret into publicly served JavaScript. Use a server-side proxy or another appropriate authentication architecture.
- The frontend does not send an `orderId` UUID. V3 falls back to a per-execution identifier, so retries are **not deduplicated**. Generate one UUID per order and retain it across retries.
- The example menu items omit `alcol_grammi`; BAC estimates will remain zero unless you supply correct alcohol metadata in the order payload.
- The admin editor uses a default `admin` password stored as a hash in browser localStorage. **This is not server-side authentication.** Do not expose the admin page publicly as an administrative security boundary.
- A menu-save webhook, if configured in the admin editor, is a separate workflow/service and is **not included** in V3.

See the [V3 README](../README.md) and [full setup documentation](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-849f0ba27c32836e844101b86f496c55) for the n8n side.
