import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CreateCommunity: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    collegeName: '',
    description: '',
    category: 'technology'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Community created successfully!');
      navigate('/communities');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card-header">
        <h1>Create New Community</h1>
        <button onClick={() => navigate('/communities')} className="btn-secondary">
          Back to Communities
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Community Creator Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="Your name as community creator"
            required
          />
        </div>

        <div className="form-group">
          <label>College Name</label>
          <input
            type="text"
            value={formData.collegeName}
            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
            className="input-field"
            placeholder="e.g., ABC Engineering College"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows={4}
            placeholder="Describe your community's purpose and activities..."
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
};

export default CreateCommunity;