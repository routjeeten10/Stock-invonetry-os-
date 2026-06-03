# ⬡ STOCKR — Inventory & Order Management System

A full-stack Inventory & Order Management System built with FastAPI, React, and PostgreSQL. Containerized with Docker and ready for deployment.




## ✅ Features

### Business Rules Implemented
- **Unique SKUs**: Product SKUs are enforced unique at DB + API level
- **Unique Emails**: Customer emails are enforced unique at DB + API level
- **Inventory Validation**: Orders check stock availability before creation
- **Automatic Stock Reduction**: Placing an order atomically deducts stock
- **Insufficient Stock Guard**: Orders are blocked with a clear error when stock is too low

### Modules
| Module | Features |
|---|---|
| **Products** | CRUD, SKU uniqueness, stock tracking, category, low-stock highlighting |
| **Customers** | CRUD, unique email enforcement, contact details |
| **Orders** | Create with multiple line items, status lifecycle, stock validation |
| **Dashboard** | Live stats — revenue, orders, customers, low-stock alerts |

