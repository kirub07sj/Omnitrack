Build the complete Reports module for our existing offline-first Restaurant ERP.

IMPORTANT:
Before writing code, inspect the existing project and understand:

- Database schema
- API structure
- Existing modules
- Existing business logic
- Existing authentication/authorization
- Existing UI/design system
- Existing state management
- Existing chart/table components
- Existing Sales, Expenses, Transactions, Inventory, Products, Employees, Orders, and Tables implementations

DO NOT rewrite existing modules.

DO NOT create duplicate data models for reports.

Reports must read and aggregate data from the existing system.

==================================================
REPORTS MODULE
==================================================

Create:

Reports
├── Overview
├── Sales
├── Expenses
├── Transactions
├── Inventory
├── Products
├── Employees
└── Financial Summary

The Reports module is primarily READ-ONLY.

Users should not create, edit, or delete business records from Reports.

==================================================
1. GLOBAL REPORT FILTERS
==================================================

Every report should support a common date range filter.

Provide:

- Today
- Yesterday
- This Week
- This Month
- Last Month
- This Year
- Custom Range

Example:

Date Range
[ This Month ▼ ]

[ From ] [ To ]

Reports should update automatically when filters change.

Do not require users to click a separate "Generate Report" button unless the existing architecture requires it.

Add appropriate loading states while report data is being calculated.

==================================================
2. REPORT OVERVIEW
==================================================

Create a dashboard-style Overview report.

It should answer:

"How is the business doing?"

Display:

- Total Sales
- Total Expenses
- Total Money In
- Total Money Out
- Net Cash Flow
- Number of Orders
- Number of Completed Sales
- Average Sale Value
- Top-Selling Product
- Low-Stock Item Count

Example:

REPORTS

[ This Month ▼ ]

--------------------------------

Total Sales
450,000 ETB

Total Expenses
120,000 ETB

Money In
450,000 ETB

Money Out
270,000 ETB

Net Cash Flow
180,000 ETB

Orders
1,245

Average Sale
361 ETB

--------------------------------

Sales Trend
[ Chart ]

Payment Methods
[ Chart ]

Top Products
[ List ]

Low Stock
[ List ]

==================================================
3. SALES REPORT
==================================================

Create a Sales report.

It should answer:

"What did we sell?"

Display:

- Gross sales
- Discounts
- Taxes
- Service charges
- Net sales
- Number of completed sales
- Average sale value
- Sales by date
- Sales by payment method
- Sales by product
- Sales by category
- Sales by waiter
- Sales by cashier

Use the actual stored values from historical sales.

IMPORTANT:

Do NOT calculate historical tax/service charges using the current Settings configuration.

Historical sales must use the values stored when the sale occurred.

Provide:

- Summary cards
- Sales trend chart
- Payment method breakdown
- Product/category table
- Optional employee performance table

Example table:

Date | Sales | Orders | Average Sale
--------------------------------------
Aug 1 | 25,000 | 72 | 347
Aug 2 | 31,500 | 89 | 354

==================================================
4. EXPENSE REPORT
==================================================

Create an Expenses report.

It should answer:

"Where is the business spending money?"

Display:

- Total expenses
- Paid expenses
- Unpaid expenses
- Expenses by category
- Expenses by date
- Top expense categories
- Expense trend

Example:

Category | Amount | Percentage
--------------------------------
Rent | 50,000 | 42%
Utilities | 15,000 | 13%
Maintenance | 8,000 | 7%

Provide:

- Summary cards
- Expense trend chart
- Category breakdown
- Expense history table

Respect the existing distinction between:

Expense record
and
actual cash transaction.

Do not treat unpaid expenses as money-out transactions until they are actually paid.

==================================================
5. TRANSACTIONS REPORT
==================================================

Create a Transactions report.

It should answer:

"Where did the business's money move?"

Display:

- Total money in
- Total money out
- Net cash flow
- Cash transactions
- Mobile banking transactions
- Card transactions
- Bank transfer transactions

Provide filters:

- Date
- Money In / Money Out
- Transaction type
- Payment method
- User/cashier
- Search

Transaction types may include:

- Sale
- Inventory Purchase
- Expense
- Salary
- Refund
- Other

Use the existing Transactions data.

DO NOT create a second transaction system.

==================================================
6. INVENTORY REPORT
==================================================

Create an Inventory report.

It should answer:

"What is happening with our stock?"

Display:

- Total inventory items
- Current stock value
- Low-stock items
- Out-of-stock items
- Stock received
- Stock adjustments
- Purchase totals
- Supplier purchase totals

Provide:

Low Stock table:

Product | Current Stock | Threshold | Status

Stock movement summary:

Product | Received | Used/Sold | Adjusted | Current

Purchase summary:

Supplier | Purchases | Amount

IMPORTANT:

Use the existing Inventory and stock movement logic.

Do not create a second inventory calculation system.

If inventory costing already uses weighted average, use the existing calculated values.

