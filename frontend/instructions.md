Build a complete production-ready SALES module for our offline-first Restaurant ERP.

The application is a restaurant management system where Orders, Tables, Kitchen, Products, Inventory, Employees, and Sales are separate feature modules.

IMPORTANT:
Do not redesign or replace the existing Orders, Tables, Kitchen, Products, or Inventory modules.
Integrate with their existing data structures and components.

==================================================
BUSINESS WORKFLOWS
==================================================

The restaurant supports TWO ways of handling sales.

WORKFLOW 1 — DIGITAL WAITER ORDER

1. Waiter uses the mobile Waiter App over the restaurant's local Wi-Fi.
2. Waiter selects a table and creates an order.
3. Order is sent to the system.
4. If the kitchen uses the Kitchen module, the order goes through the existing order workflow:
   Pending → In Progress → Ready/Completed.
5. Customer finishes their meal.
6. Waiter tells the cashier which table/order is ready for payment.
7. Cashier finds the order in the Sales module.
8. Cashier reviews the order.
9. Cashier collects payment.
10. Payment is completed.
11. The order becomes financially completed/paid.
12. Sale record is created.
13. Receipt can be printed.
14. Table/session becomes available according to the existing table workflow.

WORKFLOW 2 — MANUAL / OFF-SYSTEM ORDER

Some restaurants may not use the Kitchen Display or Waiter App.

Example:

1. Waiter takes the customer's order verbally.
2. Waiter tells the kitchen verbally what to prepare.
3. No order is entered into the system while the food is being prepared.
4. When the customer wants to pay, the waiter tells the cashier:
   - Table number
   - Ordered products
   - Quantities
5. Cashier creates the order directly from the desktop.
6. Because the food has already been served, this order MUST NOT go through Pending/In Progress/Kitchen workflow.
7. The cashier creates it as an already-completed/served order.
8. Cashier immediately proceeds to payment.
9. Payment is recorded.
10. Sale is created.
11. Receipt can be printed.
12. Table/session is closed according to the existing table workflow.

The Sales module must support both workflows naturally.

==================================================
SALES MODULE RESPONSIBILITY
==================================================

Sales is responsible for:

- Finding completed/unpaid orders
- Collecting payments
- Creating sales records
- Cashier checkout
- Manual completed-sale entry
- Payment methods
- Discounts where permitted
- Service charges/taxes if enabled
- Receipts
- Sales history
- Refunds
- Voids/cancellations where permitted
- Payment records
- Cashier accountability
- Daily sales information

Do NOT duplicate order-management functionality unnecessarily.

Orders remain responsible for:
- Creating normal orders
- Order items
- Order status
- Kitchen workflow
- Order modifications

Sales is responsible for:
- Money
- Payment
- Receipt
- Financial transaction history

==================================================
SALES PAGE STRUCTURE
==================================================

Create the following pages/views:

1. PAYMENT QUEUE
2. NEW MANUAL SALE
3. CHECKOUT
4. SALES HISTORY
5. SALE DETAILS
6. REFUNDS
7. PAYMENT DETAILS

==================================================
1. PAYMENT QUEUE
==================================================

This is the main Sales screen.

Show completed/served orders that have not yet been paid.

Example:

Order #BF4C2D50
Table 4
3 items
835 ETB

Order Status: Completed
Payment Status: Unpaid

[ Collect Payment ]

--------------------------------------------------

Allow searching by:

- Order number
- Table number
- Customer
- Waiter

Filters:

- Unpaid
- Partially Paid
- Paid
- Date
- Waiter
- Table

Display useful information:

- Order number
- Table
- Waiter
- Number of items
- Total
- Order status
- Payment status
- Time
- Actions

==================================================
2. NEW MANUAL SALE
==================================================

This is REQUIRED.

It allows a cashier to enter an order that happened outside the digital ordering workflow.

Use this when:

- Waiter took the order verbally
- Kitchen does not use the system
- Waiter App was not used
- The food has already been served

The cashier selects:

Table:
[ Select Table ]

Optional:

Waiter:
[ Select Waiter ]

Then add products.

Product search:

[ Search products / scan barcode ]

Product list/cart:

Product        Qty       Price       Total

Burger          2        300          600
Coke            2        125          250

Subtotal: 850 ETB

Because this is a manual completed order:

Order Status:
COMPLETED

Do NOT send this order to the Kitchen.

Do NOT show "Send to Kitchen".

Do NOT make the cashier wait for kitchen status.

After entering the products:

[ Continue to Payment ]

The system should create the completed order and immediately open checkout.

==================================================
3. CHECKOUT
==================================================

Checkout must work for BOTH:

A. Existing completed order
B. Newly created manual completed order

Display:

Order number
Table
Waiter
Items
Quantities
Unit prices
Subtotal

Optional:

Discount
Service charge
Tax

Grand Total

