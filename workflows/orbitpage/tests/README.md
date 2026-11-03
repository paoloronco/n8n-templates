# OrbitPage template checks

Run `node workflows/orbitpage/tests/check.mjs` from the repository root with Node.js 20 or newer. No dependencies or credentials are needed. Checks read the actual distributed workflow JSON, verify shared guards/graph integrity and exercise strict input, ownership, timestamp, revision, SMTP receipt, evidence and exact AI-preview validation. They do not call external services. These local checks do not repeat authenticated acceptance runs.
