// backend/middleware/auth.js - ES MODULES ÁTÍRÁS
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// JWT token ellenőrzés middleware
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

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentikáció szükséges'
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Nincs jogosultságod ehhez a művelethez'
      });
    }

    next();
  };
};

// Service Provider middleware
const requireServiceProvider = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentikáció szükséges'
    });
  }

  if (req.user.userType !== 'service_provider') {
    return res.status(403).json({
      success: false,
      error: 'Csak szolgáltatók férhetnek hozzá ehhez a funkcióhoz'
    });
  }

  next();
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentikáció szükséges'
    });
  }

  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin jogosultság szükséges'
    });
  }

  next();
};

// ES Modules export
export default authenticateToken;
export { 
  authenticateToken, 
  requireRole, 
  requireServiceProvider, 
  requireAdmin 
};