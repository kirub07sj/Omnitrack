Software Requirements Specification (SRS)
Project Name: omnitrack (working name)
Version: 1.0
Status: Draft

1. Introduction
1.1 Purpose
Omnitrack is a comprehensive restaurant and small hotel management system. Due to the complexities of network stability in hospitality environments, Omnitrack has been architected as two completely independent product offerings:
- **Omnitrack Desktop (Offline Edition):** A local, standalone application that requires no internet connection for daily operations.
- **Omnitrack Cloud (SaaS Edition):** A fully cloud-based web application for real-time remote management and multi-device synchronization.

The system aims to simplify restaurant operations by providing tools for sales, inventory management, employee management, expense tracking, and reporting.

1.2 Goals
The primary goals of Omnitrack are:
- Provide a robust offline solution for businesses with unreliable internet.
- Provide a modern cloud SaaS solution for modern, multi-location businesses.
- Reduce manual record keeping and improve inventory accuracy.
- Provide financial insights through comprehensive reports.
- Support role-based access for multiple staff members.

1.3 Target Users
Omnitrack is intended for:
Restaurants, Cafés, Fast food businesses, Small hotels without complex reservation systems, Bars and lounges, and Coffee shops.

1.4 User Roles
- **Super Admin (Cloud Only):** Platform administrator responsible for managing SaaS tenants (businesses), subscriptions, global statistics, and system-wide settings.
- **Owner:** Unrestricted access to all system features (Business settings, Reports, Employee management, Inventory, Expenses, Sales).
- **Manager:** Responsible for daily operations (Inventory, Employees, Reports, Sales, Expenses). Cannot modify licenses or delete the business.
- **Cashier:** Responsible for customer payments (Create sales, Process payments, Print receipts).
- **Waiter:** Responsible for customer service (View assigned tables, Create orders).
- **Kitchen Staff:** Responsible for preparing food (View incoming orders, Update preparation status).

2. Product Overview
Omnitrack consists of two separate software distributions:

2.1 Omnitrack Desktop (Offline Edition)
- Runs completely locally on a restaurant's computer via an Electron application and local SQLite database.
- Designed to function flawlessly with zero internet connection.
- Activated via a one-time or recurring Product Activation Key (managed by an external Product Key Manager Web App).
- Waiter and Kitchen tablets connect to the main POS computer over Local Area Network (LAN).

2.2 Omnitrack Cloud (SaaS Edition)
- Hosted on modern cloud infrastructure (Vercel and Neon PostgreSQL).
- Designed for owners who want to monitor their business from anywhere in the world.
- Uses a Subscription/Account-based model (SaaS) rather than activation keys.
- Requires a persistent internet connection for all devices.

3. Product Scope
Omnitrack Version 1.0 includes:
- Super Admin Tenant Management (Cloud Edition)
- Authentication & Role-based Access
- Employee management
- Sales and Order management (POS)
- Inventory and Purchase management
- Expense management
- Reporting dashboard
- Local LAN networking (Desktop) / Global accessibility (Cloud)

*Note: Reservation management, online ordering, accounting integrations, and customer loyalty programs are outside the scope of Version 1.0.*

4. Database

Table businesses {
  id uuid [pk]
  name varchar
  owner_name varchar
  phone varchar
  email varchar
  address text
  logo text
  currency varchar
  tax_rate decimal
  is_kitchen_active boolean
  settings text
  created_at timestamp
  updated_at timestamp
}

Table subscriptions {
  id uuid [pk]
  account_id varchar
  business_id uuid
  plan varchar
  status varchar
  starts_at timestamp
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
}

Table roles {
  id uuid [pk]
  name varchar
}

Table employees {
  id uuid [pk]
  business_id uuid
  first_name varchar
  last_name varchar
  phone varchar
  email varchar
  salary decimal
  status varchar
}

Table users {
  id uuid [pk]
  business_id uuid
  employee_id uuid
  role_id uuid
  username varchar
  password_hash varchar
  status varchar
}

Table restaurant_tables {
  id uuid [pk]
  business_id uuid
  table_number varchar
  capacity int
  status varchar
  waiter_id uuid
}

Table categories {
  id uuid [pk]
  business_id uuid
  name varchar
  status varchar
}

Table products {
  id uuid [pk]
  business_id uuid
  category_id uuid
  inventory_item_id uuid
  name varchar
  price decimal
  cost decimal
  track_inventory boolean
  status varchar
}

