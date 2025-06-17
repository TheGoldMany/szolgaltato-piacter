// frontend/src/components/courses/CoursesList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CourseCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color_class: string;
  course_count: number;
  is_active: boolean;
  sort_order: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  instructor_name: string;
  thumbnail_url?: string;
  price: number;
  currency: string;
  duration_weeks: number;
  difficulty_level: string;
  is_featured: boolean;
  is_published: boolean;
  student_count: number;
  rating_average: number;
  rating_count: number;
  category_name?: string;
  category_icon?: string;
  created_at: string;
}

interface CoursesListProps {
  showFilters?: boolean;
  featuredOnly?: boolean;
  categoryFilter?: string;
  limit?: number;
}

const CoursesList: React.FC<CoursesListProps> = ({ 
  showFilters = true, 
  featuredOnly = false, 
  categoryFilter,
  limit
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: categoryFilter || '',
    difficulty: '',
    search: '',
    featured: featuredOnly
  });

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [filters, featuredOnly, categoryFilter, limit]);

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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (featuredOnly || filters.featured) params.append('featured', 'true');
      if (limit) params.append('limit', limit.toString());

      const endpoint = featuredOnly ? '/api/courses/featured' : '/api/courses';
      const url = params.toString() ? `${endpoint}?${params}` : endpoint;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Hiba a kurzusok betöltése során');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Kezdő';
      case 'intermediate': return 'Haladó';
      case 'advanced': return 'Mester';
      default: return difficulty;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: currency || 'HUF'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button 
          onClick={fetchCourses}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Újrapróbálás
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Szűrők</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Keresés..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Minden kategória</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Minden szint</option>
                <option value="beginner">Kezdő</option>
                <option value="intermediate">Haladó</option>
                <option value="advanced">Mester</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={filters.featured}
                onChange={(e) => setFilters({...filters, featured: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Csak kiemelt kurzusok
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500 mb-4">📚 Nincsenek elérhető kurzusok</div>
            <p className="text-gray-400">Próbáljon meg más szűrőket alkalmazni.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Course Image */}
              <div className="relative">
                <img
                  src={course.thumbnail_url || '/api/placeholder/300/200'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/300/200';
                  }}
                />
                {course.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    ⭐ Kiemelt
                  </div>
                )}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(course.difficulty_level)}`}>
                  {getDifficultyText(course.difficulty_level)}
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Category Badge */}
                {course.category_name && (
                  <div className="flex items-center gap-2 mb-2">
                    <span>{course.category_icon}</span>
                    <span className="text-sm text-blue-600 font-medium">{course.category_name}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {course.short_description || course.description}
                </p>

                {/* Instructor */}
                <div className="text-sm text-gray-500 mb-3">
                  👨‍🏫 {course.instructor_name}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(course.rating_average)}
                    <span className="text-sm text-gray-500 ml-1">
                      ({course.rating_count})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    👥 {course.student_count} tanuló
                  </div>
                </div>

                {/* Course Details */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <span>⏱️ {course.duration_weeks} hét</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(course.price, course.currency)}
                  </span>
                </div>

                {/* Action Button */}
                <Link
                  to={`/courses/${course.id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors font-semibold"
                >
                  Részletek megtekintése
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoursesList;