import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState('customer'); // 'customer' vagy 'provider'
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

  // Scroll-based animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id^="section-"]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const customerSteps = [
    {
      icon: '🔍',
      title: 'Keresd meg a problémád megoldását',
      description: 'Használd az AI asszisztenst vagy böngészd a kategóriákat. Írd le a problémád természetes nyelven.',
      details: ['AI-powered keresés', 'Kategória böngészés', 'Okos ajánlások', 'Helyi szolgáltatók'],
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: '👥',
      title: 'Válassz szakembert',
      description: 'Hasonlítsd össze a szolgáltatókat értékelések, árak és tapasztalatok alapján.',
      details: ['Moduláris profilok', 'Értékelések és vélemények', 'Árak összehasonlítása', 'Portfolio megtekintés'],
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: '💬',
      title: 'Vedd fel a kapcsolatot',
      description: 'Beszéld meg a részleteket üzenetben vagy videohívásban. Kérj ajánlatot.',
      details: ['Belső üzenetrendszer', 'Videóhívás lehetőség', 'Ajánlatkérés', 'Fájlmegosztás'],
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: '✅',
      title: 'Dolgozzatok együtt',
      description: 'Használjátok a projekt workspace-t. Fizess biztonságosan és értékeld a munkát.',
      details: ['Projekt workspace', 'Biztonságos fizetés', 'Milestone tracking', 'Értékelőrendszer'],
      color: 'from-rose-500 to-pink-600'
    }
  ];

  const providerSteps = [
    {
      icon: '📝',
      title: 'Készítsd el a profilod',
      description: 'Használd a moduláris szerkesztőt. Mutasd meg a munkáidat és szakértelmeid.',
      details: ['Moduláris profil építő', 'Portfolio galéria', 'Tanúsítványok feltöltése', 'Szolgáltatások leírása'],
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: '🎯',
      title: 'Várj a megkeresésekre',
      description: 'Az AI automatikusan ajánl téged a megfelelő ügyfeleknek. Válaszolj gyorsan!',
      details: ['AI-powered matching', 'Automatikus ajánlások', 'Push értesítések', 'Gyors válaszadás'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '🤝',
      title: 'Projekteket kapj',
      description: 'Ajánlatot tehetsz, tárgyalhatsz az ügyféllel és megállapodtok a részletekben.',
      details: ['Ajánlattétel', 'Árkalkulátor', 'Szerződéstervezetek', 'Rugalmas feltételek'],
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: '💰',
      title: 'Dolgozz és kapj fizetést',
      description: 'Használd a workspace-t, kövesd a határidőket és kapd meg biztonságosan a pénzed.',
      details: ['Projekt management', 'Automatikus számlázás', 'Biztonságos kifizetés', 'Könyvelési segítség'],
      color: 'from-amber-500 to-yellow-600'
    }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI Asszisztens',
      description: 'Természetes nyelven írd le a problémád, és az AI megtalálja a legjobb szakembereket.',
      stats: '95% pontosság'
    },
    {
      icon: '🛡️',
      title: 'Biztonságos Fizetés',
      description: 'Escrow rendszer védi a pénzed. Csak akkor fizetsz, ha elégedett vagy az eredménnyel.',
      stats: '100% visszafizetési garancia'
    },
    {
      icon: '⭐',
      title: 'Hitelesített Szakemberek',
      description: 'Minden szolgáltató át van vizsgálva. Corvus tanúsítvánnyal rendelkező szakemberek.',
      stats: '50,000+ ellenőrzött profil'
    },
    {
      icon: '🏗️',
      title: 'Projekt Workspace',
      description: 'Közös munkafelület minden projekthez. Fájlok, üzenetek, határidők egy helyen.',
      stats: '24/7 hozzáférhetőség'
    },
    {
      icon: '📚',
      title: 'Corvus Akadémia',
      description: 'Tanulj új készségeket, szerezz tanúsítványokat és fejleszd a karriered.',
      stats: '200+ kurzus elérhető'
    },
    {
      icon: '📱',
      title: 'Mobil App',
      description: 'Kezeld a projektjeid útközben is. iOS és Android alkalmazásaink hamarosan.',
      stats: 'Hamarosan elérhető'
    }
  ];

  const currentSteps = userType === 'customer' ? customerSteps : providerSteps;

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      {/* Navigation - Az új Navbar komponenst használjuk */}
      <Navbar />

    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      paddingTop: '8px'
    }}>
      
      {/* Hero Section */}
      <section 
        id="section-hero"
        style={{
          padding: '80px 20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite'
        }} />
        
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Hogyan Működik a Corvus?
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            marginBottom: '48px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 48px auto',
            lineHeight: 1.6
          }}>
            Egyszerű, biztonságos és hatékony platform szakemberek és ügyfelek találkozásához.
          </p>

          {/* User Type Selector */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setUserType('customer')}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: userType === 'customer' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                transform: userType === 'customer' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: userType === 'customer' 
                  ? '0 8px 25px rgba(255, 255, 255, 0.2)' 
                  : 'none'
              }}
            >
              👨‍💼 Ügyfél vagyok
            </button>
            <button
              onClick={() => setUserType('provider')}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: userType === 'provider' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                transform: userType === 'provider' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: userType === 'provider' 
                  ? '0 8px 25px rgba(255, 255, 255, 0.2)' 
                  : 'none'
              }}
            >
              🔨 Szolgáltató vagyok
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section 
        id="section-steps"
        style={{
          padding: '100px 20px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {userType === 'customer' ? 'Ügyfélként így használd' : 'Szolgáltatóként így kezdj el'}
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {userType === 'customer' 
              ? 'Négy egyszerű lépésben a problémától a megoldásig'
              : 'Négy lépés az első megrendelésig és a sikeres vállalkozásig'
            }
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '100px'
        }}>
          {currentSteps.map((step, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                padding: '40px',
                borderRadius: '20px',
                background: 'white',
                boxShadow: activeStep === index 
                  ? '0 20px 60px rgba(0, 0, 0, 0.15)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.5s ease',
                transform: activeStep === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => setActiveStep(index)}
              onMouseEnter={() => setActiveStep(index)}
            >
              {/* Background gradient */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: `linear-gradient(135deg, ${step.color.split(' ')[1]}, ${step.color.split(' ')[3]})`,
                opacity: activeStep === index ? 1 : 0.3,
                transition: 'all 0.3s ease'
              }} />

              {/* Step number */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: activeStep === index 
                  ? `linear-gradient(135deg, ${step.color.split(' ')[1]}, ${step.color.split(' ')[3]})` 
                  : '#e2e8f0',
                color: activeStep === index ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}>
                {index + 1}
              </div>

              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                transform: activeStep === index ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#1a202c',
                lineHeight: 1.3
              }}>
                {step.title}
              </h3>

              <p style={{
                fontSize: '1rem',
                color: '#64748b',
                marginBottom: '24px',
                lineHeight: 1.6
              }}>
                {step.description}
              </p>

              {/* Details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {step.details.map((detail, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#64748b',
                      opacity: activeStep === index ? 1 : 0.6,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${step.color.split(' ')[1]}, ${step.color.split(' ')[3]})`
                    }} />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Step Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '40px'
        }}>
          {currentSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: activeStep === index ? '#3b82f6' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: activeStep === index ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="section-features"
        style={{
          padding: '100px 20px',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          transform: isVisible['section-features'] ? 'translateY(0)' : 'translateY(50px)',
          opacity: isVisible['section-features'] ? 1 : 0,
          transition: 'all 0.8s ease'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Miért válaszd a Corvust?
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Minden funkció azért készült, hogy a legjobb eredményt érhesd el a legkevesebb erőfeszítéssel.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '32px',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                }} />

                <div style={{
                  fontSize: '36px',
                  marginBottom: '20px'
                }}>
                  {feature.icon}
                </div>

                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#1a202c'
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  marginBottom: '16px'
                }}>
                  {feature.description}
                </p>

                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        id="section-faq"
        style={{
          padding: '100px 20px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Gyakran Ismételt Kérdések
          </h2>
        </div>

        <FAQAccordion />
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '24px'
          }}>
            Készen állsz a kezdésre?
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '48px',
            opacity: 0.9,
            lineHeight: 1.6
          }}>
            Csatlakozz több mint 50,000 elégedett felhasználóhoz és kezdj el dolgozni még ma!
          </p>

          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                background: 'white',
                color: '#2563eb',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
            >
              🔍 Szakember keresése
            </button>
            
            <button
              style={{
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔨 Szolgáltatóként csatlakozom
            </button>
          </div>
        </div>
      </section>
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

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            .grid-responsive {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
     </div>
  );
};

// FAQ Accordion Component
const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Mennyibe kerül a Corvus használata?',
      answer: 'Az alapszolgáltatások ingyenesek! Csak akkor számítunk fel 3% tranzakciós díjat, ha a platformon keresztül fizetsz. Ez tartalmazza a biztonságos fizetést és a könyvelési segítséget is.'
    },
    {
      question: 'Hogyan tudom, hogy megbízható a szolgáltató?',
      answer: 'Minden szolgáltató át van vizsgálva, értékelésekkel rendelkezik, és a Corvus tanúsítvánnyal rendelkező szakemberek különösen megbízhatóak. Emellett escrow rendszerrel védjük a kifizetéseket.'
    },
    {
      question: 'Mi az a moduláris profil?',
      answer: 'A szolgáltatók drag-and-drop módon építhetik fel a profiljukat különböző modulokból: képek, videók, árlista, naptár, értékelések. Ez egy 4x8-as rácsrendszerben működik.'
    },
    {
      question: 'Hogyan működik az AI asszisztens?',
      answer: 'Természetes nyelven írd le a problémád, az AI megérti a szándékod, és automatikusan ajánlja a legmegfelelőbb szolgáltatókat a lokációd, költségvetésed és igényeid alapján.'
    },
    {
      question: 'Mi a projekt workspace?',
      answer: 'Minden projekthez külön munkaterületet biztosítunk, ahol üzenetek, fájlok, határidők és fizetések egy helyen kezelhetők. Több szolgáltató is részt vehet egy projektben.'
    },
    {
      question: 'Elérhető már a mobil alkalmazás?',
      answer: 'A mobil alkalmazásaink fejlesztés alatt állnak iOS és Android platformokra. Addig a webes felület teljes mértékben reszponzív és mobiltelefonon is remekül használható.'
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            marginBottom: '16px',
            borderRadius: '12px',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            style={{
              width: '100%',
              padding: '24px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#1a202c'
            }}
          >
            <span>{faq.question}</span>
            <span style={{
              transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              fontSize: '20px',
              color: '#3b82f6'
            }}>
              ▼
            </span>
          </button>
          
          <div style={{
            maxHeight: openIndex === index ? '200px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease'
          }}>
            <div style={{
              padding: '0 24px 24px 24px',
              fontSize: '1rem',
              color: '#64748b',
              lineHeight: 1.6
            }}>
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HowItWorksPage;