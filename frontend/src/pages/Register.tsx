import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuth } from '../utils/auth';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    collegeName: '',
    adminSecret: ''
  });
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, formData);
      const { token, role, userId } = response.data;
      
      setAuth(token, role, userId);
      setIsRegistered(true);
      
      setTimeout(() => {
        if (role === 'student') {
          navigate('/events');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Registration Completed!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Redirecting you to events page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Register for EventAura</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === 'admin' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  name="collegeName"
                  placeholder="College Name"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="password"
                  name="adminSecret"
                  placeholder="Admin Secret Code"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <a href="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;