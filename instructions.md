Build the complete Super Admin Dashboard for Omnitrack.

IMPORTANT:
- The Super Admin is the administrator of the entire Omnitrack platform.
- This is NOT the same as a Business Owner, Manager, or Cashier.
- Do not modify or break the existing business dashboard/modules.
- Reuse the existing UI components, design system, authentication, API patterns, and architecture wherever possible.
- Do not create unnecessary charts or visualizations just to fill space.
- Prioritize useful information, fast navigation, and operational control.
- Keep the interface clean, modern, minimal, and professional.

==================================================
SUPER ADMIN SIDEBAR
==================================================

Create the following sidebar:

1. Dashboard
2. Businesses
3. Users
4. Licenses & Plans
5. Subscriptions
6. Devices
7. Synchronization
8. Support
9. Reports
10. Audit Logs
11. System Settings

At the bottom:

- Super Admin profile
- Account settings
- Logout

Use clear icons and active-state indicators.

==================================================
1. SUPER ADMIN DASHBOARD
==================================================

Create a platform overview dashboard.

Display useful summary cards:

- Total Businesses
- Active Businesses
- Suspended Businesses
- Trial Businesses
- Active Users
- Active Devices
- Active Licenses
- Businesses with Sync Problems

If subscription functionality already exists, also show:

- Monthly Recurring Revenue
- Active Subscriptions
- Past Due Subscriptions
- Cancelled Subscriptions

Do NOT fill the dashboard with unnecessary charts.

Include useful sections:

RECENT BUSINESSES
- Business name
- Business type
- Owner
- Plan
- Status
- Created date

SYSTEM ALERTS
Examples:
- Businesses that have not synchronized recently
- Expired licenses
- Failed synchronization
- Failed payments
- Unsupported application versions

RECENT ACTIVITY
- Recent Super Admin actions
- Business creation
- License changes
- Device revocations
- User changes

==================================================
2. BUSINESSES
==================================================

Create a complete business management page.

Features:

- Search
- Filter
- Sort
- Pagination
- Create business
- View business
- Edit business
- Suspend business
- Activate business
- Archive business

Business list should show:

- Business name
- Business type
- Owner
- Plan
- Status
- Number of users
- Number of devices
- Last sync
- Created date

Business statuses:

- Active
- Suspended
- Trial
- Archived

Do not permanently delete business data by default.

Use archive/deactivate behavior instead.

==================================================
BUSINESS DETAILS
==================================================

When the Super Admin opens a business, create a detailed business page.

Header:

- Business name
- Business type
- Status
- Plan
- Created date

Show:

- Owner
- Contact information
- User count
- Device count
- License status
- Subscription status
- Last synchronization
- Application versions

Create tabs:

Overview
Users
Devices
License
Subscription
Synchronization
Activity

Available actions:

- Edit business
- Suspend
- Activate
- Archive
- Change plan
- Manage license
- View sync status

Any sensitive action must require confirmation.

==================================================
3. USERS
==================================================

Create a platform user management page.

Features:

- Search users
- Filter by business
- Filter by role
- Filter by status
- View user
- Activate/deactivate account
- Force logout
- Reset access where appropriate

Display:

- Name
- Email
- Business
- Role
- Status
- Last login
- Created date

Do not expose sensitive credentials.

Super Admin actions must be logged.

==================================================
4. LICENSES & PLANS
==================================================

Integrate with the existing Omnitrack License Manager.

PLANS:

Allow Super Admin to:

- Create plan
- Edit plan
- Activate/deactivate plan

Plan properties can include:

- Name
- Price
- Billing interval
- Maximum users
- Maximum devices
- Enabled modules
- Data/storage limits
- Trial duration
- Status

LICENSES:

Allow:

- Issue license
- View license
- Renew
- Revoke
- Suspend
- Reactivate
- Change plan
- View activation count
- View assigned devices

Display:

- License
- Business
- Plan
- Status
- Issued date
- Expiration
- Activation count
- Maximum activations

Never display stored license secrets or hashes.

==================================================
5. SUBSCRIPTIONS
==================================================

Create subscription management.

Statuses:

- Trial
- Active
- Past Due
- Cancelled
- Expired
- Suspended

Display:

- Business
- Plan
- Billing interval
- Amount
- Status
- Start date
- Renewal date
- Cancellation date

Allow Super Admin to:

- View subscription
- Change plan
- Extend subscription
- Cancel/suspend subscription
- Reactivate subscription

Do not fake payment information if no payment provider is currently integrated.

Design the UI so a payment provider can be integrated later.

==================================================
6. DEVICES
==================================================

This is important because Omnitrack supports Electron/offline installations.

Display:

- Business
- Device name
- Device ID
- Platform
- Application version
- Status
- Last seen
- Last sync

Statuses:

- Active
- Offline
- Revoked

Actions:

- View device
- Rename device
- Revoke device
- Reactivate device
- View activity

When revoking a device, require confirmation.

==================================================
7. SYNCHRONIZATION
==================================================

Create a synchronization monitoring page.

Display:

- Business
- Device
- Last successful sync
- Pending changes
- Failed changes
- Sync status
- Last error

Statuses:

- Synced
- Syncing
- Pending
- Failed
- Offline

