const pool = require('../config/database');

class ServiceProfile {
  // Get all profiles with advanced filtering
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        sp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        array_agg(DISTINCT sc.name) FILTER (WHERE sc.name IS NOT NULL) as categories,
        array_agg(DISTINCT sc.slug) FILTER (WHERE sc.slug IS NOT NULL) as category_slugs
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN profile_categories pc ON sp.id = pc.profile_id
      LEFT JOIN service_categories sc ON pc.category_id = sc.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // City filter
    if (filters.city) {
      query += ` AND LOWER(sp.location_city) ILIKE LOWER($${paramCount})`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    // Category filter
    if (filters.category) {
      query += ` AND EXISTS (
        SELECT 1 FROM profile_categories pc2 
        JOIN service_categories sc2 ON pc2.category_id = sc2.id 
        WHERE pc2.profile_id = sp.id AND sc2.slug = $${paramCount}
      )`;
      values.push(filters.category);
      paramCount++;
    }

    // Price category filter
    if (filters.price_category) {
      query += ` AND sp.price_category = $${paramCount}`;
      values.push(filters.price_category);
      paramCount++;
    }

    // Rating filter
    if (filters.rating_min) {
      query += ` AND sp.rating_average >= $${paramCount}`;
      values.push(parseFloat(filters.rating_min));
      paramCount++;
    }

    // Featured filter
    if (filters.featured === 'true') {
      query += ` AND sp.is_featured = true`;
    }

    // Search in business name and description
    if (filters.search) {
      query += ` AND (
        LOWER(sp.business_name) ILIKE LOWER($${paramCount}) OR 
        LOWER(sp.description) ILIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Group and order
    query += `
      GROUP BY sp.id, u.first_name, u.last_name, u.email, u.phone
      ORDER BY 
        CASE WHEN sp.is_featured = true THEN 0 ELSE 1 END,
        sp.rating_average DESC NULLS LAST,
        sp.created_at DESC
    `;

    // Pagination
    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;
    
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT sp.id) as total
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN profile_categories pc ON sp.id = pc.profile_id
      LEFT JOIN service_categories sc ON pc.category_id = sc.id
      WHERE 1=1
    `;
    
    // Apply same filters for count (simplified)
    const countResult = await pool.query(countQuery.replace(/\$\d+/g, '').replace('LIMIT.*', ''));
    
    return {
      profiles: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0]?.total || 0),
        limit,
        offset,
        hasMore: offset + limit < parseInt(countResult.rows[0]?.total || 0)
      }
    };
  }

  // Get single profile by ID
  static async getById(id) {
    const query = `
      SELECT 
        sp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.user_type,
        array_agg(
          DISTINCT jsonb_build_object(
            'id', sc.id,
            'name', sc.name,
            'slug', sc.slug,
            'is_primary', pc.is_primary
          )
        ) FILTER (WHERE sc.id IS NOT NULL) as categories
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN profile_categories pc ON sp.id = pc.profile_id
      LEFT JOIN service_categories sc ON pc.category_id = sc.id
      WHERE sp.id = $1
      GROUP BY sp.id, u.first_name, u.last_name, u.email, u.phone, u.user_type
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new profile
  static async create(profileData) {
    const {
      userId,
      businessName,
      description,
      profileImageUrl,
      coverImageUrl,
      website,
      locationCity,
      locationAddress,
      priceCategory,
      availabilityStatus = 'available'
    } = profileData;

    const query = `
      INSERT INTO service_profiles (
        user_id, business_name, description, profile_image_url,
        cover_image_url, website, location_city, location_address,
        price_category, availability_status, profile_completed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *
    `;

    const values = [
      userId,
      businessName,
      description || null,
      profileImageUrl || null,
      coverImageUrl || null,
      website || null,
      locationCity || null,
      locationAddress || null,
      priceCategory || null,
      availabilityStatus
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update profile
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Allowed fields to update
    const fieldMapping = {
      businessName: 'business_name',
      description: 'description',
      profileImageUrl: 'profile_image_url',
      coverImageUrl: 'cover_image_url',
      website: 'website',
      locationCity: 'location_city',
      locationAddress: 'location_address',
      priceCategory: 'price_category',
      availabilityStatus: 'availability_status'
    };

    Object.keys(updateData).forEach(key => {
      const dbField = fieldMapping[key];
      if (dbField && updateData[key] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE service_profiles 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete profile
  static async delete(id) {
    const query = `
      DELETE FROM service_profiles 
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Add categories to profile
  static async updateCategories(profileId, categoryIds, primaryCategoryId = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Remove existing categories
      await client.query(
        'DELETE FROM profile_categories WHERE profile_id = $1',
        [profileId]
      );

      // Add new categories
      for (const categoryId of categoryIds) {
        const isPrimary = categoryId === primaryCategoryId;
        await client.query(
          'INSERT INTO profile_categories (profile_id, category_id, is_primary) VALUES ($1, $2, $3)',
          [profileId, categoryId, isPrimary]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user's profile
  static async getByUserId(userId) {
    const query = `
      SELECT sp.* FROM service_profiles sp
      WHERE sp.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = ServiceProfile;