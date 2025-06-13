const validateServiceProfile = (req, res, next) => {
  const { businessName, description, locationCity } = req.body;
  const errors = [];

  // Required fields
  if (!businessName || businessName.trim().length < 2) {
    errors.push('Business name is required and must be at least 2 characters');
  }

  if (businessName && businessName.length > 255) {
    errors.push('Business name must not exceed 255 characters');
  }

  if (description && description.length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }

  if (locationCity && locationCity.length > 100) {
    errors.push('Location city must not exceed 100 characters');
  }

  // Validate price category
  const validPriceCategories = ['low', 'medium', 'high'];
  if (req.body.priceCategory && !validPriceCategories.includes(req.body.priceCategory)) {
    errors.push('Price category must be one of: low, medium, high');
  }

  // Validate website URL
  if (req.body.website) {
    try {
      new URL(req.body.website);
    } catch {
      errors.push('Website must be a valid URL');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateQueryParams = (req, res, next) => {
  const { limit, offset, rating_min } = req.query;

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a number between 1 and 100'
    });
  }

  if (offset && (isNaN(offset) || parseInt(offset) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Offset must be a non-negative number'
    });
  }

  if (rating_min && (isNaN(rating_min) || parseFloat(rating_min) < 0 || parseFloat(rating_min) > 5)) {
    return res.status(400).json({
      success: false,
      message: 'Rating minimum must be a number between 0 and 5'
    });
  }

  next();
};

module.exports = {
  validateServiceProfile,
  validateQueryParams
};