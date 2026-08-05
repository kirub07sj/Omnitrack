You are building the Employee Management module for Omnitrack, an offline-first Restaurant ERP system.

## Tech Stack
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Table
- TanStack Query
- React Hook Form
- Zod
- Desktop-first
- Light theme

## Goal

Create a complete Employee Management module that allows restaurant owners and managers to manage employees.

The module must be clean, reusable, modular, and production-ready.

DO NOT create mockup-only UI.
Generate real React components.

--------------------------------

EMPLOYEE LIST PAGE

Features

- Search employee
- Filter by role
- Filter by status
- Sort columns
- Pagination

Columns

- Profile Photo
- Employee ID
- Full Name
- Position
- Phone Number
- Salary
- Employment Status
- Hire Date
- Actions

Top Actions

- Add Employee
- Export
- Refresh

Row Actions

- View
- Edit
- Deactivate
- Delete

--------------------------------

ADD / EDIT EMPLOYEE

Fields

Personal Information

- First Name
- Last Name
- Gender
- Date of Birth
- Phone Number
- Email
- Address
- National ID (optional)
- Emergency Contact

Employment Information

- Employee Number
- Position
- Department
- Salary
- Employment Type
    - Full Time
    - Part Time
    - Contract

- Hire Date
- Status
    - Active
    - On Leave
    - Suspended
    - Terminated

Optional Login Account

Checkbox:

Create Login Account

If enabled:

- Username
- Password
- Confirm Password
- Role

Roles

- Owner
- Manager
- Cashier
- Waiter
- Kitchen

--------------------------------

EMPLOYEE DETAILS PAGE

Tabs

Overview

Employment

Attendance (placeholder)

Activity Log (placeholder)

Documents (placeholder)

Display

- Profile Photo
- Contact Information
- Employment Details
- Salary
- Current Status
- Assigned Role

--------------------------------

VALIDATION

Use React Hook Form and Zod.

Validate

- Required fields
- Valid email
- Phone number
- Salary must be positive
- Password confirmation

--------------------------------

COMPONENTS

Create reusable components

EmployeeTable

EmployeeForm

EmployeeCard

EmployeeAvatar

EmployeeStatusBadge

EmployeeDetails

DeleteEmployeeDialog

DeactivateEmployeeDialog

--------------------------------

DESIGN

Use shadcn/ui only.

Large data table.

Consistent spacing.

Professional ERP layout.

Desktop-first.

Minimal animations.

Accessible.

Keyboard friendly.

--------------------------------

FOLDER STRUCTURE

Generate the module using feature-based architecture.

src/modules/employees

├── components
├── pages
├── hooks
├── services
├── schemas
├── types
├── utils
└── index.ts

Keep every component reusable.

Avoid duplicated code.

Generate production-quality React + TypeScript code.