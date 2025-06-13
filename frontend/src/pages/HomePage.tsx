import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';

const HomePage: React.FC = () => {
  const heroActions = (
    <>
      <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
        Kezdjük el! 🚀
      </Link>
      <Link to="/services" className="btn btn-outline text-lg px-8 py-3">
        Szolgáltatók böngészése
      </Link>
    </>
  );

  return (
    <Layout 
      showHero={true}
      heroTitle="Találd meg a tökéletes szolgáltatót!"
      heroSubtitle="Egy helyen minden szakember - villanyszerelőtől grafikusig. Modulárisan testreszabható profilok, megbízható értékelések."
      heroActions={heroActions}
    >
      <Container>
        {/* Features */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-12">
            Miért választd a platformunkat?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center" hover={true}>
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Moduláris Profilok</h3>
              <p className="text-gray-600">
                Drag-and-drop szerkesztővel személyre szabható szolgáltatói oldalak
              </p>
            </Card>
            
            <Card className="text-center" hover={true}>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Okos Keresés</h3>
              <p className="text-gray-600">
                Gyors és pontos keresés kategóriák, ár és helyszín alapján
              </p>
            </Card>
            
            <Card className="text-center" hover={true}>
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Megbízható Értékelések</h3>
              <p className="text-gray-600">
                Valós ügyfél vélemények és tanúsítvány alapú hitelesítés
              </p>
            </Card>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-12">
            Népszerű kategóriák
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '🏗️', name: 'Építőipar', count: '234 szolgáltató', slug: 'epites-felujitas' },
              { icon: '🎨', name: 'Kreatív & Design', count: '156 szolgáltató', slug: 'grafikai-tervezes' },
              { icon: '💻', name: 'IT & Fejlesztés', count: '189 szolgáltató', slug: 'it-technologia' },
              { icon: '📚', name: 'Oktatás', count: '98 szolgáltató', slug: 'oktatas-kepzes' },
              { icon: '🌱', name: 'Kert & Háztartás', count: '145 szolgáltató', slug: 'kert-kulso-teruletek' },
              { icon: '⚖️', name: 'Jogi & Pénzügyi', count: '67 szolgáltató', slug: 'uzleti-szolgaltatasok' }
            ].map((category, index) => (
              <Link 
                key={index} 
                to={`/services?category=${category.slug}`}
                className="block"
              >
                <Card className="text-center" hover={true} padding="sm">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h4 className="font-semibold text-sm">{category.name}</h4>
                  <p className="text-xs text-gray-600">{category.count}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default HomePage;