import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

interface ServiceProvider {
  id: number;
  business_name: string;
  description: string;
  location_city: string;
  rating_average: string;
  rating_count: number;
  first_name: string;
  last_name: string;
  price_category: string;
  categories: string[];
}

interface ApiResponse {
  success: boolean;
  data: ServiceProvider[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const ServiceProviders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const city = searchParams.get('city');

  useEffect(() => {
    fetchProviders();
  }, [category, search, city]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (city) params.append('city', city);
      params.append('limit', '20');

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/profiles?${params}`
      );
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProviders(data.data);
      } else {
        throw new Error('Failed to fetch providers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-20">
          <Loading size="lg" text="Szolgáltatók betöltése..." />
        </Container>
      </Layout>
    );
  }

  const getCategoryName = (slug: string) => {
    const categoryMap: { [key: string]: string } = {
      'epites-felujitas': 'Építés és Felújítás',
      'grafikai-tervezes': 'Kreatív & Design',
      'it-technologia': 'IT & Fejlesztés',
      'oktatas-kepzes': 'Oktatás',
      'kert-kulso-teruletek': 'Kert & Háztartás',
      'uzleti-szolgaltatasok': 'Jogi & Pénzügyi'
    };
    return categoryMap[slug] || slug;
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="bg-gray-100 py-8">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {category ? getCategoryName(category) : 'Szolgáltatók böngészése'}
            </h1>
            {search && (
              <p className="text-lg text-gray-600 mb-2">
                Keresés: "{search}"
              </p>
            )}
            <p className="text-gray-600">
              {error ? '0' : providers.length} szolgáltató találat
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8">
        {error ? (
          <Card className="text-center">
            <div className="text-red-600 mb-4">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-lg">Hiba történt: {error}</p>
            </div>
            <Link to="/" className="btn btn-primary">
              Vissza a főoldalra
            </Link>
          </Card>
        ) : providers.length === 0 ? (
          <Card className="text-center">
            <div className="text-gray-600 mb-4">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-lg">Nincs találat a megadott kritériumokkal.</p>
            </div>
            <Link to="/" className="btn btn-primary">
              Vissza a főoldalra
            </Link>
          </Card>
        ) : (
          <>
            {/* Filters/Search Bar */}
            <Card className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Szűrők</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/services" className="btn btn-outline">
                  Minden szolgáltató
                </Link>
                <Link to="/services?category=epites-felujitas" className="btn btn-outline">
                  Építőipar
                </Link>
                <Link to="/services?category=it-technologia" className="btn btn-outline">
                  IT & Fejlesztés
                </Link>
                <Link to="/services?category=grafikai-tervezes" className="btn btn-outline">
                  Design
                </Link>
              </div>
            </Card>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card key={provider.id} hover={true} className="h-full flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {provider.business_name}
                  </h3>
                  
                  <p className="text-gray-600 mb-2">
                    {provider.first_name} {provider.last_name}
                  </p>
                  
                  <p className="text-gray-700 mb-4 flex-grow">
                    {provider.description?.substring(0, 120)}...
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 flex items-center">
                      📍 {provider.location_city}
                    </span>
                    
                    {parseFloat(provider.rating_average) > 0 && (
                      <span className="text-yellow-600 flex items-center">
                        ⭐ {parseFloat(provider.rating_average).toFixed(1)} ({provider.rating_count})
                      </span>
                    )}
                  </div>

                  {/* Categories */}
                  {provider.categories && provider.categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {provider.categories.slice(0, 2).map((cat, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {cat}
                          </span>
                        ))}
                        {provider.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{provider.categories.length - 2} további
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Profile Button */}
                  <Link 
                    to={`/profile/${provider.id}`}
                    className="btn btn-primary w-full text-center"
                  >
                    Profil megtekintése
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default ServiceProviders;