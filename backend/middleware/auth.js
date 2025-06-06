const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Hozzáférés megtagadva',
        message: 'JWT token szükséges' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const user = await pool.query(
      'SELECT id, email, first_name, last_name, user_type, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Érvénytelen token',
        message: 'Felhasználó nem található' 
      });
    }

    if (!user.rows[0].is_active) {
      return res.status(401).json({ 
        error: 'Fiók inaktív',
        message: 'A fiók deaktiválva' 
      });
    }

    // Add user info to request object
    req.user = user.rows[0];
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Érvénytelen token',
        message: 'JWT token hibás' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token lejárt',
        message: 'Kérjük jelentkezzen be újra' 
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Szerver hiba az autentikáció során' 
    });
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentikáció szükséges' 
      });
    }

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({ 
        error: 'Nincs jogosultsága ehhez a művelethez',
        required_role: roles,
        user_role: req.user.user_type
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};