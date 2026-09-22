# Menu Order Push Notifications with ntfy and Home Assistant TTS

## Quick Overview

Receive online menu orders through n8n, send push notifications with ntfy, log orders in an n8n Data Table, and announce new orders through Home Assistant TTS on a connected speaker.

## How It Works

- **Order webhook** — The menu website sends customer and order data as an HTTP POST request to the n8n `/menu` webhook.
- **Push notification** — n8n formats the order and publishes it to the configured ntfy topic for delivery to subscribed devices.
- **Order logging** — The DB node stores the first ordered item and customer name in an n8n Data Table.
- **Home Assistant announcement** — n8n calls the configured Home Assistant script and passes a message containing the customer and ordered item.
- **TTS playback** — Home Assistant handles the final text-to-speech announcement through the media device configured in the script.

## Setup

- **Import the workflow** — Import `workflow/Online_Menu-Push_Notifications-Home_Assistant_TTS-V2.json` into n8n.
- **Configure the website** — Set the n8n webhook Production URL as the order endpoint used by your menu frontend.
- **Configure ntfy** — Deploy ntfy, create authentication, select a topic, and add its bearer token as an n8n HTTP Header Auth credential.
- **Configure the Data Table** — Create or select a table with `item` and `person` fields and assign it to the DB node.
- **Connect Home Assistant** — Add your Home Assistant host and long-lived access token to n8n credentials.
- **Create the TTS script** — Configure the Home Assistant `annuncia_ordine` script and its target media player or Google Cast device.
- **Test and activate** — Submit an order and verify ntfy, Data Table logging, and TTS playback before activation.

## Requirements

- n8n instance
- Online menu or frontend capable of HTTP POST requests
- ntfy server and authentication token
- n8n Data Table with `item` and `person`
- Home Assistant instance
- Home Assistant long-lived access token
- TTS-capable media device configured in Home Assistant

### Optional

- Included website mockup
- Google Cast integration
- Cloudflare Tunnel or another secure exposure method
- Additional notification devices or ntfy subscribers

## Customization

- **TTS message** — Change the text passed to Home Assistant to announce quantities, full orders, customer names, or other fields.
- **TTS service** — Replace `annuncia_ordine` with your own Home Assistant script or service.
- **Notification content** — Customize the ntfy payload and formatting.
- **Order storage** — Extend the Data Table with additional order information.
- **Frontend** — Connect any website, kiosk, tablet, or application capable of sending the expected webhook payload.
- **Notification provider** — Replace ntfy or add additional n8n notification channels.

## Additional Info

- This version extends Workflow 5 v1 by adding Home Assistant TTS while retaining ntfy notifications and Data Table logging.
- Detailed deployment instructions are available in the included `docs/` directory.
- The repository includes a `website-mockup/` example for testing the order flow.
- Secure Home Assistant, ntfy, and the n8n webhook appropriately before exposing services outside your local network.
