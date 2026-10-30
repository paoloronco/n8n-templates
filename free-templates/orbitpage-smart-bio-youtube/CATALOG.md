# Catalog listing copy

This is ready-to-use listing copy, not confirmation of submission or catalog
approval. Import [the workflow JSON](./OrbitPage_Smart_Bio_YouTube.json) and see
[the technical guide](./GUIDE.md) for the complete requirements and test procedure.

## Title

Add new YouTube videos to OrbitPage with automatic or email-approved publishing

## Description

Keep your creator page up to date whenever you publish a new public YouTube
video. This workflow adds a native OrbitPage video card with a cover and Play
button, without a YouTube API key, Google Cloud project, YouTube OAuth or an AI
subscription.

### Who is this for?

Creators, educators, podcasters and professionals who want their public page to
follow their YouTube channel without copying each new video into it manually.

### How it works

The workflow checks the public channel feed every 15 minutes. Its first normal
run records existing videos without importing them. A persistent n8n Data Table
is created automatically and records what has already been processed.

Choose one of two modes in **Configuration**:

- **AUTOMATIC:** add the new video and publish it immediately.
- **EMAIL_APPROVAL:** save a private draft and email the reviewer two buttons:
  **Approva e pubblica** (approve and publish) and **Rifiuta** (decline).

Approval checks that the exact proposed card and page revision are unchanged.
Decline or timeout discards only the unchanged proposal. Other unpublished work
or concurrent edits stop the operation for review. Repeated checks do not create
another card or email for a registered video.

Cards use OrbitPage's responsive YouTube preset. Title and description above the
player are optional and hidden by default. The cover and privacy-enhanced player
respect the page's experience consent. Existing page blocks are preserved.
After publishing, the workflow checks publication metadata and the public HTML.

### Setup

Install `n8n-nodes-orbitpage` 0.3.2 or newer, connect your hosted OrbitPage
workspace, and enter the channel's `UC…` ID. Select your preferred publishing
mode. For email approval, connect SMTP and set the sender and reviewer address.
Run once to establish the baseline, then publish the workflow.

An optional manual replay lets you test a recent existing video without uploading
a new one. The guide covers approval, rejection and duplicate checks.

### Requirements and limits

Use n8n 2.x with Data Tables and an OrbitPage API supporting private block drafts
(`publish=0`). The cover presentation requires renderer 4.21.162 or newer. The
workflow checks draft support before saving an approval proposal.

No YouTube or AI API charges are introduced. Normal n8n and SMTP quotas still
apply; 15-minute polling means 96 scheduled checks per day. The feed is a recent
public-video window, not a complete archive. Videos must permit embedding, and
external consent platforms must be configured for the YouTube widget.

## Suggested demonstration

1. Establish the baseline: no old video is imported.
2. Replay one existing recent video in email-approval mode.
3. Show the private proposal and unchanged public page.
4. Approve from the email; open the new cover and play the video.
5. Repeat the replay: no second card or email.

Use your own authorized test channel and workspace. Keep real credentials,
approval URLs and private execution data out of the recording and export.
