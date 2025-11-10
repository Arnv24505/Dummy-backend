const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, 'data', 'data.json');
let raw = fs.readFileSync(dataPath);
let DB = JSON.parse(raw); // in-memory DB

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Helper to save DB back to file (optional).
 * Since user requested no DB, we still persist to JSON for demo.
 */
function saveDB() {
  fs.writeFileSync(dataPath, JSON.stringify(DB, null, 2));
}

/**
 * 15 APIs:
 * - Users CRUD (5)
 * - Products CRUD (5)
 * - Auth login (1)
 * - Orders list & create (2)
 * - Stats (1)
 * - Wishlist toggle (1)
 */

// --- Users
app.get('/api/v1/users', (req, res) => {
  res.json(DB.users);
});

app.get('/api/v1/users/:id', (req, res) => {
  const u = DB.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json(u);
});

app.post('/api/v1/users', (req, res) => {
  const user = { id: uuidv4(), ...req.body };
  DB.users.push(user);
  saveDB();
  res.status(201).json(user);
});

app.put('/api/v1/users/:id', (req, res) => {
  const idx = DB.users.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  DB.users[idx] = { ...DB.users[idx], ...req.body };
  saveDB();
  res.json(DB.users[idx]);
});

app.delete('/api/v1/users/:id', (req, res) => {
  const idx = DB.users.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const removed = DB.users.splice(idx,1)[0];
  saveDB();
  res.json({ deleted: removed.id });
});

// --- Products
app.get('/api/v1/products', (req, res) => {
  res.json(DB.products);
});

app.get('/api/v1/products/:id', (req, res) => {
  const p = DB.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

app.post('/api/v1/products', (req, res) => {
  const product = { id: uuidv4(), ...req.body };
  DB.products.push(product);
  saveDB();
  res.status(201).json(product);
});

app.put('/api/v1/products/:id', (req, res) => {
  const idx = DB.products.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  DB.products[idx] = { ...DB.products[idx], ...req.body };
  saveDB();
  res.json(DB.products[idx]);
});

app.delete('/api/v1/products/:id', (req, res) => {
  const idx = DB.products.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const removed = DB.products.splice(idx,1)[0];
  saveDB();
  res.json({ deleted: removed.id });
});

// --- Auth (mock)
app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body;
  const user = DB.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  // return a dummy token
  res.json({ token: 'dummy-token-' + user.id, user });
});

// --- Orders
app.get('/api/v1/orders', (req, res) => {
  res.json(DB.orders);
});

app.post('/api/v1/orders', (req, res) => {
  const order = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  DB.orders.push(order);
  saveDB();
  res.status(201).json(order);
});

// --- Stats
app.get('/api/v1/stats', (req, res) => {
  const totalUsers = DB.users.length;
  const totalProducts = DB.products.length;
  const totalOrders = DB.orders.length;
  const revenue = DB.orders.reduce((s,o)=> s + (o.total || 0), 0);
  res.json({ totalUsers, totalProducts, totalOrders, revenue });
});

// --- Wishlist toggle
app.post('/api/v1/wishlist/:productId/toggle', (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ error: 'userId required in body' });
  const user = DB.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const pid = req.params.productId;
  user.wishlist = user.wishlist || [];
  const idx = user.wishlist.indexOf(pid);
  let action;
  if (idx === -1) {
    user.wishlist.push(pid);
    action = 'added';
  } else {
    user.wishlist.splice(idx,1);
    action = 'removed';
  }
  saveDB();
  res.json({ action, wishlist: user.wishlist });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
