import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken, getRole } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successRate, setSuccessRate] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ location: '', description: '' });
  const role = getRole();

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data);
      setEditData({ 
        location: response.data.location, 
        description: response.data.description 
      });
      
      // Check if user is registered
      const userId = JSON.parse(atob(token!.split('.')[1])).userId;
      setIsRegistered(response.data.participants?.includes(userId));
      
      // Check if user is admin of this event's community
      setIsAdmin(response.data.communityId?.adminId === userId);
      
      // Check if user is member of this event's community
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userCommunities = profileResponse.data.user.communitiesJoined || [];
      setIsCommunityMember(userCommunities.some((c: any) => c._id === response.data.communityId?._id));
      
      // Fetch success rate if event is completed
      if (new Date() > new Date(response.data.endDate)) {
        fetchSuccessRate();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setLoading(false);
    }
  };

  const joinCommunityAndRegister = async () => {
    try {
      const token = getToken();
      // First join the community
      await axios.post(`${API_BASE_URL}/communities/${event.communityId._id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Then register for the event
      await axios.post(`${API_BASE_URL}/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsRegistered(true);
      setIsCommunityMember(true);
      fetchEventDetails();
      alert('Joined community and registered for event successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const registerForEvent = async () => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRegistered(true);
      fetchEventDetails();
      alert('Successfully registered for event!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const unregisterFromEvent = async () => {
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/events/${eventId}/unregister`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRegistered(false);
      fetchEventDetails();
      alert('Successfully unregistered from event!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Unregistration failed');
    }
  };

  const fetchSuccessRate = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/success-rate`);
      setSuccessRate(response.data);
    } catch (error) {
      console.error('Error fetching success rate:', error);
    }
  };

  const updateEventDetails = async () => {
    try {
      const token = getToken();
      await axios.put(`${API_BASE_URL}/events/${eventId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent({ ...event, ...editData });
      setIsEditing(false);
      alert('Event updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update event');
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (!event) return <div>Event not found</div>;

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const deadline = new Date(event.registrationDeadline);
  
  const eventStatus = now > endDate ? 'completed' : now >= startDate ? 'ongoing' : 'upcoming';
  const canRegister = now < deadline && eventStatus === 'upcoming';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back
      </button>

      <div className="card-header">
        <div className="flex-between">
          <div>
            <h1>{event.name}</h1>
            <p>{event.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className={`badge ${eventStatus === 'completed' ? 'badge-completed' : eventStatus === 'ongoing' ? 'badge-active' : 'badge-upcoming'}`}>
              {eventStatus.toUpperCase()}
            </span>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-secondary"
                >
                  {isEditing ? 'Cancel' : 'Quick Edit'}
                </button>
                <button 
                  onClick={() => navigate(`/event/${eventId}/edit`)}
                  className="btn-secondary"
                >
                  Full Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Event Details</h3>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Theme:</strong> {event.theme}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <strong>Location:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="input-field"
                    style={{ flex: 1, margin: 0 }}
                  />
                ) : (
                  <span>{event.location}</span>
                )}
              </div>
              <p><strong>Start:</strong> {startDate.toLocaleString()}</p>
              <p><strong>End:</strong> {endDate.toLocaleString()}</p>
              <p><strong>Registration Deadline:</strong> {deadline.toLocaleString()}</p>
              <p><strong>Attendance Tracking:</strong> {event.attendanceProvided ? 'Yes' : 'No'}</p>
              <p><strong>Certificates:</strong> {event.certificatesProvided ? 'Available' : 'Not Available'}</p>
              {isEditing && (
                <div style={{ marginTop: '1rem' }}>
                  <button onClick={updateEventDetails} className="btn-primary" style={{ marginRight: '0.5rem' }}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {event.prizes?.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3>Prizes</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {event.prizes.map((prize: any, index: number) => (
                  <div key={index} className="card" style={{ textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'}
                    </div>
                    <h4>{prize.position === 1 ? '1st' : prize.position === 2 ? '2nd' : '3rd'} Prize</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      ₹{prize.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3>Event Guidelines</h3>
            <div style={{ marginTop: '1rem' }}>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="input-field"
                  rows={4}
                  style={{ width: '100%' }}
                />
              ) : (
                <p>{event.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Registration</h3>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Participants:</strong> {event.participants?.length || 0}</p>
              
              {role === 'student' && (
                <div style={{ marginTop: '1rem' }}>
                  {isRegistered ? (
                    <div>
                      <span className="badge badge-active" style={{ marginBottom: '1rem', display: 'block' }}>
                        ✅ Registered
                      </span>
                      {canRegister && (
                        <button onClick={unregisterFromEvent} className="btn-danger" style={{ width: '100%' }}>
                          Unregister
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {canRegister ? (
                        isCommunityMember ? (
                          <button 
                            onClick={() => navigate(`/event/${eventId}/register`)}
                            className="btn-primary" 
                            style={{ width: '100%' }}
                          >
                            Register Now
                          </button>
                        ) : (
                          <div>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#f59e0b' }}>
                              You must join the community to register for this event
                            </p>
                            <button onClick={joinCommunityAndRegister} className="btn-primary" style={{ width: '100%' }}>
                              Join Community & Register
                            </button>
                          </div>
                        )
                      ) : (
                        <div>
                          <span className="badge badge-completed">Registration Closed</span>
                          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {now > deadline ? 'Deadline passed' : 'Event has started'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Community</h3>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Name:</strong> {event.communityId?.name}</p>
              <p><strong>College:</strong> {event.communityId?.collegeName}</p>
            </div>
          </div>

          {successRate && (
            <div className="card">
              <h3>Event Success Rate</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: 'bold', 
                    color: successRate.successRate >= 70 ? '#10b981' : successRate.successRate >= 50 ? '#f59e0b' : '#ef4444'
                  }}>
                    {successRate.successRate}%
                  </div>
                  <p>Success Rate</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                      {successRate.totalRegistered}
                    </div>
                    <p style={{ fontSize: '0.875rem' }}>Registered</p>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {successRate.totalAttended}
                    </div>
                    <p style={{ fontSize: '0.875rem' }}>Attended</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;