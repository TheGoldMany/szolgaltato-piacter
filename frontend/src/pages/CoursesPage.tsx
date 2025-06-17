// frontend/src/pages/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import CoursesList from '../components/courses/CoursesList';

interface CourseCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color_class: string;
  course_count: number;
}

interface CourseStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  totalInstructors: number;
}

const CoursesPage: React.FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/courses/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStats = async () => {
    try {
      // Ez egy mock API hívás, implementálni kell a backend-ben
      const response = await fetch('/api/courses/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Mock stats if API not available
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        averageRating: 0,
        totalInstructors: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              📚 Corvus Akadémia
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Fejleszd készségeidet, szerezz szakmai tanúsítványokat és emeld új szintre a karrieredet. 
              Válassz a több mint {stats?.totalCourses || 0} kurzusból!
            </p>

            {/* Quick Stats */}
            {stats && !loading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <div className="text-sm opacity-80">Kurzus</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="text-sm opacity-80">Tanuló</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm opacity-80">Átlag értékelés</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.totalInstructors}</div>
                  <div className="text-sm opacity-80">Oktató</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Kurzus Kategóriák
          </h2>
          
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">📂 Még nincsenek kategóriák</div>
              <p className="text-gray-400">Az első kurzusok hamarosan érkeznek!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory('')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  selectedCategory === '' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-semibold text-lg mb-2">Minden kategória</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Összes elérhető kurzus megtekintése
                </p>
                <div className="text-blue-600 font-medium">
                  {categories.reduce((sum, cat) => sum + cat.course_count, 0)} kurzus
                </div>
              </button>

              {/* Category Cards */}
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedCategory === category.name 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="text-blue-600 font-medium">
                    {category.course_count} kurzus
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              ⭐ Kiemelt Kurzusok
            </h2>
          </div>
          
          <CoursesList 
            featuredOnly={true} 
            showFilters={false} 
            limit={6} 
          />
        </div>
      </section>

      {/* All Courses Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory} Kurzusok` : 'Minden Kurzus'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ✕ Szűrő eltávolítása
              </button>
            )}
          </div>
          
          <CoursesList 
            categoryFilter={selectedCategory}
            showFilters={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">
              Készen állsz az új kihívásokra?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Csatlakozz több ezer tanulóhoz, akik már fejlesztik készségeiket a Corvus Akadémián!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                📧 Értesítés új kurzusokról
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                🎯 Személyre szabott ajánlás
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;