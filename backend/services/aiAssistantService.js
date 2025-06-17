// backend/services/aiAssistantService.js
import OpenAI from 'openai';
import pool from '../config/database.js'; // PostgreSQL kapcsolat

class AIAssistantService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Előre definiált problématípusok és kategóriák
    this.problemCategories = {
      'építés': ['kőműves', 'burkoló', 'villanyszerelő', 'vízszerelő', 'festő'],
      'it': ['webfejlesztő', 'mobilapp fejlesztő', 'grafikus', 'seo szakértő'],
      'kert': ['kertész', 'fűnyírás', 'fa metszés', 'kertépítés'],
      'háztartás': ['takarítás', 'mosogatás', 'vasalás', 'ablaktisztítás'],
      'oktatás': ['magánoktatás', 'nyelvoktatás', 'programozás oktatás']
    };
  }

  async processUserQuery(userMessage, userLocation = null) {
    try {
      // 1. Probléma elemzése az OpenAI-val
      const analysis = await this.analyzeUserProblem(userMessage);
      
      // 2. Költségbecslés generálása
      const costEstimate = await this.generateCostEstimate(analysis);
      
      // 3. Megfelelő szolgáltatók keresése
      const matchedProviders = await this.findMatchingProviders(
        analysis, 
        userLocation
      );
      
      // 4. AI válasz generálása
      const aiResponse = await this.generateResponse(
        userMessage, 
        analysis, 
        costEstimate, 
        matchedProviders
      );
      
      return {
        analysis,
        costEstimate,
        providers: matchedProviders,
        aiResponse,
        followUpQuestions: this.generateFollowUpQuestions(analysis)
      };
      
    } catch (error) {
      console.error('AI Assistant Error:', error);
      return this.getErrorResponse();
    }
  }

  async analyzeUserProblem(userMessage) {
    const prompt = `
Elemezd a következő problémát/igényt és add vissza strukturált JSON formában:

Felhasználó üzenete: "${userMessage}"

Add vissza a következő formátumban:
{
  "problemType": "építés|it|kert|háztartás|oktatás|egyéb",
  "urgency": "azonnali|1-3_nap|1-2_hét|rugalmas",
  "complexity": "egyszerű|közepes|összetett",
  "requiredSkills": ["skill1", "skill2"],
  "estimatedDuration": "X óra/nap/hét",
  "location": "indoor|outdoor|remote",
  "budgetHint": "alacsony|közepes|magas|nincs_megadva",
  "keywords": ["kulcsszó1", "kulcsszó2"],
  "projectPhases": ["fázis1", "fázis2"] // ha összetett projekt
}

Csak a JSON választ add vissza, semmi mást.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      // Fallback ha a JSON parsing sikertelen
      return this.createFallbackAnalysis(userMessage);
    }
  }

  async generateCostEstimate(analysis) {
    // Magyar piaci árak alapján történő becslés
    const basePrices = {
      'villanyszerelő': { min: 8000, max: 15000, unit: 'óra' },
      'vízszerelő': { min: 9000, max: 18000, unit: 'óra' },
      'webfejlesztő': { min: 12000, max: 25000, unit: 'óra' },
      'grafikus': { min: 8000, max: 20000, unit: 'óra' },
      'kertész': { min: 4000, max: 8000, unit: 'óra' },
      'takarítás': { min: 2500, max: 4500, unit: 'óra' }
    };

    const estimates = analysis.requiredSkills.map(skill => {
      const price = basePrices[skill] || { min: 5000, max: 12000, unit: 'óra' };
      
      // Komplexitás alapú szorzó
      const complexityMultiplier = {
        'egyszerű': 1,
        'közepes': 1.5,
        'összetett': 2.2
      }[analysis.complexity] || 1;

      return {
        skill,
        minPrice: Math.round(price.min * complexityMultiplier),
        maxPrice: Math.round(price.max * complexityMultiplier),
        unit: price.unit,
        estimatedHours: this.estimateHours(analysis.complexity, analysis.estimatedDuration)
      };
    });

    return {
      breakdown: estimates,
      totalMin: estimates.reduce((sum, item) => sum + (item.minPrice * item.estimatedHours), 0),
      totalMax: estimates.reduce((sum, item) => sum + (item.maxPrice * item.estimatedHours), 0),
      currency: 'HUF'
    };
  }

  async findMatchingProviders(analysis, userLocation) {
    try {
      // SQL query a szolgáltatók megtalálásához
      let query = `
        SELECT 
          sp.id,
          sp.name,
          sp.email,
          sp.phone,
          sp.skills,
          sp.location,
          sp.pricing_starting_from,
          sp.profile_image,
          sp.is_corvus_certified,
          sp.response_time,
          sp.availability,
          sp.created_at,
          sp.updated_at,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.id) as review_count,
          COUNT(DISTINCT p.id) as completed_projects
        FROM service_providers sp
        LEFT JOIN reviews r ON sp.id = r.service_provider_id
        LEFT JOIN projects p ON sp.id = p.service_provider_id AND p.status = 'completed'
        WHERE sp.is_active = true 
          AND sp.is_verified = true
      `;
      
      const queryParams = [];
      let paramIndex = 1;

      // Skill-based filtering
      if (analysis.requiredSkills && analysis.requiredSkills.length > 0) {
        // PostgreSQL array overlap operator használata
        query += ` AND sp.skills && ${paramIndex}`;
        queryParams.push(analysis.requiredSkills);
        paramIndex++;
      }

      // Location filtering if provided
      if (userLocation) {
        query += ` AND (sp.location ILIKE ${paramIndex} OR sp.service_areas ILIKE ${paramIndex})`;
        queryParams.push(`%${userLocation}%`);
        paramIndex++;
      }

      query += `
        GROUP BY sp.id
        ORDER BY 
          (CASE WHEN sp.is_corvus_certified = true THEN 10 ELSE 0 END) +
          COALESCE(AVG(r.rating), 0) * 2 +
          (COUNT(DISTINCT p.id) / 10.0)
        DESC
        LIMIT 5
      `;

      const result = await pool.query(query, queryParams);
      
      // Transform results
      const providers = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        skills: row.skills || [],
        averageRating: parseFloat(row.average_rating) || 0,
        reviewCount: parseInt(row.review_count) || 0,
        pricing: { startingPrice: row.pricing_starting_from || 0 },
        location: row.location,
        profileImage: row.profile_image,
        isCorvusCertified: row.is_corvus_certified || false,
        responseTime: row.response_time || '24 óra',
        availability: row.availability || 'Elérhető',
        completedProjects: parseInt(row.completed_projects) || 0
      }));

      return providers;
    } catch (error) {
      console.error('Provider matching error:', error);
      return [];
    }
  }

  async generateResponse(userMessage, analysis, costEstimate, providers) {
    const providerList = providers.map((p, i) => 
      `${i + 1}. ${p.name} (${p.averageRating}⭐, ${p.reviewCount} értékelés) - ${p.pricing.startingPrice} Ft-tól`
    ).join('\n');

    const prompt = `
