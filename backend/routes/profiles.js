// backend/routes/profiles.js - Frissített standard profil API
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Profile létrehozás (csak service_provider-ek számára)
router.post('/', auth, async (req, res) => {
  try {
    // Ellenőrzés, hogy service_provider-e
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók hozhatnak létre profilt'
      });
    }

    // Ellenőrzés, hogy már van-e profil
    const existingProfile = await pool.query(
      'SELECT id FROM service_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Már létezik profil ehhez a felhasználóhoz'
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

    if (!contact_phone && !contact_email) {
      return res.status(400).json({
        success: false,
        error: 'Legalább egy elérhetőség megadása kötelező'
      });
    }

    // Profil létrehozása
    const result = await pool.query(
      `INSERT INTO service_profiles (
        user_id, business_name, description, location_city, location_address,
        price_category, price_range_min, price_range_max, contact_phone,
        contact_email, availability_hours, specializations, profile_image_url,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
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

// Saját profil lekérése
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók férhetnek hozzá profiljukhoz'
      });
    }

    const result = await pool.query(
      `SELECT sp.*, u.first_name, u.last_name, u.email, u.user_type
       FROM service_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = result.rows[0];
    
    // Specializations JSON-ből array-ba alakítása
    profile.specializations = JSON.parse(profile.specializations || '[]');

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil lekérése során'
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

    if (!contact_phone && !contact_email) {
      return res.status(400).json({
        success: false,
        error: 'Legalább egy elérhetőség megadása kötelező'
      });
    }

    // Profil frissítése
    const result = await pool.query(
      `UPDATE service_profiles SET
        business_name = $2,
        description = $3,
        location_city = $4,
        location_address = $5,
        price_category = $6,
        price_range_min = $7,
        price_range_max = $8,
        contact_phone = $9,
        contact_email = $10,
        availability_hours = $11,
        specializations = $12,
        profile_image_url = $13,
        updated_at = NOW()
       WHERE user_id = $1
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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = result.rows[0];
    
    // Specializations JSON-ből array-ba alakítása
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

// Publikus profil keresés és listázás
router.get('/search', async (req, res) => {
  try {
    const {
      query = '',
      city = '',
      price_category = '',
      specialization = '',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Szöveges keresés
    if (query.trim()) {
      whereConditions.push(`(
        sp.business_name ILIKE $${paramIndex} OR 
        sp.description ILIKE $${paramIndex} OR
        sp.specializations::text ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${query.trim()}%`);
      paramIndex++;
    }

    // Város szűrés
    if (city.trim()) {
      whereConditions.push(`sp.location_city ILIKE $${paramIndex}`);
      queryParams.push(`%${city.trim()}%`);
      paramIndex++;
    }

    // Árkategória szűrés
    if (price_category && ['budget', 'mid', 'premium'].includes(price_category)) {
      whereConditions.push(`sp.price_category = $${paramIndex}`);
      queryParams.push(price_category);
      paramIndex++;
    }

    // Szakterület szűrés
    if (specialization.trim()) {
      whereConditions.push(`sp.specializations::text ILIKE $${paramIndex}`);
      queryParams.push(`%${specialization.trim()}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Főlekérdezés
    const profilesQuery = `
      SELECT sp.*, u.first_name, u.last_name, u.email
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      ${whereClause}
      ORDER BY sp.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);

    const profiles = await pool.query(profilesQuery, queryParams);

    // Találatok számának lekérdezése
    const countQuery = `
      SELECT COUNT(*) as total
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Specializations JSON-ből array-ba alakítása minden profilnál
    const processedProfiles = profiles.rows.map(profile => ({
      ...profile,
      specializations: JSON.parse(profile.specializations || '[]')
    }));

    res.json({
      success: true,
      data: processedProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        query,
        city,
        price_category,
        specialization
      }
    });

  } catch (error) {
    console.error('Profile search error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a keresés során'
    });
  }
});

