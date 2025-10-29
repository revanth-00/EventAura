const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['event_view', 'event_registration', 'community_join', 'user_login', 'certificate_download', 'badge_earned'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Event', 'Community', 'User', 'Badge']
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    device: String,
    browser: String,
    os: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ relatedId: 1, type: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);