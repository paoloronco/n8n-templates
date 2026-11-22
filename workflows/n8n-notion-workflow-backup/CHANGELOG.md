# Changes

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
