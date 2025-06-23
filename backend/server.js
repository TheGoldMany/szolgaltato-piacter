// backend/server.js - JAVÍTOTT VERZIÓ
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import pool from './config/database.js';
import modulesRoutes from './routes/modules.js';

// ROUTE IMPORTS - ES MODULES
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import uploadRoutes from './routes/upload.js';
import serviceProvidersRoutes from './routes/serviceProviders.js';

// Próbáljuk meg betölteni az opcionális route-okat
let messagesRoutes, projectRoutes, coursesRoutes;

try {
  const messagesModule = await import('./routes/messages.js');
  messagesRoutes = messagesModule.default;
  console.log('✅ Messages routes loaded');
} catch (error) {
  console.log('⚠️ Messages routes not found:', error.message);
}

try {
  const projectModule = await import('./routes/projects.js');
  projectRoutes = projectModule.default;
  console.log('✅ Projects routes loaded');
} catch (error) {
  console.log('⚠️ Projects routes not found:', error.message);
}

try {
  const coursesModule = await import('./routes/courses.js');
  coursesRoutes = coursesModule.default;
  console.log('✅ Courses routes loaded');
} catch (error) {
  console.log('⚠️ Courses routes not found:', error.message);
}

// Environment config betöltése
config();

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
// ❌ INNEN TÖRÖLD A MODULOK ROUTE-OT!

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
      profiles: '/api/users/profiles',
      modules: '/api/users/profiles/modules',
      upload: '/api/upload',
      'service-providers': '/api/service-providers'
    }
  });
});

// ROUTE REGISZTRÁLÁS - ✅ ITT A JÓ HELY!
console.log('🔗 Route regisztrálás...');

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered at /api/auth');

app.use('/api/users/profiles', profileRoutes);
console.log('✅ Profile routes registered at /api/users/profiles');

// ✅ MODULOK ROUTE IDE KELL!
app.use('/api/users/profiles/modules', modulesRoutes);
console.log('✅ Modules routes registered at /api/users/profiles/modules');

app.use('/api/upload', uploadRoutes);
console.log('✅ Upload routes registered at /api/upload');

app.use('/api/service-providers', serviceProvidersRoutes);
console.log('✅ Service Providers routes registered at /api/service-providers');

// OPCIONÁLIS ROUTES - CSAK HA LÉTEZNEK
if (messagesRoutes) {
  app.use('/api/messages', messagesRoutes);
  console.log('✅ Messages API registered at /api/messages');
}

if (projectRoutes) {
  app.use('/api/projects', projectRoutes);
  console.log('✅ Projects API registered at /api/projects');
}

if (coursesRoutes) {
  app.use('/api/courses', coursesRoutes);
  console.log('✅ Courses API registered at /api/courses');
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
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint nem található',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profiles/me',
      'GET /api/users/profiles/modules',
      'POST /api/users/profiles/modules',
      'POST /api/upload/profile-image'
    ]
  });
});

// SERVER INDÍTÁSA
app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
🌐 Local: http://localhost:${PORT}
🎯 API: http://localhost:${PORT}/api
📊 Health: http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});