==================================================
7. PRODUCT REPORT
==================================================

Create a Products report.

It should answer:

"Which products are performing well?"

Display:

- Best-selling products
- Lowest-selling products
- Quantity sold
- Revenue by product
- Revenue by category
- Product sales trend

Example:

Product | Qty Sold | Revenue
--------------------------------
Chicken Tibs | 820 | 164,000
Burger | 610 | 122,000
Pasta | 420 | 84,000

Allow sorting by:

- Quantity sold
- Revenue
- Product name

Add category filtering.

Do not modify product records from Reports.

==================================================
8. EMPLOYEE REPORT
==================================================

Create an Employees report.

It should answer:

"How are employees contributing to operations?"

Depending on existing data and permissions, display:

- Sales handled by cashier
- Orders handled by waiter
- Number of orders
- Sales amount
- Cancellations
- Discounts applied
- Activity summary

Example:

Employee | Orders | Sales | Cancellations
-------------------------------------------
Hana | 120 | 45,000 | 2
Dawit | 98 | 38,000 | 1

IMPORTANT:

Only show metrics that can be accurately derived from existing records.

Do not invent employee performance data.

Do not create surveillance-style metrics that aren't useful to the business.

==================================================
9. FINANCIAL SUMMARY
==================================================

Create a Financial Summary report.

IMPORTANT:

This is NOT a full accounting system.

Clearly distinguish between:

- Revenue/Sales
- Expenses
- Inventory Purchases
- Money In
- Money Out
- Net Cash Flow

Example:

Financial Summary

Sales
+450,000 ETB

Expenses Paid
-120,000 ETB

Inventory Purchases Paid
-150,000 ETB

Other Money Out
-0 ETB

--------------------------------

Net Cash Flow
180,000 ETB

IMPORTANT:

Do not incorrectly label cash flow as accounting profit.

If the system does not have enough accounting data to calculate true profit, label the metric as:

"Net Cash Flow"

not:

"Net Profit"

==================================================
10. CHARTS
==================================================

Use charts only where they improve understanding.

Recommended charts:

Overview:
- Sales trend
- Money in vs money out
- Payment methods

Sales:
- Sales over time
- Sales by payment method
- Sales by category

Expenses:
- Expenses over time
- Expenses by category

Inventory:
- Stock status
- Purchase trends

Products:
- Top products

Do not create charts just for decoration.

Charts must use real backend data.

Use the existing chart library if one already exists.

Do not introduce another charting library unnecessarily.

==================================================
11. TABLES
==================================================

All report tables should support where appropriate:

- Sorting
- Search
- Filtering
- Pagination
- Empty state
- Loading state

Use the existing table component/design system.

Do not create a new table component if one already exists.

==================================================
12. EXPORT
==================================================

Reports should support:

- CSV export
- Print-friendly view

CSV exports must contain the actual filtered report data.

Example:

User selects:

August 1 → August 10
Category: Food

Export CSV

→ Only export the filtered report data.

Do not generate fake or hard-coded export data.

If PDF generation already exists in the project, integrate with it.

Otherwise, do not introduce a large PDF system unless necessary.

==================================================
13. REPORT SOURCE OF TRUTH
==================================================

This is extremely important.

Reports must use existing modules as the source of truth.

Example:

Sales:

Sales records
      ↓
Reports

Expenses:

Expense records
      ↓
Reports

Transactions:

Transaction records
      ↓
Reports

Inventory:

Inventory + Stock Movements + Purchases
      ↓
Reports

Products:

Products + Sales/Sale Items
      ↓
Reports

Employees:

Employees + Orders + Sales
      ↓
Reports

DO NOT duplicate business data inside the Reports module.

==================================================
14. HISTORICAL DATA
==================================================

Reports must preserve historical values.

Example:

VAT was 15% when a sale happened.

Later:

VAT is changed to 10%.

The old sale must still report:

VAT = 15%

Do not recalculate historical sales using current Settings.

The same principle applies to:

- Service charges
- Product prices
- Discounts
- Payment methods
- Business information where historical snapshots exist

==================================================
15. CASH FLOW LOGIC
==================================================

Use the existing Transactions module as the source for actual cash-flow calculations.

Money In:

- Completed customer sales
- Other valid incoming transactions

Money Out:

- Paid expenses
- Paid inventory purchases
- Salaries
- Refunds
- Other valid outgoing transactions

UNPAID records must NOT be counted as actual cash-out until payment occurs.

Example:

Expense:
Electricity
4,500 ETB
UNPAID

→ Expense report: included as unpaid expense

→ Cash flow report: NOT money out yet

After payment:

→ Expense becomes PAID

→ Transaction is created

→ Cash flow report includes -4,500 ETB

==================================================
16. PERMISSIONS
==================================================

Reports must respect the existing authentication/authorization architecture.

Do not create a new permission system inside Reports.

Prepare the module so permissions can control:

- View reports
- View financial reports
- View employee reports
- Export reports

Recommended access:

Owner:
- All reports

Manager:
- Operational reports
- Sales
- Inventory
- Employees
- Expenses according to permission

Cashier:
- Only permitted sales/payment reports

Waiter:
- Only permitted personal/operational reports

Kitchen:
- No financial reports unless explicitly permitted

IMPORTANT:

Do not hard-code role names throughout components.

Use the existing permission system.

==================================================
17. PERFORMANCE
==================================================

Reports may process large amounts of data.

Do not load every transaction/order/sale into the browser and calculate everything client-side if the dataset can become large.

Prefer server-side aggregation where appropriate.

Use:

- Database aggregation
- Indexed queries
- Date filtering
- Pagination
- Cached summaries where appropriate

Inspect the existing backend architecture and follow its patterns.

Do not prematurely introduce a complex analytics infrastructure.

==================================================
18. OFFLINE-FIRST REQUIREMENTS
==================================================

The Restaurant ERP is designed to work without internet.

Reports must work from the local database while offline.

Example:

Internet:
OFFLINE

Local sales:
1,250

Reports should still show:

Today's Sales
45,800 ETB

Do not require cloud connectivity for basic reports.

When synchronization occurs, reports should eventually reflect synchronized data according to the existing sync architecture.

Do not create a fake cloud-sync implementation.

==================================================
19. EMPTY STATES
==================================================

If there is no data for the selected date range:

Show something like:

"No sales found for this period."

Do not display:

0 charts
broken charts
NaN
undefined
negative-looking empty states

Give the user a useful message and optionally:

[ Change Date Range ]

==================================================
20. ERROR HANDLING
==================================================

If report generation fails:

Show:

"Unable to load this report."

[ Try Again ]

Do not silently fail.

Do not show raw database errors to users.

==================================================
21. UX PRINCIPLES
==================================================

The users are not accountants or data analysts.

Reports must be easy to understand.

Use:

- Clear labels
- ETB/currency formatting
- Human-readable dates
- Simple charts
- Summary cards
- Useful defaults
- Consistent terminology

Avoid:

- Technical database terms
- Internal IDs unless useful
- Excessive configuration
- Unnecessary charts
- Complex accounting terminology

The owner should be able to open Reports and understand the business within a few seconds.

==================================================
22. RESPONSIVE DESIGN
==================================================

Reports should work on:

- Desktop
- Tablet
- Mobile

Desktop is the priority because reports are mainly used by owners/managers.

Charts should resize properly.

Tables should have appropriate horizontal scrolling on small screens.

Do not destroy usability on mobile just to fit tables.

==================================================
23. AUDIT / READ-ONLY BEHAVIOR
==================================================

Reports must not modify:

- Sales
- Orders
- Inventory
- Expenses
- Transactions
- Employees
- Products

Opening a report should never change business data.

Exporting a report should never change business data.

Filtering a report should never change business data.

==================================================
24. TESTING
==================================================

Test Reports against realistic data.

Test:

1. Sales report matches Sales module totals.

2. Expense report matches Expenses module totals.

3. Transaction report matches Transactions module totals.

4. Inventory report matches Inventory stock.

5. Product report matches actual sale items.

6. Employee report uses real order/sale data.

7. Date filters correctly exclude records outside the selected period.

8. Today filter works correctly.

9. This month filter works correctly.

10. Custom date range works correctly.

11. Paid expenses appear in cash-flow calculations.

12. Unpaid expenses do not appear as money-out.

13. Paid inventory purchases appear as money-out.

14. Historical tax values remain unchanged when Settings change.

15. Reports work while offline.

16. CSV export respects active filters.

17. Empty date ranges display correctly.

18. Unauthorized users cannot access restricted reports.

19. Large datasets do not cause the UI to freeze unnecessarily.

20. Refreshing/restarting the application does not break report functionality.

==================================================
25. FINAL IMPLEMENTATION REQUIREMENTS
==================================================

Before finishing:

1. Inspect the existing project first.
2. Reuse existing components.
3. Reuse existing APIs.
4. Reuse existing authentication.
5. Reuse existing permissions.
6. Reuse existing database models.
7. Do not duplicate business logic.
8. Do not create fake/mock report data.
9. Do not create duplicate transaction/inventory/sales data.
10. Use real database aggregation.
11. Ensure reports work offline.
12. Ensure date filtering is accurate.
13. Ensure historical data remains historically accurate.
14. Add proper loading states.
15. Add proper empty states.
16. Add proper error states.
17. Add CSV export.
18. Add print-friendly report views.
19. Ensure responsive design.
20. Test every report against the existing modules.

The final Reports module should feel like a natural part of the existing Restaurant ERP.

The core principle is:

MODULES RECORD WHAT HAPPENED.

REPORTS EXPLAIN WHAT HAPPENED.

Do not turn Reports into another data-entry module.