--------------------------------------------------

PAYMENT METHODS

Support configurable payment methods.

Initial methods:

- Cash
- Mobile Banking
- Card
- Bank Transfer

Only enabled payment methods from Settings should appear.

--------------------------------------------------

CASH PAYMENT

If Cash is selected:

Amount Due
850 ETB

Amount Received
[ 1000 ]

Change
150 ETB

[ COMPLETE PAYMENT ]

Do not allow completion if received amount is less than the amount due unless partial payments are explicitly supported.

--------------------------------------------------

MOBILE BANKING

If Mobile Banking is selected:

Payment Reference
[ __________ ]

Optional:

Upload Payment Screenshot

[ Upload Image ]

[ COMPLETE PAYMENT ]

The screenshot must work offline and be stored locally until cloud synchronization is available.

--------------------------------------------------

CARD

Show:

Amount
Payment Reference (optional)

[ COMPLETE PAYMENT ]

--------------------------------------------------

BANK TRANSFER

Show:

Amount
Reference Number

[ COMPLETE PAYMENT ]

==================================================
PAYMENT STATUS
==================================================

Use a separate payment status from order status.

Order status:

- Pending
- In Progress
- Ready
- Completed
- Cancelled

Payment status:

- Unpaid
- Partially Paid
- Paid
- Refunded
- Partially Refunded

Do NOT mix order status and payment status.

Example:

Order:
COMPLETED

Payment:
UNPAID

After payment:

Order:
COMPLETED

Payment:
PAID

==================================================
4. SALES HISTORY
==================================================

Display completed financial transactions.

Columns:

- Sale Number
- Order Number
- Table
- Waiter
- Cashier
- Total
- Payment Method
- Payment Status
- Date
- Time

Features:

- Search
- Date range
- Payment method filter
- Cashier filter
- Waiter filter
- Table filter
- Status filter
- Sorting
- Pagination
- Export CSV

Actions:

- View
- Print Receipt
- Reprint Receipt
- Refund

==================================================
5. SALE DETAILS
==================================================

Display a complete financial record.

Example:

Sale #00091

Order:
#BF4C2D50

Table:
4

Waiter:
Abebe

Cashier:
Hana

Date:
August 9, 2026

--------------------------------------------------

ITEMS

2 × Special Asa Combo
1 × Nigus
1 × Sofy Buna

--------------------------------------------------

Subtotal:
835 ETB

Discount:
0 ETB

Service Charge:
0 ETB

Tax:
0 ETB

TOTAL:
835 ETB

--------------------------------------------------

PAYMENT

Method:
Cash

Amount Received:
1,000 ETB

Change:
165 ETB

Payment Status:
PAID

--------------------------------------------------

Actions:

[ Print Receipt ]
[ Reprint Receipt ]
[ Refund ]

==================================================
6. REFUNDS
==================================================

Do NOT delete sales.

A refund must create a financial record.

Example:

Sale #00091
835 ETB
PAID

↓

Refund #00012
-835 ETB

Sale status:
REFUNDED

Require:

- Refund reason
- Refund amount
- Authorized user

For partial refunds, allow selecting individual items or entering a partial amount.

Permissions:

Cashier:
Cannot refund unless explicitly permitted.

Manager:
Can refund.

Owner:
Can refund.

Use the existing permission system.

==================================================
7. PAYMENT DETAILS
==================================================

Every payment must record:

- Payment ID
- Sale ID
- Amount
- Payment Method
- Reference Number
- Cashier
- Date
- Time
- Payment Status
- Notes
- Payment screenshot if applicable

==================================================
CASHIER WORKFLOW
==================================================

The cashier should have two obvious actions:

[ Pending Payments ]

[ New Manual Sale ]

Pending Payments:

Completed orders waiting for payment.

New Manual Sale:

Create a completed order directly from the cashier desk.

This distinction is very important.

==================================================
RECEIPTS
==================================================

After successful payment show:

Payment Successful

Sale #00091

Total:
835 ETB

Payment:
Cash

[ Print Receipt ]

[ New Payment ]

Receipt should contain:

- Restaurant name
- Restaurant information
- Sale number
- Order number
- Table
- Date/time
- Cashier
- Items
- Quantity
- Unit price
- Total
- Discount
- Tax/service charge if enabled
- Payment method
- Amount received
- Change
- Thank-you message

==================================================
TABLE INTEGRATION
==================================================

Integrate with the existing Tables module.

Sales must know which table the order belongs to.

When payment is successfully completed:

- Mark the order as paid.
- Close the relevant dining session/order.
- Release the table according to the existing table/session logic.

Do NOT permanently delete the table.

If multiple tables are part of the same dining session, release all tables belonging to that session after successful settlement.

==================================================
WAITER INFORMATION
==================================================

Keep waiter information for reporting.

For normal digital orders:

created_by = waiter

For manual sales:

