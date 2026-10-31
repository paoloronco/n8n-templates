=== WP AI Chatbot (n8n Webhook) ===
Contributors: custom
Tags: chatbot, n8n, webhook
Requires at least: 6.0
Tested up to: 6.5
Stable tag: 1.0.0
License: GPLv2 or later

== Description ==
Embeds a chatbot UI and securely proxies requests to an n8n webhook.

== Installation ==
1. Upload the plugin ZIP in WordPress Admin → Plugins → Add New → Upload Plugin.
2. Activate.
3. Go to Settings → WP AI Chatbot and configure:
   - n8n Webhook URL
   - Auth header name/value (optional but recommended)
4. Add shortcode to any page:
   [wp_ai_chatbot]

== Shortcode Attributes ==
- title: Header title
- height: Chat area height (px)
- hint: Small hint text
