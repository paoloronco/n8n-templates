# 🔔 Amazon Luna – New Games Notification Module  
### Complete Guide to Notifications, Rate Limiting, and Multi-Provider Setup

This document explains how the notification system works and how to connect Discord, Telegram, Email, Webhooks, and more.

---

## 1. 🎯 Purpose

After parsing the updated game list, the workflow identifies newly added titles and sends automated notifications through any provider.

Supported services:

- Discord  
- Telegram  
- Email  
- Slack / Teams  
- WhatsApp Cloud API  
- Pushbullet / Matrix  
- REST Webhooks  

---

## 2. 🧠 Detecting New Games

1. Load existing rows from Google Sheets.  
2. Compare each item by **ASIN** or **Title**.  
3. If not present:

```
isNew = true
```

4. Forward item to notifications.

Guarantees no duplicates and accurate detection.

---

## 3. 🔄 Loop + Wait (Anti–Rate Limit)

To avoid platform throttling:

### ✔️ Loop Over Items  
Sends messages one-by-one.

### ✔️ Wait  
Adds 1–5s delay.

Prevents 429 errors, failed messages, and temporary bans.

---

## 4. 💬 Message Content

Include:

- Title  
- Genres  
- Release year  
- Optional cover  
- Optional product link  

**Discord example:**

```
New Amazon Luna game available!
Title: {{ $json.title }}
Genres: {{ $json.genres }}
Year: {{ $json.releaseYear }}
```

---

## 5. 🖼️ Image Attachments

Workflow supports:

- Discord file uploads  
- Telegram photos  
- Slack/Teams image URLs  
- Email Base64 images  

Process:

1. HTTP Request → download image  
2. Pass binary to notification node  

---

## 6. 🟣 Discord Bot Setup

1. Create bot → https://discord.com/developers/applications  
2. Add Bot  
3. Enable Message Content Intent  
4. Invite bot via OAuth2  
5. Configure: Token, Guild ID, Channel ID  

---

## 7. 🔗 Discord Webhook (Recommended)

Simplest option:

```
POST <webhook_url>
{
  "content": "New Amazon Luna game: {{ $json.title }}"
}
```

No bot, no intents, ultra reliable.

---

## 8. 📱 Telegram Notifications

```
POST https://api.telegram.org/bot<BOT_TOKEN>/sendMessage
{
  "chat_id": "<CHAT_ID>",
  "text": "New Luna game: {{ $json.title }}"
}
```

Supports `/sendPhoto`.

---

## 9. 📧 Email Notifications

Use SMTP or services like:

- SendGrid  
- Mailgun  
- AWS SES  

---

## 10. 🧪 Debugging

| Problem | Solution |
|--------|----------|
| Bot silent | Wrong token/permissions |
| Webhook fails | Invalid URL or bad JSON |
| Rate-limits | Increase Wait |
| No images | Provider requires HTTPS |
| Missing alerts | Check Sheet matching & isNew logic |

---

## 11. 🛠️ Optional Filters

You may notify only specific games:

- Genres  
- ReleaseYear >= 2020  
- Publishers  
- Title keywords  

Add an IF node before notifications.

---

## 12. ⚠️ Notes

- Respect rate limits  
- Avoid spam  
- Test with one message before full rollout  
