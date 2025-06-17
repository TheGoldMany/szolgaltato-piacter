// frontend/src/pages/CourseDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  instructor_name: string;
  instructor_bio?: string;
  instructor_image_url?: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price: number;
  currency: string;
  duration_weeks: number;
  estimated_hours: number;
  difficulty_level: string;
  is_featured: boolean;
  is_published: boolean;
  student_count: number;
  rating_average: number;
  rating_count: number;
  category_name?: string;
  category_icon?: string;
  created_at: string;
  syllabus?: any;
  prerequisites?: string[];
  what_you_learn?: string[];
  includes?: string[];
}

interface CourseLesson {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  is_preview: boolean;
  sort_order: number;
}

interface Enrollment {
  id: number;
  enrolled_at: string;
  progress_percentage: number;
  completed_at?: string;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchLessons();
      if (isAuthenticated) {
        checkEnrollment();
      }
    }
  }, [id, isAuthenticated]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Hiba a kurzus betöltése során');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${id}/lessons`);
      const data = await response.json();
      if (data.success) {
        setLessons(data.data);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/courses/${id}/enrollment`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setEnrollment(data.data);
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          redirectTo: `/courses/${id}`,
          message: 'Jelentkezz be a kurzusra való regisztrációhoz!'
        }
      });
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEnrollment({
          id: data.data.enrollmentId,
          enrolled_at: data.data.enrolledAt,
          progress_percentage: 0
        });
        // Update student count
        if (course) {
          setCourse({
            ...course,
            student_count: course.student_count + 1
          });
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Hiba a regisztráció során');
      console.error('Error enrolling:', err);
    } finally {
      setEnrolling(false);
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
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 navbar-padding">
        <Navbar />
        <div className="text-center py-16">
          <div className="text-red-600 mb-4">❌ {error || 'Kurzus nem található'}</div>
          <button 
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Vissza a kurzusokhoz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 navbar-padding">
      <Navbar />
      
      {/* Course Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-500 mb-4">
                <span 
                  onClick={() => navigate('/courses')}
                  className="cursor-pointer hover:text-blue-600"
                >
                  Kurzusok
                </span>
                {course.category_name && (
                  <>
                    <span className="mx-2">/</span>
                    <span>{course.category_name}</span>
                  </>
                )}
                <span className="mx-2">/</span>
                <span className="text-gray-900">{course.title}</span>
              </nav>

              {/* Category Badge */}
              {course.category_name && (
                <div className="flex items-center gap-2 mb-4">
                  <span>{course.category_icon}</span>
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    {course.category_name}
                  </span>
                  {course.is_featured && (
                    <span className="text-sm text-yellow-600 font-medium bg-yellow-50 px-3 py-1 rounded-full">
                      ⭐ Kiemelt
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              {/* Short Description */}
              <p className="text-lg text-gray-600 mb-6">
                {course.short_description}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(course.rating_average)}
                  <span className="text-sm text-gray-600 ml-2">
                    {course.rating_average.toFixed(1)} ({course.rating_count} értékelés)
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  👥 {course.student_count} tanuló
                </div>
                <div className="text-sm text-gray-600">
                  ⏱️ {course.duration_weeks} hét
                </div>
                <div className="text-sm text-gray-600">
                  🕒 ~{course.estimated_hours} óra
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty_level)}`}>
                  {getDifficultyText(course.difficulty_level)}
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={course.instructor_image_url || '/api/placeholder/60/60'}
                  alt={course.instructor_name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/60/60';
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    👨‍🏫 {course.instructor_name}
                  </div>
                  <div className="text-sm text-gray-600">Oktató</div>
                </div>
              </div>
            </div>

            {/* Course Preview & Enrollment */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg shadow-sm sticky top-4">
                {/* Preview Image/Video */}
                <div className="relative">
                  {course.preview_video_url ? (
                    <video
                      className="w-full h-48 object-cover rounded-t-lg"
                      poster={course.thumbnail_url}
                      controls
                    >
                      <source src={course.preview_video_url} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={course.thumbnail_url || '/api/placeholder/400/300'}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/300';
                      }}
                    />
                  )}
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {formatPrice(course.price, course.currency)}
                  </div>

                  {/* Enrollment Status */}
                  {enrollment ? (
                    <div className="mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="text-green-800 font-semibold mb-2">
                          ✅ Regisztrálva
                        </div>
                        <div className="text-sm text-green-600">
                          Regisztráció: {new Date(enrollment.enrolled_at).toLocaleDateString('hu-HU')}
                        </div>
                        {enrollment.progress_percentage > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-green-600 mb-1">
                              Haladás: {enrollment.progress_percentage}%
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${enrollment.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/courses/${id}/learn`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Folytatás
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      {enrolling ? 'Regisztráció...' : 'Regisztráció a kurzusra'}
                    </button>
                  )}

                  {/* Course Includes */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">A kurzus tartalmazza:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {course.duration_weeks} hét tananyag
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        ~{course.estimated_hours} óra videó
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Gyakorlati feladatok
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Tanúsítvány
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Élethosszig tartó hozzáférés
                      </li>
                      {course.includes?.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Áttekintés' },
                { key: 'curriculum', label: 'Tanterv' },
                { key: 'instructor', label: 'Oktató' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="prose max-w-none">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Kurzus leírása</h3>
                  <div className="text-gray-600 whitespace-pre-line">
                    {course.description}
                  </div>
                </div>

                {/* What You'll Learn */}
                {course.what_you_learn && course.what_you_learn.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Mit fogsz megtanulni?</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {course.what_you_learn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <span className="text-green-500 mt-1">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Előfeltételek</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <span className="text-blue-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Tanterv</h3>
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    📚 A tanterv hamarosan elérhető lesz
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              ⏱️ {lesson.duration_minutes} perc
                            </span>
                            {lesson.is_preview && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Előnézet
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Oktató</h3>
                <div className="flex items-start gap-6">
                  <img
                    src={course.instructor_image_url || '/api/placeholder/120/120'}
                    alt={course.instructor_name}
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/120/120';
                    }}
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.instructor_name}
                    </h4>
                    <div className="text-gray-600 whitespace-pre-line">
                      {course.instructor_bio || 'Az oktató bemutatkozása hamarosan elérhető lesz.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;