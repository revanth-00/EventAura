import React from 'react';
import { clearAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const StudentHome: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', width: '100%', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Student Home</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px' }}>
        <h3>Welcome, Student!</h3>
        <p>You can:</p>
        <ul>
          <li>Join communities</li>
          <li>Register for events</li>
          <li>Manage your profile</li>
          <li>View available events</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentHome;