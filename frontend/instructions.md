okey now lets make the users module on the acount and permissions page

The Owner focuses on business performance and finances.
The Manager focuses on daily restaurant operations.

==================================================
MANAGER DASHBOARD GOAL
==================================================

When the manager logs in, they should immediately understand:

1. How busy the restaurant currently is
2. How many orders are waiting
3. What the kitchen is currently handling
4. Which tables are occupied/free
5. Whether any orders are delayed
6. Whether inventory needs attention
7. Which employees are working
8. Whether there are operational problems
9. Today's basic sales/order activity

The manager should be able to identify problems and take action without opening multiple modules.

==================================================
PAGE STRUCTURE
==================================================

Create the dashboard in this order:

1. Header
2. Operational summary
3. Orders requiring attention
4. Kitchen status
5. Table status
6. Inventory alerts
7. Staff activity
8. Today's activity
9. Recent operational activity

Do NOT add unnecessary charts.

==================================================
1. HEADER
==================================================

Display:

Good morning/afternoon/evening, [Manager Name]

Restaurant name

Current date

Optional:

[ Today ▼ ]

The manager's dashboard should primarily focus on the current day.

==================================================
2. OPERATIONAL SUMMARY
==================================================

Create summary cards:

ACTIVE ORDERS
Example:
12

PENDING
Example:
4

IN PROGRESS
Example:
5

READY
Example:
3

OCCUPIED TABLES
Example:
8 / 20

ACTIVE STAFF
Example:
7

These values must come from real application data.

Do not use mock values.

==================================================
3. ORDERS REQUIRING ATTENTION
==================================================

This should be one of the most important sections.

Show orders that require manager attention.

Examples:

Delayed orders
Orders waiting too long
Orders with problems
Orders that are ready but not served
Cancelled orders

Example:

ORDERS NEEDING ATTENTION

Order #BF4C2D50
Table 4
Waiting: 18 minutes
Status: In Progress

[ View Order ]

--------------------------------------------------

Order #BF4C2D61
Table 8
Waiting: 24 minutes
Status: Ready

[ View Order ]

Use clear urgency indicators.

Do NOT show every order here.

Only show orders requiring attention.

If there are no problems:

"All orders are running normally."

==================================================
4. KITCHEN STATUS
==================================================

Show a compact overview of the kitchen.

Example:

KITCHEN

Pending        4
In Progress    5
Ready          3

Then show the oldest active orders.

Example:

Order #1045
Table 6
Waiting: 17 min
Status: In Progress

Order #1047
Table 3
Waiting: 14 min
Status: Pending

[ Open Kitchen ]

The manager should be able to quickly identify bottlenecks.

Do not duplicate the entire Kitchen module.

==================================================
5. TABLE STATUS
==================================================

Show the current restaurant table situation.

Example:

TABLES

Available       12
Occupied         6
Reserved         2
Needs Cleaning   1

Show a compact visual/table map if the existing Tables module already supports it.

Use the existing table data.

Example:

Table 1   Available
Table 2   Occupied
Table 3   Occupied
Table 4   Needs Cleaning

[ Manage Tables ]

The dashboard should NOT become a full table-management page.

==================================================
6. INVENTORY ALERTS
==================================================

Show inventory items that require manager attention.

Examples:

LOW STOCK
5 items

OUT OF STOCK
2 items

Show the most important items:

Rice
Current: 8 kg
Minimum: 15 kg

Cooking Oil
Current: 3 L
Minimum: 10 L

Chicken
Current: 4 kg
Minimum: 10 kg

[ View Inventory ]

Do not show the entire inventory.

The manager needs warnings, not the whole database.

==================================================
7. STAFF ACTIVITY
==================================================

Show the manager who is currently working.

Example:

STAFF TODAY

Waiters
4 active

Cashiers
1 active

Kitchen Staff
3 active

Then:

CURRENT STAFF

Abebe
Waiter
Active

Hana
Waiter
Active

Dawit
Kitchen
Active

Sara
Cashier
Active

Use the existing Employee module and attendance/session data if available.

Do not turn this into an employee management page.

[ Manage Employees ]

==================================================
8. TODAY'S ACTIVITY
==================================================

Show basic operational numbers:

Orders Today
48

Completed
39

Cancelled
2

Sales
45,800 ETB

Average Order
954 ETB

Do not overload this section with financial metrics.

The owner has access to detailed financial information.

The manager only needs enough information to understand today's operation.

==================================================
9. RECENT OPERATIONAL ACTIVITY
==================================================

Show recent events.

Examples:

10:42
Order #1045 completed

10:38
Table 6 assigned to Abebe

10:31
Order #1047 sent to kitchen

10:20
Rice stock adjusted

10:12
Order #1042 cancelled

Keep this focused on operational events.

Do not show every database action.

==================================================
MANAGER QUICK ACTIONS
==================================================

Provide useful shortcuts:

[ Orders ]

[ Kitchen ]

[ Tables ]

[ Inventory ]

[ Employees ]

[ Reports ]

