import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'customer' as 'service_provider' | 'customer',
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

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Regisztrációs hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Regisztráció</h2>
          <p className="text-gray-600 mt-2">Hozz létre új fiókot</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="form-group" style={{flex: 1}}>
              <label htmlFor="firstName" className="form-label">
                Keresztnév
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="János"
              />
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label htmlFor="lastName" className="form-label">
                Vezetéknév
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Kovács"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email cím
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="pelda@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Telefonszám (opcionális)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+36301234567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="userType" className="form-label">
              Fiók típusa
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="customer">Ügyfél - Szolgáltatásokat keresek</option>
              <option value="service_provider">Szolgáltató - Szolgáltatásokat nyújtok</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Jelszó
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Jelszó megerősítése
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 text-red-600 text-sm" style={{backgroundColor: '#fef2f2', borderRadius: '8px'}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full mb-4"
          >
            {isLoading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Már van fiókod?{' '}
            <Link to="/login" className="text-blue-600" style={{textDecoration: 'none'}}>
              Jelentkezz be itt
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;