Provide:

- Search
- Filters
- Business filter
- Device filter
- Status filter

Business sync details should show:

- Last successful sync
- Pending records
- Failed records
- Recent sync attempts
- Error messages

Allow:

- Retry failed synchronization
- View synchronization logs

Do NOT create a dangerous "overwrite everything" operation.

Synchronization must respect the existing sync/conflict architecture.

==================================================
8. SUPPORT
==================================================

Create a basic support/ticket management section.

Display:

- Ticket ID
- Business
- User
- Subject
- Status
- Priority
- Created date
- Updated date

Statuses:

- Open
- In Progress
- Waiting
- Resolved
- Closed

Priorities:

- Low
- Medium
- High
- Critical

Allow Super Admin to:

- View ticket
- Update status
- Change priority
- Add internal notes
- Add response
- Assign support status

Keep this simple for now.

==================================================
9. REPORTS
==================================================

Reports should focus on the Omnitrack platform itself.

Do NOT show individual business financial data unless the existing authorization model explicitly allows it.

Useful reports:

BUSINESS GROWTH
- Total businesses
- New businesses
- Active businesses
- Suspended businesses
- Archived businesses

SUBSCRIPTIONS
- Active subscriptions
- New subscriptions
- Cancelled subscriptions
- Revenue by plan

USAGE
- Active users
- Active devices
- Daily/weekly active businesses
- Most-used modules

SYSTEM HEALTH
- Sync failures
- API failures
- Offline devices
- License activation failures

Use charts only where they genuinely help understand trends.

==================================================
10. AUDIT LOGS
==================================================

Create an append-only audit log viewer.

Display:

- Timestamp
- Super Admin/user
- Action
- Business
- Resource
- Result
- IP/device information if already available
- Metadata

Examples:

- BUSINESS_CREATED
- BUSINESS_UPDATED
- BUSINESS_SUSPENDED
- BUSINESS_ARCHIVED
- LICENSE_ISSUED
- LICENSE_REVOKED
- LICENSE_RENEWED
- PLAN_CHANGED
- DEVICE_REVOKED
- USER_DEACTIVATED
- ADMIN_LOGIN
- SYNC_RETRY
- SETTINGS_CHANGED

Features:

- Search
- Date filter
- Business filter
- Admin filter
- Action filter
- Pagination

Audit logs should not be editable from the dashboard.

==================================================
11. SYSTEM SETTINGS
==================================================

Create platform-level settings.

Sections:

GENERAL
- Platform name
- Support email
- Default timezone
- Default currency

LICENSING
- Default trial duration
- License policies
- Device limits

APPLICATION
- Minimum supported app version
- Latest recommended version
- Maintenance mode

SYNCHRONIZATION
- Sync configuration
- Grace period settings
- Sync monitoring configuration

SECURITY
- Session settings
- Admin security settings

Do not expose:

- Database passwords
- Private signing keys
- JWT secrets
- API secrets

Sensitive environment configuration must remain server-side.

Every important settings change must create an audit log.

==================================================
SUPER ADMIN SECURITY
==================================================

The Super Admin has platform-wide privileges.

Implement:

- Protected routes
- Authentication checks
- Authorization checks
- Session expiration
- Logout
- Confirmation for destructive actions
- Audit logging for sensitive operations

Never rely only on frontend route protection.

Every Super Admin API endpoint must validate authorization on the backend.

Do not allow a normal business user to access Super Admin endpoints by modifying frontend requests.

==================================================
UI/UX REQUIREMENTS
==================================================

The dashboard should feel like a professional SaaS administration console.

Use:

- Clean sidebar
- Responsive layout
- Consistent spacing
- Tables for management data
- Cards for key metrics
- Status badges
- Confirmation dialogs
- Toast notifications
- Loading states
- Empty states
- Error states
- Skeleton loading where appropriate

Avoid:

- Excessive charts
- Decorative statistics
- Huge empty dashboards
- Unnecessary animations
- Overcomplicated workflows

The goal is:

"Super Admin can understand the health of Omnitrack and manage businesses quickly."

==================================================
IMPORTANT ARCHITECTURE RULE
==================================================

Before implementing anything:

1. Inspect the existing backend.
2. Inspect the existing Super Admin authentication.
3. Inspect the existing License Manager.
4. Inspect the existing business/user models.
5. Inspect the existing synchronization system.
6. Inspect the existing frontend components.
7. Reuse existing APIs/models/components where possible.

Do not duplicate existing functionality.

If an API or database model is missing, identify exactly what needs to be added before implementing it.

Do not create fake/mock data in production code.

==================================================
FINAL ACCEPTANCE CRITERIA
==================================================

The Super Admin must be able to:

✓ View platform health
✓ Create businesses
✓ Edit businesses
✓ Suspend/activate/archive businesses
✓ View business details
✓ Manage users
✓ Manage plans
✓ Manage licenses
✓ Manage subscriptions
✓ View/manage devices
✓ Monitor synchronization
✓ View support issues
✓ View platform reports
✓ View audit logs
✓ Manage platform settings

All sensitive operations must be authorized server-side and recorded in the audit log.

Build this incrementally and test each module before moving to the next one.