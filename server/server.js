
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// in-memory storage (for simplicity)
let users = []          // { id, email, password }
let expenses = []       // { id, userId, amount, category, date, notes }
let nextUserId = 1
let nextExpenseId = 1

// helper to authenticate from header
function getUserId(req) {
  const uid = req.headers['x-user-id']
  return uid ? parseInt(uid, 10) : null
}

app.get('/', (req, res) => res.send('API Running'))

// signup
app.post('/signup', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered' })
  }
  const user = { id: nextUserId++, email, password }
  users.push(user)
  res.status(201).json({ id: user.id, email: user.email })
})

// login
app.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  // return simple token (user id)
  res.json({ id: user.id, email: user.email })
})

// middleware to require auth
app.use((req, res, next) => {
  if (['/login', '/signup', '/'].includes(req.path)) {
    return next()
  }
  const userId = getUserId(req)
  if (!userId || !users.find(u => u.id === userId)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  req.userId = userId
  next()
})

// expenses CRUD
app.get('/expenses', (req, res) => {
  const list = expenses.filter(e => e.userId === req.userId)
  res.json(list)
})

app.post('/expenses', (req, res) => {
  const { amount, category, date, notes } = req.body
  const exp = {
    id: nextExpenseId++,
    userId: req.userId,
    amount: parseFloat(amount) || 0,
    category: category || '',
    date: date || new Date().toISOString().slice(0, 10),
    notes: notes || ''
  }
  expenses.push(exp)
  res.status(201).json(exp)
})

app.put('/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const exp = expenses.find(e => e.id === id && e.userId === req.userId)
  if (!exp) {
    return res.status(404).json({ message: 'Not found' })
  }
  const { amount, category, date, notes } = req.body
  exp.amount = parseFloat(amount) || exp.amount
  exp.category = category || exp.category
  exp.date = date || exp.date
  exp.notes = notes || exp.notes
  res.json(exp)
})

app.delete('/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const idx = expenses.findIndex(e => e.id === id && e.userId === req.userId)
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' })
  }
  expenses.splice(idx, 1)
  res.status(204).end()
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server started on ${port}`))
