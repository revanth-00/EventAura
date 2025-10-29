const mongoose = require('mongoose');

const eventFeedbackSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  categories: {
    organization: { type: Number, min: 1, max: 5 },
    content: { type: Number, min: 1, max: 5 },
    venue: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 }
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  suggestions: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate feedback
eventFeedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('EventFeedback', eventFeedbackSchema);