// Konkrét profil lekérése ID alapján (publikus)
router.get('/:id', async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        error: 'Érvénytelen profil ID'
      });
    }

    const result = await pool.query(
      `SELECT sp.*, u.first_name, u.last_name, u.email
       FROM service_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.id = $1`,
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = result.rows[0];
    
    // Specializations JSON-ből array-ba alakítása
    profile.specializations = JSON.parse(profile.specializations || '[]');

    // User objektum létrehozása a response-hoz
    const responseProfile = {
      ...profile,
      user: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      }
    };

    // User mezők eltávolítása a főszintről
    delete responseProfile.first_name;
    delete responseProfile.last_name;
    delete responseProfile.email;

    res.json({
      success: true,
      data: responseProfile
    });

  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil lekérése során'
    });
  }
});

// Profil törlése (csak saját profil)
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
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil törlése során'
    });
  }
});

// Profil statisztikák (admin/analytics célokra)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    // Csak service_provider-ek férhetnek hozzá saját statisztikáikhoz
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Nincs jogosultság a statisztikák megtekintéséhez'
      });
    }

    const profileResult = await pool.query(
      'SELECT id, created_at, updated_at FROM service_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profil nem található'
      });
    }

    const profile = profileResult.rows[0];

    // Itt később hozzáadhatjuk a valós statisztikákat:
    // - profil megtekintések száma
    // - kapcsolatfelvételek száma
    // - projektek száma
    // - értékelések átlaga

    const stats = {
      profile_id: profile.id,
      created_at: profile.created_at,
      last_updated: profile.updated_at,
      days_active: Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24)),
      // Placeholder értékek - később cseréljük le valós adatokra
      views: 0,
      contacts: 0,
      projects: 0,
      rating: 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a statisztikák lekérése során'
    });
  }
});

// Kategóriák és szakterületek lekérése (segítség a form kitöltéséhez)
router.get('/helpers/categories', async (req, res) => {
  try {
    // Népszerű szakterületek lekérése a meglévő profilokból
    const specializationsResult = await pool.query(`
      SELECT unnest(
        array_agg(
          DISTINCT jsonb_array_elements_text(specializations::jsonb)
        )
      ) as specialization
      FROM service_profiles
      WHERE specializations IS NOT NULL 
      AND specializations != '[]'
      AND specializations != 'null'
    `);

    const popularSpecializations = specializationsResult.rows
      .map(row => row.specialization)
      .filter(spec => spec && spec.trim())
      .slice(0, 20); // Top 20 legnépszerűbb

    // Népszerű városok
    const citiesResult = await pool.query(`
      SELECT location_city, COUNT(*) as count
      FROM service_profiles
      WHERE location_city IS NOT NULL AND location_city != ''
      GROUP BY location_city
      ORDER BY count DESC
      LIMIT 20
    `);

    const popularCities = citiesResult.rows.map(row => row.location_city);

    // Árkategóriák statisztikája
    const priceCategoriesResult = await pool.query(`
      SELECT price_category, COUNT(*) as count
      FROM service_profiles
      WHERE price_category IS NOT NULL
      GROUP BY price_category
      ORDER BY count DESC
    `);

    const priceCategories = priceCategoriesResult.rows;

    res.json({
      success: true,
      data: {
        popular_specializations: popularSpecializations,
        popular_cities: popularCities,
        price_categories: priceCategories,
        suggested_specializations: [
          'Vízvezeték szerelés', 'Villanyszerelés', 'Festés', 'Burkolás',
          'Kertészet', 'Takarítás', 'Webfejlesztés', 'Grafikai tervezés',
          'Fordítás', 'Könyvelés', 'Jogi tanácsadás', 'Masszázs',
          'Fotózás', 'Catering', 'Autószerelés', 'Informatikai support'
        ]
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a kategóriák lekérése során'
    });
  }
});

module.exports = router;