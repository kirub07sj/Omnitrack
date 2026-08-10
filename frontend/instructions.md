Now that we've settled the architecture, Expenses should be a simple module: the user records why money was spent, and the system automatically creates the corresponding transaction.

Expense module
Main workflow
Create Expense
      ↓
Choose category
      ↓
Enter amount/details
      ↓
Choose payment status
      ↓
Save
      ↓
Expense record created
      ↓
If paid → Transaction created automatically
1. Expense dashboard

Keep it simple:

Expenses

Total This Month
125,400 ETB

Paid
108,000 ETB

Unpaid
17,400 ETB

────────────────────────

[ + Add Expense ]

Recent Expenses

Then the expense list:

Date	Category	Description	Amount	Status
Aug 10	Electricity	August bill	4,500	Paid
Aug 10	Cleaning	Cleaning supplies	1,200	Paid
Aug 9	Maintenance	Refrigerator repair	2,800	Paid
Aug 8	Rent	August rent	50,000	Unpaid
2. Add Expense

This is the most important screen.

Add Expense

Category
[ Electricity ▼ ]

Amount
[ 4,500 ]

Description
[ August electricity bill ]

Paid To
[ Ethiopian Electric Utility ]

Date
[ Aug 10, 2026 ]

Payment Status
○ Paid
○ Unpaid

If Paid:

Payment Method
[ Bank Transfer ▼ ]

Reference Number
[ EE-92831 ]

Receipt
[ Upload / Take Photo ]

Then:

[ Save Expense ]

The user shouldn't have to separately go to Transactions.

3. What happens after Save?
If paid
Expense
4,500 ETB
Electricity
PAID
     ↓
Transaction automatically created
     ↓
-4,500 ETB
Expense
Bank Transfer
If unpaid
Expense
4,500 ETB
Electricity
UNPAID
     ↓
No cash-flow transaction yet

Later, when they pay it:

Expense #EXP-102
4,500 ETB
UNPAID

[ Pay Expense ]

       ↓

Payment Method
Bank Transfer

Reference
EE-92831

       ↓

PAID

       ↓

Transaction
-4,500 ETB

That distinction is important because an expense can exist before the money actually leaves the business.

4. Expense categories

Start with a manageable list:

Operations
Cleaning
Maintenance
Repairs
Transportation
Packaging
Security
Utilities
Electricity
Water
Internet
Gas
Rent
Building Rent
Equipment Rent
Staff
Salary
Overtime
Staff Meals
Other Staff Costs
Taxes & Fees
License
Government Fees
Other Taxes
Other
Miscellaneous

Allow the owner to add custom categories.

5. Expense details

Clicking an expense:

Expense #EXP-102

Electricity

Amount
4,500 ETB

Description
August electricity bill

Paid To
Ethiopian Electric Utility

Date
Aug 10, 2026

Payment
Bank Transfer

Reference
EE-92831

Status
PAID

Receipt
[ View ]

Recorded By
Manager

Actions:

[ Edit ]
[ View Transaction ]
[ Void ]

I'd use Void instead of Delete for finalized expenses so you don't destroy financial history.

6. Expense history

Filters:

Date
[ This Month ▼ ]

Category
[ All ▼ ]

Status
[ All ▼ ]

Payment Method
[ All ▼ ]

[ Search ]

And allow:

Export CSV

That's useful for the owner/accountant.