const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ÚJ - Auth routes RÖGTÖN a middleware után!
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes); 
app.use('/api/upload', uploadRoutes);

// Existing routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Szolgáltató Piactér API működik! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    
    res.json({ 
      status: 'OK',
      database: 'Connected ✅',
      dbTime: result.rows[0].current_time,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected ❌',
      error: error.message
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API v1.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      profiles: '/api/profiles',
      services: '/api/services'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Valami hiba történt!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server Error'
  });
});

// 404 handler - UTOLSÓNAK!
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint nem található',
    path: req.originalUrl,
    method: req.method
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server fut a http://localhost:${PORT} címen`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API docs: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth test: http://localhost:${PORT}/api/auth/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;