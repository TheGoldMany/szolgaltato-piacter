// backend/routes/profiles.js - TELJESEN TISZTA VERZIÓ
import express from 'express';
import pool from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /me endpoint
router.get('/me', auth, async (req, res) => {
  console.log('📥 GET /me');
  
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók férhetnek hozzá profiljukhoz'
      });
    }

    const profileResult = await pool.query(`
      SELECT * FROM service_profiles WHERE user_id = $1
    `, [req.user.userId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = profileResult.rows[0];
    profile.specializations = profile.skills || [];
    profile.modules = [];

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('❌ GET error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba'
    });
  }
});

// PUT /me endpoint  
router.put('/me', auth, async (req, res) => {
  console.log('✏️ PUT /me');
  console.log('📦 Body:', req.body);
  
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók módosíthatják profiljukat'
      });
    }

    const businessName = req.body.business_name;
    const description = req.body.description;
    const locationCity = req.body.location_city;
    const locationAddress = req.body.location_address;
    const priceCategory = req.body.price_category;
    const skillsArray = req.body.skills;

    console.log('🔍 Értékek:');
    console.log('  business_name:', businessName);
    console.log('  description:', description);
    console.log('  location_city:', locationCity);
    console.log('  skills:', skillsArray);

    if (!businessName || !description || !locationCity) {
      return res.status(400).json({
        success: false,
        error: 'Kötelező mezők hiányoznak'
      });
    }

    const updateQuery = `
      UPDATE service_profiles SET
        business_name = $1,
        description = $2,
        location_city = $3,
        location_address = $4,
        price_category = $5,
        skills = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $7
      RETURNING *
    `;

    const values = [
      businessName,
      description,
      locationCity,
      locationAddress || null,
      priceCategory || null,
      skillsArray || null,
      req.user.userId
    ];

    console.log('📝 SQL values:', values);

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = result.rows[0];
    profile.specializations = profile.skills || [];

    console.log('✅ UPDATE sikeres');

    res.json({
      success: true,
      message: 'Profil sikeresen frissítve',
      data: profile
    });

  } catch (error) {
    console.error('❌ PUT error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt',
      debug: error.message
    });
  }
});

// POST / endpoint
router.post('/', auth, async (req, res) => {
  console.log('🆕 POST /');
  
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók hozhatnak létre profilt'
      });
    }

    const businessName = req.body.business_name;
    const description = req.body.description;
    const locationCity = req.body.location_city;

    if (!businessName || !description || !locationCity) {
      return res.status(400).json({
        success: false,
        error: 'Kötelező mezők hiányoznak'
      });
    }

    // Ellenőrizzük, hogy már van-e profilja
    const existingProfile = await pool.query(
      'SELECT id FROM service_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Már van aktív profilod'
      });
    }

    const insertQuery = `
      INSERT INTO service_profiles (
        user_id, business_name, description, location_city, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      req.user.userId,
      businessName,
      description,
      locationCity
    ]);

    const profile = result.rows[0];
    profile.specializations = profile.skills || [];

    res.status(201).json({
      success: true,
      message: 'Profil sikeresen létrehozva',
      data: profile
    });

  } catch (error) {
    console.error('❌ POST error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt'
    });
  }
});

export default router;