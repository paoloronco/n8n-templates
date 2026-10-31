# Menu Order Notifications

Order notification automation for online menus. Select one functional variant:

| Variant | Capabilities | Setup |
|---|---|---|
| [V1 — Basic](./V1/) | Order webhook, ntfy push and order logging | [Guide](./V1/README.md) |
| [V2 — Home Assistant TTS](./V2/) | Basic capabilities plus spoken announcements | [Guide](./V2/README.md) |
| [V3 — Home Assistant TTS + BAC](./V3/) | TTS plus per-person order history and simplified BAC estimate | [Guide](./V3/README.md) |

## Published version

- **Gumroad:** [V3 — Home Assistant TTS + BAC](https://paoloronco.gumroad.com/l/n8n-menuwebsite-ordernotifications). Only V3 is published on Gumroad.
- **n8n Creators:** [V3 — View template](https://n8n.io/workflows/14487-notify-on-menu-orders-via-ntfy-and-home-assistant-tts-with-daily-bac-tracking/).

## Shared resources

- [Online menu mockup](./website-mockup/)
- [ntfy setup](./docs/01-setup-ntfy.md)
- [Cloudflare Tunnel setup](./docs/02-setup-cloudflare-tunnel.md)

Each variant retains its workflow JSON and variant-specific setup documentation. The BAC estimate is informational only; it must not be used for driving, legal or medical decisions.
