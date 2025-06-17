// frontend/src/services/aiAssistantAPI.ts
import api from './api'; // A meglévő axios instance használata

interface QueryRequest {
  message: string;
  location?: string;
  userId?: string;
  sessionId?: string;
}

interface CostEstimate {
  breakdown: Array<{
    skill: string;
    minPrice: number;
    maxPrice: number;
    unit: string;
    estimatedHours: number;
  }>;
  totalMin: number;
  totalMax: number;
  currency: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  skills: string[];
  averageRating: number;
  reviewCount: number;
  pricing: { startingPrice: number };
  location: string;
  profileImage: string;
  isCorvusCertified: boolean;
  responseTime: string;
  availability: string;
  totalScore: number;
}

interface AIResponse {
  analysis: {
    problemType: string;
    urgency: string;
    complexity: string;
    requiredSkills: string[];
    estimatedDuration: string;
    location: string;
    budgetHint: string;
    keywords: string[];
    projectPhases: string[];
  };
  costEstimate: CostEstimate;
  providers: ServiceProvider[];
  aiResponse: string;
  followUpQuestions: string[];
  sessionId: string;
}

class AIAssistantAPI {
  constructor() {
    // A meglévő api instance-ot használjuk, nincs szükség új axios client-re
  }

  async processQuery(request: QueryRequest): Promise<AIResponse> {
    try {
      // Session ID generálása ha nincs
      const sessionId = request.sessionId || this.generateSessionId();
      
      const response = await api.post('/ai/process-query', {
        ...request,
        sessionId,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI Query Error:', error);
      throw this.handleError(error);
    }
  }

  async getQuickSuggestions(category?: string): Promise<string[]> {
    try {
      const response = await api.get('/ai/quick-suggestions', {
        params: { category }
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Quick Suggestions Error:', error);
      return this.getDefaultSuggestions();
    }
  }

  async getFeedback(sessionId: string, messageId: string, rating: number, comment?: string): Promise<void> {
    try {
      await api.post('/ai/feedback', {
        sessionId,
        messageId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Feedback Error:', error);
      // Nem dobunk hibát, mert a feedback opcionális
    }
  }

  async getConversationHistory(limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get('/ai/conversation-history', {
        params: { limit }
      });
      return response.data.conversations;
    } catch (error) {
      console.error('Conversation History Error:', error);
      return [];
    }
  }

  async reportIssue(sessionId: string, messageId: string, issueType: string, description: string): Promise<void> {
    try {
      await api.post('/ai/report-issue', {
        sessionId,
        messageId,
        issueType,
        description,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Report Issue Error:', error);
      throw new Error('Nem sikerült a bejelentés elküldése');
    }
  }

  // Provider részletes információk lekérése
  async getProviderDetails(providerId: string): Promise<any> {
    try {
      const response = await api.get(`/providers/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Provider Details Error:', error);
      throw new Error('Nem sikerült a szolgáltató adatainak betöltése');
    }
  }

  // Contact provider through AI chat
  async contactProvider(providerId: string, message: string, projectDetails?: any): Promise<void> {
    try {
      await api.post('/ai/contact-provider', {
        providerId,
        message,
        projectDetails,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Contact Provider Error:', error);
      throw new Error('Nem sikerült a kapcsolatfelvétel');
    }
  }

  // Smart search suggestions as user types
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (query.length < 3) return [];
      
      const response = await api.get('/ai/search-suggestions', {
        params: { q: query }
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Search Suggestions Error:', error);
      return [];
    }
  }

  // Price estimation for specific services
  async estimatePrice(serviceType: string, details: any): Promise<CostEstimate> {
    try {
      const response = await api.post('/ai/estimate-price', {
        serviceType,
        details
      });
      return response.data;
    } catch (error) {
      console.error('Price Estimation Error:', error);
      throw new Error('Nem sikerült a költségbecslés');
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server válaszolt hibával
      const status = error.response.status;
      const message = error.response.data?.message || 'Ismeretlen szerver hiba';
      
      switch (status) {
        case 400:
          return new Error(`Hibás kérés: ${message}`);
        case 401:
          return new Error('Hitelesítés szükséges');
        case 403:
          return new Error('Nincs jogosultságod ehhez a művelethez');
        case 404:
          return new Error('A kért szolgáltatás nem található');
        case 429:
          return new Error('Túl sok kérés. Próbáld újra később.');
        case 500:
          return new Error('Szerver hiba. Próbáld újra később.');
        default:
          return new Error(`Hiba (${status}): ${message}`);
      }
    } else if (error.request) {
      // Hálózati hiba
      return new Error('Hálózati hiba. Ellenőrizd az internetkapcsolatod.');
    } else {
      // Egyéb hiba
      return new Error(`Váratlan hiba: ${error.message}`);
    }
  }

  private getDefaultSuggestions(): string[] {
    return [
      'Mennyibe kerül egy logo tervezés?',
      'Ki tudja megjavítani a csapom?',
      'Hogyan válasszak webfejlesztőt?',
      'Keresek egy villanyszerelőt',
      'Festő árak Budapest',
      'Mobilapp fejlesztés költségei'
    ];
  }
}

// Singleton instance export
export const aiAssistantAPI = new AIAssistantAPI();
export default aiAssistantAPI;