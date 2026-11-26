# Website Updates to Approved Instagram Videos — V3

## n8n publication and source versions

- [n8n #22955 — V3 · Creatomate](https://n8n.io/workflows/22955-create-and-publish-instagram-posts-with-openai-and-facebook-graph-api/): 84 nodes; exact V3 workflow-object match including notes and layout. The listing retains its original Facebook Graph API title. [Published release reference](https://github.com/paoloronco/n8n-templates/tree/main/catalog/n8n-published/22955).


V3 is published in the n8n library as [Create and publish Instagram posts with OpenAI and Facebook Graph API](https://n8n.io/workflows/22955-create-and-publish-instagram-posts-with-openai-and-facebook-graph-api/). The listing retains its original title; its downloadable workflow is the V3 Creatomate implementation.

Turn selected facts from a public product page, article or release note into a reviewed Instagram video or four-part video carousel. Creatomate renders in the cloud; an email contains the complete package for human approval. A native n8n Data Table records selected source revisions, progress and actual publication receipts.

This is an inactive template. Generation and publication start disabled, and the daily schedule node is disabled. No local worker, shared Runtime.json, community node, Python runtime or custom media webhook is required.

## What V3 adds

- A configured source URL and CSS selectors replace an opaque built-in campaign catalog. Only selected title/fact blocks enter the fingerprint; footer and navigation changes do not trigger a new job.
- An accessible editorial register shows source, revision, status, caption, render IDs and Instagram ID/permalink. Repeated revisions are skipped. An approved preview can be reused for publication without new AI or render requests.
- One expiring email decision covers all videos in order and the exact caption/destination. Rejected, expired or changed packages cannot publish.
- The cloud lifecycle and journal checkpoints are visible in one workflow rather than delegated to a companion service.

The existing two-stage editorial approach remains: grounded writing, independent review and at most one correction. The source page is not independently fact-checked; inspect the selected facts and the final media.

## Import and setup

1. Import [workflow.json](./workflow.json) into a new **inactive** workflow, in your template/test area. Do not replace an existing production workflow or reuse its journal.
2. Open **Configure V3 only**. Choose a dedicated `jobsTable` name. Leave `action: "setup"`, `generationEnabled: false` and `publishingEnabled: false`.
3. Run the manual trigger once. Setup creates the table and initial ledger without OpenAI, Creatomate, SMTP or Meta requests. Never run setup concurrently; it preserves an existing ledger and does not reset budgets.
4. Select your own credentials:
   - OpenAI on **Write grounded social copy** and **Review facts and grammar**.
   - Header Auth on the three Creatomate HTTP nodes: header `Authorization`, value `Bearer YOUR_API_KEY`.
   - SMTP on **Approve or reject exact videos**.
   - Meta OAuth on **Verify authenticated Instagram destination** and **Execute exact Meta action**.
5. Configure source URL/selectors, brand, language, CTA, sender/approver addresses and output format. Replace example.com with a page you are authorized to use. See [configuration and operations](./documentation.md).
6. Enter current OpenAI input/output prices for the selected model. The initial zero values intentionally block generation until configured. Keep credentials in n8n, never in the configuration code.

## Deliberate preview

Set `action: "preview"` and `generationEnabled: true`; keep `publishingEnabled: false`. This mode **can spend OpenAI/Creatomate credit and sends one approval email**. It does not publish to Instagram. Inspect every rendered video, the ordering, text and optional music. Approving the email records `preview_approved`.

To publish that same approved preview later, use the same source/output settings with `action: "publish"` and `publishingEnabled: true`. Set the intended Instagram account ID/username and configure Meta OAuth. The workflow reuses the saved draft/render IDs and requests a fresh approval bound to that destination. `generationEnabled` may remain false for this reuse; a new source revision requires it to be true.

If starting directly in publish mode with a new source, generation must also be enabled. Publication still requires human approval. Scheduling is optional: enable only the schedule node and workflow you intend to operate after acceptance testing. SMTP approval links require a correctly configured, externally reachable n8n HTTPS URL; do not expose the n8n editor without authentication.

## Output

| Format | Video output | Instagram delivery |
| --- | --- | --- |
| `carousel` | Four ordered MP4 files, 1080 × 1350, 24 fps, 5.5 seconds each | Four video children, one carousel parent, one publication |
| `single` | One four-scene MP4, 1080 × 1350, 24 fps, 16.5 seconds | A single video using REELS with feed sharing |

The neutral layout uses text cards and optional owner-supplied image/music HTTPS URLs. It does not reproduce an owner's production branding or assets. It is not an avatar or narrated-video generator. Creatomate accepts RenderScript directly; no manually created Creatomate template ID is needed.

## Verification and limits

The shipped code, graph and lifecycle were tested with fixtures; a separate n8n test ran real HTML extraction and native Data Table compare-and-set operations. No paid model/render API, email or social publication was called for this release. This is **not a live end-to-end API certification**. Read [verification.md](./verification.md) for the precise tested scope and remaining acceptance checks.

One journal lock serializes this installation, including approval waits. Uncertain requests retain their lock and IDs for reconciliation. Local budget reservations and render-request counters are guards, not provider-enforced billing caps or free allowances. Provider render URLs are not permanent storage; download files you need to archive.

## Version selection

- [V2 — existing cloud provider variants](../V2/README.md), including [Creatomate](../V2/Creatomate/README.md). V2 requires its matching Runtime.json.
- **V3 — source-driven, single-workflow Creatomate path**, with an editorial register and human approval.
- [V1 — local worker](../V1/README.md).

Import one version into a separate installation. This package does not migrate or alter any live production workflow.

## Source and reproducibility

`src/core.js` contains the transformation functions embedded selectively in Code nodes. `build.py` regenerates workflow.json; it is a development tool, not a runtime dependency. `tests.mjs` runs offline with Node.js:

```sh
node --test tests.mjs
```

The [source fixture](./fixtures/source.html) demonstrates the expected selectors. Serve it on your own HTTPS site for a deliberate live-source test, or inspect it locally without any provider call.
