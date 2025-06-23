// backend/routes/modules.js - TELJES FÁJL
import express from 'express';
import pool from '../config/database.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/profiles/modules - Modulok betöltése
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`🔍 Modulok betöltése user ${userId} számára`);
    
    // Először keressük meg a user service_profile-ját
    const profileResult = await pool.query(`
      SELECT id FROM service_profiles 
      WHERE user_id = $1 AND is_active = true
      LIMIT 1
    `, [userId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nincs aktív szolgáltatói profil. Először hozz létre egyet!'
      });
    }

    const profileId = profileResult.rows[0].id;

    // Modulok lekérése
    const modulesResult = await pool.query(`
      SELECT 
        id,
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
    `, [profileId]);

    console.log(`✅ ${modulesResult.rows.length} modul betöltve`);

    res.json({
      success: true,
      data: {
        profile_id: profileId,
        modules: modulesResult.rows.map(module => ({
          ...module,
          content: typeof module.content === 'string' 
            ? JSON.parse(module.content) 
            : module.content
        }))
      }
    });

  } catch (error) {
    console.error('❌ Modulok betöltési hiba:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a modulok betöltése során'
    });
  }
});

// POST /api/users/profiles/modules - Modulok mentése
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { modules } = req.body;

    console.log(`🚀 ${modules?.length || 0} modul mentése user ${userId} számára`);

    if (!modules || !Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        error: 'Hibás modulok formátum'
      });
    }

    // Először keressük meg a user service_profile-ját
    const profileResult = await pool.query(`
      SELECT id FROM service_profiles 
      WHERE user_id = $1 AND is_active = true
      LIMIT 1
    `, [userId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nincs aktív szolgáltatói profil. Először hozz létre egyet a Profile Editor-ban!'
      });
    }

    const profileId = profileResult.rows[0].id;

    // Transaction kezdése
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Töröljük a meglévő modulokat
      await client.query(
        'DELETE FROM profile_modules WHERE profile_id = $1',
        [profileId]
      );

      // Új modulok beszúrása
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        
        await client.query(`
          INSERT INTO profile_modules (
            profile_id,
            module_type,
            position_x,
            position_y,
            width,
            height,
            content,
            is_visible,
            sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          profileId,
          module.type || 'text',
          module.position?.x || 0,
          module.position?.y || i,
          module.size?.width || 1,
          module.size?.height || 1,
          JSON.stringify(module.content || {}),
          module.isVisible !== false,
          module.sortOrder || i
        ]);
      }

      await client.query('COMMIT');
      
      console.log(`✅ ${modules.length} modul sikeresen mentve`);

      res.json({
        success: true,
        message: `${modules.length} modul sikeresen mentve`,
        data: {
          profile_id: profileId,
          modules_count: modules.length
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Modulok mentési hiba:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a modulok mentése során: ' + error.message
    });
  }
});

export default router;