# Setup Home Assistant TTS

📖 **Full documentation:** [Notion](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-32ff0ba27c328073a168ff501c9cf33a)

This guide configures **Home Assistant** to announce orders aloud on a Google Home (or any Google Cast device) when n8n calls it.

---

## Architecture

```
n8n
  └─ Home Assistant node
       └─ Call script: annuncia_ordine
            └─ tts.speak → Google Translate TTS → Google Home
```

---

## Step 1 — Verify Google Cast Integration

1. Open Home Assistant: `http://homeassistant.local:8123`
2. Go to **Settings → Devices & Services → Integrations**
3. Find **Google Cast** (or search for it at `Settings → Integrations → + Add Integration → Google Cast`)
4. Confirm your Google Home devices are listed under the integration

> If devices are not showing, make sure your HA host and the Google Home devices are on the **same local network/VLAN**.

---

## Step 2 — Find Your Media Player Entity ID

You need the exact `entity_id` of your Google Home device.

1. Go to **Settings → Devices & Services → Google Cast → your device**
2. Or go to **Developer Tools → States** (`http://homeassistant.local:8123/developer-tools/state`)
3. Search for `media_player.` — find your device (e.g. `media_player.googlehome4105`)

> Write this value down — you will need it in the script.

---

## Step 3 — Create a Long-Lived Access Token

n8n needs a token to authenticate with the HA API.

1. Go to your HA profile: `http://homeassistant.local:8123/profile/general`
2. Scroll down to **Security → Long-lived access tokens**
3. Click **Create token**
4. Give it a name (e.g. `n8n`)
5. Copy the generated token immediately — it will not be shown again

---

## Step 4 — Test TTS from Developer Tools

Before creating the script, verify TTS works on your device.

1. Go to **Developer Tools → Actions** (`http://homeassistant.local:8123/developer-tools/action`)
2. Set:
   - **Action:** `tts.speak`
   - **Target entity:** your TTS engine (e.g. `tts.google_translate_en_com`)
   - **Media player entity:** your Google Home entity ID (e.g. `media_player.googlehome4105`)
   - **Message:** `Ciao, questo è un test`
   - **Language:** `it` (or `en` for English)
3. Click **Perform action**
4. You should hear the message on your Google Home

> If you get an error on `tts.google_translate_en_com`, check your available TTS integrations at **Settings → Integrations → search for TTS**. Common entity IDs: `tts.google_translate_en_com`, `tts.google_translate_it_com`.

---

## Step 5 — Create the `annuncia_ordine` Script

This script accepts a `message` variable from n8n and speaks it aloud.

1. Go to **Settings → Automations & Scenes → Scripts**
2. Click **+ Add script** → **Edit in YAML**
3. Paste the following:

```yaml
alias: annuncia_ordine
sequence:
  - action: tts.speak
    target:
      entity_id: tts.google_translate_en_com
    data:
      media_player_entity_id: media_player.YOUR_GOOGLE_HOME_ENTITY
      message: "{{ message }}"
      language: it
mode: single
```

> Replace `media_player.YOUR_GOOGLE_HOME_ENTITY` with your actual entity ID from Step 2.
> Replace `tts.google_translate_en_com` with your actual TTS entity ID if different.
> Change `language: it` to `en` if you want English announcements.

4. Click **Save script**
5. HA will assign the script the entity ID `script.annuncia_ordine`

### Test the script

1. Go back to **Developer Tools → Actions**
2. Set:
   - **Action:** `script.annuncia_ordine`
   - In the YAML editor, add:
     ```yaml
     variables:
       message: "Mario has ordered Pizza"
     ```
3. Click **Perform action**
4. You should hear the announcement

---

## Step 6 — Create the Home Assistant Credential in n8n

1. In n8n go to **Settings → Credentials → + Add credential**
2. Search for **Home Assistant**
3. Fill in:
   - **Host:** `http://homeassistant.local:8123` (or your HA IP)
   - **Access Token:** paste the Long-lived token from Step 3
4. Click **Save**

> Name it something clear, e.g. `Home Assistant - Local`.

---

## Step 7 — Configure the HA Node in n8n

Open the **Home Assistant TTS** node in the workflow and set:

| Field | Value |
|---|---|
| Credential | `Home Assistant - Local` |
| Resource | `Service` |
| Operation | `Call` |
| Domain | `script` |
| Service | `annuncia_ordine` |
| Service Attributes | see below |

**Service Attributes** (add one row):

| Name | Value |
|---|---|
| `message` | `={{ $('Webhook').item.json.body.nome + ' has ordered ' + $('Webhook').item.json.body.ordine[0].nome }}` |

> This will say e.g. **"Mario has ordered Pizza"** when Mario places an order.

---

## Customization

### Announce all ordered items

```javascript
={{ $('Webhook').item.json.body.nome + ' has ordered ' + $('Webhook').item.json.body.ordine.map(i => i.quantita + ' ' + i.nome).join(', ') }}
```

Example result: _"Mario has ordered 1 Pizza, 2 Beer"_

### Announce on multiple Google Home devices

Edit the HA script to target multiple entities:

```yaml
data:
  media_player_entity_id:
    - media_player.googlehome_kitchen
    - media_player.googlehome_bar
  message: "{{ message }}"
  language: it
```

### Set volume before speaking

```yaml
sequence:
  - action: media_player.volume_set
    target:
      entity_id: media_player.YOUR_GOOGLE_HOME_ENTITY
    data:
      volume_level: 0.7
  - action: tts.speak
    target:
      entity_id: tts.google_translate_en_com
    data:
      media_player_entity_id: media_player.YOUR_GOOGLE_HOME_ENTITY
      message: "{{ message }}"
      language: it
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Google Home not found in HA | Make sure HA and the device are on the same network. Restart the Google Cast integration. |
| `tts.google_translate_en_com` not found | Check available TTS entities at Developer Tools → States, search `tts.` |
| Script runs but no audio | Check media player volume. Check entity ID is correct. Test TTS directly from Developer Tools. |
| n8n returns 401 Unauthorized | The HA token has expired or was entered incorrectly — regenerate it and update the n8n credential. |
| n8n returns 404 Not Found | The script entity ID is wrong. Check HA assigns it as `script.annuncia_ordine` (Settings → Automations & Scenes → Scripts). |
