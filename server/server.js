
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// ─── In-memory storage ────────────────────────────────────────────────────────
let users = []      // { id, email, password }
let expenses = []   // { id, userId, amount, category, date, notes }
let budgets = []    // { userId, amount }
let otps = []       // { email, otp, expiresAt }
let nextUserId = 1
let nextExpenseId = 1

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getUserId(req) {
  const uid = req.headers['x-user-id']
  return uid ? parseInt(uid, 10) : null
}

function validateAmount(amount) {
  const n = parseFloat(amount)
  return !isNaN(n) && n > 0 ? n : null
}

app.get('/', (req, res) => res.send('Smart Expense Tracker API v2'))

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post('/signup', (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  if (users.find(u => u.email === email.toLowerCase().trim()))
    return res.status(409).json({ message: 'Email already registered' })
  const user = { id: nextUserId++, email: email.toLowerCase().trim(), password }
  users.push(user)
  res.status(201).json({ id: user.id, email: user.email })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })
  const user = users.find(u => u.email === email.toLowerCase().trim() && u.password === password)
  if (!user)
    return res.status(401).json({ message: 'Invalid credentials' })
  res.json({ id: user.id, email: user.email })
})

// ─── Forgot Password ─────────────────────────────────────────────────────────
app.post('/forgot-password', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email required' })
  const user = users.find(u => u.email === email.toLowerCase().trim())
  // Always respond generically to avoid email enumeration
  if (!user) return res.json({ message: 'If that email exists, a code was sent.' })

  // Generate 6-digit OTP, valid for 10 minutes
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = Date.now() + 10 * 60 * 1000

  // Remove any existing OTP for this email
  otps = otps.filter(o => o.email !== email.toLowerCase().trim())
  otps.push({ email: email.toLowerCase().trim(), otp, expiresAt })

  console.log(`[DEV] OTP for ${email}: ${otp}`) // In prod, send via email
  res.json({
    message: 'If that email exists, a code was sent.',
    // DEV ONLY — remove in production:
    devOtp: process.env.NODE_ENV === 'production' ? undefined : otp
  })
})

// ─── Reset Password ───────────────────────────────────────────────────────────
app.post('/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Email, OTP, and new password required' })
  if (newPassword.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  const record = otps.find(
    o => o.email === email.toLowerCase().trim() && o.otp === otp.trim()
  )
  if (!record) return res.status(400).json({ message: 'Invalid or expired code' })
  if (Date.now() > record.expiresAt)
    return res.status(400).json({ message: 'Code has expired. Request a new one.' })

  const user = users.find(u => u.email === email.toLowerCase().trim())
  if (!user) return res.status(400).json({ message: 'User not found' })

  user.password = newPassword
  otps = otps.filter(o => o.email !== email.toLowerCase().trim()) // Consume OTP
  res.json({ message: 'Password reset successfully. You can now log in.' })
})

// ─── Auth middleware ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (['/login', '/signup', '/', '/forgot-password', '/reset-password'].includes(req.path)) return next()
  const userId = getUserId(req)
  if (!userId || !users.find(u => u.id === userId))
    return res.status(401).json({ message: 'Unauthorized' })
  req.userId = userId
  next()
})

// ─── Expenses CRUD ────────────────────────────────────────────────────────────
app.get('/expenses', (req, res) => {
  const list = expenses
    .filter(e => e.userId === req.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  res.json(list)
})

app.post('/expenses', (req, res) => {
  const { amount, category, date, notes } = req.body
  const parsedAmount = validateAmount(amount)
  if (!parsedAmount)
    return res.status(400).json({ message: 'Valid positive amount required' })
  if (!category || !category.trim())
    return res.status(400).json({ message: 'Category required' })
  const exp = {
    id: nextExpenseId++,
    userId: req.userId,
    amount: parsedAmount,
    category: category.trim(),
    date: date || new Date().toISOString().slice(0, 10),
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString()
  }
  expenses.push(exp)
  res.status(201).json(exp)
})

app.put('/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const exp = expenses.find(e => e.id === id && e.userId === req.userId)
  if (!exp) return res.status(404).json({ message: 'Expense not found' })
  const { amount, category, date, notes } = req.body
  if (amount !== undefined) {
    const n = validateAmount(amount)
    if (!n) return res.status(400).json({ message: 'Valid positive amount required' })
    exp.amount = n
  }
  if (category) exp.category = category.trim()
  if (date) exp.date = date
  if (notes !== undefined) exp.notes = notes.trim()
  exp.updatedAt = new Date().toISOString()
  res.json(exp)
})

app.delete('/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const idx = expenses.findIndex(e => e.id === id && e.userId === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' })
  expenses.splice(idx, 1)
  res.status(204).end()
})

// ─── Summary (category totals + monthly breakdown) ───────────────────────────
app.get('/summary', (req, res) => {
  const list = expenses.filter(e => e.userId === req.userId)
  const total = list.reduce((s, e) => s + e.amount, 0)

  // Per-category totals
  const byCategory = {}
  list.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
  })

  // Monthly totals (last 6 months)
  const monthly = {}
  list.forEach(e => {
    const month = e.date.slice(0, 7) // YYYY-MM
    monthly[month] = (monthly[month] || 0) + e.amount
  })

  const sortedMonthly = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }))

  // This month's total
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthTotal = monthly[thisMonth] || 0

  res.json({ total, byCategory, monthly: sortedMonthly, thisMonthTotal, count: list.length })
})

// ─── Budget ───────────────────────────────────────────────────────────────────
app.get('/budget', (req, res) => {
  const b = budgets.find(b => b.userId === req.userId)
  res.json({ amount: b ? b.amount : 0 })
})

app.put('/budget', (req, res) => {
  const { amount } = req.body
  const n = validateAmount(amount)
  if (!n) return res.status(400).json({ message: 'Valid positive budget amount required' })
  const existing = budgets.find(b => b.userId === req.userId)
  if (existing) {
    existing.amount = n
  } else {
    budgets.push({ userId: req.userId, amount: n })
  }
  res.json({ amount: n })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`✅ Smart Expense Tracker API running on port ${port}`))
