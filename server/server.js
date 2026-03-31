const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes     = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const salesmanRoutes = require('./routes/salesman');
const adminRoutes    = require('./routes/admin');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

// Middleware
app.use(cors(ALLOWED_ORIGIN ? { origin: ALLOWED_ORIGIN } : undefined));
app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from project root
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api', authRoutes);
app.use('/api', customerRoutes);
app.use('/api', salesmanRoutes);
app.use('/api', adminRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Customer:  http://localhost:${PORT}/index.html`);
  console.log(`Admin:     http://localhost:${PORT}/admin.html`);
  console.log(`Salesman:  http://localhost:${PORT}/salesman.html`);
});
