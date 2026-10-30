# OrbitPage Smart Bio — New YouTube Videos to Your Page

Add new public YouTube videos to an OrbitPage as native, responsive YouTube
players with a cover and Play button. Choose immediate automatic publication or a private draft followed by
email approval. No YouTube API key, Google Cloud project, OAuth connection to
YouTube, or AI provider is required.

## Download and requirements

- [Importable workflow JSON](./OrbitPage_Smart_Bio_YouTube.json)
- n8n 2.x with Data Tables, Send Email 2.1, and community nodes available.
- `n8n-nodes-orbitpage` 0.3.2 or newer and a hosted OrbitPage workspace.
- An OrbitPage API that advertises `publish=0` on `PUT /links` for approval mode.
  The workflow checks the public OpenAPI before saving an approval draft.
- OrbitPage scopes: `workspace:read`, `links:read`, `links:write`,
  `publication:read`, and `publication:write`. The credential connection test
  needs `workspace:read` even though normal processing uses the other scopes.
- For email approval: an SMTP credential and a sender authorized by that provider.
- A reachable n8n HTTPS URL for the native signed approval links. If the instance
  is behind an access gateway, the approver must be able to authenticate there.

The cover-and-player presentation is available in the shared OrbitPage renderer from
4.21.162. Older renderers may show an additional YouTube heading.

## What happens

1. A schedule checks the channel's public Atom feed every 15 minutes.
2. A native n8n Data Table is created or reused as the persistent registry.
3. The first normal run records the current feed as a baseline, without adding
   old videos or emailing approval requests for them.
4. Subsequent runs select one unseen video, oldest first, and claim it in the
   registry. Only one outstanding video is processed per channel.
5. **AUTOMATIC:** the video is added to the public page immediately.
6. **EMAIL_APPROVAL:** the video is saved as an inactive draft using `publish=0`.
   The existing public page is unchanged. An email offers **Approva e pubblica**
   (approve and publish) and **Rifiuta** (decline).
7. Approval rechecks the exact draft revision and proposed card, then activates
   and publishes it. Other edits made while waiting cause a safe stop.
8. Decline or timeout removes only the unchanged proposed card and republishes
   the prior content. If the draft changed, cleanup stops for manual review.
9. Successful publication is checked against OrbitPage's publication metadata
   and the expected card ID and video ID in the public HTML.

The card uses OrbitPage's YouTube connected-service preset, a responsive 16:9
cover and an on-click player on `youtube-nocookie.com`, behind the page's
preferences/experience consent gate. The thumbnail is also gated. Title
and description above the player are optional and disabled by default.

If the page uses an external consent platform with automatic iframe blocking,
declare the YouTube privacy-enhanced video widget there and enable its Experience purpose (3 for iubenda) or the equivalent required
consent purpose. Otherwise that platform may suppress the iframe even after
OrbitPage permits it. This workflow does not disable provider consent checks.

## Setup

1. Import the JSON into n8n.
2. Select the same OrbitPage credential on every OrbitPage node, including
   **Save video card**, which uses the node's supported custom API operation.
3. Open **Configuration** and enter the channel ID beginning with `UC`.
   YouTube Studio's channel URL contains this ID; a handle such as `@creator`
   or a video URL is not the channel ID.
4. Choose `MODE`: `EMAIL_APPROVAL` (default) or `AUTOMATIC`.
5. For email approval, select your SMTP credential on the email node and set
   `FROM_EMAIL` and `APPROVAL_EMAIL` to one sender and one reviewer address.
6. Choose a dedicated `REGISTRY_TABLE_NAME` for this workflow and workspace.
   No table ID or separate database credential is needed.
7. Run **Manual check or replay** with an empty `MANUAL_VIDEO_ID` to establish
   the baseline. Check the Result output and table.
8. Publish the workflow to enable its schedule.

Use a dedicated token rather than broad account credentials. Store it only in
n8n credentials. Do not put secrets in Configuration or export files.

## Configuration

