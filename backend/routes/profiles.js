// backend/routes/profiles.js - ES MODULES + MODULÁRIS PROFIL ENDPOINT - JAVÍTOTT

import express from 'express';
import pool from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ✅ ÚJ! Modulok mentése endpoint
router.post('/modules', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók menthetnek modulokat'
      });
    }

    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        error: 'Modulok array formátumban vártak'
      });
    }

    console.log(`📦 ${modules.length} modul mentése felhasználó ${req.user.userId} számára`);

    // Service profile ID lekérése
    const profileResult = await pool.query(
      'SELECT id FROM service_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service profil nem található. Először hozz létre alapvető profilt!'
      });
    }

    const profileId = profileResult.rows[0].id;

    // Tranzakció indítása
    await pool.query('BEGIN');

    try {
      // Régi modulok törlése
      await pool.query('DELETE FROM profile_modules WHERE profile_id = $1', [profileId]);
      console.log(`🗑️ Régi modulok törölve profile_id: ${profileId}`);

      // Új modulok beszúrása
      for (const module of modules) {
        await pool.query(`
          INSERT INTO profile_modules (
            profile_id, uuid, module_type, 
            position_x, position_y, width, height,
            content, is_visible, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          profileId,
          module.uuid,
          module.module_type,
          module.position_x,
          module.position_y,
          module.width,
          module.height,
          JSON.stringify(module.content),
          module.is_visible,
          module.sort_order
        ]);
      }

      // Service profile frissítése
      await pool.query(
        'UPDATE service_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [profileId]
      );

      await pool.query('COMMIT');
      console.log(`✅ ${modules.length} modul sikeresen mentve`);

      res.json({
        success: true,
        message: `${modules.length} modul sikeresen elmentve`,
        data: { 
          profile_id: profileId,
          modules_count: modules.length 
        }
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Modules save error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a modulok mentése során'
    });
  }
});

// Saját profil lekérése modulokkal - FRISSÍTETT!
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók férhetnek hozzá profiljukhoz'
      });
    }

    // Alapvető profil adatok lekérése
    const profileResult = await pool.query(`
      SELECT sp.*, u.first_name, u.last_name, u.email, u.user_type
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [req.user.userId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = profileResult.rows[0];
    
    // Specializations JSON-ből array-ba alakítása
    profile.specializations = JSON.parse(profile.specializations || '[]');

    // Modulok lekérése
    const modulesResult = await pool.query(`
      SELECT 
        uuid,
        module_type,
        position_x,
        position_y,
        width,
        height,
        content,
        is_visible,
        sort_order,
        created_at,
        updated_at
      FROM profile_modules 
      WHERE profile_id = $1 
      ORDER BY sort_order ASC, created_at ASC
    `, [profile.id]);

    // Modulok hozzáadása a profil objektumhoz
    profile.modules = modulesResult.rows.map(module => ({
      ...module,
      content: typeof module.content === 'string' 
        ? JSON.parse(module.content) 
        : module.content
    }));

    console.log(`📥 Profil betöltve ${modulesResult.rows.length} modullal`);

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile with modules error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil lekérése során'
    });
  }
});

