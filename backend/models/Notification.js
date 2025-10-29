const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'community', 'badge', 'certificate', 'announcement', 'reminder'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Event', 'Community', 'Badge', 'User']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, dateCreated: -1 });

module.exports = mongoose.model('Notification', notificationSchema);