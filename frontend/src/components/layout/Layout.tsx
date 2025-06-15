import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroActions?: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHero = false, 
  heroTitle, 
  heroSubtitle, 
  heroActions,
  className = '' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {showHero && (
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-24 lg:py-32">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed max-w-3xl mx-auto">
                  {heroSubtitle}
                </p>
                
                {heroActions && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {heroActions}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bottom Wave */}
          <div className="absolute bottom-0 w-full">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)"/>
            </svg>
          </div>
        </section>
      )}
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};