# Validation · 3 November 2026

Acceptance ran in n8n against an authenticated OrbitPage workspace using the installed community integration and existing SMTP transport.

- Event: real before/during/after subpage publications at the same URL; same-phase replay produced no write. Native SVG QR decoded to the exact stable URL.
- Campaign: real private save, full read-back, exact revision publication, public verification and SMTP package delivery; duplicate input produced no second publication; rejection and expiry produced no public write. Native SVG QR decoded to the exact UTM URL.
- Analytics: real low-traffic report and SMTP acceptance; a separate sufficient-traffic fixture exercised actual AI allowance, server preview, exact one-title commit, publication and complete draft/public read-back.
- Native Data Tables: conditional claim, rejection of a stale claimant, exact ownership verification and release passed for each journal.
- Event and campaign pages were checked on desktop and a 390×844 CSS viewport without horizontal overflow.
- All temporary page content was removed and the original page content was compared after restoration. Journals were reset for first use.

Approval decisions in the isolated QA copies were controlled fixtures. The distributed workflows retain real SMTP send-and-wait nodes. The sufficient-traffic input was synthetic; no traffic increase or conversion uplift is claimed. This was a functional acceptance run, not a distributed load test. Verify your own credential, inbound approval URL, sender and plan before activation.

The dependency-free [checks](../tests/README.md) test the actual distributed Code source, input/ownership/revision/AI guards and graph integrity. Artwork is reused from the initial design edition; the executable JSON and current README describe this release.

## Final publishing review

The public canvas contains only operational paths; the isolated development example branch was removed. Setup, review, verification and recovery notes were rewritten for importers. Node ids/positions, sticky-note geometry, operational node parameters, business code and connections between operational nodes were compared with the authenticated acceptance version and preserved. The portable export checks pass 68 assertions, including graph integrity, absence of private identifiers and disabled/orphan nodes, and input/revision/ownership/AI guards. Failed execution retention is enabled for private troubleshooting; successful executions remain unretained. These packaging and diagnostic settings do not change provider operations and did not require another public-page mutation.
