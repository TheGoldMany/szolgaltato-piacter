// frontend/src/pages/AIChatPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import aiAssistantAPI from '../services/aiAssistantAPI';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  analysis?: any;
  costEstimate?: any;
  providers?: any[];
  followUpQuestions?: string[];
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
}

interface AIChatPageProps {
  showHistory?: boolean;
}

const AIChatPage: React.FC<AIChatPageProps> = ({ showHistory = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Üdvözlöm! Corvus AI vagyok, az Ön személyes szakember-kereső asszisztensem. Hogyan segíthetek ma?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    getUserLocation();
    
    const state = location.state as { initialMessage?: string };
    if (state?.initialMessage) {
      const initialMessage = state.initialMessage;
      setInputValue(initialMessage);
      setTimeout(() => {
        if (initialMessage.trim()) {
          sendInitialMessage(initialMessage);
        }
      }, 500);
      
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const sendInitialMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiAssistantAPI.processQuery({
        message: message,
        location: userLocation
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.aiResponse,
        timestamp: new Date(),
        analysis: response.analysis,
        costEstimate: response.costEstimate,
        providers: response.providers,
        followUpQuestions: response.followUpQuestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '😔 Sajnos hiba történt. Próbáld meg később vagy böngészd a szolgáltatókat!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.location) {
          setUserLocation(profile.location);
          return;
        }
      }
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setUserLocation('Budapest');
          },
          () => {
            setUserLocation('Budapest');
          }
        );
      }
    } catch (error) {
      console.error('Location error:', error);
      setUserLocation('Budapest');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiAssistantAPI.processQuery({
        message: inputValue,
        location: userLocation
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.aiResponse,
        timestamp: new Date(),
        analysis: response.analysis,
        costEstimate: response.costEstimate,
        providers: response.providers,
        followUpQuestions: response.followUpQuestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '😔 Sajnos hiba történt. Próbáld meg később vagy böngészd a szolgáltatókat!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' Ft';
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'hu-HU';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  const quickCategories = [
    { id: 'szerviz', name: 'Szerviz', icon: '🔧', bgClass: 'bg-orange-50', borderClass: 'border-orange-200', textClass: 'text-orange-700' },
    { id: 'it-tech', name: 'IT/Tech', icon: '💻', bgClass: 'bg-blue-50', borderClass: 'border-blue-200', textClass: 'text-blue-700' },
    { id: 'otthon', name: 'Otthon', icon: '🏠', bgClass: 'bg-green-50', borderClass: 'border-green-200', textClass: 'text-green-700' },
    { id: 'kreativ', name: 'Kreatív', icon: '🎨', bgClass: 'bg-purple-50', borderClass: 'border-purple-200', textClass: 'text-purple-700' },
    { id: 'oktatas', name: 'Oktatás', icon: '📚', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-200', textClass: 'text-indigo-700' },
    { id: 'auto', name: 'Autó', icon: '🚗', bgClass: 'bg-red-50', borderClass: 'border-red-200', textClass: 'text-red-700' },
    { id: 'uzleti', name: 'Üzleti', icon: '💼', bgClass: 'bg-gray-50', borderClass: 'border-gray-200', textClass: 'text-gray-700' }
  ];

  const frequentQuestions = [
    'Mennyibe kerül egy logo tervezés?',
    'Ki tudja megjavítani a csapom?',
    'Hogyan válasszak webfejlesztőt?',
    'Kellene egy villanyszerelő gyorsan',
    'Meddig tart egy fürdőszoba felújítás?',
    'Mire figyeljek építkezésnél?'
  ];

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-blue-600 transition-colors"
            >
              Főoldal
            </button>
            <span className="mx-2">›</span>
            <span className="text-gray-900">AI Asszisztens</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          
          {/* LEFT SIDEBAR (25%) */}
          <div style={{ width: '25%' }} className="space-y-6">
            
            {/* Gyors Kategóriák */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">⚡</span>
                  Gyors Kategóriák
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {quickCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleQuickQuestion(`Keresek egy ${category.name.toLowerCase()} szakembert`)}
                      className={`w-full flex items-center p-3 rounded-lg border-2 transition-all duration-200 group ${category.bgClass} ${category.borderClass} ${category.textClass} hover:shadow-lg`}
                    >
                      <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gyakori Kérdések */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">💡</span>
                  Gyakori Kérdések
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {frequentQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 transition-all duration-200 text-sm group"
                    >
                      <span className="text-blue-600 mr-2">❓</span>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gyors Műveletek */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Gyors Műveletek</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/services')}
                    className="btn btn-primary w-full"
                  >
                    <span className="mr-2">🔍</span>
                    Szolgáltatók böngészése
                  </button>
                  <button 
                    onClick={() => navigate('/categories')}
                    className="btn w-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <span className="mr-2">📋</span>
                    Kategóriák megtekintése
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CHAT AREA (75%) */}
          <div style={{ width: '75%' }}>
            <div className="card overflow-hidden">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center">
                  <div className="avatar lg bg-white/20 mr-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">Corvus AI Asszisztens</h1>
                    <p className="text-blue-100 text-sm">Segítek megtalálni a tökéletes szakembert</p>
                  </div>
                  <div className="ml-auto text-white text-sm">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Conversation Area */}
              <div style={{ height: '500px' }} className="overflow-y-auto p-6 space-y-6 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-4xl ${message.type === 'user' ? '' : 'mr-12'}`}>
                      
                      {/* Avatar és timestamp */}
                      <div className={`flex items-center mb-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'ai' && (
                          <div className="avatar md bg-gradient-to-br from-blue-500 to-blue-600 mr-2">
                            <span className="text-white text-sm">🤖</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString('hu-HU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.type === 'user' && (
                          <div className="avatar md bg-gradient-to-br from-gray-400 to-gray-500 ml-2">
                            <span className="text-white text-sm">👤</span>
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl shadow-lg ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-8' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {/* Cost Estimate */}
                      {message.costEstimate && (
                        <div className="mt-4 card border-green-200">
                          <div className="card-header bg-green-50">
                            <h4 className="font-semibold text-green-800 flex items-center">
                              <span className="mr-2">💰</span>
                              Költségbecslés
                            </h4>
                          </div>
                          <div className="card-body">
                            <div className="space-y-2">
                              {message.costEstimate.breakdown.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="capitalize">{item.skill}</span>
                                  <span>
                                    {formatPrice(item.minPrice)} - {formatPrice(item.maxPrice)} / {item.unit}
                                  </span>
                                </div>
                              ))}
                              <hr className="border-green-200" />
                              <div className="flex justify-between font-semibold text-green-900">
                                <span>Összesen:</span>
                                <span>
                                  {formatPrice(message.costEstimate.totalMin)} - {formatPrice(message.costEstimate.totalMax)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Service Providers */}
                      {message.providers && message.providers.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <span className="mr-2">⭐</span>
                            Ajánlott szakemberek
                          </h4>
                          {message.providers.map((provider: ServiceProvider, index: number) => (
                            <div
                              key={provider.id}
                              onClick={() => handleProviderClick(provider.id)}
                              className="card hover:shadow-xl cursor-pointer transition-all duration-300"
                            >
                              <div className="card-body">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="avatar lg bg-gray-200 mr-4">
                                      <span className="text-2xl">{provider.profileImage || '👨‍💼'}</span>
                                    </div>
                                    <div>
                                      <div className="flex items-center">
                                        <h5 className="font-semibold text-gray-900 mr-2">
                                          {provider.name}
                                        </h5>
                                        {provider.isCorvusCertified && (
                                          <span className="badge primary">🛡️ Corvus</span>
                                        )}
                                      </div>
                                      <div className="flex items-center text-sm text-gray-600 mt-1">
                                        <span className="flex items-center mr-4">
                                          ⭐ {provider.averageRating} ({provider.reviewCount})
                                        </span>
                                        <span>{formatPrice(provider.pricing.startingPrice)}-tól</span>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {provider.skills.join(', ')} • {provider.location}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <div>⚡ {provider.responseTime}</div>
                                    <div>📅 {provider.availability}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Response Buttons */}
                      {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {message.followUpQuestions.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickQuestion(question)}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center space-x-2">
                          <div className="avatar md bg-gradient-to-br from-blue-500 to-blue-600">
                            <span className="text-white text-sm">🤖</span>
                          </div>
                          <div className="loading-spinner"></div>
                          <span className="text-sm text-gray-600">AI gondolkodik...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Area */}
              <div className="card-footer">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Üzenet írása..."
                      className="form-input resize-none"
                      rows={1}
                      disabled={isLoading}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                  </div>
                  
                  {/* Voice Input Button */}
                  <button
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    className={`btn p-3 ${
                      isListening 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Hang bemenet"
                  >
                    {isListening ? '🎙️' : '🎤'}
                  </button>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="btn btn-primary p-3"
                    title="Üzenet küldése"
                  >
                    {isLoading ? (
                      <div className="loading-spinner sm"></div>
                    ) : (
                      '✈️'
                    )}
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Enter = küldés, Shift+Enter = új sor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">🚀 Corvus Platform</div>
              <p className="text-gray-400">
                Találd meg a tökéletes szakembert minden igényedre.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/services" className="hover:text-white transition-colors">Szolgáltatók böngészése</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Regisztráció</a></li>
                <li><a href="/education" className="hover:text-white transition-colors">Corvus Tanulás</a></li>
                <li><a href="/projects" className="hover:text-white transition-colors">Projektek</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Támogatás</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Súgó központ</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Kapcsolat</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">GYIK</a></li>
                <li><a href="/guidelines" className="hover:text-white transition-colors">Irányelvek</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kapcsolat</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 info@corvus-platform.hu</p>
                <p>📞 +36 1 234 5678</p>
                <p>📍 Budapest, Magyarország</p>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-700 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 Corvus Platform Kft. Minden jog fenntartva.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Adatvédelem</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">ÁSZF</a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">Sütik</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIChatPage;