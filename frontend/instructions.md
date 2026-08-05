The goal is to create a reusable, production-ready Products module.

--------------------------------------------------

MODULE FEATURES

The module should contain:

1. Products List
2. Product Details
3. Add Product
4. Edit Product
5. Delete Product
6. Categories Management
7. Product Import (CSV)
8. Product Export (CSV)

--------------------------------------------------

PRODUCT LIST

Display products in a professional data table.

Columns

- Product Image
- SKU
- Product Name
- Category
- Selling Price
- Purchase Price
- Unit
- Inventory Tracking
- Status
- Last Updated

Table Features

- Search
- Category Filter
- Status Filter
- Sort
- Pagination
- Column Visibility
- Export CSV

Top Actions

- Add Product
- Import CSV
- Export CSV
- Refresh

Row Actions

- View
- Edit
- Duplicate
- Archive
- Delete

--------------------------------------------------

ADD / EDIT PRODUCT

Product Information

- Product Name
- SKU (auto-generate with manual override)
- Barcode (optional)
- Category
- (+ Create Category)
- Description

Pricing

- Purchase Price
- Selling Price

Unit

Dropdown

Examples

- Piece
- Bottle
- Kg
- Gram
- Liter
- Box
- Packet

Inventory

Checkbox

Track Inventory

If enabled

- Minimum Stock Level
- Opening Stock
- Opening Stock Date

If disabled

Hide inventory-related fields.

Media

- Product Image Upload

Status

- Active
- Inactive

--------------------------------------------------

CATEGORY MANAGEMENT

Manage categories without leaving the Products module.

Features

- Category List
- Create Category
- Edit Category
- Delete Category
- Search Categories

Category Fields

- Category Name
- Description
- Active

Categories should also be creatable directly from the Product Form using a modal dialog.

--------------------------------------------------

PRODUCT DETAILS

Display

- Image
- Name
- SKU
- Barcode
- Category
- Description
- Purchase Price
- Selling Price
- Unit
- Inventory Tracking
- Minimum Stock
- Current Stock (placeholder)
- Created Date
- Updated Date

Tabs

Overview

Inventory (placeholder)

Sales History (placeholder)

Purchase History (placeholder)

--------------------------------------------------

CSV IMPORT

Allow importing products using CSV.

Supported Columns

Name

SKU

Category

Purchase Price

Selling Price

Unit

Track Inventory

Minimum Stock

Provide:

- Download Sample CSV
- Validation
- Import Summary
- Error Report

--------------------------------------------------

CSV EXPORT

Export

- All Products
- Filtered Products
- Selected Products

--------------------------------------------------

VALIDATION

Use React Hook Form.

Use Zod.

Validate

- Required Product Name
- Positive Prices
- Unique SKU
- Category Required
- Unit Required
- Minimum Stock >= 0

--------------------------------------------------

REUSABLE COMPONENTS

ProductTable

ProductForm

ProductCard

ProductImage

CategoryDialog

CategoryTable

ProductStatusBadge

ImportDialog

ExportDialog

DeleteProductDialog

--------------------------------------------------

DESIGN

Professional ERP design.

Desktop-first.

Minimal animations.

Consistent spacing.

Large data tables.

Keyboard friendly.

Accessible.

Use shadcn/ui only.

--------------------------------------------------

FOLDER STRUCTURE

src/modules/products

components/
pages/
hooks/
services/
schemas/
types/
utils/
index.ts

--------------------------------------------------

IMPORTANT

Products are the foundation for Orders, Purchases, Inventory, and Reports.

Design the module to be reusable.

Do not implement inventory logic yet.

Current Stock, Purchase History, and Sales History should use placeholder components that can later be connected to Inventory and Orders modules.

Generate clean, modular, production-quality React + TypeScript code.