# ⬡ STOCKR — Inventory & Order Management System

A full-stack Inventory & Order Management System built with FastAPI, React, and PostgreSQL. Containerized with Docker and ready for deployment.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────┐
│                Docker Compose                   │
│                                                 │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐  │
│  │ Frontend │   │ Backend  │   │ PostgreSQL  │  │
│  │  React   │──▶│ FastAPI  │──▶│   DB       │  │
│  │ :3000    │   │  :8000   │   │  :5432     │  │
│  └──────────┘   └──────────┘   └────────────┘  │
└─────────────────────────────────────────────────┘
```

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

---

## 🚀 Quick Start (Docker Compose)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose

### 1. Clone & configure

```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD
```

### 2. Build & run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### 3. Stop

```bash
docker compose down          # keep DB data
docker compose down -v       # also delete DB volume
```

---

## 🛠 Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set env (point to a running Postgres)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db"

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# Point to backend
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local

npm start
```

---

## 🌐 Free Deployment Guide

### Backend → Render.com (free tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo, select the `backend/` directory
4. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add a **Render PostgreSQL** database (free tier)
6. Set environment variable:
   - `DATABASE_URL` → connection string from Render PostgreSQL

### Frontend → Vercel / Netlify (free tier)

**Vercel:**
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo, set **Root Directory** to `frontend/`
3. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL (e.g., `https://stockr-api.onrender.com`)
4. Deploy

**Netlify:**
1. Go to [netlify.com](https://netlify.com) → **Add new site**
2. Connect repo, set **Base directory** to `frontend/`
3. Build command: `npm run build`
4. Publish directory: `frontend/build`
5. Add env var `REACT_APP_API_URL`

### CORS note
The backend uses `allow_origins=["*"]` — in production you may want to restrict this to your frontend domain in `main.py`.

---

## 🐳 Docker Image (Docker Hub)

```bash
# Backend
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/stockr-backend:latest .
docker push YOUR_DOCKERHUB_USERNAME/stockr-backend:latest

# Frontend
cd frontend
docker build \
  --build-arg REACT_APP_API_URL=https://your-backend-url.com \
  -t YOUR_DOCKERHUB_USERNAME/stockr-frontend:latest .
docker push YOUR_DOCKERHUB_USERNAME/stockr-frontend:latest
```

---

## 📡 API Reference

Base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders` | List orders (filterable by status) |
| POST | `/orders` | Create order (validates stock) |
| GET | `/orders/{id}` | Get order with items |
| PATCH | `/orders/{id}/status` | Update order status |

### Misc
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard statistics |
| GET | `/health` | Health check |

---

## 🗂 Project Structure

```
inventory-system/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # DB connection
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/       # Dashboard, Products, Customers, Orders
│   │   ├── utils/api.js # Axios API client
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔒 Security Notes

- All credentials via environment variables — never hardcoded
- `DATABASE_URL` injected at runtime
- `.env` is gitignored
- Use `.env.example` as a template
- Change default passwords before any production deployment

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Axios, lucide-react |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2, Pydantic v2 |
| Database | PostgreSQL 16 |
| Container | Docker, Docker Compose |
| Web Server | Nginx (frontend), Uvicorn (backend) |
