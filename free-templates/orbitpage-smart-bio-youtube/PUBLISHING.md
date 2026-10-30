# Smart Bio YouTube publishing package

The public template uses the Template Publishing Assistant's documentation format and its actual layout engine. The engine is executed locally by `publishing.mjs`; the Assistant's SMTP, Notion and paid API branches are not executed. The section plan is grounded in the existing executable graph. The final sections are packed into three reading rows, with approval and rejection in separate lanes.

## Delivery files

- [Workflow JSON](./OrbitPage_Smart_Bio_YouTube.json): 41 executable nodes, one orange README note and ten neutral section notes. Imported workflows are inactive, with no credential bindings or pinned data.
- [README](./README.md): concise English quick overview, behavior, setup, requirements and customization; the exact same text is included in the orange note, with absolute documentation links that also work from n8n.
- [Technical guide](./GUIDE.md): full configuration reference, replay procedure, consent setup, costs, privacy and operational limits.
- [Gumroad delivery](./gumroad-delivery.md) and [listing](./gumroad-listing.md): editable English publishing copy with real download and guide links.
- [n8n catalog copy](./CATALOG.md): description and demonstration outline; this file does not mean the template has been submitted or approved.
- [Square thumbnail](./assets/thumbnail.png) and [landscape cover](./assets/cover.png): coordinated promotional illustrations, generated with Imagegen using the Assistant's white/pale-blue, navy and electric-blue visual brief. They are not screenshots.
- [Canvas preview](./assets/workflow-canvas.png): screenshot of the imported public template in the real n8n editor; the preview is unpublished and has not been executed.
- [Sticky-note text](./sticky-notes.md) and [layout report](./layout-report.json): readable annotations and verified frame/node geometry, section membership and graph fingerprint.

## Verification and maintenance

Run `node publishing.mjs` from this directory to regenerate the presentation, note text, report and workflow JSON. It uses the checked-in Template Publishing Assistant engine in the adjacent template directory and records the engine fingerprint. Run `node --test smart-bio.test.mjs` to check behavior and portability. Run `node workflow.mjs` to refresh only the workflow JSON from the saved presentation.

The presentation pass verifies that every executable node belongs to exactly one section, all section descriptions are under fifty words, frames and executable nodes do not overlap, nodes fit below their section text, and executable IDs, names, parameters and connections are preserved. Compared with the previous public export, only presentation and placeholder credential bindings changed; credentials must be selected after import. A separate unpublished import was used for visual inspection. The owner's active Smart Bio workflow was not edited or re-executed for this publishing revision.

Images are maintained separately from `publishing.mjs`. After changing the README or section plan, repeat the real n8n visual check and refresh the canvas screenshot. Publishing copy and images are ready for review; no Gumroad product change or n8n marketplace submission is performed by these scripts.
