const express = require('express');
const router = express.Router();
const ServiceProfile = require('../models/ServiceProfile');
const { validateServiceProfile, validateQueryParams } = require('../middleware/validation');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// GET /api/profiles - Get all profiles with filtering
router.get('/', validateQueryParams, async (req, res) => {
  try {
    const filters = {
      city: req.query.city,
      category: req.query.category,
      price_category: req.query.price_category,
      rating_min: req.query.rating_min,
      featured: req.query.featured,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await ServiceProfile.getAll(filters);

    res.json({
      success: true,
      data: result.profiles,
      pagination: result.pagination,
      filters: {
        applied: Object.keys(filters).filter(key => filters[key] !== undefined),
        total_results: result.pagination.total
      }
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/profiles/:id - Get single profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const profile = await ServiceProfile.getById(parseInt(id));

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Service profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/profiles - Create new profile (requires auth)
router.post('/', requireAuth, validateServiceProfile, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has a profile
    const existingProfile = await ServiceProfile.getByUserId(userId);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'User already has a service profile'
      });
    }

    // Check if user is provider type
    if (req.user.user_type !== 'service_provider') {
      return res.status(403).json({
        success: false,
        message: 'Only service providers can create profiles'
      });
    }

    const profileData = {
      userId,
      businessName: req.body.businessName,
      description: req.body.description,
      profileImageUrl: req.body.profileImageUrl,
      coverImageUrl: req.body.coverImageUrl,
      website: req.body.website,
      locationCity: req.body.locationCity,
      locationAddress: req.body.locationAddress,
      priceCategory: req.body.priceCategory,
      availabilityStatus: req.body.availabilityStatus || 'available'
    };

    const newProfile = await ServiceProfile.create(profileData);

    // Add categories if provided
    if (req.body.categoryIds && req.body.categoryIds.length > 0) {
      await ServiceProfile.updateCategories(
        newProfile.id, 
        req.body.categoryIds, 
        req.body.primaryCategoryId
      );
    }

    // Fetch complete profile with categories
    const completeProfile = await ServiceProfile.getById(newProfile.id);

    res.status(201).json({
      success: true,
      message: 'Service profile created successfully',
      data: completeProfile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/profiles/:id - Update profile (requires auth + ownership)
router.put('/:id', requireAuth, validateServiceProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    // Check if profile exists and belongs to user
    const existingProfile = await ServiceProfile.getById(parseInt(id));
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Service profile not found'
      });
    }

    if (existingProfile.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const updateData = {
      businessName: req.body.businessName,
      description: req.body.description,
      profileImageUrl: req.body.profileImageUrl,
      coverImageUrl: req.body.coverImageUrl,
      website: req.body.website,
      locationCity: req.body.locationCity,
      locationAddress: req.body.locationAddress,
      priceCategory: req.body.priceCategory,
      availabilityStatus: req.body.availabilityStatus
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedProfile = await ServiceProfile.update(parseInt(id), updateData);

    // Update categories if provided
    if (req.body.categoryIds) {
      await ServiceProfile.updateCategories(
        parseInt(id), 
        req.body.categoryIds, 
        req.body.primaryCategoryId
      );
    }

    // Fetch complete updated profile
    const completeProfile = await ServiceProfile.getById(parseInt(id));

    res.json({
      success: true,
      message: 'Service profile updated successfully',
      data: completeProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/profiles/:id - Delete profile (requires auth + ownership)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    // Check if profile exists and belongs to user
    const existingProfile = await ServiceProfile.getById(parseInt(id));
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Service profile not found'
      });
    }

    if (existingProfile.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this profile'
      });
    }

    await ServiceProfile.delete(parseInt(id));

    res.json({
      success: true,
      message: 'Service profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/profiles/user/me - Get current user's profile
router.get('/user/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await ServiceProfile.getByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No service profile found for current user'
      });
    }

    // Get complete profile with categories
    const completeProfile = await ServiceProfile.getById(profile.id);

    res.json({
      success: true,
      data: completeProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;