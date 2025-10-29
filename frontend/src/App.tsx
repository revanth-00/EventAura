import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentHome from './pages/StudentHome';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import CommunityPage from './pages/CommunityPage';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import CreateCommunity from './pages/CreateCommunity';
import CommunityHub from './pages/CommunityHub';
import EventDetails from './pages/EventDetails';
import EventRegistration from './pages/EventRegistration';
import Events from './pages/Events';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import { getRole } from './utils/auth';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route 
            path="/communities" 
            element={
              <ProtectedRoute>
                <CommunityHub />
              </ProtectedRoute>
            } 
          />
          <Route path="/events" element={<Events />} />
          
          <Route 
            path="/event/:eventId" 
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/event/:eventId/register" 
            element={
              <ProtectedRoute>
                <EventRegistration />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/leaderboard" element={<Landing />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/home" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          

          
          <Route 
            path="/community/:communityId/create-event" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/event/:eventId/edit" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EditEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-community" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateCommunity />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/community/:communityId" 
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;