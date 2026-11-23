# Changes

## V4 — unified backup and setup

- Fold catalog provisioning into the main backup workflow. Import one workflow instead of configuring a setup companion.
- Create or adopt a catalog with 17 managed properties, including published endpoint URL, method and authentication metadata.
- Preserve original sticky-note text in an appendix and update managed README blocks in place, protecting personal content.
- Derive published endpoint metadata during the existing source read, removing the separate ingress scan.
- Support a manual setup-only operation and compatible aliases for existing catalog properties.
- Preserve the owner's final node positions, sticky-note dimensions and colors in the distribution JSON.
- Exclude account destinations, credential bindings, private workflow identities and the owner's documentation link from the importable template.
- Verify the unified runtime with 54 automated checks and recorded real-account backup, repeat and restore checks; the final canvas refinement changes geometry only.


## V3

- Added a reusable setup sub-workflow that provisions the catalog page, inline database, 14 typed properties and restore guide.
- Added safe reuse and additive schema upgrades for existing compatible catalogs.
- Added node count, tags, activation/archive flags, export size/hash and last saved backup timestamp.
- Made cached verification detect edited catalog metadata.
- Matched timestamp verification to Notion's minute precision and implemented the configured secret-blocking policy.
- Preserved the owner's existing canvas positions, node IDs and sticky notes in the main template; added a separate setup band.
- Retained complete JSON download verification, personal-note preservation, paced requests and failure reporting.

Earlier revisions remain available in the repository history.

## Revised canvas and documentation

- Group configuration, catalog setup, API dispatch and attachment verification horizontally.
- Put failure reporting and optional notifications in a separate band.
- Fit concise notes to the reviewed canvas and document the required setup companion.
- Remove credential bindings, local webhook identities and instance metadata from distribution files. Runtime logic remains unchanged.
