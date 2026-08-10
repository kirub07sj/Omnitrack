Build the complete Settings module for our offline-first Restaurant ERP.

IMPORTANT:
Before writing code, inspect the existing project and understand the current architecture, database schema, modules, shared components, authentication, authorization, and state management.

Existing modules include:

- Dashboard
- Employees
- Products
- Suppliers
- Inventory
- Orders
- Tables
- Kitchen
- Sales
- Expenses
- Transactions

Do NOT redesign or rewrite existing modules.

The Settings module must configure existing system behavior through centralized settings. Every setting implemented must actually be consumed by the relevant module.

==================================================
SETTINGS STRUCTURE
==================================================

Create:

Settings
├── Business
├── Payments
├── Orders
├── Inventory
├── Taxes & Charges
├── Receipts
└── System

Do NOT implement Users & Roles inside this task.
Roles and permissions will be implemented separately.

==================================================
1. BUSINESS SETTINGS
==================================================

Create a Business Settings page.

Fields:

- Business name
- Owner name
- Phone
- Email
- Address
- Logo
- Currency

Example:

Business Information

Business Name
[ Restaurant Name ]

Owner Name
[ Owner Name ]

Phone
[ +251... ]

Email
[ email@example.com ]

Address
[ Address ]

Currency
[ ETB ]

Logo
[ Upload Logo ]

[ Save Changes ]

Requirements:

- Business name is required.
- Currency is required.
- Validate email format.
- Validate phone where appropriate.
- Store uploaded logo according to the existing file/storage architecture.
- Business information must be available to receipts and reports.
- Do not hard-code business information anywhere else in the application.

==================================================
2. PAYMENT SETTINGS
==================================================

Create configurable payment methods.

Default methods:

- Cash
- Mobile Banking
- Card
- Bank Transfer

Allow the owner to enable/disable payment methods.

Example:

Payment Methods

☑ Cash
☑ Mobile Banking
☑ Card
☐ Bank Transfer

[ + Add Payment Method ]

Each payment method should support:

- Name
- Status: enabled/disabled
- Optional description
- Optional provider
- Optional account information
- Display order

Do NOT hard-code specific Ethiopian payment providers.

The system must support custom payment methods.

Example:

Mobile Banking
Provider: [ Telebirr ]
Account Name: [ Restaurant ]
Account Number: [ ... ]

IMPORTANT:

The Sales checkout must only display payment methods that are currently enabled.

If a payment method is disabled:

- It must disappear from checkout.
- Existing historical transactions using that method must remain unchanged.

Do NOT delete historical payment methods or transaction records simply because a payment method was disabled.

==================================================
3. ORDER SETTINGS
==================================================

Create Order Settings.

Settings:

- Order number format
- Default order status
- Allow order cancellation
- Require cancellation reason
- Allow order modification
- Optional order notes

Example:

Order Settings

