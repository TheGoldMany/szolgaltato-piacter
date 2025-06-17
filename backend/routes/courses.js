// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all course categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, icon, color_class, course_count, is_active, sort_order
      FROM course_categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, name ASC
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching course categories:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a kategóriák betöltése során'
    });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, featured, limit = 12, offset = 0 } = req.query;

    let query = `
      SELECT c.*, cc.name as category_name, cc.icon as category_icon
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.is_published = true
    `;
    
    const queryParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND cc.name = $${paramCount}`;
      queryParams.push(category);
    }

    if (difficulty) {
      paramCount++;
      query += ` AND c.difficulty_level = $${paramCount}`;
      queryParams.push(difficulty);
    }

    if (search) {
      paramCount++;
      query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (featured === 'true') {
      query += ` AND c.is_featured = true`;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: { total: result.rows.length, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a kurzusok betöltése során'
    });
  }
});

// Get featured courses
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, cc.name as category_name, cc.icon as category_icon
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.is_published = true AND c.is_featured = true
      ORDER BY c.student_count DESC, c.rating_average DESC
      LIMIT 6
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a kiemelt kurzusok betöltése során'
    });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, cc.name as category_name, cc.icon as category_icon
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.id = $1 AND c.is_published = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kurzus nem található' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, error: 'Hiba a kurzus betöltése során' });
  }
});

// Protected routes
router.post('/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { id: userId } = req.user;

    const courseCheck = await pool.query('SELECT id, title FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kurzus nem található' });
    }

    const enrollmentCheck = await pool.query(
      'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollmentCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Már regisztrált erre a kurzusra' });
    }

    const enrollment = await pool.query(`
      INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, enrolled_at
    `, [userId, courseId]);

    await pool.query('UPDATE courses SET student_count = student_count + 1 WHERE id = $1', [courseId]);

    res.json({
      success: true,
      message: 'Sikeresen regisztrált a kurzusra',
      data: {
        enrollmentId: enrollment.rows[0].id,
        courseTitle: courseCheck.rows[0].title,
        enrolledAt: enrollment.rows[0].enrolled_at
      }
    });
  } catch (error) {
    console.error('Error enrolling:', error);
    res.status(500).json({ success: false, error: 'Hiba a regisztráció során' });
  }
});

router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query(`
      SELECT c.*, cc.name as category_name, cc.icon as category_icon,
             ce.enrolled_at, ce.progress_percentage, ce.completed_at
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE ce.user_id = $1
      ORDER BY ce.enrolled_at DESC
    `, [userId]);

    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ success: false, error: 'Hiba a kurzusok betöltése során' });
  }
});

router.get('/my-certificates', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query(`
      SELECT cert.*, c.title as course_title, cc.name as category_name, cc.icon as category_icon
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE cert.user_id = $1
      ORDER BY cert.issued_date DESC
    `, [userId]);

    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, error: 'Hiba a tanúsítványok betöltése során' });
  }
});

module.exports = router;