// Profil létrehozása
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók hozhatnak létre profilt'
      });
    }

    const {
      business_name,
      description,
      location_city,
      location_address,
      price_category,
      price_range_min,
      price_range_max,
      contact_phone,
      contact_email,
      availability_hours,
      specializations,
      profile_image_url
    } = req.body;

    // Validáció
    if (!business_name || !description || !location_city) {
      return res.status(400).json({
        success: false,
        error: 'Vállalkozás neve, bemutatkozás és város megadása kötelező'
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
        error: 'Már van aktív profilod. Használd a PUT /me endpoint-ot a frissítéshez.'
      });
    }

    const result = await pool.query(
      `INSERT INTO service_profiles (
        user_id, business_name, description, location_city, location_address,
        price_category, price_range_min, price_range_max, contact_phone, contact_email,
        availability_hours, specializations, profile_image_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        req.user.userId,
        business_name,
        description,
        location_city,
        location_address || null,
        price_category || null,
        price_range_min || null,
        price_range_max || null,
        contact_phone || null,
        contact_email || null,
        availability_hours || null,
        JSON.stringify(specializations || []),
        profile_image_url || null
      ]
    );

    const profile = result.rows[0];
    
    // Specializations JSON-ből array-ba alakítása response-hoz
    profile.specializations = JSON.parse(profile.specializations || '[]');

    res.status(201).json({
      success: true,
      message: 'Profil sikeresen létrehozva',
      data: profile
    });

  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil létrehozása során'
    });
  }
});

// Profil frissítése
router.put('/me', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók módosíthatják profiljukat'
      });
    }

    const {
      business_name,
      description,
      location_city,
      location_address,
      price_category,
      price_range_min,
      price_range_max,
      contact_phone,
      contact_email,
      availability_hours,
      specializations,
      profile_image_url
    } = req.body;

    // Validáció
    if (!business_name || !description || !location_city) {
      return res.status(400).json({
        success: false,
        error: 'Vállalkozás neve, bemutatkozás és város megadása kötelező'
      });
    }

    const result = await pool.query(
      `UPDATE service_profiles SET
        business_name = $1,
        description = $2,
        location_city = $3,
        location_address = $4,
        price_category = $5,
        price_range_min = $6,
        price_range_max = $7,
        contact_phone = $8,
        contact_email = $9,
        availability_hours = $10,
        specializations = $11,
        profile_image_url = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $13
      RETURNING *`,
      [
        business_name,
        description,
        location_city,
        location_address || null,
        price_category || null,
        price_range_min || null,
        price_range_max || null,
        contact_phone || null,
        contact_email || null,
        availability_hours || null,
        JSON.stringify(specializations || []),
        profile_image_url || null,
        req.user.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = result.rows[0];
    profile.specializations = JSON.parse(profile.specializations || '[]');

    res.json({
      success: true,
      message: 'Profil sikeresen frissítve',
      data: profile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil frissítése során'
    });
  }
});

// Publikus profil lekérése modulokkal
router.get('/public/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    // Profil alapadatok lekérése
    const profileResult = await pool.query(`
      SELECT 
        sp.*,
        u.first_name,
        u.last_name
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1 AND sp.is_active = true
    `, [profileId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található vagy inaktív'
      });
    }

    const profile = profileResult.rows[0];
    
    // Specializations feldolgozása
    profile.specializations = JSON.parse(profile.specializations || '[]');

    // Csak látható modulok lekérése
    const modulesResult = await pool.query(`
      SELECT 
        uuid,
        module_type,
        position_x,
        position_y,
        width,
        height,
        content,
        sort_order
      FROM profile_modules 
      WHERE profile_id = $1 AND is_visible = true
      ORDER BY sort_order ASC, created_at ASC
    `, [profile.id]);

    profile.modules = modulesResult.rows.map(module => ({
      ...module,
      content: typeof module.content === 'string' 
        ? JSON.parse(module.content) 
        : module.content
    }));

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil lekérése során'
    });
  }
});

// Publikus profil keresés - JAVÍTOTT SQL
router.get('/search', async (req, res) => {
  try {
    const { 
      query = '', 
      category = '', 
      city = '', 
      price_category = '',
      page = 1, 
      limit = 12 
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = ['sp.is_active = true'];
    let queryParams = [];
    let paramCount = 0;

    // Search query
    if (query) {
      paramCount++;
      whereConditions.push(`(
        sp.business_name ILIKE $${paramCount} OR 
        sp.description ILIKE $${paramCount} OR
        u.first_name ILIKE $${paramCount} OR
        u.last_name ILIKE $${paramCount}
      )`);
      queryParams.push(`%${query}%`);
    }

    // City filter
    if (city) {
      paramCount++;
      whereConditions.push(`sp.location_city ILIKE $${paramCount}`);
      queryParams.push(`%${city}%`);
    }

    // Price category filter
    if (price_category) {
      paramCount++;
      whereConditions.push(`sp.price_category = $${paramCount}`);
      queryParams.push(price_category);
    }

    // Add limit and offset
    paramCount++;
    const limitParam = paramCount;
    queryParams.push(limit);
    
    paramCount++;
    const offsetParam = paramCount;
    queryParams.push(offset);

    const searchQuery = `
      SELECT 
        sp.id,
        sp.business_name,
        sp.description,
        sp.location_city,
        sp.price_category,
        sp.rating_average,
        sp.rating_count,
        sp.profile_image_url,
        u.first_name,
        u.last_name,
        sp.created_at
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY sp.rating_average DESC, sp.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await pool.query(searchQuery, queryParams);

    // Total count lekérése
    const countQuery = `
      SELECT COUNT(*) as total
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        profiles: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a keresés során'
    });
  }
});

// Profil törlése
router.delete('/me', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók törölhetik profiljukat'
      });
    }

    const result = await pool.query(
      'DELETE FROM service_profiles WHERE user_id = $1 RETURNING id',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    res.json({
      success: true,
      message: 'Profil sikeresen törölve'
    });

  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil törlése során'
    });
  }
});

export default router;