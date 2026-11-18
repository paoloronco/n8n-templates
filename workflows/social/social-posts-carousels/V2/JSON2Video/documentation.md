← [Social Posts & Carousels — Local Worker or Cloud](https://paoloronco.notion.site/41af0ba27c3281e7a8c3c9434b6efbbe)

V2 uses cloud rendering and a required native n8n sub-workflow. These are inactive templates: generation and publication are disabled. The retained copies are not production deployments.

## 1. Choose one provider

| Provider folder | Rendering and output | Voice / availability |
| --- | --- | --- |
| Creatomate | Creatomate RenderScript, 24 fps; 1080 × 1350 (4:5) | Music is embedded; no generated narration; API credit required |
| Shotstack | Native n8n Shotstack node; Sandbox, watermark, 24 fps; 1080 × 1350 (4:5) | Existing music; no paid speech generation required |
| JSON2Video | HTML scenes, 25 fps; 1080 × 1350 (4:5) | Existing music; 600 initial non-renewing credits, non-commercial evaluation |

Posts remain musical MP4 assets: a single post is 16.5 seconds; a carousel is four independent 5.5-second videos. They are not a set of static JPEG-only posts.

## 2. Files and import order

Package location: open the V2 directory inside the downloaded family ZIP. Choose <code>Creatomate</code>, <code>Shotstack</code> or <code>JSON2Video</code>. Each folder contains the main workflow JSON, <code>Runtime.json</code> and <code>README.md</code>; the V2-level <code>manifest.json</code> records the distributed file sizes and SHA-256 hashes.

The local template archive and GitHub now use the same anonymous distribution without owner credentials, destination account IDs or runtime bindings. Public sanitized copies are now available in [the GitHub V2 provider folders](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/social-posts-carousels/V2): each contains workflow.json, Runtime.json, `README.md` and `documentation.md`. Owner credentials, destination IDs and runtime bindings are removed; configure them before execution. V1 remains available under [V1](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/social-posts-carousels/V1), with its local-worker JSON and neutral worker source and a complete local-worker setup guide.

1. Import <code>Runtime.json</code> first, keeping it inactive.
2. Import the selected Instagram Posts JSON, also inactive.
3. Open every native <code>Execute Sub-workflow</code> node in the main workflow and select the imported runtime. A new installation may assign a different ID; do not leave references to an unavailable owner workflow.
4. Import each required runtime once. Creatomate and HeyGen share a runtime implementation; Shotstack and JSON2Video share another. Compare SHA-256 hashes before reusing a byte-identical copy, then explicitly select its new installation ID in each caller.
5. The runtime uses native n8n Data Tables and bundled assets. No Social Studio worker, SSH helper, Python, FFmpeg, local Kokoro or local HyperFrames installation is required.
6. Install <code>@shotstack/n8n-nodes-shotstack</code> if the selected shared runtime has unknown Shotstack nodes. Resolve unknown-node errors in your own installation before testing any branch.
7. Configure credentials, then follow journal setup and preview below. Do not execute the complete graph merely to check imports.

## 3. Credentials and public URLs

| Credential | Configuration |
| --- | --- |
| OpenAI API | Select on <code>Write specific English copy</code> and <code>Independent editorial review</code>. These V2 nodes are native OpenAI Text / Message a Model using Responses API. Keep <code>Simplify Output</code> off and preserve the complete response/usage mapping. |
| Facebook Graph API OAuth2 API | Select the intended Meta credential on the Graph API node. Confirm the configured Instagram professional account, relevant Meta permissions and account/login product. Copy the callback URL shown by n8n into the matching Meta app configuration. |
| Inbound Header Auth | Protect <code>Authenticated test trigger</code> with its own secret. Do not reuse a renderer API key as a webhook secret. |
| Renderer | Configure the selected provider as described below. Secrets belong in n8n credentials, never Notion or Code nodes. |

In <code>Apply cloud configuration</code>, set <code>publicN8nBaseUrl</code> to your public HTTPS origin, without a webhook path. Set <code>instagramAccountId</code>, <code>instagramUsername</code> to your own destinations. Do not retain the owner's account values in a new installation.

Preserve the provider/family-specific mediaPath identity and match its webhook route. Keep assetPath and previewPath matched to their webhooks. Arbitrary media-path renaming also requires changing the runtime identity validator. Signed asset delivery, previews and Meta access require externally reachable HTTPS routes. The renderer must be able to download the requested music, source files or uploaded composition; private container addresses are not public asset URLs.

Keep studio secrets, signed links and execution data private. Configure binary-size/proxy limits and execution retention for actual media sizes. The native workflow checks hashes and MP4 metadata; preview inspection is still necessary.

## 4. Initialize the journal without generation

In <code>Apply cloud configuration</code>, start with:

```json
{
  "manualAction": "setup",
  "generationEnabled": false,
  "publishingEnabled": false
}
```

These are existing fields to edit in the node's config object, not a replacement for the full object. Preserve its other required settings.

1. Select the correct runtime and configure its Data Table access.
2. Set <code>jobsTable</code> to the intended journal. Creatomate/HeyGen default: <code>social_studio_cloud</code>; Shotstack: <code>social_studio_shotstack_templates</code>; JSON2Video: <code>social_studio_json2video_templates</code>.
3. Run only the main workflow's manual setup action once. It initializes or reuses the journal and generates signing material; it does not call OpenAI or render a video.
4. Verify the setup receipt before selecting <code>manualAction: "reserve"</code>. Keep generation and publication off until the future preview test is deliberately authorized.
5. Initialize your own journal once. Do not reset a journal to clear errors or render counters.

The sub-workflow setup was tested while inactive on n8n 2.47.5. If another n8n version requires publication for sub-workflow invocation, configure a separate working installation according to that version's rules. Rendering also needs the parent asset/media webhook routes to be registered; a manual editor test alone does not make those routes continuously available.

## 5. Creatomate configuration

1. Open Creatomate's developer/API settings and obtain a project API key with render credit.
2. Create Header Auth: header <code>Authorization</code>, value <code>Bearer <your API key></code>; select it on the Creatomate nodes in the Creatomate/HeyGen runtime.
3. This variant sends a complete RenderScript composition to the render API. It does not require a manually created Creatomate template ID.
4. It builds the neutral sample scenes in Creatomate, using the selected campaign, demo branding, music and 4:5 dimensions. It is not certified pixel-identical to the local HyperFrames output.
5. Keep signed n8n asset URLs reachable. The bundled font/music derivatives are already prepared; a local converter is not needed after import.
6. The default <code>maxCloudRenders</code> is 4: one four-part carousel, or up to four single rendering requests. This counter is not a monthly allowance.

Official references: [Create a render](https://creatomate.com/docs/api/reference/create-a-render), [RenderScript element properties](https://creatomate.com/docs/api/render-script/element-properties).

## 6. Shotstack Sandbox configuration

1. Install the native Shotstack node if needed; create/select a Shotstack credential with environment <b>Sandbox</b>. The distribution has no selected credentials: choose your own Sandbox credential. Do not select Production as a substitute.
2. Keep <code>renderer: "shotstack"</code> and the provider-specific journal/routes. The API node selects the Sandbox endpoint from the credential.
3. Sandbox rendering is free with a watermark but requires at least one credit available. The advertised 10 initial credits expire after 30 days; account offers and terms must be checked when signing up.
4. The workflow renders the neutral musical 4:5 sample scenes. It does not call a voice-generation API.
5. Shotstack HTML5 blocks external images and fonts. The runtime unpacks ready-made WebP/font derivatives and embeds them as data URIs via deduplicated merge fields, enforcing a 450 kB request cap. Do not change these back to remote image URLs: that produced videos with missing images.
6. Sandbox variants block social publication even when the generic publishing flag is changed. They are evaluation templates; changing to a paid production credential alone is not a supported publishing conversion.

Official references: [pricing](https://shotstack.io/pricing/), [API keys and Sandbox](https://shotstack.io/docs/guide/getting-started/request-api-keys/), [HTML5 limitations](https://shotstack.io/docs/guide/architecting-an-application/html5/).

## 7. JSON2Video configuration

1. Create a JSON2Video API account and obtain its API key.
2. Create Header Auth with header name <code>x-api-key</code>; select it on <b>Read JSON2Video movie</b>, <b>Render with JSON2Video</b> and <b>Refresh JSON2Video original</b> in the provider runtime. The distribution has no selected JSON2Video credential.
3. Keep <code>renderer: "json2video"</code>, its dedicated table and routes. The runtime checks actual remaining quota before the first render.
4. The free allowance is 600 initial, non-renewing credits (about ten minutes), not 600 monthly credits. Free use is for personal, educational and non-commercial evaluation; a watermark may apply. It allows up to 1080p and 60 seconds.
5. Keep <code>minimumRemainingCredits: 120</code>. The preflight also reserves an estimated 17 seconds for a single post or 24 for a carousel; it stops before POST if the verified remaining quota is insufficient. These checks do not cover separate OpenAI billing.
6. The single has three scenes; a carousel has four separately rendered musical videos. Use the service's actual 25 fps output.
7. Leave <code>commercialUseConfirmed: false</code> for evaluation. Social publication remains blocked until a suitable commercial entitlement is obtained, verified and deliberately configured. That flag does not grant a license.

Official references: [free-plan limits](https://json2video.com/docs/v2/reference/credits/plans), [credit consumption](https://json2video.com/docs/v2/reference/credits/credit-consumption), [movie specification](https://json2video.com/docs/v2/reference/json-syntax/movie).

## 8. First future preview and publication

The retained templates remain inactive. Perform the following only in a separately configured working copy when API spend is intended:

1. Disable its schedule during the first manual preview and verify the production webhook URLs, credentials, account identity and budget.
2. Set <code>manualAction: "reserve"</code> and <code>generationEnabled: true</code>, leaving <code>publishingEnabled: false</code>. A preview can still consume OpenAI and renderer credit.
3. Register the working copy's required HTTPS webhook routes before a render that fetches assets. Resolve n8n routing, proxy-size and authentication errors without exposing the internal credential manager.
4. Generate one approved job. Inspect its private preview, MP4, cover and caption; verify all four carousel parts, ordering, music and caption.
5. Only a provider/plan with the required publishing rights may proceed. Confirm platform credentials and consciously enable the publication gate for that working copy. Sandbox/evaluation gates stay in force.
6. The authenticated test entry forces <code>previewOnly</code>; generic trigger labels are not authorization. <code>dryRun</code> does not publish.
7. Re-enable only the intended schedule after results and recovery behavior are checked. Editing this documentation does not activate n8n or authorize a paid test.

The default OpenAI budget is USD 3/month. Renderer counters are separate, cumulative local limits: 4 for each Posts variant. They are not a provider billing cap or monthly free tier.

## 9. Troubleshooting and recovery

| Symptom | Check / response |
| --- | --- |
| Sub-workflow not found | Select the imported Runtime ID in every Execute Sub-workflow node; check caller policy and n8n version. |
| Unknown node | Install the required verified community package or use the correct runtime; do not delete routing nodes to suppress the warning. |
| Missing credential / 401 / 403 | Provider-specific header, correct credential environment, account access, quota and selected social account. Never insert keys into Code nodes. |
| Asset 404 / cannot download | Registered production webhook path, public HTTPS origin, signature/expiry and proxy limits. |
| Shotstack image/font missing | Embedded asset build and merge fields; external resources inside HTML5 are blocked. |
| JSON2Video quota refused | Read the real remaining quota and preserve the reserve; do not bypass the guard to empty the allowance. |
| Pending or uncertain POST | Retain job ID, render/container/video ID and checkpoint. Reconcile the existing provider request before retrying. |
| Media expired | Refresh the same render's original URL; hashes must still match. Do not silently substitute another video. |
| Journal conflict | Stop the next API action and inspect competing executions. Do not erase claims or reset storage to continue. |

The journal records render state, claims, original hashes and platform receipts. It has bounded retained jobs and needs deliberate maintenance. An n8n timeout does not prove a cloud job was cancelled.

## 10. What was actually verified

Status at 2026-11-18:

- All six parent templates and both supporting runtimes are archived and inactive; generation and publication flags are false. The two live production originals were not modified. Final server definitions were downloaded and compared.
- 106 offline checks passed, including 50 checks against the actual saved public exports. An export-initialization defect affecting the cloud-original URL validator was fixed in both template runtimes and verified in native n8n. Public file hashes are recorded in the GitHub manifests; [verification scope](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/social-posts-carousels/V2/verification.md) lists the untested paid/live paths.
- Creatomate/HeyGen: 31 offline migration checks plus 7 consolidated-graph checks. No paid render, generated voice or end-to-end social test was run because credits were unavailable.
- Shotstack/JSON2Video: 18 offline checks, including complete simulated render states and all 30 campaigns. Native n8n journal setup, object inputs, disabled-generation gates and ZIP/unpack/embedded-asset construction were tested.
- Shotstack: actual Sandbox Post 1080 × 1350, 5.5 s, and Reel 1080 × 1920, 34.792 s; both H.264/AAC, 24 fps. Native/downloaded hashes match; full media decode and visual frame checks passed. Existing audio replaced speech in the Reel test to avoid TTS charges.
- JSON2Video: no real API run; credentials were absent. Shotstack speech, OpenAI generation and social publishing were not exercised.
- Actual outputs depend on the chosen renderer; a metadata pass alone does not certify typography, intelligibility or platform acceptance.

Free renderer credits do not include OpenAI usage. These checks support technical review; they are not a claim that every provider and live publication path has passed an end-to-end deployment test.

## Neutral branding revision

The downloadable template packages use the fictional Example brand and [example.com](http://example.com). Logos and sample illustrations are neutral in both PNG and WebP versions. Prompt text, captions, narrated invitations, end cards, tags, notes and journal names are anonymized together. Replace this demo with your own verified brand facts and assets before public use.

Use a fresh journal/database and output directory for a new brand. Previously stored jobs and generated media retain their original content and are not part of the downloadable template distribution. The revision was checked offline; historical Sandbox video tests predate this artwork. No new provider rendering, paid API call or social publication was performed for anonymization.


## This provider and current sample

Selected provider: **JSON2Video**. 25 fps; initial evaluation quota, not a recurring monthly free allowance. Commercial rights require the appropriate plan. Import only this provider folder. The sample uses newly authored grayscale cards, generic font and new procedural audio, without owner production screenshots, media or palette. Replace the fictional facts and sample branding with your own verified content.

[Provider documentation](https://paoloronco.notion.site/41cf0ba27c3281a89696c3c0585159af) · [Version selection](../../README.md)
