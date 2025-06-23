// backend/routes/upload.js - ES MODULES ÁTÍRÁS

import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import auth from '../middleware/auth.js';
import pool from '../config/database.js'; // ✅ HOZZÁADVA: adatbázis kapcsolat

const router = express.Router();

// Cloudinary konfiguráció
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer konfiguráció - memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Csak képek engedélyezése
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Csak képfájlok engedélyezettek!'), false);
    }
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload service működik! ✅',
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET),
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'
    }
  });
});

// Upload info endpoint
router.get('/info', auth, (req, res) => {
  res.json({
    success: true,
    limits: {
      maxFileSize: '5MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxFiles: 1
    },
    user: {
      id: req.user.userId,
      type: req.user.userType
    }
  });
});

// Profilkép feltöltés ✅ FRISSÍTVE: adatbázis mentéssel
router.post('/profile-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nem található kép fájl'
      });
    }

    console.log(`📸 Profilkép feltöltés indítása user ${req.user.userId} számára`);

    // Cloudinary upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder: 'profile-images',
        public_id: `user-${req.user.userId}-${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });

      uploadStream.end(req.file.buffer);
    });

    console.log('✅ Cloudinary upload sikeres:', uploadResult.secure_url);

    // ✅ ÚJ: Kép URL mentése az adatbázisba
    try {
      await pool.query(
        'UPDATE users SET profile_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [uploadResult.secure_url, req.user.userId]
      );
      console.log('✅ Profilkép URL elmentve adatbázisba');
    } catch (dbError) {
      console.error('❌ Adatbázis mentési hiba:', dbError);
    }

    res.json({
      success: true,
      message: 'Profilkép sikeresen feltöltve! 📸',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes
      }
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a kép feltöltése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
});

// Borítókép feltöltés
router.post('/cover-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nem található kép fájl'
      });
    }

    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók tölthetnek fel borítóképet'
      });
    }

    console.log(`🖼️ Borítókép feltöltés indítása user ${req.user.userId} számára`);

    // Cloudinary upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder: 'cover-images',
        public_id: `cover-${req.user.userId}-${Date.now()}`,
        transformation: [
          { width: 1200, height: 600, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });

      uploadStream.end(req.file.buffer);
    });

    console.log('✅ Cloudinary cover upload sikeres:', uploadResult.secure_url);

    res.json({
      success: true,
      message: 'Borítókép sikeresen feltöltve! 🖼️',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes
      }
    });

  } catch (error) {
    console.error('Cover image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a borítókép feltöltése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
});

// ✅ FRISSÍTVE: Profilkép törlés adatbázisból is
router.delete('/profile-image', auth, async (req, res) => {
  try {
    console.log(`🗑️ Profilkép törlése user ${req.user.userId} számára`);

    // Jelenlegi profilkép lekérése az adatbázisból
    const userResult = await pool.query(
      'SELECT profile_image_url FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Felhasználó nem található'
      });
    }

    const currentImageUrl = userResult.rows[0].profile_image_url;

    if (!currentImageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Nincs profilkép törölni'
      });
    }

    // Public ID kivonása a Cloudinary URL-ből
    const urlParts = currentImageUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = `profile-images/${publicIdWithExtension.split('.')[0]}`;

    // Cloudinary-ból törlés
    const deleteResult = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary törlés eredménye:', deleteResult);

    // Adatbázisból URL törlése
    await pool.query(
      'UPDATE users SET profile_image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.user.userId]
    );

    console.log('✅ Profilkép sikeresen törölve mindenhonnan');

    res.json({
      success: true,
      message: 'Profilkép sikeresen eltávolítva! 🗑️'
    });

  } catch (error) {
    console.error('Profile image deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a kép törlése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Deletion failed'
    });
  }
});

// Kép törlés (általános)
router.delete('/image/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Public ID szükséges'
      });
    }

    console.log(`🗑️ Kép törlése: ${publicId} user ${req.user.userId} által`);

    // Cloudinary deletion
    const deleteResult = await cloudinary.uploader.destroy(publicId);

    if (deleteResult.result === 'ok') {
      console.log('✅ Kép sikeresen törölve Cloudinary-ből');
      res.json({
        success: true,
        message: 'Kép sikeresen törölve! 🗑️'
      });
    } else {
      console.log('⚠️ Kép nem található Cloudinary-ben:', deleteResult);
      res.status(404).json({
        success: false,
        error: 'Kép nem található vagy már törölve van'
      });
    }

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a kép törlése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Deletion failed'
    });
  }
});

// Múltiple képek feltöltése (galéria számára)
router.post('/gallery', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nem található kép fájl'
      });
    }

    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({
        success: false,
        error: 'Csak szolgáltatók tölthetnek fel galéria képeket'
      });
    }

    console.log(`🖼️ ${req.files.length} galéria kép feltöltése user ${req.user.userId} számára`);

    const uploadPromises = req.files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: 'gallery-images',
          public_id: `gallery-${req.user.userId}-${Date.now()}-${index}`,
          transformation: [
            { width: 800, height: 600, crop: 'fit', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });

        uploadStream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    console.log(`✅ ${uploadResults.length} galéria kép feltöltve`);

    res.json({
      success: true,
      message: `${uploadResults.length} kép sikeresen feltöltve! 🖼️`,
      data: {
        images: uploadResults.map(result => ({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }))
      }
    });

  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba történt a galéria képek feltöltése során',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
    });
  }
});

export default router;