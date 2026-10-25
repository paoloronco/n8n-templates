# WordPress AI Chatbot Plugin

Install the plugin ZIP through WordPress Admin → Plugins → Add New → Upload Plugin. Activate it and open the WP AI Chatbot settings page. Enter your n8n production webhook URL and Header Auth values, then add `[wp_ai_chatbot]` to a page.

The widget sends messages to the WordPress REST endpoint `/wp-json/wpaicb/v1/chat`. WordPress forwards the request to n8n server-side. Customize `assets/wpaicb.css` and `assets/wpaicb.js` for appearance and rendering.

The `GET /wp-json/wpaicb/v1/health` route checks plugin availability.
