const express = require('express');
const Analytics = require('../models/Analytics');
const { verifyToken, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Track analytics event
router.post('/track', async (req, res) => {
  try {
    const { type, relatedId, relatedModel, metadata } = req.body;
    
    const analyticsData = {
      type,
      relatedId,
      relatedModel,
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    if (req.user) {
      analyticsData.userId = req.user.userId;
    }

    await Analytics.create(analyticsData);
    res.status(201).json({ message: 'Analytics tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics dashboard (Admin only)
router.get('/dashboard', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = {};
    if (Object.keys(dateFilter).length > 0) {
      filter.timestamp = dateFilter;
    }

    // Event analytics
    const eventViews = await Analytics.countDocuments({
      ...filter,
      type: 'event_view'
    });

    const eventRegistrations = await Analytics.countDocuments({
      ...filter,
      type: 'event_registration'
    });

    // User analytics
    const userLogins = await Analytics.countDocuments({
      ...filter,
      type: 'user_login'
    });

    const communityJoins = await Analytics.countDocuments({
      ...filter,
      type: 'community_join'
    });

    // Popular events
    const popularEvents = await Analytics.aggregate([
      { $match: { ...filter, type: 'event_view' } },
      { $group: { _id: '$relatedId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          eventName: '$event.name',
          views: 1
        }
      }
    ]);

    res.json({
      eventViews,
      eventRegistrations,
      userLogins,
      communityJoins,
      popularEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;