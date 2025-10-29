import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTheme, setFilterTheme] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterTheme) params.append('theme', filterTheme);
      
      const response = await axios.get(`${API_BASE_URL}/events?${params}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now > endDate) return 'completed';
    if (now >= startDate) return 'ongoing';
    return 'upcoming';
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card-header">
        <h1>All Events</h1>
        <p>Discover and join exciting events from various communities</p>
      </div>

      {/* Search and Filter */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label>Search Events</label>
            <input
              type="text"
              placeholder="Search by event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label>Filter by Theme</label>
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="input-field"
            >
              <option value="">All Themes</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="arts">Arts</option>
              <option value="sports">Sports</option>
              <option value="business">Business</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-auto">
        {events.map((event: any) => {
          const status = getEventStatus(event);
          return (
            <div key={event._id} className="card">
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3>{event.name}</h3>
                <span className={`badge ${
                  status === 'completed' ? 'badge-completed' : 
                  status === 'ongoing' ? 'badge-active' : 'badge-upcoming'
                }`}>
                  {status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p><strong>Theme:</strong> {event.theme}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(event.startDate).toLocaleTimeString()}</p>
                <p><strong>Community:</strong> {event.communityId?.name}</p>
                <p><strong>College:</strong> {event.communityId?.collegeName}</p>
              </div>

              {event.prizes?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Prizes:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {event.prizes.map((prize: any, index: number) => (
                      <span key={index} className="badge badge-active">
                        {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'} ₹{prize.amount}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="btn-primary"
                >
                  View Details
                </button>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {event.participants?.length || 0} registered
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {event.attendanceProvided && (
                  <span className="badge badge-active">📋 Attendance</span>
                )}
                {event.certificatesProvided && (
                  <span className="badge badge-active">📜 Certificate</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No events found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default Events;