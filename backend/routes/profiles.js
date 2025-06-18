// backend/routes/profiles.js - Frissített verzió moduláris adatokkal
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get single profile (public) - with modules
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get profile data
    const profileResult = await pool.query(`
      SELECT 
        sp.*,
        u.first_name,
        u.last_name,
        u.email
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1
    `, [id]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = profileResult.rows[0];

    // Get profile modules
    let modules = [];
    try {
      const modulesResult = await pool.query(`
        SELECT *
        FROM profile_modules
        WHERE profile_id = $1 AND is_visible = true
        ORDER BY sort_order ASC
      `, [id]);
      
      modules = modulesResult.rows;
    } catch (moduleError) {
      console.log('Modules table not found, using empty array');
      // If modules table doesn't exist yet, just return empty array
    }

    // Combine profile with modules
    const profileWithModules = {
      ...profile,
      modules: modules,
      user: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      }
    };

    // Remove user fields from main object
    delete profileWithModules.first_name;
    delete profileWithModules.last_name;
    delete profileWithModules.email;

    res.json({
      success: true,
      data: profileWithModules
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Szerverhiba történt'
    });
  }
});

// Get all profiles (public search)
router.get('/', async (req, res) => {
  try {
    const { search, category, location, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT 
        sp.*,
        u.first_name,
        u.last_name,
        COUNT(*) OVER() as total_count
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Add search filters
    if (search) {
      paramCount++;
      query += ` AND (sp.business_name ILIKE $${paramCount} OR sp.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (location) {
      paramCount++;
      query += ` AND sp.location_city ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
    }

    // Add pagination
    query += ` ORDER BY sp.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    const profiles = result.rows.map(profile => ({
      ...profile,
      user: {
        first_name: profile.first_name,
        last_name: profile.last_name
      }
    }));

    // Remove user fields from main objects
    profiles.forEach(profile => {
      delete profile.first_name;
      delete profile.last_name;
    });

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Szerverhiba történt'
    });
  }
});

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(`
      SELECT 
        sp.*,
        u.first_name,
        u.last_name,
        u.email
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Nincs profil létrehozva'
      });
    }

    const profile = result.rows[0];

    // Get profile modules
    let modules = [];
    try {
      const modulesResult = await pool.query(`
        SELECT 
          module_id,
          module_type,
          position_x,
          position_y,
          position_width,
          position_height,
          content,
          is_visible,
          sort_order
        FROM profile_modules
        WHERE profile_id = $1
        ORDER BY sort_order ASC
      `, [profile.id]);
      
      modules = modulesResult.rows;
    } catch (moduleError) {
      console.log('Modules table not found or error:', moduleError.message);
    }

    const profileWithModules = {
      id: profile.id, // ← Fontos! Az id mező
      user_id: profile.user_id,
      business_name: profile.business_name,
      description: profile.description,
      short_description: profile.short_description,
      profile_image_url: profile.profile_image_url,
      cover_image_url: profile.cover_image_url,
      website: profile.website,
      location_city: profile.location_city,
      location_address: profile.location_address,
      phone: profile.phone,
      email: profile.email,
      price_category: profile.price_category,
      hourly_rate_min: profile.hourly_rate_min,
      hourly_rate_max: profile.hourly_rate_max,
      rating_average: profile.rating_average,
      rating_count: profile.rating_count,
      response_time_hours: profile.response_time_hours,
      completion_rate: profile.completion_rate,
      is_verified: profile.is_verified,
      is_featured: profile.is_featured,
      years_experience: profile.years_experience,
      availability_status: profile.availability_status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      modules: modules,
      user: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      }
    };

    res.json({
      success: true,
      data: profileWithModules
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Szerverhiba történt'
    });
  }
});

// Save profile modules
router.post('/modules', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id: userId } = req.user;
    const { modules } = req.body;

    // Get user's profile
    const profileResult = await client.query(
      'SELECT id FROM service_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profileId = profileResult.rows[0].id;

    await client.query('BEGIN');

    // Delete existing modules
    await client.query('DELETE FROM profile_modules WHERE profile_id = $1', [profileId]);

    // Insert new modules
    for (const module of modules) {
      await client.query(`
        INSERT INTO profile_modules (
          profile_id, module_id, module_type, position_x, position_y, 
          position_width, position_height, content, is_visible, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        profileId,
        module.id,
        module.type,
        module.position.x,
        module.position.y,
        module.position.width,
        module.position.height,
        JSON.stringify(module.content),
        module.isVisible,
        module.sortOrder
      ]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Modulok sikeresen mentve'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving modules:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a modulok mentése során'
    });
  } finally {
    client.release();
  }
});

module.exports = router;