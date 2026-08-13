Build the CASHIER DASHBOARD for the Omnitrack Restaurant Management System.

IMPORTANT:
The cashier has a different role from Owner and Manager.

The cashier's primary responsibility is handling customer payments, completing sales, viewing orders needed for payment, and monitoring their own cash/transaction activity.

Do NOT give the cashier access to owner/manager functionality such as:

- Employee management
- Supplier management
- Purchase management
- Inventory management
- Expense management
- Business settings
- User/role management
- License management
- Advanced financial reports
- Profit analysis
- System administration

Reuse the existing database, APIs, authentication, components, styling system, and business logic.

Do not create duplicate functionality that already exists.

==================================================
CASHIER SIDEBAR
==================================================

Create this sidebar:

Dashboard
Orders
Sales / Checkout
Transactions
Tables
Reports

----------------

Notifications
Settings

The sidebar must only display items the cashier is authorized to access.

==================================================
1. CASHIER DASHBOARD
==================================================

Create a clean, practical cashier dashboard.

The dashboard should prioritize information needed during a working shift.

Display:

Today's Sales
Today's Transactions
Pending Payments
Cash Collected
Card Payments
Mobile/Digital Payments

Also display:

Current Shift Status
Recent Transactions
Pending/Unpaid Orders
Quick Actions

Do NOT fill the dashboard with unnecessary charts.

The cashier needs useful information, not decorative analytics.

Example layout:

Today's Sales
12,450 ETB

Transactions
48

Pending Payments
3

Cash
7,200 ETB

Card
3,250 ETB

Mobile
2,000 ETB

Current Shift
Active
Started 08:00 AM

Quick Actions:

[ New Sale ]
[ View Orders ]
[ Transactions ]
[ Close Shift ]

==================================================
2. ORDERS
==================================================

The cashier must be able to view orders that require payment.

Display:

Order Number
Table Number
Waiter
Items
Total
Order Status
Payment Status
Created Time

Allow:

Search by order number
Search by table
Filter by status
Filter by payment status

Important restaurant workflow:

A waiter may create an order using the system.

When the customer is ready to pay:

Waiter → Cashier
Cashier finds order
Cashier reviews order
Cashier completes payment
Sale is recorded

The cashier must also be able to create a completed/finished order manually when the restaurant did not use the order system.

Example:

The waiter verbally gives the cashier:

Table 4
2 Burgers
1 Pizza
2 Coke

The cashier can create the finished order directly in the checkout flow and immediately proceed to payment.

Do not force the order through an artificial pending/kitchen workflow when the kitchen did not use the system.

==================================================
3. SALES / CHECKOUT
==================================================

This is the cashier's primary working page.

Create a fast checkout interface.

The cashier should be able to:

1. Select an existing unpaid order
2. Review items
3. Adjust allowed quantities if authorized
4. Calculate subtotal
5. Apply supported discounts if the existing system supports them
6. Calculate total
7. Select payment method
8. Complete payment
9. Generate transaction
10. Mark sale as paid
11. Print or preview receipt

Payment methods should support the methods already defined by the system, such as:

Cash
Card
Mobile/Digital

Do not invent unsupported payment providers.

After successful payment:

Show:

Payment Successful

Transaction Number
Order Number
Table
Total
Payment Method
Date/Time

Actions:

[ Print Receipt ]
[ New Sale ]

==================================================
4. TRANSACTIONS
==================================================

Create a transaction history page.

Display:

Transaction Number
Date/Time
Order Number
Table
Amount
Payment Method
Cashier
Status

Support:

Search
Date filtering
Payment-method filtering
Status filtering

The cashier can view transaction history but should not be able to freely modify historical financial transactions.

If refunds/voids already exist in the system, expose only the actions the cashier's permissions allow.

Do not allow the cashier to delete financial history.

==================================================
5. TABLES
==================================================

Create a simple table-status view.

Show:

Available
Occupied
Waiting for Payment
Completed

The cashier should be able to click a table and see:

