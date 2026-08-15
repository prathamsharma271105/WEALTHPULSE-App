const path = require('path');
const dotenv = require('dotenv');
// Load .env from backend folder and project root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// -----------------------------
// API routes
// -----------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/income', require('./routes/income'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// -----------------------------
// Serve frontend static files
// -----------------------------
const frontendDir = path.join(__dirname, '..', 'frontend');

// Handle both lowercase and uppercase folder names seamlessly
app.use('/css', express.static(path.join(frontendDir, 'css')));
app.use('/css', express.static(path.join(frontendDir, 'Css')));
app.use('/js', express.static(path.join(frontendDir, 'js')));
app.use('/js', express.static(path.join(frontendDir, 'JS')));
app.use(express.static(frontendDir));

// Fallback: serve specific html files or index.html for HTML routes only
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  // If request has a static file extension (like .css, .js, .png, etc.), do not send index.html
  if (/\.(css|js|map|png|jpg|jpeg|svg|ico|woff|woff2|ttf|json)$/i.test(req.path)) {
    return res.status(404).send('Not found');
  }

  const reqPath = req.path.replace(/^\//, '');
  const filePath = path.join(frontendDir, reqPath);
  if (reqPath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// -----------------------------
// Error handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await db.init();
    if (require.main === module) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`WealthPulse API running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

startServer();

module.exports = app;
