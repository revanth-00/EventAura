const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  attendanceProvided: {
    type: Boolean,
    default: false
  },
  certificatesProvided: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  prizes: [{
    position: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  registrationFields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'email', 'phone', 'select', 'textarea', 'file'],
      default: 'text'
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    options: [String], // For select type
    placeholder: String
  }],
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);