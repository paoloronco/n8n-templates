# Newsletter Subscription + New Release Notification

## Quick Overview

This workflow provides a complete lightweight newsletter flow for product updates: it collects and validates subscriber emails through a webhook, stores subscribers in an n8n Data Table, sends a welcome email to new subscribers, and distributes release notifications generated from your changelog or GitHub README.

Release emails can be prepared with OpenAI using structured output, while a deterministic fallback ensures the notification can still be generated if the AI branch fails.

## How It Works

- **Newsletter subscription webhook** — Receives an email address through a POST webhook, normalizes it, and validates the address format.
- **Duplicate protection** — Checks the newsletter Data Table before creating a new subscriber, preventing duplicate entries and repeated welcome emails.
- **Subscriber storage** — Stores new email addresses in an n8n Data Table that acts as the newsletter recipient list.
- **Welcome email** — Builds and sends a customizable HTML welcome email when a new subscriber is registered.
- **Release trigger** — Release notifications can be started through the production webhook or manually from inside n8n.
- **Send safety check** — Requires at least one valid semantic version and `SEND_EMAIL=YES` before the workflow can continue to the subscriber list.
- **Changelog extraction** — Reads a GitHub README, extracts only the requested release version sections, and can also use a manually supplied changelog.
- **Release preparation** — Groups changelog entries into user-facing highlights and filters out low-value technical noise such as internal maintenance where possible.
- **AI copywriting** — Optionally uses OpenAI with structured output to create the subject, introduction, highlights, and closing text for the release email.
- **Deterministic fallback** — If AI generation fails or does not pass the quality checks, the workflow builds the release email directly from the extracted changelog.
- **Bulk delivery** — Reads all subscribers, loops through them, sends the release email via SMTP, and applies a short wait between sends.
- **Webhook response** — Returns a success response with the announced version, recipient count, and the content-generation path used.

## Setup

- **Import the workflow** — Import `Newsletter Subscribe + New Release Notification _ template.json` into n8n.
- **Create the subscriber Data Table** — Create an n8n Data Table for newsletter subscribers with at least an `email` field.
- **Replace the Data Table placeholder** — Update every node using `REPLACE_WITH_YOUR_NEWSLETTER_DATA_TABLE_ID` with the ID of your subscriber table.
- **Configure webhook authentication** — Configure the Header Auth credentials used by the subscription and release webhooks.
- **Configure SMTP** — Add your SMTP credentials to both the welcome-email and release-email nodes.
- **Replace sender addresses** — Change `newsletter@example.com` to the verified sender address you want to use.
- **Customize the welcome email** — Update the product name, welcome copy, legal footer, privacy information, and unsubscribe language in `Build Welcome Email`.
- **Configure the changelog source** — Replace the example raw GitHub README URL in `Read README from GitHub` with the README or changelog file used by your project.
- **Replace product URLs** — Update the example website and release-note URLs generated inside `Extract Requested Release Versions`.
- **Configure OpenAI** — Connect an OpenAI credential to the chat model nodes if you want AI-assisted release copy.
- **Test before production** — Use a temporary single-recipient path or duplicated workflow before sending to the complete subscriber list.
- **Activate the workflow** — Enable the workflow only after both webhook paths and email delivery have been tested successfully.

## Requirements

- n8n instance with Data Tables available.
- Public or otherwise reachable n8n webhook endpoints for website or application integration.
- An n8n Data Table used to store subscriber email addresses.
- SMTP credentials and a valid sender address.
- A GitHub-hosted README or changelog reachable by HTTP, unless changelog content is always supplied manually.
- Header Auth credentials if the webhook authentication included in the template is kept enabled.
- OpenAI API credentials if the AI copywriting branch is enabled.
- Network access from n8n to GitHub/raw content, your SMTP server, and OpenAI when used.

## Customization

- **Subscriber schema** — Add fields such as `subscribed_at`, `active`, source, language, preferences, or campaign metadata.
- **Unsubscribe support** — Add an unsubscribe webhook and an `active` field, then filter `Read Subscribers` to send only to active subscribers.
- **Welcome flow** — Change the welcome message, branding, subject, sender name, or add onboarding links and product documentation.
- **Webhook integration** — Connect the subscription endpoint to a website form, SaaS application, landing page, or another automation.
- **Release source** — Replace the GitHub README with another HTTP-accessible changelog source or rely entirely on manually provided changelog text.
- **Version parsing** — Extend the extraction logic if your project uses a release format different from semantic versions such as `1.2.3`.
- **AI model and prompt** — Change the OpenAI model, editorial instructions, structured schema, language, or writing style.
- **Email design** — Customize the HTML template, colors, buttons, product branding, release links, and footer.
- **Delivery rate** — Adjust the Wait node if your SMTP provider requires a different sending rate.
- **Notification channels** — Extend the workflow with Telegram, Slack, Discord, Microsoft Teams, push notifications, or another delivery channel.
- **Segmentation** — Filter subscribers by language, plan, product, environment, or release channel before entering the send loop.

## Additional Info

- The subscription webhook accepts an email address, normalizes it to lowercase, validates the format, and does not send another welcome email when the subscriber already exists.
- Release sending is deliberately protected by a hard validation step: the workflow will stop unless a valid release version is supplied and `SEND_EMAIL` is exactly `YES`.
- Multiple versions can be announced in the same execution, for example `7.15.1, 7.15.2, 7.15.3`.
- A manually supplied changelog takes precedence when matching release information is available; otherwise the workflow attempts to extract the requested version sections from the configured README.
- The OpenAI branch is optional. A deterministic release-email fallback is included so newsletter delivery does not depend entirely on successful AI generation.
- The default subscriber query returns every row in the Data Table. If you add unsubscribe handling, update this node to filter only active subscribers.
- The template contains example product names, domains, release URLs, sender addresses, and legal text. Replace all placeholders before production use.
- For real mailing lists, review applicable privacy, consent, unsubscribe, and email-marketing requirements before collecting or contacting subscribers.
