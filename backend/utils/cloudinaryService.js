const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage (fájlokat memóriában tároljuk, majd Cloudinary-ba küldünk)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Csak képfájlok engedélyezettek!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload image to Cloudinary
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'szolgaltato-piacter',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    const uploadOptions = { ...defaultOptions, ...options };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Upload profile image (optimized for profile pictures)
const uploadProfileImage = async (buffer) => {
  const options = {
    folder: 'szolgaltato-piacter/profiles',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  };
  
  return await uploadToCloudinary(buffer, options);
};

// Upload cover image (optimized for cover photos)
const uploadCoverImage = async (buffer) => {
  const options = {
    folder: 'szolgaltato-piacter/covers',
    transformation: [
      { width: 1200, height: 400, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  };
  
  return await uploadToCloudinary(buffer, options);
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  try {
    // Extract public ID from URL like: 
    // https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.jpg
    const parts = cloudinaryUrl.split('/');
    const versionIndex = parts.findIndex(part => part.startsWith('v'));
    
    if (versionIndex !== -1 && versionIndex < parts.length - 1) {
      // Get everything after version number, remove file extension
      const pathAfterVersion = parts.slice(versionIndex + 1).join('/');
      return pathAfterVersion.replace(/\.[^/.]+$/, "");
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Test Cloudinary connection
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  uploadProfileImage,
  uploadCoverImage,
  deleteImage,
  extractPublicId,
  testConnection
};