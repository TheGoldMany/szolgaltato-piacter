const pool = require('../config/database');

class Profile {
  // Create new profile
  static async create(profileData) {
    const {
      userId, businessName, description, profileImageUrl,
      coverImageUrl, website, locationCity, locationAddress,
      priceCategory
    } = profileData;

    const query = `
      INSERT INTO service_profiles 
      (user_id, business_name, description, profile_image_url, cover_image_url, 
       website, location_city, location_address, price_category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId, businessName, description, profileImageUrl,
      coverImageUrl, website, locationCity, locationAddress, priceCategory
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get profile by user ID
  static async getByUserId(userId) {
    const query = `
      SELECT sp.*, u.first_name, u.last_name, u.email, u.phone
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Update profile
  static async update(userId, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Dynamically build UPDATE query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbField = this.camelToSnakeCase(key);
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE service_profiles 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Search profiles
  static async search(filters = {}) {
    let query = `
      SELECT sp.*, u.first_name, u.last_name, u.email
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
    `;
    
    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.city) {
      query += ` AND LOWER(sp.location_city) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    if (filters.priceCategory) {
      query += ` AND sp.price_category = $${paramCount}`;
      values.push(filters.priceCategory);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (
        LOWER(sp.business_name) LIKE LOWER($${paramCount}) OR 
        LOWER(sp.description) LIKE LOWER($${paramCount}) OR
        LOWER(u.first_name) LIKE LOWER($${paramCount}) OR
        LOWER(u.last_name) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ` ORDER BY sp.rating_average DESC, sp.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Helper: Convert camelCase to snake_case
  static camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Profile;