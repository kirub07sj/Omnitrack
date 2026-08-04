Software Requirements Specification (SRS)
Project Name: omnitrack (working name)
Version: 1.0
Status: Draft

1. Introduction
1.1 Purpose
Omnitrack is an offline-first restaurant and small hotel management system designed to help businesses manage their daily operations efficiently. The application runs primarily on a local computer, allowing business operations to continue without an internet connection while synchronizing data with the cloud whenever connectivity is available.
The system aims to simplify restaurant operations by providing tools for sales, inventory management, employee management, expense tracking, reporting, and cloud backup.

1.2 Goals
The primary goals of Omnitrack are:
Enable restaurants to operate without a constant internet connection.
Reduce manual record keeping.
Improve inventory accuracy.
Provide financial insights through reports.
Allow multiple staff members to use the system simultaneously.
Automatically synchronize business data to the cloud.
Support multiple businesses using the same software platform.

1.3 Target Users
Omnitrack is intended for:
Restaurants
Cafés
Fast food businesses
Small hotels without complex reservation systems
Bars and lounges
Coffee shops

1.4 User Roles
Owner
The owner has unrestricted access to all system features.
Responsibilities:
Business settings
Reports
Employee management
Inventory
Expenses
Sales
Synchronization
System configuration

Manager
Responsible for daily business operations.
Permissions include:
Inventory
Employees
Reports
Sales
Expenses
Restrictions:
Cannot modify licenses
Cannot delete business
Cannot access developer settings

Cashier
Responsible for customer payments.
Permissions:
Create sales
Process payments
Print receipts
View current-day sales
Restrictions:
Cannot modify inventory
Cannot manage employees
Cannot access financial reports

Waiter
Responsible for customer service.
Permissions:
View assigned tables
Create orders
Update order status
Request payment
Restrictions:
Cannot access reports
Cannot manage inventory
Cannot process payments

Kitchen Staff
Responsible for preparing food.
Permissions:
View incoming orders
Update preparation status
Restrictions:
Cannot modify orders
Cannot access financial information

2. Product Overview
Omnitrack consists of two major components.
Local System
Runs inside the restaurant.
Responsible for:
Daily operations
Local database
Staff management
Sales
Inventory
Printing receipts
The local system continues functioning even if the internet connection is unavailable.

Cloud Platform
Provides:
Data backup
Business synchronization
Software updates
License verification
Remote reporting
Multi-business management
The cloud platform is not required for daily restaurant operations but enhances security, management, and data accessibility.


3. Product Scope
Omnitrack Version 1.0 includes:
Authentication
Employee management
Sales management
Inventory management
Expense management
Reporting dashboard
Synchronization
User roles
Local networking for waiter access
Cloud backup
Reservation management, online ordering, accounting integrations, and customer loyalty programs are outside the scope of Version 1.0.

4. Database

Table businesses {
  id uuid [pk]
  name varchar
  phone varchar
  email varchar
  address text
  logo text
  currency varchar
  tax_rate decimal
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
  salary decimal
  hire_date date
  status varchar
}

Table users {
  id uuid [pk]
  business_id uuid
  employee_id uuid
  role_id uuid
  username varchar
  password_hash text
  status varchar
  last_login timestamp
}

Table restaurant_tables {
  id uuid [pk]
  business_id uuid
  table_number varchar
  capacity int
  status varchar
}

Table categories {
  id uuid [pk]
  business_id uuid
  name varchar
}

Table products {
  id uuid [pk]
  business_id uuid
  category_id uuid
  name varchar
  sku varchar
  price decimal
  cost decimal
  status varchar
}

Table inventory {
  id uuid [pk]
  business_id uuid
  product_id uuid
  quantity decimal
  minimum_quantity decimal
}

Table inventory_movements {
  id uuid [pk]
  business_id uuid
  product_id uuid
  type varchar
  quantity decimal
  reference_type varchar
  reference_id uuid
  created_at timestamp
}

Table suppliers {
  id uuid [pk]
  business_id uuid
  name varchar
  phone varchar
  email varchar
  address text
}

Table purchases {
  id uuid [pk]
  business_id uuid
  supplier_id uuid
  total decimal
  status varchar
  created_at timestamp
}

Table purchase_items {
  id uuid [pk]
  purchase_id uuid
  product_id uuid
  quantity decimal
  cost decimal
}

Table orders {
  id uuid [pk]
  business_id uuid
  table_id uuid
  waiter_id uuid
  status varchar
  notes text
  created_at timestamp
}

Table order_items {
  id uuid [pk]
  order_id uuid
  product_id uuid
  quantity decimal
  price decimal
}

Table payments {
  id uuid [pk]
  business_id uuid
  order_id uuid
  amount decimal
  method varchar
  status varchar
  proof_image text
  paid_at timestamp
}

Table sales {
  id uuid [pk]
  business_id uuid
  order_id uuid
  cashier_id uuid
  subtotal decimal
  tax decimal
  discount decimal
  total decimal
  created_at timestamp
}

Table expenses {
  id uuid [pk]
  business_id uuid
  category varchar
  amount decimal
  description text
  receipt_image text
  created_at timestamp
}

Table sync_queue {
  id uuid [pk]
  business_id uuid
  entity varchar
  entity_id uuid
  operation varchar
  status varchar
  created_at timestamp
}

Ref: employees.business_id > businesses.id
Ref: users.business_id > businesses.id
Ref: users.employee_id > employees.id
Ref: users.role_id > roles.id

Ref: restaurant_tables.business_id > businesses.id

Ref: categories.business_id > businesses.id
Ref: products.business_id > businesses.id
Ref: products.category_id > categories.id

Ref: inventory.business_id > businesses.id
Ref: inventory.product_id > products.id

Ref: inventory_movements.business_id > businesses.id
Ref: inventory_movements.product_id > products.id

Ref: suppliers.business_id > businesses.id

Ref: purchases.business_id > businesses.id
Ref: purchases.supplier_id > suppliers.id

Ref: purchase_items.purchase_id > purchases.id
Ref: purchase_items.product_id > products.id

Ref: orders.business_id > businesses.id
Ref: orders.table_id > restaurant_tables.id
Ref: orders.waiter_id > employees.id

Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id

Ref: payments.business_id > businesses.id
Ref: payments.order_id > orders.id

Ref: sales.business_id > businesses.id
Ref: sales.order_id > orders.id
Ref: sales.cashier_id > employees.id

Ref: expenses.business_id > businesses.id

Ref: sync_queue.business_id > businesses.id