Table inventory_items {
  id uuid [pk]
  business_id uuid
  name varchar
  unit varchar
  quantity decimal
  minimum_quantity decimal
  cost_per_unit decimal
  supplier_id uuid
}

Table inventory_movements {
  id uuid [pk]
  business_id uuid
  inventory_item_id uuid
  type varchar
  quantity decimal
}

Table suppliers {
  id uuid [pk]
  business_id uuid
  name varchar
  phone varchar
  email varchar
}

Table purchases {
  id uuid [pk]
  business_id uuid
  supplier_id uuid
  total decimal
  status varchar
}

Table purchase_items {
  id uuid [pk]
  purchase_id uuid
  inventory_item_id uuid
  quantity decimal
  cost decimal
}

Table orders {
  id uuid [pk]
  business_id uuid
  table_id uuid
  waiter_id uuid
  status varchar
}

Table order_items {
  id uuid [pk]
  order_id uuid
  product_id uuid
  quantity decimal
  price decimal
}

Table transactions {
  id uuid [pk]
  business_id uuid
  order_id uuid
  purchase_id uuid
  expense_id uuid
  type varchar
  amount decimal
  method varchar
  date timestamp
}

Table sales {
  id uuid [pk]
  business_id uuid
  order_id uuid
  cashier_id uuid
  total decimal
}

Table expenses {
  id uuid [pk]
  business_id uuid
  category varchar
  amount decimal
  status varchar
}

Table sync_changes {
  id uuid [pk]
  business_id uuid
  entity_type varchar
  operation varchar
  status varchar
}

Ref: subscriptions.business_id - businesses.id
Ref: employees.business_id > businesses.id
Ref: users.business_id > businesses.id
Ref: users.employee_id > employees.id
Ref: users.role_id > roles.id
Ref: restaurant_tables.business_id > businesses.id
Ref: restaurant_tables.waiter_id > employees.id
Ref: categories.business_id > businesses.id
Ref: products.business_id > businesses.id
Ref: products.category_id > categories.id
Ref: products.inventory_item_id > inventory_items.id
Ref: inventory_items.business_id > businesses.id
Ref: inventory_items.supplier_id > suppliers.id
Ref: inventory_movements.business_id > businesses.id
Ref: inventory_movements.inventory_item_id > inventory_items.id
Ref: suppliers.business_id > businesses.id
Ref: purchases.business_id > businesses.id
Ref: purchases.supplier_id > suppliers.id
Ref: purchase_items.purchase_id > purchases.id
Ref: purchase_items.inventory_item_id > inventory_items.id
Ref: orders.business_id > businesses.id
Ref: orders.table_id > restaurant_tables.id
Ref: orders.waiter_id > employees.id
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id
Ref: transactions.business_id > businesses.id
Ref: transactions.order_id > orders.id
Ref: transactions.purchase_id > purchases.id
Ref: transactions.expense_id > expenses.id
Ref: sales.business_id > businesses.id
Ref: sales.order_id > orders.id
Ref: sales.cashier_id > employees.id
Ref: expenses.business_id > businesses.id
Ref: sync_changes.business_id > businesses.id


# Omnitrack Application Workflow

## 1. Application Startup

When the application launches, it performs a series of checks to determine the next screen.

```text
Launch Omnitrack
        │
        ▼
Is License Activated?
        │
   ┌────┴────┐
   │         │
  No        Yes
   │         │
License     Does Business Exist?
Activation         │
                   ▼
             ┌─────┴─────┐
             │           │
            No          Yes
             │           │
      Business Setup    Login
```

> **Note:** During development (v1), the License Activation step may be temporarily bypassed until the licensing server is implemented.

---

# 2. License Activation

The user enters the product key received after purchasing Omnitrack.

### Process

1. User enters the Product Key.
2. Omnitrack sends the key and device information to the License Server.
3. The License Server verifies:

   * Product key exists.
   * Product key is active.
   * Product key has not expired.
   * Device activation rules.
4. If valid:

   * The license is activated.
   * License information is stored locally.
5. The application proceeds to Business Setup.

If invalid, the user is notified and activation is denied.

---

# 3. Business Setup Wizard

This process is executed only once during the first installation.

## Step 1 – Business Information

The owner provides:

* Business Name
* Business Type
* Phone Number
* Email Address
* Physical Address
* Logo (Optional)
* Currency
* Time Zone

Creates:

* Business record

---

## Step 2 – Owner Account

The first administrator account is created.

Required information:

* Full Name
* Username or Email
* Password
* Confirm Password

