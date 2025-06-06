import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Bejelentkezési hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Bejelentkezés</h2>
          <p className="text-gray-600 mt-2">Jelentkezz be a fiókodba</p>
        </div>

        <form onSubmit={handleSubmit}>
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
            {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Még nincs fiókod?{' '}
            <Link to="/register" className="text-blue-600" style={{textDecoration: 'none'}}>
              Regisztrálj itt
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;