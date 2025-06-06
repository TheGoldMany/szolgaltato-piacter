const express = require('express');
const Profile = require('../models/Profile');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.getByUserId(req.user.id);
    
    if (!profile) {
      return res.status(404).json({
        error: 'Profil nem található',
        message: 'Még nem hoztál létre szolgáltatói profilt'
      });
    }

    res.json({
      message: 'Profil sikeresen lekérve',
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Szerver hiba a profil lekérése során' });
  }
});

// Create new profile (service providers only)
router.post('/', 
  authenticateToken, 
  requireRole(['service_provider']), 
  async (req, res) => {
    try {
      const {
        businessName, description, profileImageUrl, coverImageUrl,
        website, locationCity, locationAddress, priceCategory
      } = req.body;

      // Input validation
      if (!businessName || !description || !locationCity) {
        return res.status(400).json({
          error: 'Hiányzó kötelező mezők',
          required: ['businessName', 'description', 'locationCity']
        });
      }

      // Check if profile already exists
      const existingProfile = await Profile.getByUserId(req.user.id);
      if (existingProfile) {
        return res.status(409).json({
          error: 'Profil már létezik',
          message: 'Már van szolgáltatói profilod. Használd a PUT /api/profiles/me endpoint-ot a frissítéshez.'
        });
      }

      const profileData = {
        userId: req.user.id,
        businessName,
        description,
        profileImageUrl,
        coverImageUrl,
        website,
        locationCity,
        locationAddress,
        priceCategory: priceCategory || 'mid'
      };

      const newProfile = await Profile.create(profileData);

      res.status(201).json({
        message: 'Szolgáltatói profil sikeresen létrehozva! 🎉',
        profile: newProfile
      });

    } catch (error) {
      console.error('Profile creation error:', error);
      res.status(500).json({ 
        error: 'Szerver hiba a profil létrehozása során',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Update current user's profile
router.put('/me', 
  authenticateToken, 
  requireRole(['service_provider']), 
  async (req, res) => {
    try {
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated this way
      delete updateData.userId;
      delete updateData.ratingAverage;
      delete updateData.ratingCount;
      delete updateData.createdAt;

      const updatedProfile = await Profile.update(req.user.id, updateData);

      if (!updatedProfile) {
        return res.status(404).json({
          error: 'Profil nem található',
          message: 'Először hozz létre egy profilt'
        });
      }

      res.json({
        message: 'Profil sikeresen frissítve! ✅',
        profile: updatedProfile
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ 
        error: 'Szerver hiba a profil frissítése során' 
      });
    }
  }
);

// Search profiles (public)
router.get('/search', async (req, res) => {
  try {
    const { city, priceCategory, search, limit = 20 } = req.query;

    const filters = {
      city,
      priceCategory,
      search,
      limit: parseInt(limit)
    };

    const profiles = await Profile.search(filters);

    res.json({
      message: 'Keresés sikeres',
      count: profiles.length,
      profiles
    });

  } catch (error) {
    console.error('Profile search error:', error);
    res.status(500).json({ error: 'Szerver hiba a keresés során' });
  }
});

// Get public profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);

    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Érvénytelen profil ID' });
    }

    const query = `
      SELECT sp.*, u.first_name, u.last_name
      FROM service_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1 AND u.is_active = true
    `;

    const result = await pool.query(query, [profileId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profil nem található' });
    }

    res.json({
      message: 'Profil sikeresen lekérve',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Szerver hiba' });
  }
});

module.exports = router;