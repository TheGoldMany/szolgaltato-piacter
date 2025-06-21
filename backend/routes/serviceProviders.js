// backend/routes/serviceProviders.js - VÉGLEGES JAVÍTOTT VERZIÓ
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/service-providers - Publikus szolgáltató keresés
router.get('/', async (req, res) => {
  try {
    const { 
      query = '', 
      category = '', 
      city = '', 
      price_category = '',
      page = 1, 
      limit = 12 
    } = req.query;

    console.log('🔍 Service providers keresés indítva...', { query, city, category, page, limit });

    const offset = (page - 1) * limit;

    // ✅ JAVÍTOTT - availability_status használata is_active helyett
    let whereConditions = [`sp.id IS NOT NULL`];
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
    queryParams.push(parseInt(limit));
    
    paramCount++;
    const offsetParam = paramCount;
    queryParams.push(parseInt(offset));

    // ✅ EGYSZERŰSÍTETT SQL - csak alapadatok
    const searchQuery = `
      SELECT 
        sp.id,
        sp.business_name,
        sp.description,
        sp.location_city,
        sp.location_address,
        sp.price_category,
        sp.rating_average,
        sp.rating_count,
        sp.profile_image_url,
        sp.cover_image_url,
        sp.website,
        sp.availability_status,
        sp.created_at,
        u.first_name,
        u.last_name,
        u.email,
        sp.skills
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY sp.rating_average DESC, sp.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    console.log('📊 SQL query:', searchQuery);
    console.log('📊 Parameters:', queryParams);

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

    console.log(`✅ Service provider search: ${result.rows.length} results (total: ${total})`);

    // ✅ ADATOK FELDOLGOZÁSA
    const profiles = result.rows.map(profile => ({
      ...profile,
      specializations: profile.skills ? (Array.isArray(profile.skills) ? profile.skills : []) : [],
      services: [] // Egyelőre üres, később kiegészítjük
    }));

    res.json({
      success: true,
      data: {
        profiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasMore: (page * limit) < total
        },
        filters: {
          query: query || null,
          city: city || null,
          price_category: price_category || null,
          category: category || null
        }
      }
    });

  } catch (error) {
    console.error('❌ Service provider search error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a keresés során',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/service-providers/:id - Publikus profil megtekintés
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👁️ Profil megtekintés: ${id}`);

    // ✅ EGYSZERŰSÍTETT SQL
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
    
    // ✅ ADATOK FELDOLGOZÁSA
    profile.specializations = profile.skills ? (Array.isArray(profile.skills) ? profile.skills : []) : [];

    // Modulok lekérése (ha vannak)
    try {
      const modulesResult = await pool.query(`
        SELECT 
          module_type,
          position_x,
          position_y,
          width,
          height,
          content,
          sort_order
        FROM profile_modules 
        WHERE profile_id = $1 AND is_visible = true
        ORDER BY sort_order ASC
      `, [profile.id]);

      profile.modules = modulesResult.rows.map(module => ({
        ...module,
        content: typeof module.content === 'string' 
          ? JSON.parse(module.content) 
          : module.content
      }));
    } catch (moduleError) {
      console.log('⚠️ Modules query failed (table might not exist):', moduleError.message);
      profile.modules = [];
    }

    // Szolgáltatások lekérése (ha vannak)
    try {
      const servicesResult = await pool.query(`
        SELECT 
          so.id,
          so.title,
          so.description,
          so.base_price,
          so.price_unit,
          sc.name as category
        FROM service_offerings so
        LEFT JOIN service_categories sc ON so.category_id = sc.id
        WHERE so.profile_id = $1
      `, [profile.id]);

      profile.services = servicesResult.rows;
    } catch (serviceError) {
      console.log('⚠️ Services query failed (table might not exist):', serviceError.message);
      profile.services = [];
    }

    console.log(`✅ Profil betöltve: ${profile.business_name}`);

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a profil lekérése során',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint
router.get('/test/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Service Providers API működik! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      list: 'GET /api/service-providers',
      single: 'GET /api/service-providers/:id',
      test: 'GET /api/service-providers/test/ping'
    }
  });
});

export default router;