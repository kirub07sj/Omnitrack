Build the OFFLINE-FIRST SYNCHRONIZATION SYSTEM for our Restaurant Management System.

IMPORTANT ARCHITECTURE:

The restaurant operates primarily on a LOCAL PostgreSQL database.

Multiple devices inside the restaurant connect through the local network/Wi-Fi to the local backend/server.

The cloud system uses:

- Cloud Backend API
- Neon PostgreSQL

The frontend/devices MUST NOT connect directly to Neon.

The architecture is:

CLIENT DEVICES
    ↓
LOCAL BACKEND
    ↓
LOCAL POSTGRESQL
    ↕
SYNC ENGINE
    ↕
CLOUD BACKEND API
    ↓
NEON POSTGRESQL

The local system must continue operating when the internet is unavailable.

==================================================
PRIMARY REQUIREMENT
==================================================

Build synchronization so that:

1. All normal restaurant operations happen locally.
2. Changes are saved to local PostgreSQL first.
3. Changes are placed into a local sync/change queue.
4. When internet is available, the sync engine uploads changes to the cloud.
5. Cloud changes that need to be downloaded are pulled into the local database.
6. Failed synchronization attempts are retried automatically.
7. The application never blocks normal restaurant operations because the internet is unavailable.
8. Synchronization must be idempotent so the same change cannot create duplicate records.
9. Do not expose Neon credentials to frontend clients.

==================================================
DATABASE / SYNC METADATA
==================================================

Inspect the existing PostgreSQL schema before making changes.

Do not duplicate existing business models.

Create a synchronization/change-log mechanism.

Suggested table:

sync_changes

Fields:

id
entity_type
entity_id
operation
device_id
installation_id
created_at
processed_at
status
retry_count
last_error

Suggested operations:

CREATE
UPDATE
DELETE

Suggested statuses:

PENDING
SYNCING
SYNCED
FAILED

Use UUIDs where the existing system already uses UUIDs.

Do not blindly add sync_status columns to every business table if a centralized change log is more appropriate.

==================================================
INSTALLATION ID
==================================================

Every deployed restaurant installation must have a unique installation ID.

Example:

INSTALLATION-xxxxxxxx

This identifies one restaurant installation.

Every device should also have a unique device ID.

Example:

SERVER-xxxxxxxx
CASHIER-xxxxxxxx
WAITER-xxxxxxxx
KITCHEN-xxxxxxxx

Do not use usernames as device IDs.

Store installation/device identity securely.

==================================================
LOCAL-FIRST WRITE FLOW
==================================================

Every business operation must follow:

User action
    ↓
Local backend
    ↓
Local PostgreSQL transaction
    ↓
Business data saved
    ↓
Sync change recorded
    ↓
Response returned immediately

The cloud must NOT be required for the operation to succeed.

Example:

Waiter creates order

1. Create order locally.
2. Create order items locally.
3. Commit database transaction.
4. Create sync change.
5. Return success to waiter.
6. Sync engine later sends the change to the cloud.

If the internet is unavailable, steps 1-5 still succeed.

==================================================
SYNC ENGINE
==================================================

Create a dedicated synchronization service.

Responsibilities:

- Detect internet/cloud availability.
- Read pending sync changes.
- Send changes to cloud API.
- Process acknowledgements.
- Mark successful changes as SYNCED.
- Retry failed changes.
- Use exponential backoff.
- Prevent duplicate processing.
- Record errors.
- Pull remote changes when required.
- Update local database safely.

Do not run unlimited retry loops.

Suggested retry delays:

5 seconds
15 seconds
30 seconds
1 minute
5 minutes
15 minutes

Adapt this to the existing application architecture.

==================================================
CLOUD API
==================================================

Create a secure cloud synchronization API.

The local system should communicate with:

Cloud Backend
    ↓
Neon PostgreSQL

Do NOT allow clients to connect directly to Neon.

Create appropriate endpoints such as:

POST /sync/push
POST /sync/pull

or adapt to the existing backend architecture.

The API must authenticate the restaurant installation/device.

Do not use the user's normal login password as synchronization credentials.

==================================================
IDEMPOTENCY
==================================================

This is critical.

Every synchronization event must have a unique identifier.

If the local system sends the same event twice because of a timeout:

The cloud must recognize that the event was already processed.

Example:

Change ID:
CHANGE-123

First request:
processed successfully.

Second request:
return already processed / success.

Never create duplicate:

- Orders
- Sales
- Expenses
- Transactions
- Products
- Inventory movements
- Employees
- Purchases

==================================================
CONFLICT HANDLING
==================================================

The restaurant's local server is the primary operational source for devices inside the same restaurant.

Multiple local devices should NOT synchronize independently with the cloud.

Instead:

Waiter
Cashier
Kitchen
Manager
    ↓
LOCAL SERVER
    ↓
LOCAL DATABASE
    ↓
CLOUD SYNC

This minimizes conflicts.

For cloud/local conflicts, create a deterministic conflict strategy.

Do not silently overwrite important financial records.

For conflicts involving:

Sales
Transactions
Expenses
Purchases
Inventory movements

log the conflict and preserve the original records.

Do not delete financial history automatically.

==================================================
SOFT DELETES
==================================================

Do not physically delete synchronized business records where doing so could break references or financial history.

Use soft deletion where appropriate:

deleted_at

Synchronization must propagate deletions correctly.

==================================================
FINANCIAL DATA
==================================================

Financial records require special handling.

Do not synchronize financial operations by simply replacing rows.

