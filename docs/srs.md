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
