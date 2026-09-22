# Menu Order Push Notifications with n8n and ntfy

## Quick Overview

Receive orders from an online menu through an n8n webhook, send real-time push notifications through a self-hosted ntfy server, and log basic order information in an n8n Data Table.

## How It Works

- **Order webhook** — The menu website sends each order as an HTTP POST request to the n8n `/menu` webhook.
- **Push notification** — An HTTP Request formats the customer name, ordered items, quantities, details, and time into a message and publishes it to the configured ntfy topic.
- **Order logging** — The workflow records the first ordered item and customer name in an n8n Data Table for simple order history.
- **Device delivery** — Phones or other devices subscribed to the same authenticated ntfy topic receive the order notification.

## Setup

- **Import the workflow** — Import `workflow/menu-order-notifications.json` into n8n.
- **Configure the website** — Copy the webhook Production URL and set it as `orderWebhook` in the included menu website configuration.
- **Deploy ntfy** — Set up an ntfy server and create the user, token, and topic used for order notifications.
- **Create n8n authentication** — Add an HTTP Header Auth credential containing the ntfy bearer token and select it in the notification node.
- **Configure the Data Table** — Create or select a table containing `item` and `person` columns and assign it to the DB node.
- **Test and activate** — Submit a test order, verify the notification and Data Table row, then activate the workflow.

## Requirements

- n8n instance
- Online menu or frontend capable of sending HTTP POST requests
- ntfy server
- ntfy authentication token
- n8n Data Table with `item` and `person` fields

### Optional

- Included website mockup
- Cloudflare Tunnel or another HTTPS reverse-proxy solution for exposing self-hosted services
- ntfy mobile app on Android or iOS/iPadOS
- Additional order fields in the Data Table

## Customization

- **Notification content** — Change the ntfy message to include additional customer, order, price, or timing information.
- **Order storage** — Extend the Data Table schema to log the complete order instead of only the first item and customer.
- **Frontend** — Replace the included website mockup with any application capable of calling the webhook.
- **Notification provider** — Replace ntfy with another messaging or notification service supported by n8n.
- **Webhook path** — Change the endpoint path if `/menu` conflicts with another workflow or application.

## Additional Info

- Full setup instructions are available in the included `docs/` directory.
- The repository includes a `website-mockup/` example that can be connected to the webhook.
- Protect public webhook endpoints and authenticated ntfy topics appropriately before exposing them to the internet.
