// backend/routes/serviceProviders.js - PUBLIKUS SERVICE PROVIDER API
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
        sp.cover_image_url,
        u.first_name,
        u.last_name,
        sp.created_at,
        -- Szolgáltatások lekérése
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', so.id,
              'title', so.title,
              'base_price', so.base_price,
              'price_unit', so.price_unit,
              'category', sc.name
            )
          )
          FROM service_offerings so
          LEFT JOIN service_categories sc ON so.category_id = sc.id
          WHERE so.profile_id = sp.id
        ) as services
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

    console.log(`🔍 Service provider search: ${result.rows.length} results`);

    res.json({
      success: true,
      data: {
        profiles: result.rows,
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
    console.error('Service provider search error:', error);
    res.status(500).json({
      success: false,
      error: 'Szerver hiba történt a keresés során',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/service-providers/:id - Publikus profil megtekintés modulokkal
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Profil alapadatok lekérése
    const profileResult = await pool.query(`
      SELECT 
        sp.*,
        u.first_name,
        u.last_name,
        u.email,
        -- Szolgáltatások
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', so.id,
              'title', so.title,
              'description', so.description,
              'base_price', so.base_price,
              'price_unit', so.price_unit,
              'category', sc.name,
              'category_slug', sc.slug
            )
          )
          FROM service_offerings so
          LEFT JOIN service_categories sc ON so.category_id = sc.id
          WHERE so.profile_id = sp.id
        ) as services
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1 AND sp.is_active = true
    `, [id]);

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

    console.log(`👁️ Public profile viewed: ${profile.business_name}`);

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

// GET /api/service-providers/categories - Kategóriák listázása
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.id,
        sc.name,
        sc.slug,
        sc.description,
        COUNT(so.id) as service_count
      FROM service_categories sc
      LEFT JOIN service_offerings so ON sc.id = so.category_id
      WHERE sc.is_active = true
      GROUP BY sc.id, sc.name, sc.slug, sc.description
      ORDER BY service_count DESC, sc.sort_order ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Kategóriák lekérése sikertelen'
    });
  }
});

export default router;