| Field | Meaning |
| --- | --- |
| `YOUTUBE_CHANNEL_ID` | The public channel's `UC…` ID. |
| `MODE` | `AUTOMATIC` or `EMAIL_APPROVAL`. |
| `REGISTRY_TABLE_NAME` | Unique registry name in the workflow's n8n project. |
| `FROM_EMAIL` | SMTP-authorized sender, used only in approval mode. |
| `APPROVAL_EMAIL` | One reviewer's mailbox. |
| `SHOW_TITLE` | Show the video title above the player; default false. |
| `SHOW_DESCRIPTION` | Show the feed description above the player; default false. |
| `APPROVAL_TIMEOUT_HOURS` | 1–168 hours; default 48. |
| `MANUAL_VIDEO_ID` | Optional recent public video to replay from the manual trigger. Ignored by the schedule. Clear it after testing. |

Changing the mode governs future videos. Finish pending approvals or reconcile
their records before changing registry, channel, or workspace. Schedule frequency
is configured on the Schedule Trigger itself.

## Test without uploading a new video

1. Establish the baseline with the manual trigger and no replay ID.
2. Choose a recent public video currently included in the channel's feed.
3. Set `MANUAL_VIDEO_ID` to its 11-character ID and run the manual trigger.
4. In approval mode, confirm the draft exists in the editor while the public
   page is unchanged. Decline first: the proposed card should be discarded.
5. Select a different recent video and test approval. Confirm the native player
   on the live page, on desktop and mobile, after the required consent.
6. Repeat the same video: a registered video should produce no second card or
   approval request. Test automatic mode with another recent video if needed.
7. Clear the replay ID and leave the desired mode selected before publishing.

The registered declined/expired video is deliberately not retried. To repeat a
controlled test, inspect the page and execution first, then remove only that
test video's registry row. Never clear the entire table to fix one video.

## Reliability and limits

- The feed is a recent-video window, not a complete historical archive. A long
  outage or more uploads than fit in that window can cause missed videos.
  Private and unlisted videos are not imported. Public premieres or live videos
  may appear before normal playback is available.
- Registry states are `baseline`, `processing`, `pending`, `publishing`,
  `published`, `declined`, and `expired`. A held or uncertain record is not
  silently retried. Review failed executions and the current card before retrying.
- Do not run overlapping manual replays or reset the registry during a run.
  Revision checks prevent stale page writes; no external email system can promise
  exactly-once delivery after an uncertain transport outcome.
- Existing blocks are preserved; cards are prepended with a deterministic
  `smartbio-VIDEO_ID` ID. No automatic deletion of older published videos occurs.
- Unrelated unpublished changes block staging. Any revision change during email
  review blocks publication/cleanup. This avoids publishing private work that the
  reviewer did not see. Review and resolve the draft manually after a conflict.
- The dedicated block write defaults to immediate publication. Approval mode
  explicitly requests `publish=0`; it must not run against an older API that
  ignores the option. Do not remove the capability check.
- Approval links are signed, sensitive links handled by n8n. Do not forward them
  or expose waiting execution data. No apply endpoint is exposed by this template.
- Public HTML verification is a smoke check, not a playback guarantee. The video
  must allow embedding, and YouTube age, region or account restrictions still apply.
- Optional content stays behind the existing page consent settings. The workflow
  uses the optional preferences/experience category; it never marks the player as necessary.

## Costs and data

No paid YouTube or AI API is used. Your n8n hosting/execution and SMTP provider
may have their normal costs or quotas. The workflow does not upload video files
to OrbitPage storage.

The registry contains public video metadata and processing state. Execution data
can include the complete editable page, private drafts, email addresses and
signed approval state. Successful scheduled executions are not saved by default;
failed and manual executions remain available for diagnosis. Apply your n8n
retention and access policy and protect the SMTP and OrbitPage credentials.

## Source and validation

The checked-in JSON is generated from [workflow.mjs](./workflow.mjs); pure logic
is in [smart-bio.mjs](./smart-bio.mjs). To regenerate and test with Node.js:

```sh
node workflow.mjs
node --test smart-bio.test.mjs
```

Live deployment evidence and private instance details are not part of the public
template. Verify the imported workflow with your own workspace before enabling it.

References: [OrbitPage node operations](https://github.com/paoloronco/n8n-nodes-orbitpage/blob/main/docs/OPERATIONS.md),
[YouTube feed format](https://developers.google.com/youtube/data/guides/push_notifications),
[OrbitPage API specification](https://orbitpage.com/api/openapi.json).
