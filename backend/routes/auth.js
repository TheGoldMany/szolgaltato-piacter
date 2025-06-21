// backend/routes/auth.js - ES MODULES ÁTÍRÁS

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// JWT token létrehozás helper
const generateToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware - Token ellenőrzés
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Hozzáférés megtagadva. Token szükséges.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // User adatok lekérése
    const result = await pool.query(
      'SELECT id, email, user_type, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Token érvénytelen vagy felhasználó inaktív'
      });
    }

    req.user = {
      userId: result.rows[0].id,
      email: result.rows[0].email,
      userType: result.rows[0].user_type,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Token érvénytelen'
    });
  }
};

// REGISTER endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;

    // Input validáció
    if (!email || !password || !firstName || !lastName || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Minden mező kitöltése kötelező'
      });
    }

    if (!['service_provider', 'customer'].includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'Érvénytelen felhasználó típus'
      });
    }

    // Email formátum ellenőrzés
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Érvénytelen email formátum'
      });
    }

    // Jelszó hossz ellenőrzés
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
      });
    }

    // Email egyediség ellenőrzés
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ez az email cím már regisztrálva van'
      });
    }

    // Jelszó hashelés
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // User létrehozás
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, user_type, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
       RETURNING id, email, first_name, last_name, user_type, created_at`,
      [email.toLowerCase(), hashedPassword, firstName, lastName, userType]
    );

    const newUser = result.rows[0];

    // JWT token generálás
    const token = generateToken(newUser.id, newUser.email, newUser.user_type);

    console.log(`✅ New user registered: ${email} (${userType})`);

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció! 🎉',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: newUser.user_type,
        createdAt: newUser.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba a regisztráció során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// LOGIN endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validáció
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email és jelszó megadása kötelező'
      });
    }

    // User keresés
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Hibás email vagy jelszó'
      });
    }

    const userData = result.rows[0];

    // Jelszó ellenőrzés
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Hibás email vagy jelszó'
      });
    }

    // Last login frissítés
    await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userData.id]
    );

    // JWT token generálás
    const token = generateToken(userData.id, userData.email, userData.user_type);

    console.log(`✅ User logged in: ${email} (${userData.user_type})`);

    res.json({
      success: true,
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
      success: false,
      error: 'Szerver hiba a bejelentkezés során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PROFILE endpoint - Dashboard adatok
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userQuery = await pool.query(
      `SELECT id, email, first_name, last_name, user_type, phone, 
              is_verified, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Felhasználó nem található'
      });
    }

    const user = userQuery.rows[0];

    // Ha szolgáltató, akkor hozzunk profil statisztikákat is
    let serviceStats = null;
    if (user.user_type === 'service_provider') {
      const statsQuery = await pool.query(
        `SELECT 
           COUNT(*) as total_services,
           AVG(rating_average) as avg_rating,
           COUNT(CASE WHEN profile_completed = true THEN 1 END) as completed_profiles
         FROM service_profiles 
         WHERE user_id = $1`,
        [userId]
      );
      
      serviceStats = statsQuery.rows[0] || {
        total_services: 0,
        avg_rating: 0,
        completed_profiles: 0
      };
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        phone: user.phone,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      serviceStats
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a profil betöltése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// TEST endpoint
router.get('/test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Auth middleware működik! ✅',
    user: req.user
  });
});

export default router;