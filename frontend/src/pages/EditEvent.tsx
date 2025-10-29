import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EditEvent: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    theme: '',
    description: '',
    attendanceProvided: false,
    certificatesProvided: false,
    prizes: [{ position: 1, amount: 0 }]
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const event = response.data;
      setFormData({
        name: event.name,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        registrationDeadline: new Date(event.registrationDeadline).toISOString().slice(0, 16),
        location: event.location,
        theme: event.theme,
        description: event.description,
        attendanceProvided: event.attendanceProvided,
        certificatesProvided: event.certificatesProvided,
        prizes: event.prizes || [{ position: 1, amount: 0 }]
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.put(`${API_BASE_URL}/events/${eventId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Event updated successfully!');
      navigate(-1);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update event');
    }
  };

  const addPrize = () => {
    setFormData({
      ...formData,
      prizes: [...formData.prizes, { position: formData.prizes.length + 1, amount: 0 }]
    });
  };

  const removePrize = (index: number) => {
    setFormData({
      ...formData,
      prizes: formData.prizes.filter((_, i) => i !== index)
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card-header">
        <h1>Edit Event</h1>
        <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Event Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date & Time</label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label>End Date & Time</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Registration Deadline</label>
          <input
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div className="form-group">
          <label>Theme</label>
          <input
            type="text"
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            className="input-field"
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
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.attendanceProvided}
                onChange={(e) => setFormData({ ...formData, attendanceProvided: e.target.checked })}
              />
              Attendance Provided
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.certificatesProvided}
                onChange={(e) => setFormData({ ...formData, certificatesProvided: e.target.checked })}
              />
              Certificates Provided
            </label>
          </div>
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label>Prizes</label>
            <button type="button" onClick={addPrize} className="btn-secondary">Add Prize</button>
          </div>
          {formData.prizes.map((prize, index) => (
            <div key={index} className="prize-row">
              <select
                value={prize.position}
                onChange={(e) => {
                  const newPrizes = [...formData.prizes];
                  newPrizes[index].position = parseInt(e.target.value);
                  setFormData({ ...formData, prizes: newPrizes });
                }}
                className="input-field"
              >
                <option value={1}>1st Place</option>
                <option value={2}>2nd Place</option>
                <option value={3}>3rd Place</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={prize.amount}
                onChange={(e) => {
                  const newPrizes = [...formData.prizes];
                  newPrizes[index].amount = parseInt(e.target.value);
                  setFormData({ ...formData, prizes: newPrizes });
                }}
                className="input-field"
                min="0"
              />
              <button type="button" onClick={() => removePrize(index)} className="btn-danger">Remove</button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary">Update Event</button>
      </form>
    </div>
  );
};

export default EditEvent;