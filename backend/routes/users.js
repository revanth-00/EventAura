const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Community = require('../models/Community');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Users route is working' });
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log('Profile request for user:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Populate communities separately to avoid errors
    let populatedUser;
    try {
      populatedUser = await User.findById(req.user.userId)
        .populate('communitiesJoined', 'name collegeName');
    } catch (popError) {
      console.log('Population error, using basic user:', popError.message);
      populatedUser = user;
    }

    // Find events separately to avoid errors
    let events = [];
    try {
      events = await Event.find({
        $or: [
          { participants: req.user.userId },
          { 'participants.userId': req.user.userId }
        ]
      });
    } catch (eventError) {
      console.log('Event query error:', eventError.message);
    }

    const now = new Date();
    const categorizedEvents = {
      ongoing: events.filter(e => e.startDate && e.endDate && now >= new Date(e.startDate) && now <= new Date(e.endDate)),
      upcoming: events.filter(e => e.startDate && now < new Date(e.startDate)),
      completed: events.filter(e => e.endDate && now > new Date(e.endDate))
    };

    res.json({
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        collegeName: populatedUser.collegeName || '',
        badges: populatedUser.badges || [],
        certificates: populatedUser.certificates || [],
        communitiesJoined: populatedUser.communitiesJoined || []
      },
      events: categorizedEvents
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user activity timeline
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { participants: req.user.userId },
        { 'participants.userId': req.user.userId }
      ]
    }).populate('communityId', 'name')
      .sort({ dateCreated: -1 });
    
    const user = await User.findById(req.user.userId);
    
    const activities = [
      ...events.map(event => ({
        type: 'event_joined',
        title: `Joined ${event.name}`,
        date: event.dateCreated,
        community: event.communityId.name
      })),
      ...user.certificates.map(cert => ({
        type: 'certificate_earned',
        title: `Earned certificate`,
        date: cert.earnedDate,
        eventId: cert.eventId
      })),
      ...user.badges.map(badge => ({
        type: 'badge_earned',
        title: `Earned ${badge.name} badge`,
        date: badge.earnedDate
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $addFields: {
          eventCount: { $size: '$certificates' },
          badgeCount: { $size: '$badges' },
          totalScore: { $add: [{ $size: '$certificates' }, { $size: '$badges' }] }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 50 },
      {
        $project: {
          name: 1,
          eventCount: 1,
          badgeCount: 1,
          totalScore: 1
        }
      }
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin dashboard stats
router.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalEvents = await Event.countDocuments();
    const totalCommunities = await Community.countDocuments();
    
    const adminCommunity = await Community.findOne({ adminId: req.user.userId });
    const myEvents = adminCommunity ? await Event.countDocuments({ communityId: adminCommunity._id }) : 0;

    res.json({
      totalUsers,
      totalEvents,
      totalCommunities,
      myEvents,
      myMembers: adminCommunity ? adminCommunity.members.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;