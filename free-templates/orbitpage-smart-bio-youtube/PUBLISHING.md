# Smart Bio YouTube publishing package

The importable workflow JSON is the authoritative owner-approved n8n export. The owner manually arranged its nodes and sticky notes; their IDs, order, positions, dimensions, colors, text, parameters and connections must be preserved. The earlier automatic layout is superseded. The Template Publishing Assistant supplied the original documentation format, but its layout engine is no longer run for this template.

## Delivery files

- [Workflow JSON](./OrbitPage_Smart_Bio_YouTube.json): 41 executable nodes, one orange README note and ten neutral section notes. Imported workflows are inactive, with no credential bindings or pinned data.
- [README](./README.md): concise English quick overview, behavior, setup, requirements and customization; the exact same text is included in the orange note, with absolute documentation links that also work from n8n.
- [Technical guide](./GUIDE.md): full configuration reference, replay procedure, consent setup, costs, privacy and operational limits.
- [Gumroad delivery](./gumroad-delivery.md) and [listing](./gumroad-listing.md): editable English publishing copy with real download and guide links.
- [n8n catalog copy](./CATALOG.md): description and demonstration outline; this file does not mean the template has been submitted or approved.
- [Square thumbnail](./assets/thumbnail.png) and [landscape cover](./assets/cover.png): coordinated promotional illustrations, generated with Imagegen using the Assistant's white/pale-blue, navy and electric-blue visual brief. They are not screenshots.
- [Canvas preview](./assets/workflow-canvas.png): screenshot of the owner's definitive layout in the real n8n editor; its node IDs and coordinates were compared with the approved export. The preview remains unpublished.
- [Sticky-note text](./sticky-notes.md), [presentation snapshot](./presentation.json) and [layout report](./layout-report.json): the existing annotations and coordinates, section membership and export fingerprint. These are documentation snapshots, not alternate layout sources.

## Verification and maintenance

Run `node publishing.mjs` from this directory to verify the approved export and refresh only the presentation, note text and report snapshots. It does not write the workflow JSON or alter the canvas. Run `node --test smart-bio.test.mjs` to check behavior and portability. `node workflow.mjs` reads the authoritative JSON and reports its node count without rewriting any file.

The final public export preserves the owner's executable node IDs and all node coordinates, note parameters and connections. Private credential bindings, the email node's instance webhook ID and top-level instance metadata were removed; the public product title replaces the preview label. n8n's exported parameter defaults and workflow settings are retained. Credentials must be selected after import. The owner's active Smart Bio workflow was not edited or re-executed for this publication.

For future changes, edit the workflow in n8n and review its exported JSON. Sanitize instance bindings before replacing the authoritative file, then refresh the snapshots and screenshot. The behavior helpers in `smart-bio.mjs` support focused tests; edits to that file are not automatically injected into the approved Code nodes. Preserve intentional manual layout changes instead of running an automatic tidy-up.

Images are maintained separately from `publishing.mjs`. After changing the workflow, repeat the real n8n visual check and refresh the canvas screenshot. Keep the overview note and README consistent through explicit edits. Publishing copy and images are ready for review; no Gumroad product change or n8n marketplace submission is performed by these scripts.