Sales, transactions, expenses, purchases and inventory movements should be treated as historical events.

Never silently overwrite financial history.

==================================================
OFFLINE OPERATION
==================================================

The restaurant must continue working without internet.

Offline functionality includes:

- Orders
- Sales
- Tables
- Kitchen
- Inventory
- Purchases
- Expenses
- Transactions
- Employees
- Reports

Do not disable modules because the internet is unavailable.

==================================================
SYNC STATUS UI
==================================================

Add a small global synchronization indicator to the application header.

Possible states:

ONLINE + SYNCED
ONLINE + SYNCING
OFFLINE
PENDING SYNC
SYNC ERROR

Examples:

🟢 Synced

🟡 Syncing...

🔴 Offline
24 changes waiting

⚠ Sync issue
3 changes failed

Do not make this indicator intrusive.

==================================================
SETTINGS → SYNCHRONIZATION
==================================================

Create:

Settings
    ↓
Synchronization

Display:

Connection:
Online / Offline

Sync status:
Synced / Syncing / Pending / Error

Last successful sync:
Date and time

Pending changes:
Number

Failed changes:
Number

Installation ID:
Masked/read-only

Device ID:
Masked/read-only

Provide:

[ Sync Now ]

The Sync Now button should manually trigger a sync attempt.

Normal synchronization must happen automatically.

==================================================
SYNC DETAILS
==================================================

Allow the owner/authorized manager to inspect synchronization problems.

Example:

Sync Issues

Order #1042
Failed
Reason: temporary server error
Retrying automatically

Expense #EXP-104
Failed
Reason: network timeout

Do not expose technical stack traces to normal users.

Provide a user-friendly message.

==================================================
CLOUD DATABASE: NEON
==================================================

Prepare the cloud backend for Neon PostgreSQL.

Use an environment variable such as:

DATABASE_URL

The Neon connection string must exist ONLY on the cloud backend/server.

Never expose:

DATABASE_URL
Neon password
Neon credentials

to React/frontend code.

Use SSL as required by Neon.

Create proper database migrations so the Neon database can be created from the existing schema.

Do not manually create random tables in Neon that differ from the application's schema.

==================================================
ENVIRONMENTS
==================================================

Support:

Development
Local
Production

Example environment variables:

LOCAL_DATABASE_URL
CLOUD_API_URL
SYNC_ENABLED
INSTALLATION_ID

Cloud backend:

DATABASE_URL
JWT_SECRET
etc.

Do not commit secrets.

Update .env.example with placeholders only.

==================================================
PERFORMANCE
==================================================

Do not continuously poll the cloud every second.

Use a reasonable sync interval.

Also trigger synchronization when:

- Internet becomes available
- Application starts
- Significant local changes are queued
- User presses Sync Now

Use batching where appropriate.

Example:

Instead of:

1 change → 1 HTTP request

prefer:

50 pending changes → 1 sync batch

when appropriate.

==================================================
SECURITY
==================================================

Never trust client-provided installation IDs or device identities without validation.

Authenticate sync requests.

Validate:

- Installation
- Device
- Request signature/token
- Change IDs
- Entity IDs
- Payloads

Rate-limit cloud synchronization endpoints.

Do not allow one restaurant installation to access another restaurant's data.

Every cloud query must be scoped to the correct business/tenant.

==================================================
MULTI-TENANCY
==================================================

The cloud database will eventually contain multiple restaurant businesses.

Every cloud business record must be associated with the correct business/tenant.

Example:

business_id

Never allow:

Business A
    ↓
access
    ↓
Business B data

This is critical.

==================================================
BACKUP
==================================================

Do not treat synchronization as the same thing as backup.

Synchronization keeps cloud/local data aligned.

Backups are a separate concern.

Design the system so cloud database backups can be configured independently.

==================================================
IMPLEMENTATION RULES
==================================================

Before implementation:

1. Inspect the existing database schema.
2. Inspect authentication.
3. Inspect business/tenant relationships.
4. Inspect all major modules.
5. Inspect existing API architecture.
6. Determine whether local PostgreSQL is already configured.
7. Determine the current backend entry point.
8. Reuse existing database utilities.
9. Do not rewrite working modules unnecessarily.
10. Do not introduce a second ORM/database abstraction without a reason.
11. Do not break offline functionality.
12. Do not replace existing business logic.

Build synchronization incrementally.

First implement:

1. Installation/device identity
2. Sync change log
3. Local change recording
4. Cloud authentication
5. Push synchronization
6. Idempotency
7. Retry system
8. Pull synchronization
9. Conflict handling
10. Sync status UI
11. Settings synchronization page
12. Error handling
13. Production configuration

Test each stage before moving to the next.

==================================================
ACCEPTANCE TESTS
==================================================

Test:

1. Create order while online.
2. Confirm local database receives it.
3. Confirm cloud receives it.
4. Disconnect internet.
5. Create several orders.
6. Confirm they work normally.
7. Confirm changes become pending.
8. Reconnect internet.
9. Confirm automatic synchronization.
10. Confirm no duplicate orders.
11. Repeat with sales.
12. Repeat with expenses.
13. Repeat with inventory.
14. Repeat with transactions.
15. Simulate failed cloud requests.
16. Confirm retry behavior.
17. Simulate duplicate sync request.
18. Confirm idempotency.
19. Test multiple devices through local network.
20. Confirm one restaurant cannot access another restaurant's cloud data.

The final result must feel invisible to normal users.

The system should simply work whether the restaurant is online or offline.