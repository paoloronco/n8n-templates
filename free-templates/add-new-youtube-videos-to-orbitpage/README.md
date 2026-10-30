# Add New YouTube Videos to OrbitPage

## Quick overview

Add new public YouTube videos to your OrbitPage as native video cards with a cover and Play button. Choose automatic publication or a private draft with email approval. Public feed polling needs no YouTube API key or AI service.

## How it works

1. Manual and scheduled checks share one configuration and a persistent n8n Data Table registry.
2. The workflow checks OrbitPage draft support, reads the channel feed and selects one unseen video, oldest first. The first normal run only records a baseline.
3. A registry claim prevents a pending video from generating another card or approval request.
4. Current blocks and publication revisions are checked before adding a native YouTube card; unrelated private changes stop processing.
5. `AUTOMATIC` publishes immediately; `EMAIL_APPROVAL` saves a private draft and emails signed approve/decline buttons.
6. Approval publishes only the unchanged reviewed card. Decline or timeout removes only the unchanged proposal; concurrent edits stop cleanup for review.
7. Publication metadata and public HTML are checked before recording success. No-work, baseline and declined paths finish without another email.

## Setup

1. Import [the workflow JSON](https://raw.githubusercontent.com/paoloronco/n8n-templates/main/free-templates/add-new-youtube-videos-to-orbitpage/Add_New_YouTube_Videos_to_OrbitPage.json) and install `n8n-nodes-orbitpage` 0.3.2 or newer.
2. Select the same OrbitPage credential on all OrbitPage nodes, including `Save video card`; keep tokens in n8n credentials.
3. In `Configuration`, set `YOUTUBE_CHANNEL_ID` to the channel's `UC…` ID, choose `MODE` and set a dedicated `REGISTRY_TABLE_NAME`.
4. For `EMAIL_APPROVAL`, select SMTP on `Email approval — Approva or Rifiuta` and set `FROM_EMAIL` and `APPROVAL_EMAIL` to authorized addresses.
5. Run `Manual check or replay` with `MANUAL_VIDEO_ID` empty to establish the baseline; confirm its result and registry.
6. To test without a new upload, replay a recent feed video using `MANUAL_VIDEO_ID`; check approve, decline and duplicate behavior with separate videos, then clear the field.
7. Confirm the page's YouTube consent configuration, inspect the public player, then publish the workflow to enable its schedule. Follow the [technical guide](https://github.com/paoloronco/n8n-templates/blob/8ac0080/free-templates/orbitpage-smart-bio-youtube/GUIDE.md) for the full test procedure.

## Requirements

- n8n 2.x with Data Tables, Send Email 2.1 and community nodes enabled; a hosted OrbitPage workspace.
- OrbitPage token scopes: `workspace:read`, `links:read`, `links:write`, `publication:read`, `publication:write`.
- Approval mode requires API support for `publish=0`; native cover presentation requires renderer 4.21.162 or newer.
- Email approval requires SMTP and a reachable n8n HTTPS address for the reviewer.
- Videos must be public, present in the recent channel feed and allow embedding; the page's consent provider must permit the YouTube widget.

## Customization

- Set `SHOW_TITLE` and `SHOW_DESCRIPTION` to display optional text; both default to false.
- Set `APPROVAL_TIMEOUT_HOURS` from 1 to 168; the default is 48.
- Change the Schedule Trigger's 15-minute interval to suit your upload frequency and n8n execution quota.
- Finish pending reviews before changing the channel, registry, workspace or mode. Keep revision checks and the private-draft capability check enabled.