Creates:

* Employee
* User
* Owner Role Assignment

---

## Step 3 – Restaurant Configuration

Basic operational settings.

Examples:

* Number of Tables
* Tax Percentage
* Inventory Enabled
* Receipt Settings

The user may skip optional configuration and complete it later.

---

## Step 4 – Initial Data (Optional)

Optional setup includes:

* Product Categories
* Products
* Employees
* Suppliers

The application should allow the owner to skip this step and configure everything later.

---

## Step 5 – Setup Completion

After successful setup:

* Business is created.
* Owner account is created.
* Initial configuration is saved.

The application redirects to the Login screen.

---

# 4. Authentication

Returning users must log in.

Process:

1. Enter username/email.
2. Enter password.
3. Credentials are verified.
4. User session is created.
5. User is redirected according to their role.

---

# 5. Role-Based Home Page

Each role lands on the page that best matches their daily workflow.

### Super Admin (Cloud Only)

Tenants / Global Dashboard

### Owner

Dashboard

### Manager

Dashboard

### Cashier

Orders / POS

### Waiter

Tables

### Kitchen Staff

Kitchen Queue

---

# 6. Daily Operational Workflow

Once logged in, Omnitrack supports the following business process.

```text
Customer Arrives
        │
        ▼
Assign Table
        │
        ▼
Waiter Creates Order
        │
        ▼
Kitchen Receives Order
        │
        ▼
Kitchen Marks Order Ready
        │
        ▼
Food Served
        │
        ▼
Customer Pays
        │
        ▼
Payment Recorded
        │
        ▼
Sale Completed
        │
        ▼
Inventory Updated
        │
        ▼
Reports Updated
```

---

# 7. Deployment Models

Omnitrack no longer relies on real-time bidirectional synchronization, as network instability creates critical conflicts (split-brain). Instead, businesses choose between two distinct deployment models:

### 7.1 Omnitrack Desktop (Offline Edition)
*   All business operations are performed using the local SQLite database.
*   No internet connection is required for daily operations.
*   The application remains fully functional indefinitely.
*   Optional backup: The owner may initiate a one-way sync to a cloud backup for disaster recovery, but this is strictly a backup push, not a bidirectional merge.

### 7.2 Omnitrack Cloud (SaaS Edition)
*   All business operations hit the live Neon PostgreSQL database via Vercel Edge endpoints.
*   A persistent internet connection is required.
*   Allows instantaneous multi-location monitoring, real-time analytics, and out-of-store management.

---

# 8. Subscription and Licensing Workflows

The licensing model depends strictly on which version of Omnitrack the business is using.

### 8.1 Desktop Licensing (Product Key Manager)
The Desktop Edition uses a traditional software licensing model managed by an external **Product Key Manager**.
*   **Workflow:** The user purchases the software (or subscription) through a payment portal. They receive a 16-character alphanumeric Activation Key.
*   **Activation:** The software contacts the License Server *once* during setup (or periodically if required by the license) to validate the key against hardware fingerprints.
*   **Offline Mode:** Once activated, the restaurant operates fully offline until the key expires (if applicable).

### 8.2 Cloud Subscriptions (SaaS Model)
The Cloud Edition uses a native account and subscription architecture managed within the cloud backend.
*   **Workflow:** The user registers via the Cloud Web Portal using their email and password.
*   **Subscription:** A subscription record is created (e.g., a 30-day trial). The `expires_at` column tracks their access window.
*   **Billing:** Payment processing (e.g., via Stripe webhooks or manual administrator extension) updates the `expires_at` timestamp on their subscription record.
*   **Enforcement:** Access is enforced via JWT Authentication. If the subscription expires, the user is redirected to a billing page and the API returns `403 Forbidden` for data mutations. Product keys are **not** used.

---

# 9. Password Recovery

## Owner

Preferred method:

* Password reset through the License Server using the registered email.

Alternative offline method:

* Recovery Code generated during setup.

## Employees

Employees do not reset their own passwords.

Managers or Owners may reset employee passwords from the Employee Management module.

---

# 10. Future Licensing Workflow

Omnitrack licensing will be managed through a separate License Management System.

Responsibilities include:

* Customer registration
* Product key generation
* License activation
* Device management
* Subscription renewal
* License suspension
* Usage monitoring

Omnitrack communicates with the License Server only when:

* Activating a license
* Verifying license status
* Renewing subscriptions
* Synchronizing business data

The restaurant can continue operating offline between successful license verifications.
