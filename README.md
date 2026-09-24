# 🏆 SportNest

A full-stack sports e-commerce platform built with **Next.js, Go, and PostgreSQL**.

SportNest is designed as a modern online sports store where users can browse products, manage their cart, place orders, and track their purchases. The project follows a separated frontend/backend architecture.

## 🧱 Tech Stack

### Frontend

* **Next.js**
* **React**
* **JavaScript**
* **Zustand** — State management
* **Lucide React** — Icons
* **jsPDF / AutoTable** — Reports & PDF generation

### Backend

* **Go**
* REST API architecture
* Authentication & authorization
* Order management
* Product management

### Database

* **PostgreSQL**

## 📁 Project Structure

```text
sportnest/
│
├── frontend/          # Next.js frontend application
│
├── backend/           # Go backend / REST API
│
├── .gitignore
└── README.md
```

## ✨ Features

### 🛍️ Customer

* Browse sports products
* Product details
* Search and product filtering
* Shopping cart
* User authentication
* Place orders
* View order history
* Track order status

### 🔐 Authentication

* User authentication
* Protected routes
* Role-based access
* Shop-owner/admin authorization

### 🧑‍💼 Admin / Shop Owner

* Product management
* Order management
* Customer management
* Order status updates
* Sales/report generation
* Admin dashboard

### 📦 Order Status

SportNest supports the following order states:

```text
pending_confirmation
        ↓
     confirmed
        ↓
  out_for_delivery
        ↓
     delivered
```

Orders can also be:

```text
cancelled
```

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/jahidprog/sportnest.git
cd sportnest
```

Then set up the frontend and backend separately.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will normally run at:

```text
http://localhost:3000
```

### Backend

Open another terminal:

```bash
cd backend
```

Install the required Go dependencies:

```bash
go mod download
```

Then run the backend:

```bash
go run .
```

> Backend configuration may require environment variables such as database credentials and authentication secrets.

## 🔐 Environment Variables

Do **not** commit `.env` files or secrets to GitHub.

Example:

```text
frontend/
└── .env.local

backend/
└── .env
```

Keep sensitive values such as:

```text
DATABASE_URL
JWT_SECRET
API_KEYS
```

outside the repository.

## 🗄️ Database

SportNest uses **PostgreSQL** as its primary database.

Make sure PostgreSQL is running before starting the backend.

Example database configuration:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/sportnest
```

Use your actual local configuration rather than committing credentials.

## 🔄 Application Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Next.js      │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                         REST API
                             │
                             ▼
                    ┌──────────────────┐
                    │       Go         │
                    │     Backend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │     Database     │
                    └──────────────────┘
```

## 🛠️ Development

The project is split into two independently developed applications:

```text
Frontend
Next.js → UI / UX / State / API integration

Backend
Go → REST API / Business Logic / Authentication

Database
PostgreSQL → Persistent Data
```

When working on a feature that requires both sides, update the backend API first and then integrate the API into the frontend.

## 📌 Project Status

🚧 **Under active development**

SportNest is being developed as a full-stack e-commerce project with a focus on:

* Clean architecture
* Real-world API integration
* Authentication & authorization
* E-commerce workflows
* Admin management
* Production deployment

## 👨‍💻 Author

**Jahid**

GitHub: [@jahidprog](https://github.com/jahidprog)

## 📄 License

This project is currently intended for educational and development purposes.