Te a Corvus Platform AI asszisztense vagy. A felhasználó ezt a problémát/igényt írta le: "${userMessage}"

Elemzés eredménye:
- Probléma típusa: ${analysis.problemType}
- Sürgősség: ${analysis.urgency}  
- Komplexitás: ${analysis.complexity}
- Szükséges készségek: ${analysis.requiredSkills.join(', ')}

Költségbecslés: ${costEstimate.totalMin.toLocaleString()} - ${costEstimate.totalMax.toLocaleString()} Ft

Ajánlott szakemberek:
${providerList}

Írj egy barátságos, segítőkész választ magyar nyelven, amely:
1. Megérti a problémát
2. Rövid tanácsot ad
3. Bemutatja a költségbecslést
4. Ajánlja a legjobb 2-3 szakembert
5. Kérdez vissza a részletekért

Legyen természetes, emberi hangvétel, ne túl formális.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  }

  generateFollowUpQuestions(analysis) {
    const questions = {
      'építés': [
        'Milyen területen van a munka?',
        'Van már minden anyag beszerzve?',
        'Mikor szeretnéd elkezdeni a munkát?'
      ],
      'it': [
        'Milyen platformra készülne? (web/mobil/desktop)',
        'Van már designod vagy azt is kell?',
        'Mikor kell kész legyen a projekt?'
      ],
      'kert': [
        'Mekkora a terület?',
        'Milyen évszakban tervezed?',
        'Van egyéb kertészeti munka is?'
      ]
    };

    return questions[analysis.problemType] || [
      'Mikor lenne megfelelő az időpont?',
      'Van valamilyen preferenciád a szakemberrel kapcsolatban?',
      'Szükséged van garanciára?'
    ];
  }

  createFallbackAnalysis(userMessage) {
    // Egyszerű kulcsszó alapú fallback
    const keywords = userMessage.toLowerCase();
    
    if (keywords.includes('villany') || keywords.includes('elektromos')) {
      return {
        problemType: 'építés',
        urgency: 'rugalmas',
        complexity: 'közepes',
        requiredSkills: ['villanyszerelő'],
        estimatedDuration: '2-4 óra',
        location: 'indoor',
        budgetHint: 'közepes',
        keywords: ['villanyszerelés'],
        projectPhases: []
      };
    }
    
    // További fallback logika...
    return {
      problemType: 'egyéb',
      urgency: 'rugalmas',
      complexity: 'közepes',
      requiredSkills: ['általános'],
      estimatedDuration: 'változó',
      location: 'indoor',
      budgetHint: 'nincs_megadva',
      keywords: [],
      projectPhases: []
    };
  }

  estimateHours(complexity, duration) {
    const hourMap = {
      'egyszerű': { min: 1, max: 4 },
      'közepes': { min: 4, max: 12 },
      'összetett': { min: 12, max: 40 }
    };
    
    return hourMap[complexity]?.min || 2;
  }

  async saveFeedback(feedbackData) {
    try {
      const query = `
        INSERT INTO ai_feedback (
          user_id, session_id, message_id, rating, comment, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `;
      
      const values = [
        feedbackData.userId,
        feedbackData.sessionId,
        feedbackData.messageId,
        feedbackData.rating,
        feedbackData.comment
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Save feedback error:', error);
      throw error;
    }
  }

  async contactProvider(contactData) {
    try {
      // Új beszélgetés létrehozása vagy meglévő megkeresése
      let conversationQuery = `
        SELECT id FROM conversations 
        WHERE user_id = $1 AND service_provider_id = $2
        ORDER BY created_at DESC LIMIT 1
      `;
      
      let conversation = await pool.query(conversationQuery, [
        contactData.userId, 
        contactData.providerId
      ]);
      
      let conversationId;
      
      if (conversation.rows.length === 0) {
        // Új beszélgetés létrehozása
        const newConversationQuery = `
          INSERT INTO conversations (user_id, service_provider_id, created_at)
          VALUES ($1, $2, NOW())
          RETURNING id
        `;
        
        const newConversation = await pool.query(newConversationQuery, [
          contactData.userId,
          contactData.providerId
        ]);
        
        conversationId = newConversation.rows[0].id;
      } else {
        conversationId = conversation.rows[0].id;
      }
      
      // Üzenet mentése
      const messageQuery = `
        INSERT INTO messages (
          conversation_id, sender_id, sender_type, content, 
          project_details, created_at
        ) VALUES ($1, $2, 'user', $3, $4, NOW())
        RETURNING id
      `;
      
      const messageResult = await pool.query(messageQuery, [
        conversationId,
        contactData.userId,
        contactData.message,
        JSON.stringify(contactData.projectDetails)
      ]);
      
      return { 
        conversationId, 
        messageId: messageResult.rows[0].id 
      };
    } catch (error) {
      console.error('Contact provider error:', error);
      throw error;
    }
  }

  async reportIssue(issueData) {
    try {
      const query = `
        INSERT INTO ai_issue_reports (
          user_id, session_id, message_id, issue_type, description,
          ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `;
      
      const values = [
        issueData.userId,
        issueData.sessionId,
        issueData.messageId,
        issueData.issueType,
        issueData.description,
        issueData.ip,
        issueData.userAgent
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Report issue error:', error);
      throw error;
    }
  }

  async getConversationHistory(userId, limit = 10) {
    try {
      const query = `
        SELECT 
          aic.id,
          aic.session_id,
          aic.user_message,
          aic.ai_response,
          aic.providers_suggested,
          aic.created_at
        FROM ai_conversations aic
        WHERE aic.user_id = $1
        ORDER BY aic.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Conversation history error:', error);
      return [];
    }
  }

  async getSearchSuggestions(query) {
    try {
      // Egyszerű PostgreSQL-based search suggestions
      const searchQuery = `
        SELECT DISTINCT 
          unnest(skills) as suggestion
        FROM service_providers 
        WHERE unnest(skills) ILIKE $1
        LIMIT 10
      `;
      
      const result = await pool.query(searchQuery, [`%${query}%`]);
      
      const suggestions = result.rows.map(row => row.suggestion);
      
      // Kiegészítés popular searches-szel
      const popularSuggestions = [
        'villanyszerelés',
        'vízszerelés', 
        'weboldal készítés',
        'logo tervezés',
        'kertészet',
        'takarítás'
      ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
      
      return [...new Set([...suggestions, ...popularSuggestions])];
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  async logInteraction(userId, sessionId, userMessage, aiResponse, analysis, providers) {
    try {
      const query = `
        INSERT INTO ai_conversations (
          user_id, session_id, user_message, ai_response, 
          problem_analysis, providers_suggested, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `;
      
      const values = [
        userId,
        sessionId,
        userMessage,
        aiResponse,
        JSON.stringify(analysis),
        JSON.stringify(providers)
      ];
      
      await pool.query(query, values);
    } catch (error) {
      console.error('Log interaction error:', error);
      // Don't throw, logging is not critical
    }
  }

  async healthCheck() {
    try {
      // OpenAI connection check
      await this.openai.models.list();
      
      // Database connection check
      await pool.query('SELECT 1');
      
      return {
        status: 'healthy',
        openai: 'connected',
        database: 'connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default AIAssistantService;