Order Number Format
[ ORD-{YYYY}-{####} ]

Default Order Status
[ Pending ]

☑ Allow Order Cancellation

☑ Require Cancellation Reason

☑ Allow Order Modification

[ Save Changes ]

IMPORTANT:

Do not bypass the existing Orders workflow.

Settings should modify existing behavior rather than create a second order system.

Cancellation reason should be required when enabled.

==================================================
4. INVENTORY SETTINGS
==================================================

Create Inventory Settings.

Settings:

- Low stock alerts
- Default low stock threshold
- Allow negative stock
- Inventory costing method
- Require supplier for purchases
- Optional stock adjustment settings

Example:

Inventory Settings

☑ Low Stock Alerts

Default Low Stock Threshold
[ 10 ]

☐ Allow Negative Stock

Costing Method
[ Weighted Average ]

☑ Require Supplier for Purchases

[ Save Changes ]

IMPORTANT:

The costing method must integrate with the existing inventory implementation.

Do not create a second inventory calculation system.

If the current application already implements weighted average costing, preserve it.

If a setting is not currently supported by the existing inventory architecture, implement it cleanly rather than creating duplicated logic.

==================================================
5. TAXES & CHARGES
==================================================

Create Taxes & Charges settings.

Support:

- Tax enabled/disabled
- Tax name
- Tax rate
- Service charge enabled/disabled
- Service charge rate

Example:

Taxes & Charges

☑ Enable Tax

Tax Name
[ VAT ]

Tax Rate
[ 15 ] %

☐ Enable Service Charge

Service Charge Rate
[ 10 ] %

[ Save Changes ]

IMPORTANT:

Sales must automatically use these settings when calculating new sales.

Do not make cashiers manually calculate tax/service charges.

Historical sales must NOT change when the owner changes tax settings.

Example:

A sale created when VAT = 15% must continue showing 15% even if the owner later changes the setting to 10%.

Store the applicable rates on the sale/order transaction itself.

Prevent invalid values:

- Tax rate cannot be negative.
- Service charge cannot be negative.
- Prevent unreasonable values according to existing validation rules.

==================================================
6. RECEIPT SETTINGS
==================================================

Create Receipt Settings.

Allow configuration of:

- Show business name
- Show logo
- Show address
- Show phone
- Show cashier
- Show table number
- Show order number
- Footer message
- Paper size

Example:

Receipt Settings

☑ Show Business Name
☑ Show Logo
☑ Show Address
☑ Show Phone
☑ Show Cashier
☑ Show Table Number
☑ Show Order Number

Footer Message
[ Thank you for visiting us! ]

Paper Size
[ 80mm ]

[ Preview Receipt ]

[ Save Changes ]

Requirements:

- Create a receipt preview using current settings.
- Sales receipt generation must consume these settings.
- Do not duplicate receipt configuration inside Sales.
- Historical receipts should preserve transaction data even if receipt settings later change.

==================================================
7. SYSTEM SETTINGS
==================================================

Create System Settings.

Settings:

- Language
- Date format
- Time zone
- Auto backup
- Backup frequency
- Sync status
- License status

Example:

System

Language
[ English ]

Date Format
[ DD/MM/YYYY ]

Time Zone
[ Africa/Addis_Ababa ]

☑ Auto Backup

Backup Frequency
[ Daily ]

--------------------------------

Synchronization

Status:
● Online

Last Sync:
10:42 PM

Pending Sync:
12 records

--------------------------------

License

Status:
● Active

Valid Until:
August 10, 2027

IMPORTANT:

System settings must work with the existing offline-first architecture.

Do not create a fake sync system.

If sync functionality already exists, display its actual status.

If sync functionality is not yet implemented, create the settings structure and UI without pretending that synchronization is working.

Do NOT allow ordinary users to modify database internals or dangerous system configuration.

==================================================
8. CENTRALIZED SETTINGS ARCHITECTURE
==================================================

Settings must have a centralized source of truth.

Do NOT scatter settings across individual components.

Create an appropriate settings service/repository/API.

Example conceptual structure:

settings
├── business
├── payments
├── orders
├── inventory
├── taxes
├── receipts
└── system

Use the existing project architecture and naming conventions.

If the project uses:

- React Query
- Context
- Zustand
- Redux
- API services

follow the existing pattern instead of introducing another state-management system.

==================================================
9. SETTINGS DATABASE
==================================================

Inspect the existing database architecture first.

Do not create duplicate settings tables/models if one already exists.

Settings should support:

- Business-specific configuration
- Persistence
- Updates
- Validation
- Defaults

Use sensible defaults so the system works immediately after installation.

Example defaults:

Currency:
ETB

Tax:
Disabled unless configured

Service Charge:
Disabled

Cash:
Enabled

Mobile Banking:
Enabled

Card:
Enabled

Bank Transfer:
Disabled

Low Stock Alerts:
Enabled

Allow Negative Stock:
Disabled

Use the existing database technology and migration strategy.

==================================================
10. SETTINGS CONSUMERS
==================================================

Make sure settings actually affect the application.

Business settings
→ Receipts
→ Reports
→ Business identity

Payment settings
→ Sales checkout
→ Payment forms

Order settings
→ Orders module

Inventory settings
→ Inventory module

Tax settings
→ Sales calculations
→ Receipts
→ Reports

Receipt settings
→ Receipt preview
→ Printed receipts

System settings
→ System UI
→ Backup/sync/license areas where supported

Do not simply build forms that save values without connecting them to their consumers.

==================================================
11. VALIDATION
==================================================

Use the existing validation library.

Validate:

- Required fields
- Numeric rates
- Currency
- Payment method names
- Duplicate payment methods
- Invalid order formats
- Invalid thresholds
- Invalid time zones
- Invalid dates/configuration

Show clear validation errors.

Do not allow invalid settings to break other modules.

==================================================
12. UNSAVED CHANGES
==================================================

If a user changes settings and navigates away without saving:

Show:

"You have unsaved changes. Leave without saving?"

Actions:

[ Stay ]
[ Leave ]

Do not silently discard changes.

==================================================
13. SAVE FEEDBACK
==================================================

After saving:

Show a clear success notification:

"Settings saved successfully."

If saving fails:

"Unable to save settings. Please try again."

Do not silently fail.

==================================================
14. RESPONSIVE DESIGN
==================================================

The Settings page should work on:

- Desktop
- Tablet
- Mobile

However, prioritize desktop because this is primarily an administration interface.

Use the existing design system.

Do not introduce a new visual language.

Use existing:

- Buttons
- Inputs
- Selects
- Switches
- Dialogs
- Toasts
- Cards
- Tables

==================================================
15. SECURITY
==================================================

Settings contain sensitive business configuration.

Use the existing authentication and authorization system.

Do NOT create a new authentication mechanism.

The module should be prepared for role-based permissions.

For now, respect whatever authorization system already exists.

Do not expose sensitive system configuration to unauthorized users.

==================================================
16. AUDIT LOGGING
==================================================

Important settings changes should be auditable.

Record:

- User
- Setting/category changed
- Previous value where appropriate
- New value where appropriate
- Date/time

Especially log changes to:

- Payment methods
- Tax rates
- Service charges
- Inventory costing method
- Negative stock setting
- Receipt configuration
- System configuration

Use the existing audit-log architecture if available.

==================================================
17. UX PRINCIPLES
==================================================

The users of this ERP are not technical users.

Keep the Settings UI simple.

Users should not need to understand:

- Database structure
- Internal IDs
- API configuration
- Sync internals
- Technical implementation

Use:

- Clear labels
- Helpful descriptions
- Sensible defaults
- Confirmation dialogs for important changes
- Minimal required fields

Use progressive disclosure for advanced options.

Do not overwhelm users with unnecessary configuration.

==================================================
18. IMPORTANT BUSINESS RULE
==================================================

Settings are configuration.

They should change how the system behaves going forward.

They should NOT rewrite historical business records.

Examples:

Changing VAT from 15% to 10%
→ affects future sales
→ does NOT change old sales

Disabling Mobile Banking
→ prevents new Mobile Banking payments
→ does NOT alter previous Mobile Banking transactions

Changing receipt footer
→ affects future receipt printing
→ does NOT rewrite old transaction data

Changing currency settings
→ must be handled carefully and should not silently convert existing financial records.

==================================================
19. TESTING
==================================================

Test every setting end-to-end.

Examples:

1. Disable Card
→ Card disappears from Sales checkout.

2. Enable Mobile Banking
→ Mobile Banking appears in checkout.

3. Change tax rate
→ New sales use the new rate.

4. Change tax rate
→ Existing sales remain unchanged.

5. Change receipt footer
→ Receipt preview changes.

6. Change low-stock threshold
→ Inventory alerts use the new threshold.

7. Disable service charge
→ Sales no longer calculate service charge.

8. Change business name
→ New receipts use the new name.

9. Disable a payment method
→ Historical transactions remain intact.

10. Restart application
→ Settings persist.

11. Refresh page
→ Settings persist.

12. Test unauthorized access according to existing permission system.

==================================================
20. FINAL IMPLEMENTATION REQUIREMENTS
==================================================

Before finishing:

1. Inspect the existing project architecture.
2. Reuse existing components and services.
3. Reuse existing authentication/authorization.
4. Reuse existing database patterns.
5. Reuse existing design system.
6. Do not duplicate business logic.
7. Do not create mock data as the final implementation.
8. Do not break existing modules.
9. Connect settings to their actual consumers.
10. Ensure settings persist after restart.
11. Ensure historical records are not modified by configuration changes.
12. Add appropriate loading, error, empty, and success states.
13. Test the complete Settings module end-to-end.

The final result should feel like one coherent part of the existing Restaurant ERP, not a separate application.