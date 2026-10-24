# Menu Order Notifications

Order notification automation for online menus. Select one functional variant:

| Variant | Capabilities | Setup |
|---|---|---|
| [Basic](./basic/) | Order webhook, ntfy push and order logging | [Guide](./basic/README.md) |
| [Home Assistant TTS](./home-assistant-tts/) | Basic capabilities plus spoken announcements | [Guide](./home-assistant-tts/README.md) |
| [Home Assistant TTS + BAC](./home-assistant-tts-bac/) | TTS plus per-person order history and simplified BAC estimate | [Guide](./home-assistant-tts-bac/README.md) |

## Shared resources

- [Online menu mockup](./website-mockup/)
- [ntfy setup](./docs/01-setup-ntfy.md)
- [Cloudflare Tunnel setup](./docs/02-setup-cloudflare-tunnel.md)

Each variant retains its workflow JSON and variant-specific setup documentation. The BAC estimate is informational only; it must not be used for driving, legal or medical decisions.
