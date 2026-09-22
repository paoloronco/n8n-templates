# Menu Order Notifications with Home Assistant TTS and BAC Estimation

## Quick Overview

Process online menu orders with n8n, log daily orders, send ntfy push notifications, announce orders through Home Assistant TTS, and calculate a simple cumulative BAC estimate from configured alcohol-gram values.

## How It Works

- **Order webhook** — The `/menu` webhook receives the customer name, order time, and an array of ordered items.
- **Order normalization** — JavaScript normalizes the customer name, formats the order, calculates alcohol grams from item metadata, and adds the current date.
- **Order logging** — The workflow stores the formatted order, customer, alcohol grams, date, and order time in an n8n Data Table.
- **Daily history lookup** — The Data Table is queried for all orders placed by the same person on the current date.
- **BAC estimation** — JavaScript sums logged alcohol grams and applies a configurable simplified Widmark-style calculation using the workflow's weight and distribution-factor constants.
- **Push notification** — ntfy receives a formatted message containing the current order, previous daily orders, alcohol total, and calculated estimate.
- **Home Assistant TTS** — n8n calls a Home Assistant script to announce the newly ordered item through the configured media device.

## Setup

- **Import the workflow** — Import `workflow/Online_Menu-Push_Notifications-Home_Assistant_TTS-BAC_Calculation-V3.json` into n8n.
- **Configure the Data Table** — Create `item`, `person`, `alcohol_grams`, `date`, and `order_time` fields and select the table in both Data Table nodes.
- **Configure menu data** — Ensure each relevant menu item sends the expected `alcohol_grams` value along with name, quantity, and optional detail.
- **Configure ntfy** — Set the server/topic URL and add the required HTTP Header Auth credential.
- **Connect Home Assistant** — Configure Home Assistant credentials and update the script service used by the announcement node.
- **Review calculation constants** — Change the hard-coded weight and distribution factor if you are experimenting with different calculation assumptions.
- **Test and activate** — Send representative test orders and verify storage, notifications, calculation output, and TTS before activation.

## Requirements

- n8n instance
- Online menu or frontend sending the expected webhook payload
- n8n Data Table with the required order and alcohol fields
- ntfy server and authentication credentials
- Home Assistant instance and n8n credentials
- Home Assistant announcement script and TTS-capable media device

### Optional

- Included website mockup
- Cloudflare Tunnel or another secure exposure method
- Additional order-history fields
- Alternative notification or TTS providers

## Customization

- **Menu metadata** — Define or change the alcohol-gram values associated with menu items.
- **Calculation assumptions** — Modify the weight, distribution factor, thresholds, and related display logic in `Calculate Cumulative BAC`.
- **Notification content** — Change the ntfy message, history formatting, indicators, or displayed values.
- **Order history** — Extend the Data Table with prices, categories, table numbers, IDs, or other metadata.
- **Home Assistant** — Change the announcement script, target speaker, message, or TTS implementation.
- **Frontend** — Replace the included mockup with another ordering interface using the same webhook contract.

## Additional Info

- This version extends Workflow 5 v2 with normalized order processing, richer Data Table logging, daily per-person history, and a cumulative BAC estimate.
- The included BAC calculation is a simplified estimate based on configured alcohol grams and fixed constants. It does not model absorption, elapsed-time elimination, food, individual physiology, or measurement uncertainty.
- Do not use the calculated value to determine whether someone is safe or legally permitted to drive, operate machinery, or make medical decisions. A breath or blood alcohol measurement and applicable local rules are materially different.
- Detailed setup material is available in the included `docs/` directory.