Do NOT put financial actions such as:

- Process payment
- Refund sale
- Manage financial settings

unless the existing permission system explicitly allows the manager to perform them.

==================================================
MANAGER RESPONSIBILITIES
==================================================

The manager dashboard should focus on:

Orders
Kitchen
Tables
Inventory
Employees
Daily operations

The manager may have access to:

- Orders
- Tables
- Kitchen
- Inventory
- Products
- Suppliers
- Employees
- Sales
- Expenses
- Transactions
- Reports

However, access must follow the existing permission system.

Do NOT hard-code permissions in dashboard components.

==================================================
OWNER VS MANAGER
==================================================

IMPORTANT:

Do not duplicate the Owner Dashboard.

OWNER:

"How is the business performing?"

Focus:
- Revenue
- Expenses
- Cash flow
- Business trends
- Inventory value
- Financial alerts
- Overall performance

MANAGER:

"What is happening right now?"

Focus:
- Active orders
- Kitchen
- Tables
- Staff
- Inventory alerts
- Operational problems
- Delayed orders

==================================================
ALERT SYSTEM
==================================================

Only show alerts when something requires attention.

Examples:

Order delayed
Inventory critically low
Product out of stock
Kitchen backlog
Table needs cleaning
Staff shortage
Unusual number of cancelled orders

If there are no issues:

"Everything is running normally."

Do not fill the dashboard with empty warning cards.

==================================================
CHARTS
==================================================

Charts are NOT a priority.

Do not add charts simply to make the dashboard look impressive.

If one visualization is useful, optionally show:

Orders by hour today

This can help the manager understand busy periods.

Otherwise, use numbers and lists instead.

==================================================
OFFLINE-FIRST
==================================================

The dashboard must work without internet.

All dashboard information must come from the local database when offline.

Do not make dashboard rendering dependent on cloud services.

If synchronization is available, show a small status indicator:

Synced

or

Last synced: 10 minutes ago

Do not block the manager dashboard when there is no internet.

==================================================
DATA SOURCES
==================================================

Use the existing modules:

Orders
Kitchen
Tables
Inventory
Employees
Sales
Reports

Reuse existing services, types, APIs, and database relationships.

Do NOT create duplicate models.

If aggregate data is required, create a dedicated manager dashboard service rather than placing database/business logic inside React components.

Prefer a single dashboard summary request where practical.

Example:

GET /dashboard/manager

Return:

{
  operationalSummary,
  ordersAttention,
  kitchenStatus,
  tableStatus,
  inventoryAlerts,
  staffActivity,
  todayActivity,
  recentActivity
}

Adapt this to the existing architecture rather than blindly creating a new endpoint.

==================================================
PERFORMANCE
==================================================

The dashboard must load quickly.

Avoid dozens of independent requests.

Use existing caching/query mechanisms where available.

Only refresh frequently changing information when necessary.

For example:

Orders and kitchen status may refresh more frequently than employee information.

==================================================
EMPTY STATES
==================================================

Handle all empty states.

No active orders:

"No active orders."

No delayed orders:

"All orders are running normally."

No inventory alerts:

"Inventory levels look good."

No staff activity:

"No staff activity recorded."

Do not show fake numbers.

==================================================
DESIGN
==================================================

Use the existing Restaurant ERP design system.

Use:

React
TypeScript
Tailwind CSS
shadcn/ui
Existing components
Existing theme

Design should be:

- Clean
- Fast
- Professional
- Easy to scan
- Operational
- Touch-friendly where appropriate

Avoid:

- Excessive charts
- Decorative cards
- Huge empty spaces
- Unnecessary animations
- Excessive colors
- Information overload

Use color primarily to communicate state:

Normal
Warning
Critical
Completed

==================================================
RESPONSIVE DESIGN
==================================================

Desktop is the primary environment.

Also support:

- Laptop
- Tablet
- Smaller screens

On smaller screens:

- Stack summary cards
- Stack alert sections
- Allow tables to scroll horizontally
- Keep important actions accessible

==================================================
FINAL UX PRINCIPLE
==================================================

When the manager opens the dashboard, they should immediately be able to answer:

"How busy are we?"

"Are any orders delayed?"

"How is the kitchen doing?"

"Which tables need attention?"

"Do we have inventory problems?"

"Who is working?"

"Is anything going wrong?"

"What should I deal with first?"

If a component does not help answer these questions or help the manager take action, do not add it.

==================================================
IMPLEMENTATION REQUIREMENTS
==================================================

Before implementation:

1. Inspect the existing Orders module.
2. Inspect the Kitchen module.
3. Inspect the Tables module.
4. Inspect the Inventory module.
5. Inspect the Employees module.
6. Inspect Sales and Reports where relevant.
7. Reuse existing types and services.
8. Do not create duplicate business logic.
9. Do not use mock data as the final implementation.
10. Do not break existing modules.
11. Respect the existing role/permission system.
12. Make the dashboard fully functional with real local database data.

Build the complete Manager Dashboard end-to-end.