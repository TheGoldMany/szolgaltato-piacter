const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./config/database');

// MINDEN ROUTE IMPORT A TETEJÉN!
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const uploadRoutes = require('./routes/upload');
const serviceProfilesRoutes = require('./routes/serviceProfiles');

// Próbáljuk meg betölteni az opcionális route-okat
let messagesRoutes, projectRoutes, coursesRoutes;

try {
  messagesRoutes = require('./routes/messages');
  console.log('✅ Messages routes loaded');
} catch (error) {
  console.log('⚠️ Messages routes not found:', error.message);
}

try {
  projectRoutes = require('./routes/projects');
  console.log('✅ Projects routes loaded');
} catch (error) {
  console.log('⚠️ Projects routes not found:', error.message);
}

try {
  coursesRoutes = require('./routes/courses');
  console.log('✅ Courses routes loaded');
} catch (error) {
  console.log('⚠️ Courses routes not found:', error.message);
}

require('dotenv').config();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE - HELYES SORREND!
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK ENDPOINTS ELŐSZÖR
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

// API ROUTES - KÖTELEZŐ ROUTE-OK
app.use('/api/auth', authRoutes);
app.use('/api/users/profiles', profileRoutes);  // User saját profil kezeléshez
app.use('/api/upload', uploadRoutes);
app.use('/api/profiles', serviceProfilesRoutes);  // Public profil megtekintéshez

// OPCIONÁLIS ROUTES - CSAK HA LÉTEZNEK
if (messagesRoutes) {
  app.use('/api/messages', messagesRoutes);
  console.log('🔗 Messages API registered at /api/messages');
}

if (projectRoutes) {
  app.use('/api/projects', projectRoutes);
  console.log('🔗 Projects API registered at /api/projects');
}

if (coursesRoutes) {
  app.use('/api/courses', coursesRoutes);
  console.log('🔗 Courses API registered at /api/courses');
}

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Valami hiba történt!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server Error'
  });
});

// 404 HANDLER - UTOLSÓNAK!
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint nem található',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/test'
    ]
  });
});

// SERVER START - CSAK HA NEM TESZT
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server fut a http://localhost:${PORT} címen`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 API docs: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth test: http://localhost:${PORT}/api/auth/test`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;