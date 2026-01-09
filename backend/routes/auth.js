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

module.exports = router;