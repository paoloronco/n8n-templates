# Configure Google Cloud inventory

## Google access

Create or select the identities and credentials you want to use. Store authentication material in n8n credentials. The workflow JSON contains no credential bindings.

For the Google service-account credential, enable HTTP Request use and configure the OAuth scopes `https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets`. Select the credential in every Google HTTP Request node. Different Google identities may be used for inventory, BigQuery and Sheets if their access covers the relevant operations.

Enable the APIs in the appropriate target and quota projects before running. OAuth scopes do not grant IAM permissions or share spreadsheet files.

| Integration | Access and setup |
| --- | --- |
| Cloud Asset Inventory | Enable Cloud Asset API. Grant resource and visible IAM-policy search permissions on every scanned project. V3 also lists resource assets. |
| Service Usage | Enable Service Usage API. Grant enabled-service list access on scanned projects and service-use access on quota projects. |
| BigQuery | Enable BigQuery API. Grant jobs creation in `billingProject` and read/write/create-table access in the reporting dataset. Match the configured dataset location. |
| Google Sheets | Enable Sheets API. Copy the dashboard model into your own Drive and share your copy as Editor with the credential identity. Service accounts may edit shared sheets even when they cannot create spreadsheet files. |

## Dashboard

[Make your own copy of the public synthetic dashboard model](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy). The link is a public setup asset, not the author's operational inventory. Set `sheetId` to your copy.

Keep the five base tabs: Dashboard, Inventory, Findings, Changes and Scans. Keep row-one headers and hidden identifiers unchanged on populated sheets. Review state is matched by stable resource/finding identifiers. V3 adds Enabled APIs, Technical resources and Coverage if missing. Importing the workflow does not create or share a spreadsheet.

## Configuration

| Setting | Meaning |
| --- | --- |
| `billingProject`, `dataset`, `location` | Central BigQuery reporting project, dataset ID and location. |
| `scope`, `scopes` | Project access configuration; see the version-specific section. |
| `sheetId` | Spreadsheet ID of your editable dashboard copy. |
| `n8nBaseUrl` | Your n8n instance base URL, including `https://` or `http://`. Execution links are built from this setting. |
| `sendEmail` | Defaults to `false`. Set to `true` only after configuring SMTP and destinations. |
| `emailTo`, `emailFrom` | Valid destination/sender addresses; required by validation even while email is off. The exported examples use `example.com`. |
| `requiredLabels`, `labelAssetTypes`, `allowedLocations` | Governance checks to apply to the inventory. |
| `pageSize`, `maxPages`, `maxAssets`, `maxPayloadMiB`, `batchBytes` | Pagination, inventory and payload bounds. Incomplete discovery stops the run. |
| `maxBytesBilled`, `reportChangeLimit` | BigQuery billed-byte limit as a digits-only string, and report history view limit. |
| `ignoreMetadataFields` | Fields excluded recursively when comparing metadata. Changing this setting changes the compatible baseline profile. |
| `runRegistryTable` | n8n Data Table name for run and delivery tracking. |

Connect SMTP to Email digest if used. Email contains the full inventory CSV plus a filtered `resource-changes.csv`. The subject, body counts and filtered CSV use the same event selection. Full BigQuery/Sheets history and `changes.csv` retain all events.

Routine backup, execution, build and version records and confirmed `SYSTEM_MANAGED` service-account key rotations do not trigger email. User-managed keys, unknown key metadata and unknown resource types remain alertable. Baselines and metadata-only changes stay silent. `notifyEveryRun` is retained for compatibility but does not override this delivery policy.

## Manual validation and scheduling

Import into an empty workflow. Select credentials, fill Configuration, and run manually twice. Confirm the first complete snapshot becomes the baseline, the next scan compares it, Sheets updates, review notes persist, and Report files contains HTML and all CSV exports. Configure your workflow timezone and an Error Workflow before enabling the schedule. Keep one scheduled writer per dataset/profile/spreadsheet combination.

Only complete compatible snapshots are compared. IAM visibility is reported separately from resource coverage. Findings require review and do not establish a complete security assessment. Existing table schemas are not automatically migrated. The workflow reads resource metadata and IAM policies, writes inventory/reporting data, and does not remediate IAM or delete resources.

To upgrade, back up your configured workflow and dashboard. Preserve your own configuration, credential selections, registry, dataset and schedule, and apply the revised operational nodes and canvas deliberately. The templates are inactive and contain configuration examples that must be replaced before execution.

## V3: accessible-project discovery and native collectors

Create the reporting BigQuery dataset before running; this version checks it and creates missing inventory tables inside it. It does not create a missing dataset. The four table names remain `inventory_resources_v2`, `inventory_runs_v2`, `inventory_changes_v2` and `inventory_findings_v2` for schema compatibility.

`scopes` defaults to an empty array so Cloud Resource Manager determines accessible ACTIVE projects. To require known projects, provide explicit `scopes` and matching `expectedProjects` identities with a `projectId` and numeric Resource Manager `name`. These are discovery fallbacks, not a substitute for read access. Use `unreadableProjects` to describe acknowledged coverage gaps; do not fabricate project identities.

Set `projectDiscoveryQuota` and `identityQuotaProject` to quota-enabled project IDs. In addition to the common integrations, enable and grant the read permissions needed by Cloud Resource Manager, IAM service-account/key metadata, API Keys, Cloud Storage bucket metadata, BigQuery dataset/table metadata, Firestore database/backup/index/field metadata and Cloud Scheduler locations/jobs. No API-key strings or private key material are requested by the collectors.

Credential HTTP domain allowlist: `cloudresourcemanager.googleapis.com`, `cloudasset.googleapis.com`, `serviceusage.googleapis.com`, `iam.googleapis.com`, `apikeys.googleapis.com`, `storage.googleapis.com`, `bigquery.googleapis.com`, `firestore.googleapis.com`, `cloudscheduler.googleapis.com`, `sheets.googleapis.com`.

V3 preserves finding review statuses OPEN, ACCEPTED, RESOLVED and UNVERIFIED and keeps complete change history. It adds the Enabled APIs, Technical resources and Coverage dashboard tabs. Missing pagination or inaccessible required collectors fail the run rather than silently treating absent resources as removals.
