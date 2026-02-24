# Smart Expense Tracker Starter

This project is a simple expense tracking application with a React frontend and an Express backend.

## Features implemented
- Login / Signup (basic in-memory auth) with styled card UI matching your mockups
- Dashboard showing total expenses, income, balance and simple category bar chart
- Add expense form with dropdown categories and date picker
- Expense history table with edit/delete actions
- Frontend routing with React Router and responsive design
- Basic mobile-friendly styling to approximate provided screenshots

> The UI is intentionally minimal; you can expand with charts, styling, and mobile responsiveness.

## Getting started

Two processes need to be started: backend and frontend.

> **Important:** make sure you run `npm install` in each folder before starting, otherwise the server will complain about missing modules (e.g. "Cannot find module 'express'" ).
> Also ensure Node.js (v18+) and npm are installed on your machine.

### 1. Install dependencies

```bash
# backend
cd server
npm install           # installs express, cors, etc.

# frontend
cd ../client
npm install           # installs React, router, axios, etc.
```

> make sure you are using Node 18+ for compatibility with Vite.

### 2. Run the server

```bash
cd server
node server.js
```

The API will be available at `http://localhost:5000`.

### 3. Run the client

```bash
cd client
npm run dev
```

Open http://localhost:5173 in your browser (vite default port). The app will connect to the backend automatically.


## Notes
- Data is stored in memory and will be lost when the server restarts. For production, integrate a database like SQLite or MongoDB.
- Authentication is simplified: the server returns a numeric user id which is stored in `localStorage`. This is **not secure**; use JWT or sessions for real apps.
- All API requests include the `x-user-id` header automatically via axios interceptor.

Feel free to style components and add charts as needed.
