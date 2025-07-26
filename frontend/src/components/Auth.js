import React, { useState } from 'react';
import axios from 'axios';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(endpoint, formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.errors) {
        setError(error.response.data.errors[0]?.msg || 'Validation error');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            minLength="1"
            maxLength="100"
            disabled={loading}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          minLength={isLogin ? 1 : 6}
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="toggle-text">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          type="button" 
          onClick={toggleMode} 
          disabled={loading}
          className="toggle-btn"
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
}

export default Auth;