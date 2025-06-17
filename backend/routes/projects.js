// backend/routes/projects.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all projects for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(`
      SELECT DISTINCT p.*, u.first_name as client_first_name, u.last_name as client_last_name,
             (SELECT COUNT(*) FROM project_participants pp WHERE pp.project_id = p.id) as participant_count
      FROM projects p
      JOIN users u ON p.client_id = u.id
      LEFT JOIN project_participants pp ON p.id = pp.project_id
      WHERE p.client_id = $1 OR pp.provider_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Hiba a projektek betöltése során' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id: clientId } = req.user;
    const { title, description, location_city, location_address, budget_min, budget_max, start_date, end_date, required_skills } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Cím és leírás kötelező' });
    }

    const result = await pool.query(`
      INSERT INTO projects (
        client_id, title, description, location_city, location_address,
        budget_min, budget_max, start_date, end_date, required_skills
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [clientId, title, description, location_city, location_address, budget_min, budget_max, start_date, end_date, required_skills]);

    res.json({
      success: true,
      message: 'Projekt sikeresen létrehozva',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: 'Hiba a projekt létrehozása során' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;

    const result = await pool.query(`
      SELECT p.*, u.first_name as client_first_name, u.last_name as client_last_name
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE p.id = $1 AND (p.client_id = $2 OR p.is_public = true)
    `, [projectId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Projekt nem található' });
    }

    const participants = await pool.query(`
      SELECT pp.*, u.first_name, u.last_name, sp.business_name, sp.profile_image_url
      FROM project_participants pp
      JOIN users u ON pp.provider_id = u.id
      LEFT JOIN service_profiles sp ON u.id = sp.user_id
      WHERE pp.project_id = $1
    `, [projectId]);

    res.json({
      success: true,
      data: { ...result.rows[0], participants: participants.rows }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: 'Hiba a projekt betöltése során' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    const updates = req.body;

    const projectCheck = await pool.query('SELECT client_id FROM projects WHERE id = $1', [projectId]);
    
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Projekt nem található' });
    }

    if (projectCheck.rows[0].client_id !== userId) {
      return res.status(403).json({ success: false, error: 'Nincs jogosultsága a módosításra' });
    }

    const allowedFields = ['title', 'description', 'location_city', 'budget_min', 'budget_max', 'status', 'completion_percentage'];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'Nincs frissítendő mező' });
    }

    updateValues.push(projectId);
    const query = `UPDATE projects SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${++paramCount} RETURNING *`;

    const result = await pool.query(query, updateValues);

    res.json({ success: true, message: 'Projekt sikeresen frissítve', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: 'Hiba a projekt frissítése során' });
  }
});

// Invite provider to project
router.post('/:id/invite', authenticateToken, async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { id: userId } = req.user;
    const { providerId, role, hourlyRate = 0, estimatedHours = 0, notes = '' } = req.body;

    const projectCheck = await pool.query('SELECT client_id FROM projects WHERE id = $1', [projectId]);
    
    if (projectCheck.rows.length === 0 || projectCheck.rows[0].client_id !== userId) {
      return res.status(403).json({ success: false, error: 'Nincs jogosultsága a meghívásra' });
    }

    const existingInvite = await pool.query(
      'SELECT id FROM project_participants WHERE project_id = $1 AND provider_id = $2',
      [projectId, providerId]
    );

    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Ez a szolgáltató már meg van hívva' });
    }

    const result = await pool.query(`
      INSERT INTO project_participants (project_id, provider_id, role, hourly_rate, estimated_hours, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [projectId, providerId, role, hourlyRate, estimatedHours, notes]);

    res.json({
      success: true,
      message: 'Szolgáltató sikeresen meghívva',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error inviting provider:', error);
    res.status(500).json({ success: false, error: 'Hiba a meghívás során' });
  }
});

module.exports = router;