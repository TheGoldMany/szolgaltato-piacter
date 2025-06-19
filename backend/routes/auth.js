const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');


const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes működnek! 🔐',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      test: 'GET /api/auth/test'
    }
  });
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType, phone } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !userType) {
      return res.status(400).json({
        error: 'Hiányzó kötelező mezők',
        required: ['email', 'password', 'firstName', 'lastName', 'userType']
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Érvénytelen email formátum' });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'A jelszó legalább 6 karakter hosszú legyen' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Ez az email cím már használatban van' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, user_type, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, first_name, last_name, user_type, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, userType, phone]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.rows[0].id,
        email: newUser.rows[0].email,
        userType: newUser.rows[0].user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Sikeres regisztráció! 🎉',
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        firstName: newUser.rows[0].first_name,
        lastName: newUser.rows[0].last_name,
        userType: newUser.rows[0].user_type,
        createdAt: newUser.rows[0].created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Szerver hiba a regisztráció során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email és jelszó megadása kötelező'
      });
    }

    // Find user by email
    const user = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, user_type, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Érvénytelen email vagy jelszó' });
    }

    const userData = user.rows[0];

    // Check if user is active
    if (!userData.is_active) {
      return res.status(401).json({ error: 'A fiók inaktív' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Érvénytelen email vagy jelszó' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id,
        email: userData.email,
        userType: userData.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Sikeres bejelentkezés! 🚀',
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        userType: userData.user_type
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Szerver hiba a bejelentkezés során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
// EZEKET ADD HOZZÁ A backend/routes/auth.js VÉGÉRE a module.exports elé:

// Get current user profile - Dashboard adatok betöltéséhez
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userQuery = await pool.query(
      `SELECT id, email, first_name, last_name, user_type, phone, 
              profile_image_url, is_verified, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const user = userQuery.rows[0];

    // Ha szolgáltató, akkor hozzunk profil statisztikákat is
    let serviceStats = null;
    if (user.user_type === 'service_provider') {
      const statsQuery = await pool.query(
        `SELECT 
           COUNT(*) as total_services,
           AVG(rating_average) as avg_rating,
           COUNT(CASE WHEN is_active = true THEN 1 END) as active_services
         FROM service_profiles 
         WHERE user_id = $1`,
        [userId]
      );
      
      serviceStats = statsQuery.rows[0];
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        phone: user.phone,
        profileImage: user.profile_image_url,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      serviceStats
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Hiba a profil betöltése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// Update user profile - Settings oldalhoz
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone } = req.body;

    // Input validation
    if (!firstName || !lastName) {
      return res.status(400).json({
        error: 'Keresztnév és vezetéknév megadása kötelező'
      });
    }

    const updatedUser = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
       WHERE id = $4 
       RETURNING id, email, first_name, last_name, user_type, phone, profile_image_url`,
      [firstName, lastName, phone, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const user = updatedUser.rows[0];

    res.json({
      message: 'Profil sikeresen frissítve! ✅',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        phone: user.phone,
        profileImage: user.profile_image_url
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Hiba a profil frissítése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// Dashboard statistics - Role-specifikus adatok
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    let stats = {};

    if (userType === 'service_provider') {
      // Szolgáltató statisztikák
      const serviceStatsQuery = await pool.query(
        `SELECT 
           COUNT(*) as total_services,
           COUNT(CASE WHEN is_active = true THEN 1 END) as active_services,
           AVG(rating_average) as avg_rating,
           COUNT(DISTINCT user_id) as total_reviews
         FROM service_profiles 
         WHERE user_id = $1`,
        [userId]
      );

      // Havi bevétel (ha van payments tábla)
      const revenueQuery = await pool.query(
        `SELECT 
           COALESCE(SUM(amount), 0) as monthly_revenue,
           COUNT(*) as completed_projects
         FROM payments 
         WHERE service_provider_id = $1 
           AND status = 'completed' 
           AND created_at >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      );

      stats = {
        ...serviceStatsQuery.rows[0],
        ...revenueQuery.rows[0],
        userType: 'service_provider'
      };

    } else {
      // Ügyfél statisztikák
      const customerStatsQuery = await pool.query(
        `SELECT 
           COUNT(*) as total_bookings,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
         FROM bookings 
         WHERE customer_id = $1`,
        [userId]
      );

      stats = {
        ...customerStatsQuery.rows[0],
        userType: 'customer'
      };
    }

    res.json({ stats });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Hibás adatbázis lekérdezés esetén alapértelmezett értékek
    res.json({ 
      stats: {
        total_services: 0,
        active_services: 0,
        avg_rating: 0,
        total_reviews: 0,
        monthly_revenue: 0,
        completed_projects: 0,
        userType: req.user.userType
      }
    });
  }
});
// GET /api/auth/profile - Dashboard számára
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userQuery = await pool.query(
      `SELECT id, email, first_name, last_name, user_type, phone, 
              profile_image_url, is_verified, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }

    const user = userQuery.rows[0];
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        phone: user.phone,
        profileImage: user.profile_image_url,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Hiba a profil betöltése során'
    });
  }
});

module.exports = router;
module.exports = router;