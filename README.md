# Expense Voucher Management System

A full-stack web application for ABC Company to digitize the expense voucher creation, approval, and tracking process. Built with **React**, **Node.js/Express**, **PostgreSQL**, and **JWT authentication**.

## Features

- **Employee Portal** — Create, edit, delete, and submit expense vouchers with signature upload
- **Director Portal** — Review, approve, or reject submitted vouchers with signature and rejection remarks
- **Accounts Portal** — View all vouchers organization-wide for reimbursement processing
- **Role-Based Access Control** — JWT authentication with three distinct user roles
- **Advanced Search & Filters** — Search by voucher number, employee name, department, category, status, date range, amount range
- **Sortable Tables** — Click column headers to sort ascending/descending
- **Pagination** — Server-side pagination for efficient data loading
- **Cloudinary Integration** — Signature images uploaded to cloud storage
- **Print Support** — Print-friendly voucher detail view

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4     |
| Backend   | Node.js, Express.js                 |
| Database  | PostgreSQL with Sequelize ORM       |
| Auth      | JWT (JSON Web Tokens), bcrypt       |
| Storage   | Cloudinary (signature images)       |
| Icons     | Lucide React                        |

## Database Schema

### Users Table
| Column            | Type         | Description                        |
|-------------------|--------------|------------------------------------|
| id                | UUID (PK)    | Auto-generated primary key         |
| name              | VARCHAR(100) | User's full name                   |
| email             | VARCHAR(150) | Unique login email                 |
| password          | VARCHAR(255) | Bcrypt-hashed password             |
| role              | ENUM         | 'employee', 'director', 'accounts' |
| department        | VARCHAR(100) | Department name                    |
| employee_id_number| VARCHAR(50)  | Optional employee identifier       |
| created_at        | TIMESTAMP    | Auto-generated                     |
| updated_at        | TIMESTAMP    | Auto-generated                     |

### Vouchers Table
| Column             | Type          | Description                                        |
|--------------------|---------------|----------------------------------------------------|
| id                 | UUID (PK)     | Auto-generated primary key                         |
| voucher_number     | VARCHAR(20)   | Unique, auto-generated (VCH-YYYYMMDD-XXXX)         |
| voucher_date       | DATE          | Date of voucher creation                           |
| expense_date       | DATE          | Date when expense occurred                         |
| department         | VARCHAR(100)  | Department name                                    |
| expense_title      | VARCHAR(200)  | Brief title of the expense                         |
| expense_category   | VARCHAR(100)  | Category (Travel, Office Supplies, etc.)           |
| expense_description| TEXT          | Detailed description                               |
| amount             | DECIMAL(12,2) | Expense amount in INR                              |
| status             | ENUM          | 'draft', 'submitted', 'approved', 'rejected'      |
| employee_name      | VARCHAR(100)  | Name of the employee who created the voucher       |
| employee_id_number | VARCHAR(50)   | Employee ID (optional)                             |
| employee_signature | VARCHAR(500)  | Cloudinary URL of employee signature image         |
| director_signature | VARCHAR(500)  | Cloudinary URL of director signature image         |
| approval_date      | TIMESTAMP     | Date/time of approval                              |
| rejection_reason   | TEXT          | Reason for rejection (required if rejected)        |
| created_by         | UUID (FK)     | References users.id                                |
| approved_by        | UUID (FK)     | References users.id                                |
| created_at         | TIMESTAMP     | Auto-generated                                     |
| updated_at         | TIMESTAMP     | Auto-generated                                     |

### Voucher Status Workflow
```
Draft → Submitted → Approved (visible to Accounts for reimbursement)
                  → Rejected (employee can view rejection reason)
```

## API Documentation

### Authentication
| Method | Endpoint         | Description       | Access |
|--------|-----------------|-------------------|--------|
| POST   | /api/auth/login  | Login user        | Public |
| GET    | /api/auth/me     | Get current user  | Auth   |

### Vouchers
| Method | Endpoint                         | Description              | Access    |
|--------|----------------------------------|--------------------------|-----------|
| GET    | /api/vouchers                    | List vouchers            | Auth      |
| GET    | /api/vouchers/:id                | Get voucher detail       | Auth+Role |
| POST   | /api/vouchers                    | Create voucher (draft)   | Employee  |
| PUT    | /api/vouchers/:id                | Update draft voucher     | Employee  |
| DELETE | /api/vouchers/:id                | Delete draft voucher     | Employee  |
| PATCH  | /api/vouchers/:id/submit         | Submit for approval      | Employee  |
| PATCH  | /api/vouchers/:id/approve        | Approve voucher          | Director  |
| PATCH  | /api/vouchers/:id/reject         | Reject voucher           | Director  |
| PATCH  | /api/vouchers/:id/signature      | Upload signature to voucher | Auth   |
| GET    | /api/vouchers/stats/dashboard    | Dashboard statistics     | Auth      |

### File Upload
| Method | Endpoint                | Description            | Access |
|--------|------------------------|------------------------|--------|
| POST   | /api/upload/signature  | Upload signature image | Auth   |

### Query Parameters (GET /api/vouchers)
- `search` — Search across voucher number, employee name, title
- `status` — Filter by status (draft, submitted, approved, rejected)
- `department` — Filter by department
- `category` — Filter by expense category
- `dateFrom` / `dateTo` — Date range filter
- `amountMin` / `amountMax` — Amount range filter
- `sortBy` — Sort column (created_at, amount, status, etc.)
- `sortOrder` — ASC or DESC
- `page` / `limit` — Pagination

## Project Setup

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Cloudinary account (free tier)

### 1. Clone and Install

```bash
git clone <repository-url>
cd vabc

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:
- Set your PostgreSQL password
- Set a JWT secret key
- Add your Cloudinary credentials

### 3. Create PostgreSQL Database

```sql
CREATE DATABASE vabc_vouchers;
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates three demo users:
| Role      | Email              | Password    |
|-----------|-------------------|-------------|
| Employee  | employee@abc.com  | password123 |
| Director  | director@abc.com  | password123 |
| Accounts  | accounts@abc.com  | password123 |

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Assumptions

1. A single Director approves/rejects all vouchers (no multi-level approval chain).
2. Voucher numbers are auto-generated per day (VCH-YYYYMMDD-XXXX).
3. "Submitted" and "Pending Approval" are the same status internally (`submitted`).
4. Signature images are uploaded to Cloudinary; no local file storage.
5. Employee can only view their own vouchers; Director and Accounts can view all.
6. Once submitted, vouchers become read-only for the employee.
7. Rejected vouchers include a mandatory rejection reason but cannot be resubmitted.
8. The application uses client-side routing with React Router v6.
9. Currency is displayed in Indian Rupees (INR).
