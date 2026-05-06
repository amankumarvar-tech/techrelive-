# ⚡ TechRelive – Second-Hand Tech Marketplace

A full-stack MERN marketplace for buying and selling quality second-hand gadgets with condition grading (A/B/C), admin verification, and JWT authentication.

---

## 📁 Folder Structure

```
techrelive/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, login, profile
│   │   ├── product.controller.js  # CRUD + search/filter
│   │   └── admin.controller.js    # Approve/reject listings, user management
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT protect + restrictTo + generateToken
│   ├── models/
│   │   ├── User.model.js          # buyer | seller | admin, bcrypt, toPublicJSON
│   │   ├── Product.model.js       # Condition A/B/C, category, status workflow
│   │   └── Order.model.js         # Order with status history
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   └── admin.routes.js
│   ├── server.js                  # Express entry, CORS, global error handler
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── ProductCard.jsx
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       └── Footer.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx         # Browse, filter, search, pagination
    │   │   ├── ProductDetailPage.jsx# Image gallery, condition info, add to cart
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── SellerDashboard.jsx  # Post/edit/delete listings
    │   │   └── AdminDashboard.jsx   # Approve/reject, verify sellers, stats
    │   ├── store/
    │   │   ├── index.js             # Redux store
    │   │   └── slices/
    │   │       ├── authSlice.js     # Auth state + async thunks
    │   │       └── cartSlice.js     # Cart with localStorage persistence
    │   ├── utils/
    │   │   └── api.js               # Axios instance with JWT interceptors
    │   ├── App.jsx                  # Routes + ProtectedRoute wrapper
    │   ├── main.jsx
    │   └── index.css                # Tailwind + custom component classes
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend
cp .env.example .env        # Fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                 # Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env        # Set VITE_API_URL if needed
npm install
npm run dev                 # Runs on http://localhost:5173
```

---

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Get JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/products` | – | List (search, filter, paginate) |
| GET | `/api/products/:id` | – | Product detail |
| POST | `/api/products` | seller/admin | Create listing |
| PUT | `/api/products/:id` | owner | Update listing |
| DELETE | `/api/products/:id` | owner | Delete listing |
| GET | `/api/products/seller/my-listings` | seller | My listings |
| POST | `/api/orders` | buyer | Place order |
| GET | `/api/orders/my` | buyer | My orders |
| GET | `/api/admin/stats` | admin | Platform stats |
| GET | `/api/admin/products/pending` | admin | Pending approvals |
| PUT | `/api/admin/products/:id/approve` | admin | Approve listing |
| PUT | `/api/admin/products/:id/reject` | admin | Reject listing |
| GET | `/api/admin/users` | admin | All users |
| PUT | `/api/admin/users/:id/verify-seller` | admin | Verify seller |

---

## 🏷️ Condition Grades

| Grade | Label | Description |
|-------|-------|-------------|
| **A** | Like New | Minimal use, may include original accessories |
| **B** | Good | Light scratches, fully functional |
| **C** | Fair | Visible wear, works properly |

---

## 🔒 Security Features

- **bcryptjs** (cost factor 12) for password hashing
- JWT tokens with configurable expiry
- Passwords excluded from all DB queries via `select: false`
- CORS locked to `CLIENT_URL` env variable
- Role-based access: `buyer` → `seller` → `admin`
- Product listing workflow: `pending → approved/rejected → sold`

---

## ☁️ Deployment

### Backend → [Render](https://render.com)
1. Connect your GitHub repo
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env vars from `.env.example`

### Frontend → [Vercel](https://vercel.com)
1. Connect your GitHub repo
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add `VITE_API_URL` = your Render backend URL + `/api`
5. `vercel.json` handles SPA routing automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Lucide React |
| State | Redux Toolkit (Auth + Cart slices) |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| HTTP Client | Axios |
| Fonts | Syne (display) + DM Sans (body) |
