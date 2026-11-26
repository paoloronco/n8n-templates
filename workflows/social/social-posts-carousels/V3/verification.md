# Verification scope

## n8n library publication

V3 is published as [Create and publish Instagram posts with OpenAI and Facebook Graph API](https://n8n.io/workflows/22955-create-and-publish-instagram-posts-with-openai-and-facebook-graph-api/), listing #22955. The public export from the [n8n template API](https://api.n8n.io/api/workflows/templates/22955) matches this repository's workflow object: 84 nodes, including all 77 operational nodes, seven sticky notes, positions, connections and settings. The listing title differs from the workflow's internal name.

This distribution check does not add live OpenAI, Creatomate, SMTP or Meta execution coverage; the recorded test scope below remains unchanged.

## Passed without paid service calls

- **36 offline tests** against the source functions and emitted workflow: graph reachability/references, embedded JavaScript syntax, inactive defaults/unbound credentials, source selection and revision fingerprint, missing/oversized facts, duplicate handling, approved-preview reuse, conservative budget reservation, stale-owner rejection, strict AI output handling, fact references, invented numeric claims, incomplete/refused AI output, one-correction limit, RenderScript dimensions/durations, render receipts/poll limits/failure states, approval hash/expiry/rejection, refreshed render identity, Meta destination identity, ordered child/parent publishing states, actual receipt requirements and terminal lock ownership.
- The emitted graph itself completes fixture-driven carousel preview with one correction, single-video publication, rejection/duplicate skip and publication of an existing approved carousel with generation disabled. Native provider nodes are replaced only by test adapters; no network sockets or credentials are used by this suite.
- **An isolated native n8n run** passed real HTML extraction over local sample HTML, execution of the V3 transformations against provider fixtures, creation of a dedicated test Data Table, conditional native row update and rejection of a stale competing update. The native update returned the claimed row; the stale update returned no matching row. The temporary helper was archived afterward. The neutral acceptance table contains only its fixture data.
- Every runtime credential selector is unbound. The distribution contains no owner account IDs, production endpoints, production media, local-worker calls, missing sub-workflow or pinned execution data. The owner's live workflow and local worker were not modified or executed.

## Deliberately not exercised

No live OpenAI request, Creatomate render, SMTP email or Meta publication was made. API spend was zero for the verification paths above. The native integration with each remote service, quota, permissions, real email approval/timeout/resume, provider retention and actual platform output still need acceptance testing in a separately configured installation.

No new sample video was generated. Metadata tests do not certify rendered typography, audio, media decoding or platform acceptance. The template remains inactive, generation/publication disabled and its schedule disabled. It is published as a configurable template with this verification scope, not as a fully exercised production deployment.

## Reproduce

```sh
node --test tests.mjs
```

Tests use synthetic Example-brand content and simulated service receipts. The optional Python builder regenerates workflow.json from src/core.js and node definitions; Python is not needed in the imported workflow.