cashier creates the order, but allow selecting the waiter who served the table.

This allows reports such as:

- Sales by waiter
- Orders by waiter
- Cashier transactions
- Manual sales vs digital sales

Also record:

- created_by
- completed_by
- paid_by

where appropriate.

==================================================
AUDIT LOG
==================================================

Important financial actions must be recorded.

Record:

- Sale created
- Payment created
- Payment edited
- Sale refunded
- Sale voided
- Discount applied
- Manual sale created
- Receipt printed/reprinted

Store:

- User
- Action
- Date/time
- Related record
- Reason where applicable

==================================================
OFFLINE-FIRST REQUIREMENTS
==================================================

The restaurant must be able to perform sales without internet.

Payment records must be saved to the local database first.

Internet is NOT required for:

- Creating manual sales
- Finding existing orders
- Processing cash payments
- Recording mobile banking payments
- Printing receipts
- Viewing sales history

Cloud synchronization happens separately when internet becomes available.

Do not make the payment workflow dependent on an external API.

==================================================
INVENTORY INTEGRATION
==================================================

When a sale is completed:

Decrease inventory according to the existing Inventory module.

Do not duplicate inventory calculations inside Sales.

Use the existing inventory service.

For products where inventory tracking is disabled:

Do not modify stock.

For tracked products:

Sale completion should create the appropriate inventory movement.

IMPORTANT:

Inventory should only be changed when the sale/payment workflow reaches the appropriate final state according to the existing business rules.

Do not decrease inventory multiple times if a sale is reopened or the receipt is reprinted.

==================================================
DASHBOARD SUMMARY
==================================================

At the top of Sales provide:

Today's Sales
Today's Transactions
Cash Sales
Mobile Banking Sales
Card Sales
Unpaid Orders
Refunds

These numbers should come from actual sales/payment data.

==================================================
PERMISSIONS
==================================================

Use existing role/permission system.

Cashier:

- View payment queue
- Create manual sales
- Process payments
- Print receipts
- View permitted sales

Manager:

- All cashier permissions
- Refunds
- Voids
- Discounts
- View broader sales reports

Owner:

- Full access
- Financial settings
- Refunds
- Voids
- Reports
- Payment method configuration

Do not hard-code permissions inside components.

Use the existing authorization system.

==================================================
COMPONENT STRUCTURE
==================================================

Use feature-based architecture:

src/modules/sales/

components/
pages/
hooks/
services/
schemas/
types/
utils/

Reusable components:

PaymentQueue
PaymentQueueCard
ManualSaleForm
SaleCart
Checkout
PaymentMethodSelector
CashPaymentForm
MobilePaymentForm
CardPaymentForm
SaleTable
SaleDetails
RefundDialog
PaymentDetails
ReceiptPreview
PaymentSuccessDialog
SalesSummary
SalesFilters

==================================================
DATA / SERVICE LAYER
==================================================

Do not put business logic directly inside UI components.

Create services for:

- Get unpaid orders
- Create manual completed order
- Create sale
- Process payment
- Get sales
- Get sale details
- Refund sale
- Print/reprint receipt
- Record payment
- Record audit event

Use the existing API/database architecture.

Do not create a second database or separate order model.

==================================================
IMPORTANT EDGE CASES
==================================================

Handle:

1. Two cashiers attempting to pay the same order.
2. Order already paid.
3. Order cancelled.
4. Partial payment if supported.
5. Refund after payment.
6. Manual sale with zero items — prevent it.
7. Negative quantities — prevent them.
8. Invalid payment amount.
9. Duplicate payment submission.
10. User refreshing checkout after payment.
11. Network unavailable.
12. Mobile banking screenshot stored offline.
13. Receipt reprinted multiple times.
14. Cashier attempting an unauthorized refund.
15. Inventory being deducted twice.

Payment completion must be idempotent.

==================================================
DESIGN
==================================================

Use the existing RestaurantOS design system.

Use:

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Table
- TanStack Query where appropriate

Desktop-first for cashier.

Clean, fast, professional ERP interface.

Large touch-friendly buttons for payment actions.

Clear visual distinction between:

UNPAID
PAID
REFUNDED
CANCELLED

Avoid unnecessary animations.

Do not redesign existing modules.

==================================================
FINAL REQUIREMENT
==================================================

Before finishing:

1. Inspect the existing Orders module.
2. Inspect the existing Tables module.
3. Inspect the existing Products module.
4. Inspect the existing Inventory module.
5. Reuse their existing types, services, APIs, components, and database relationships where possible.
6. Do not duplicate existing business logic.
7. Do not create mock data as the final implementation.
8. Do not break existing functionality.
9. Ensure both workflows work:

   A. Waiter App → Order → Completed → Cashier Payment → Sale

   B. Verbal Order → Cashier creates completed order → Payment → Sale

10. Make the Sales module fully functional end-to-end.