<div align="center">

# 💸 SmartExpense

**A premium dark-themed expense tracker built with React + Express**

![Demo](docs/demo.webp)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)

</div>

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🔐 Auth | Sign up / Login / **Forgot password** (OTP flow) |
| 📊 Dashboard | Animated stat cards, spending-by-category chart, recent transactions |
| ➕ Add Expense | Category pill grid with emoji, ₹ amount input |
| 📋 History | Searchable table, inline edit modal, inline delete confirm |
| 💡 Budget | Set a monthly budget — progress bar turns red when over |
| 🌙 Design | Dark glassmorphism theme, smooth animations, responsive |

---

## 🚀 Getting Started

> **Node 18+ is required.** If you're on an older Node, install via [nvm](https://github.com/nvm-sh/nvm).

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/smart-expense-tracker-starter.git
cd smart-expense-tracker-starter
```

### 2. Start the backend
```bash
cd server
npm install
node server.js
# → API running at http://localhost:5000
```

### 3. Start the frontend (new terminal)
```bash
cd client
npm install
npm run dev
# → App running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Forgot Password Flow

1. Click **"Forgot password?"** on the login screen
2. Enter your email — a 6-digit OTP is generated (check server console in dev mode)
3. Enter the OTP code
4. Set a new password (with live strength meter)

> In development, the OTP is also returned in the API response and shown in the UI.  
> For production, wire up an email provider (e.g. Nodemailer + SendGrid) to send the code.

---

## 🗂️ Project Structure

```
smart-expense-tracker-starter/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/           # Login, Dashboard, AddExpense, History
│       ├── components/      # Navbar, StatsCard, ExpenseChart, EditModal
│       ├── api.js           # Axios instance with auth interceptor
│       └── index.css        # Dark design system (CSS variables)
└── server/
    └── server.js            # Express API (auth, expenses, budget, OTP reset)
```

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/signup` | ✗ | Create account |
| POST | `/login` | ✗ | Sign in |
| POST | `/forgot-password` | ✗ | Request OTP code |
| POST | `/reset-password` | ✗ | Reset password with OTP |
| GET | `/expenses` | ✓ | List your expenses (newest first) |
| POST | `/expenses` | ✓ | Add expense |
| PUT | `/expenses/:id` | ✓ | Edit expense |
| DELETE | `/expenses/:id` | ✓ | Delete expense |
| GET | `/summary` | ✓ | Category totals, monthly breakdown |
| GET/PUT | `/budget` | ✓ | Get/set monthly budget |

---

## ⚠️ Notes

- **Data is in-memory** — lost on server restart. Add SQLite or MongoDB for persistence.
- Auth uses a simple `x-user-id` header. Use **JWT + httpOnly cookies** for production.
- The OTP `devOtp` field in the API response should be **removed in production**.
