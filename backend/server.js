// backend/server.js - Corvus Platform v2.0 (Fixed)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const uploadRoutes = require('./routes/upload');
const serviceProfilesRoutes = require('./routes/serviceProfiles');
require('dotenv').config();

// Conditional route imports with fallback
let coursesRoutes, projectRoutes, messagesRoutes;

// Try to load courses routes
try {
  coursesRoutes = require('./routes/courses');
  console.log('✅ Courses routes loaded successfully');
} catch (error) {
  console.log('⚠️  Courses routes not found, creating fallback...');
  coursesRoutes = express.Router();
  coursesRoutes.get('/', (req, res) => {
    res.json({ 
      error: 'Courses module not yet implemented',
      message: 'Create ./routes/courses.js to enable this feature',
      status: 'fallback'
    });
  });
  coursesRoutes.get('/categories', (req, res) => {
    res.json({ 
      success: true, 
      data: [],
      message: 'Courses module not implemented yet'
    });
  });
  coursesRoutes.get('/featured', (req, res) => {
    res.json({ 
      success: true, 
      data: [],
      message: 'Courses module not implemented yet'
    });
  });
}

// Try to load projects routes
try {
  projectRoutes = require('./routes/projects');
  console.log('✅ Projects routes loaded successfully');
} catch (error) {
  console.log('⚠️  Projects routes not found, creating fallback...');
  projectRoutes = express.Router();
  projectRoutes.get('/', (req, res) => {
    res.json({ 
      error: 'Projects module not yet implemented',
      message: 'Create ./routes/projects.js to enable this feature',
      status: 'fallback'
    });
  });
  projectRoutes.post('/', (req, res) => {
    res.status(501).json({ 
      error: 'Projects creation not available',
      message: 'Projects module not implemented yet'
    });
  });
}

// Try to load messages routes  
try {
  messagesRoutes = require('./routes/messages');
  console.log('✅ Messages routes loaded successfully');
} catch (error) {
  console.log('⚠️  Messages routes not found, creating fallback...');
  messagesRoutes = express.Router();
  messagesRoutes.get('/conversations', (req, res) => {
    res.json({ 
      success: true,
      data: [],
      message: 'Messages module not implemented yet'
    });
  });
  messagesRoutes.post('/send', (req, res) => {
    res.status(501).json({ 
      error: 'Message sending not available',
      message: 'Messages module not implemented yet'
    });
  });
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core Routes (always available)
app.use('/api/auth', authRoutes);
app.use('/api/users/profiles', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profiles', serviceProfilesRoutes);

// Extended Routes (with fallbacks)
app.use('/api/courses', coursesRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messagesRoutes);

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Corvus Platform API működik! 🚀',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Authentication & Authorization ✅',
      'Service Provider Profiles ✅', 
      'File Upload (Cloudinary) ✅',
      'Course Management System 🔄',
      'Project Management 🔄',
      'Messaging System 🔄',
      'AI Integration Ready 🔄'
    ]
  });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Check core tables exist
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'service_profiles', 'courses', 'course_categories', 'projects', 'messages')
    `);
    
    // Check for new Corvus columns
    let corvusColumns = [];
    try {
      const corvusCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'service_profiles' 
        AND column_name IN ('skills', 'is_corvus_certified', 'corvus_points')
      `);
      corvusColumns = corvusCheck.rows.map(row => row.column_name);
    } catch (err) {
      console.log('Note: Corvus columns not yet added to service_profiles');
    }
    
    res.json({ 
      status: 'OK',
      database: 'Connected ✅',
      dbTime: result.rows[0].current_time,
      tables: tableCheck.rows.map(row => row.table_name),
      corvusFeatures: corvusColumns,
      modulesLoaded: {
        auth: '✅',
        profiles: '✅',
        upload: '✅',
        courses: coursesRoutes ? '✅' : '⚠️ Fallback',
        projects: projectRoutes ? '✅' : '⚠️ Fallback', 
        messages: messagesRoutes ? '✅' : '⚠️ Fallback'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
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
    message: 'Corvus Platform API v2.0',
    documentation: 'https://corvus-platform.dev/api-docs',
    endpoints: {
      auth: {
        base: '/api/auth',
        status: 'active',
        endpoints: [
          'POST /register - User registration',
          'POST /login - User login', 
          'GET /profile - User profile (protected)',
          'GET /dashboard - Dashboard data (protected)'
        ]
      },
      profiles: {
        base: '/api/profiles',
        status: 'active',
        endpoints: [
          'GET / - List all service profiles',
          'GET /:id - Get single profile',
          'POST / - Create profile (protected)',
          'PUT /:id - Update profile (protected)'
        ]
      },
      upload: {
        base: '/api/upload',
        status: 'active',
        endpoints: [
          'POST /profile-image - Upload profile image (protected)',
          'POST /cover-image - Upload cover image (protected)',
          'GET /info - Upload information'
        ]
      },
      courses: {
        base: '/api/courses',
        status: coursesRoutes._routerPath ? 'active' : 'fallback',
        endpoints: [
          'GET / - List courses with filters',
          'GET /featured - Featured courses',
          'GET /categories - Course categories',
          'GET /:id - Single course details',
          'POST /:id/enroll - Enroll in course (protected)',
          'GET /my-courses - My enrolled courses (protected)',
          'GET /my-certificates - My certificates (protected)'
        ]
      },
      projects: {
        base: '/api/projects',
        status: projectRoutes._routerPath ? 'active' : 'fallback',
        endpoints: [
          'GET / - My projects (protected)',
          'POST / - Create project (protected)',
          'GET /:id - Project details (protected)',
          'PUT /:id - Update project (protected)',
          'POST /:id/invite - Invite provider (protected)'
        ]
      },
      messages: {
        base: '/api/messages',
        status: messagesRoutes._routerPath ? 'active' : 'fallback',
        endpoints: [
          'GET /conversations - My conversations (protected)',
          'GET /conversation/:id - Messages with user (protected)',
          'POST /send - Send message (protected)',
          'PUT /:id/read - Mark as read (protected)'
        ]
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Valami hiba történt!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint nem található',
    requestedPath: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      api: '/api',
      health: '/health',
      docs: '/api'
    },
    suggestion: 'Látogassa meg a /api endpoint-ot az elérhető API végpontokért'
  });
});

// Server start
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`
🚀 Corvus Platform Server Successfully Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Server Info:
   🌐 URL: http://localhost:${PORT}
   🔧 Environment: ${process.env.NODE_ENV || 'development'}
   💾 Database: PostgreSQL
   🕒 Started: ${new Date().toLocaleString('hu-HU')}

📋 Available Endpoints:
   🏠 Home: http://localhost:${PORT}/
   🩺 Health: http://localhost:${PORT}/health
   📚 API Docs: http://localhost:${PORT}/api
   
   🔐 Auth: /api/auth/* ✅
   👤 Profiles: /api/profiles/* ✅
   📸 Upload: /api/upload/* ✅
   📚 Courses: /api/courses/* ${coursesRoutes.stack ? '✅' : '⚠️'}
   📁 Projects: /api/projects/* ${projectRoutes.stack ? '✅' : '⚠️'}
   💬 Messages: /api/messages/* ${messagesRoutes.stack ? '✅' : '⚠️'}

🎯 Next Steps:
   1. 📊 Check health: curl http://localhost:${PORT}/health
   2. 🗄️  Run migration: psql -d database_name -f simple_migration.sql
   3. 📁 Create missing routes: Copy route files to ./routes/
   4. 🌐 Start frontend: cd frontend && npm start
   5. 🖥️  Visit: http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
}

module.exports = app;