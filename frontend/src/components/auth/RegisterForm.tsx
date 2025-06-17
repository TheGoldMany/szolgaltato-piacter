// frontend/src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // Multi-step registration
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: null as 'service_provider' | 'customer' | null,
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeSelect = (type: 'service_provider' | 'customer') => {
    setFormData({
      ...formData,
      userType: type
    });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('A jelszavak nem egyeznek');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A jelszó legalább 6 karakter hosszú legyen');
      setIsLoading(false);
      return;
    }

    if (!formData.userType) {
      setError('Kérjük válassz szerepkört');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, userType, ...otherData } = formData;
      // TypeScript now knows userType is not null due to the validation above
      const registerData = {
        ...otherData,
        userType: userType! // Non-null assertion since we validated above
      };
      await register(registerData);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Regisztrációs hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 navbar-padding">
      <Navbar />
      
      {/* Main Registration Container */}
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full">
          
          {/* Registration Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h1 className="text-2xl font-bold mb-1">Csatlakozz a Corvushoz!</h1>
              <p className="text-blue-100 text-sm">
                {step === 1 ? 'Válaszd ki a szerepköröd' : 'Töltsd ki az adataidat'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="px-8 py-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {step === 1 ? '1. lépés: Szerepkör' : '2. lépés: Adatok'}
                </span>
                <span className="text-sm text-gray-500">{step}/2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              
              {step === 1 ? (
                /* Step 1: User Type Selection */
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Ki vagy te?
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Válaszd ki hogy szolgáltatóként vagy ügyfélként szeretnél csatlakozni
                    </p>
                  </div>

                  {/* Service Provider Option */}
                  <button
                    onClick={() => handleUserTypeSelect('service_provider')}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                        🔨
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          Szolgáltató vagyok
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Szolgáltatásokat kínálok és ügyfeleket keresek
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>✓ Ingyenes regisztráció</span>
                          <span className="mx-2">•</span>
                          <span>✓ Moduláris profil</span>
                        </div>
                      </div>
                      <div className="text-blue-500">→</div>
                    </div>
                  </button>

                  {/* Customer Option */}
                  <button
                    onClick={() => handleUserTypeSelect('customer')}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                        👤
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          Ügyfél vagyok
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Szolgáltatókat keresek a problémáimra
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>✓ AI asszisztens</span>
                          <span className="mx-2">•</span>
                          <span>✓ Biztonságos fizetés</span>
                        </div>
                      </div>
                      <div className="text-blue-500">→</div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Step 2: User Data Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Selected Role Display */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        {formData.userType === 'service_provider' ? '🔨' : '👤'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">
                          {formData.userType === 'service_provider' ? 'Szolgáltató fiók' : 'Ügyfél fiók'}
                        </p>
                        <button
                          type="button"
                          onClick={goBack}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Módosítás
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keresztnév *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="János"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vezetéknév *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Kovács"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email cím *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="pelda@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefonszám (opcionális)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+36 30 123 4567"
                    />
                  </div>

                  {/* Password Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jelszó *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Minimum 6 karakter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jelszó megerősítése *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Írd be újra a jelszót"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Regisztráció...
                      </div>
                    ) : (
                      'Fiók létrehozása'
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    ← Vissza
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Már van fiókod?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Jelentkezz be itt
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/80">
              A regisztrációval elfogadod a{' '}
              <a href="/terms" className="text-white hover:underline font-medium">
                Felhasználási Feltételeket
              </a>{' '}
              és az{' '}
              <a href="/privacy" className="text-white hover:underline font-medium">
                Adatvédelmi Szabályzatot
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;