Table number
Current order
Order total
Payment status

The cashier should NOT manage waiter assignments here.

Waiter/table assignment remains under the appropriate management workflow.

==================================================
6. REPORTS
==================================================

Create a limited cashier report page.

Show only information relevant to the cashier.

Examples:

Today's sales
Number of transactions
Cash collected
Card collected
Mobile/digital collected
Refunds if applicable

Allow date filtering where appropriate.

Do NOT expose:

Profit
Payroll
Employee salaries
Business expenses
Supplier costs
Inventory valuation
Owner financial analytics

unless explicitly permitted by the existing role/permission system.

==================================================
7. CASHIER SHIFT
==================================================

Implement or integrate cashier shift functionality if it does not already exist.

At the beginning of a shift:

Cashier enters opening cash amount.

Example:

Opening Cash
1,000 ETB

[ Start Shift ]

During the shift show:

Shift Started
Opening Cash
Total Sales
Cash Sales
Card Sales
Mobile Sales
Refunds
Expected Cash

At the end:

Cashier selects:

[ Close Shift ]

Show:

Opening Cash
Cash Sales
Cash Refunds
Expected Cash
Actual Cash
Difference

Example:

Opening Cash: 1,000 ETB
Cash Sales: 7,200 ETB
Cash Refunds: 0 ETB
Expected Cash: 8,200 ETB
Actual Cash: 8,150 ETB
Difference: -50 ETB

Require confirmation before closing.

Do not allow the cashier to silently change the expected amount.

==================================================
8. PERMISSIONS
==================================================

Enforce cashier permissions at both:

Frontend
AND
Backend/API

Do not rely only on hiding sidebar items.

A cashier must not be able to access protected owner/manager endpoints by manually entering URLs or API requests.

Use the existing role/permission system.

==================================================
9. USER EXPERIENCE
==================================================

The cashier interface must prioritize speed.

Cashiers may be handling many customers continuously.

Therefore:

- Minimal clicks
- Large clear payment actions
- Fast search
- Keyboard-friendly where appropriate
- Clear totals
- Clear payment status
- Clear success/error feedback
- No unnecessary charts
- No unnecessary configuration

The main workflow should be:

Existing Order:

Order
 ↓
Review
 ↓
Payment
 ↓
Complete Sale
 ↓
Receipt

Manual Order:

New Sale
 ↓
Add Items
 ↓
Select Table/Order information if required
 ↓
Payment
 ↓
Complete Sale
 ↓
Receipt

==================================================
10. RESPONSIVE DESIGN
==================================================

The cashier dashboard will primarily be used on a desktop computer.

Optimize for desktop first.

It should still work on smaller screens where practical.

==================================================
11. DESIGN
==================================================

Use the existing Omnitrack design system.

Keep the interface:

Minimal
Modern
Professional
Fast
Easy to scan

Do not introduce a completely different visual language.

Avoid filling the page with cards, graphs, and decorative elements.

Every component should have a practical purpose.

==================================================
12. IMPLEMENTATION
==================================================

Before coding:

1. Inspect the existing cashier-related APIs.
2. Inspect the orders module.
3. Inspect the sales module.
4. Inspect the transactions module.
5. Inspect the tables module.
6. Inspect authentication and roles.
7. Inspect the existing dashboard components.
8. Reuse existing components and APIs.
9. Do not duplicate business logic.
10. Do not break the existing Owner or Manager dashboards.

Then implement the cashier dashboard.

Finally test:

- Cashier login
- Dashboard data
- Existing order checkout
- Manual finished order checkout
- Cash payment
- Card payment
- Mobile/digital payment
- Transaction creation
- Receipt flow
- Table status viewing
- Shift opening
- Shift closing
- Permission restrictions
- Unauthorized API access
- Offline operation
- Sync to cloud

The final cashier experience should be extremely simple:

SEE WHAT NEEDS PAYMENT
→ TAKE PAYMENT
→ RECORD SALE
→ PRINT RECEIPT
→ CONTINUE