const express = require('express');
const { 
  upload, 
  uploadProfileImage, 
  uploadCoverImage, 
  deleteImage, 
  extractPublicId,
  testConnection 
} = require('../utils/cloudinaryService');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Profile = require('../models/Profile');

const router = express.Router();

// Test Cloudinary connection
router.get('/test', authenticateToken, async (req, res) => {
  try {
    const testResult = await testConnection();
    
    if (testResult.success) {
      res.json({
        message: 'Cloudinary kapcsolat működik! ☁️',
        status: 'connected',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      });
    } else {
      res.status(500).json({
        error: 'Cloudinary kapcsolat hiba',
        message: testResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Cloudinary teszt hiba',
      message: error.message
    });
  }
});

// Upload profile image
router.post('/profile-image', 
  authenticateToken,
  requireRole(['service_provider']),
  upload.single('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Nincs feltöltött fájl',
          message: 'Kérjük válasszon ki egy képfájlt' 
        });
      }

      // Upload to Cloudinary
      const uploadResult = await uploadProfileImage(req.file.buffer);
      
      // Update user's profile with new image
      const updatedProfile = await Profile.update(req.user.id, {
        profileImageUrl: uploadResult.secure_url
      });

      res.json({
        message: 'Profilkép sikeresen feltöltve! 📸',
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        profile: updatedProfile
      });

    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({ 
        error: 'Szerver hiba a képfeltöltés során',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
      });
    }
  }
);

// Upload cover image  
router.post('/cover-image',
  authenticateToken,
  requireRole(['service_provider']),
  upload.single('coverImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Nincs feltöltött fájl',
          message: 'Kérjük válasszon ki egy képfájlt' 
        });
      }

      // Upload to Cloudinary
      const uploadResult = await uploadCoverImage(req.file.buffer);

      // Update user's profile with new cover image
      const updatedProfile = await Profile.update(req.user.id, {
        coverImageUrl: uploadResult.secure_url
      });

      res.json({
        message: 'Borítókép sikeresen feltöltve! 🖼️',
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        profile: updatedProfile
      });

    } catch (error) {
      console.error('Cover image upload error:', error);
      res.status(500).json({ 
        error: 'Szerver hiba a képfeltöltés során',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
      });
    }
  }
);

// Get upload info
router.get('/info', authenticateToken, (req, res) => {
  res.json({
    message: 'Képfeltöltés információk',
    limits: {
      profileImage: {
        maxSize: '5MB',
        dimensions: '400x400px (optimalizált)',
        formats: ['jpg', 'jpeg', 'png', 'webp']
      },
      coverImage: {
        maxSize: '5MB', 
        dimensions: '1200x400px (optimalizált)',
        formats: ['jpg', 'jpeg', 'png', 'webp']
      }
    },
    endpoints: {
      test: 'GET /api/upload/test',
      uploadProfile: 'POST /api/upload/profile-image',
      uploadCover: 'POST /api/upload/cover-image',
      info: 'GET /api/upload/info'
    }
  });
});

module.exports = router;