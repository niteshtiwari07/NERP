# NERP Operations Portal

An internal, production-grade ERP and CRM operations system designed for wholesale and distribution enterprises. Built with **React 18**, **TypeScript**, **Express.js**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication** with password hashing using `bcryptjs`.
- Four distinct enterprise roles with strict backend authorization middlewares (`requireAuth`, `requireRole`):
  - **ADMIN**: Full system control (Users, Customers, Products, Stock, Sales Challans, CRM).
  - **SALES**: Manage Customers, schedule Follow-ups, view Catalog, create & confirm Sales Challans.
  - **WAREHOUSE**: View Catalog, execute Stock IN / Stock OUT movements, track stock logs, confirm fulfilled Challans.
  - **ACCOUNTS**: Read-only oversight of Accounts, Products, and Financial Sales Challan records.

### 🏢 2. Customer CRM Module
- Customer master list with instant search, status filter (`LEAD`, `ACTIVE`, `INACTIVE`), and type filter (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`).
- Detailed Customer Profile page featuring contact info, GSTIN, shipping address, and order history.
- **Dedicated Follow-up Log**: Complete chronological history of client discussions and scheduled follow-up dates.

### 📦 3. Product Catalog & Inventory Management
- SKU master directory with category filtering and unique SKU constraints.
- **Low Stock Indicator**: Visual badges when `currentStock <= minimumStock`.
- **Stock Movement Log**: Mandatory audit trail for every `IN` and `OUT` inventory adjustment.
- **Negative Stock Prevention**: Database transactions prevent stock from dropping below zero.

### 📋 4. Sales Challan Workflow & Transactional Safety
- **Sequential Auto-Numbering**: Auto-generates challan IDs in format `SC-YYYY-0001`.
- **Product Snapshot Preservation**: Sales Challans store frozen snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`). Subsequent product price or title changes do not corrupt historic sales records.
- **Draft vs. Confirmed Lifecycle**:
  - `DRAFT`: Reserves items without altering inventory.
  - `CONFIRMED`: Triggers an atomic Prisma `$transaction`. Checks stock for **ALL** line items simultaneously. If **ANY** item stock is insufficient, the entire transaction rolls back and returns a structured `400 INSUFFICIENT_STOCK` error response.
  - `CANCELLED`: Cancels draft/confirmed orders for historic record-keeping.

---

## 🏗 System Architecture & Monorepo Structure

```
ERP/
├── README.md
├── package.json
├── ERP_CRM_Postman_Collection.json
├── client/                      # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── index.html
│   ├── src/
│   │   ├── components/         # Reusable UI (Badge, Modal, Table, Skeleton, Toast)
│   │   ├── features/           # ProtectedRoute & Auth Context
│   │   ├── hooks/              # useAuth, useToast
│   │   ├── pages/              # Dashboard, Customers, Products, Inventory, Challans
│   │   ├── routes/             # AppRoutes (React Router v6)
│   │   ├── services/           # Axios API Client & Modules
│   │   └── types/              # TypeScript Interfaces
├── server/                      # Node.js + Express + Prisma ORM + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema
│   │   └── seed.ts             # Test Credentials & Master Seed
│   └── src/
│       ├── config/             # Environment & Database Singletons
│       ├── controllers/        # Route Handlers
│       ├── middleware/         # Auth, Role, Zod Validation, Central Error Handler
│       ├── repositories/       # Prisma Database Queries & $transactions
│       ├── routes/             # Express API Endpoints
│       ├── services/           # Business Logic Layer
│       ├── utils/              # JWT, Password Hash, Challan Number Generator
│       └── validators/         # Zod Input Schemas
```

---

## 🔑 Test Credentials (Database Seed)

All accounts share a common development password: **`Password123!`**

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | Full System Access |
| **SALES** | `sales@example.com` | Customers, Follow-ups, Create & Confirm Challans |
| **WAREHOUSE** | `warehouse@example.com` | Products, Stock Movements, Fulfill Challans |
| **ACCOUNTS** | `accounts@example.com` | Financial Oversight & Read-Only Reports |

---

## ⚙️ Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18+ 
- **PostgreSQL**: Local instance, Docker container, or Cloud PostgreSQL URL (Supabase / Neon).

### 1. Installation
Clone the repository and install root dependencies:
```bash
npm run db:generate
```

### 2. Environment Variables
Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_db?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="24h"
CLIENT_URL="http://localhost:5173"
```

Create `.env` inside `client/`:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Database Migration & Seeding
Run Prisma database push and seed script:
```bash
cd server
npm run db:push
npm run prisma:seed
```

### 4. Running Local Servers
Start Backend Server (Port 5000):
```bash
npm run dev:server
```

Start Frontend Client (Port 5173):
```bash
npm run dev:client
```

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & return JWT.
- `GET /api/auth/me` - Fetch logged-in user profile.

### Customer CRM (`/api/customers`)
- `GET /api/customers` - List customers with search, type/status filter & pagination.
- `GET /api/customers/:id` - Detailed customer info + follow-up history + challans.
- `POST /api/customers` - Add new customer (Sales/Admin).
- `PATCH /api/customers/:id` - Update customer details.
- `POST /api/customers/:id/followups` - Log follow-up note & schedule next call.

### Products & Inventory (`/api/products`)
- `GET /api/products` - List products with stock levels & minimum alert badges.
- `POST /api/products` - Create product SKU (Warehouse/Admin).
- `PATCH /api/products/:id` - Update product details.
- `POST /api/products/:id/stock` - Record IN/OUT stock movement in transaction.
- `GET /api/products/:id/stock-movements` - View movement history.

### Sales Challans (`/api/challans`)
- `GET /api/challans` - List sales challans with status filter.
- `GET /api/challans/:id` - View challan details + item snapshots.
- `POST /api/challans` - Create DRAFT sales challan.
- `POST /api/challans/:id/confirm` - **Confirm Challan**: Atomic stock verification & deduction.
- `POST /api/challans/:id/cancel` - Cancel sales challan.

### Executive Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Total customers, active accounts, low stock warnings, recent challans & upcoming follow-ups.

---

## 🧪 Postman Collection

Import `ERP_CRM_Postman_Collection.json` into Postman.
- Configured with environment variables `{{baseUrl}}` and `{{token}}`.
- Pre-populated request bodies for quick manual testing.

---

## 🚀 Production Deployment Instructions

### Frontend (Vercel)
1. Import `client/` folder to Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-render-url.onrender.com/api`

### Backend (Render)
1. Import `server/` folder as Web Service on Render.
2. Environment: Node
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.

### Database (Supabase / Neon)
1. Create a PostgreSQL project on Supabase or Neon.
2. Copy Direct Connection String to `DATABASE_URL`.
3. Execute `npx prisma db push` and `npx tsx prisma/seed.ts`.

---

## 📜 Business Rules & Assumptions

1. **Snapshot Integrity**: Prices and names stored inside `SalesChallanItem` are immutable snapshots created at order entry.
2. **Atomic Rollback**: If a customer orders 5 items, and 4 items have ample stock while 1 item has 0 stock, the entire challan confirmation fails and no stock is modified.
3. **Audit History**: Outbound stock movements generated during challan confirmation carry reasons tagged with `Sales Challan Confirmation (SC-YYYY-XXXX)`.
