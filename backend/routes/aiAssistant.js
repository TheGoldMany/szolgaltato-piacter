// backend/routes/aiAssistant.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import AIAssistantService from '../services/aiAssistantService.js';
import { authenticateToken } from '../middleware/auth.js';
import { logAIInteraction } from '../middleware/analytics.js';

const router = express.Router();
const aiService = new AIAssistantService();

// Rate limiting - max 20 AI kérés per user per órában
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 óra
  max: 20, // 20 kérés per óra
  message: {
    error: 'Túl sok AI kérés. Próbáld újra 1 óra múlva.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Main AI query processing endpoint
router.post('/process-query', 
  aiRateLimit,
  [
    body('message')
      .trim()
      .isLength({ min: 3, max: 1000 })
      .withMessage('Az üzenet 3-1000 karakter között kell legyen'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Helyszín maximum 100 karakter lehet'),
    body('sessionId')
      .optional()
      .isAlphanumeric()
      .withMessage('Hibás session ID formátum')
  ],
  logAIInteraction,
  async (req, res) => {
    try {
      // Validation errors check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Hibás bemeneti adatok',
          details: errors.array()
        });
      }

      const { message, location, sessionId } = req.body;
      const userId = req.user?.id; // Ha be van jelentkezve

      // AI processing
      const result = await aiService.processUserQuery(message, location, {
        userId,
        sessionId: sessionId || generateSessionId(),
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Analytics logging (async, nem blokkolja a választ)
      logUserInteraction(userId, sessionId, message, result).catch(console.error);

      res.json({
        ...result,
        sessionId: sessionId || generateSessionId(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Processing Error:', error);
      
      // Különböző hibatípusok kezelése
      if (error.name === 'OpenAIError') {
        return res.status(503).json({
          error: 'AI szolgáltatás ideiglenesen nem elérhető',
          fallback: true
        });
      }
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Hibás bemeneti adatok',
          details: error.message
        });
      }

      res.status(500).json({
        error: 'Belső szerver hiba',
        message: 'Próbáld újra később vagy keress rá a szolgáltatók között'
      });
    }
  }
);

// Quick suggestions endpoint
router.get('/quick-suggestions', async (req, res) => {
  try {
    const { category } = req.query;
    
    const suggestions = await aiService.getQuickSuggestions(category);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Quick Suggestions Error:', error);
    res.json({ 
      suggestions: getDefaultSuggestions() 
    });
  }
});

// Search suggestions as user types
router.get('/search-suggestions', 
  rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 30, // 30 kérés per perc
  }),
  async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || query.length < 3) {
        return res.json({ suggestions: [] });
      }

      const suggestions = await aiService.getSearchSuggestions(query);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Search Suggestions Error:', error);
      res.json({ suggestions: [] });
    }
  }
);

// Price estimation endpoint
router.post('/estimate-price',
  [
    body('serviceType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Szolgáltatás típusa kötelező'),
    body('details')
      .isObject()
      .withMessage('Részletek objektum formátumban szükségesek')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Hibás bemeneti adatok',
          details: errors.array()
        });
      }

      const { serviceType, details } = req.body;
      
      const estimate = await aiService.estimatePrice(serviceType, details);
      
      res.json(estimate);
    } catch (error) {
      console.error('Price Estimation Error:', error);
      res.status(500).json({
        error: 'Nem sikerült a költségbecslés'
      });
    }
  }
);

// Feedback endpoint
router.post('/feedback',
  authenticateToken, // Csak bejelentkezett felhasználók adhatnak visszajelzést
  [
    body('sessionId').trim().notEmpty().withMessage('Session ID kötelező'),
    body('messageId').trim().notEmpty().withMessage('Message ID kötelező'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Értékelés 1-5 között kell legyen'),
    body('comment').optional().trim().isLength({ max: 500 }).withMessage('Komment maximum 500 karakter')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Hibás bemeneti adatok',
          details: errors.array()
        });
      }

      const { sessionId, messageId, rating, comment } = req.body;
      const userId = req.user.id;

      await aiService.saveFeedback({
        userId,
        sessionId,
        messageId,
        rating,
        comment,
        timestamp: new Date()
      });

      res.json({ message: 'Visszajelzés sikeresen elmentve' });
    } catch (error) {
      console.error('Feedback Error:', error);
      res.status(500).json({
        error: 'Nem sikerült a visszajelzés mentése'
      });
    }
  }
);

// Contact provider through AI
router.post('/contact-provider',
  authenticateToken,
  [
    body('providerId').trim().notEmpty().withMessage('Provider ID kötelező'),
    body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Üzenet 10-1000 karakter között'),
    body('projectDetails').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Hibás bemeneti adatok',
          details: errors.array()
        });
      }

      const { providerId, message, projectDetails } = req.body;
      const userId = req.user.id;

      const result = await aiService.contactProvider({
        userId,
        providerId,
        message,
        projectDetails,
        timestamp: new Date()
      });

      res.json({ 
        message: 'Kapcsolatfelvétel sikeresen elküldve',
        conversationId: result.conversationId
      });
    } catch (error) {
      console.error('Contact Provider Error:', error);
      res.status(500).json({
        error: 'Nem sikerült a kapcsolatfelvétel'
      });
    }
  }
);

// Issue reporting
router.post('/report-issue',
  authenticateToken,
  [
    body('sessionId').trim().notEmpty().withMessage('Session ID kötelező'),
    body('messageId').trim().notEmpty().withMessage('Message ID kötelező'),
    body('issueType').isIn(['inappropriate', 'incorrect', 'technical', 'other']).withMessage('Hibás probléma típus'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Leírás 10-500 karakter között')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Hibás bemeneti adatok',
          details: errors.array()
        });
      }

      const { sessionId, messageId, issueType, description } = req.body;
      const userId = req.user.id;

      await aiService.reportIssue({
        userId,
        sessionId,
        messageId,
        issueType,
        description,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Bejelentés sikeresen elküldve' });
    } catch (error) {
      console.error('Report Issue Error:', error);
      res.status(500).json({
        error: 'Nem sikerült a bejelentés elküldése'
      });
    }
  }
);

// Conversation history
router.get('/conversation-history',
  authenticateToken,
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const userId = req.user.id;

      const conversations = await aiService.getConversationHistory(userId, parseInt(limit));
      
      res.json({ conversations });
    } catch (error) {
      console.error('Conversation History Error:', error);
      res.status(500).json({
        error: 'Nem sikerült a beszélgetés előzmények betöltése',
        conversations: []
      });
    }
  }
);

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Helper functions
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultSuggestions() {
  return [
    'Mennyibe kerül egy logo tervezés?',
    'Ki tudja megjavítani a csapom?',
    'Hogyan válasszak webfejlesztőt?',
    'Keresek egy villanyszerelőt',
    'Festő árak Budapest',
    'Mobilapp fejlesztés költségei'
  ];
}

async function logUserInteraction(userId, sessionId, message, result) {
  try {
    // Analytics és logging
    console.log('AI Interaction:', {
      userId,
      sessionId,
      messageLength: message.length,
      providersFound: result.providers?.length || 0,
      problemType: result.analysis?.problemType,
      timestamp: new Date()
    });
    
    // Itt küldheted el az adatokat analytics szolgáltatásokhoz
    // pl. Google Analytics, Mixpanel, stb.
  } catch (error) {
    console.error('Logging error:', error);
  }
}

export default router;