const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  collegeName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['technology', 'science', 'arts', 'sports', 'business', 'cultural', 'academic', 'social', 'other'],
    default: 'other'
  },
  logo: String,
  coverImage: String,
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  announcements: [{
    title: String,
    content: String,
    type: {
      type: String,
      enum: ['general', 'event', 'urgent', 'celebration'],
      default: 'general'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    pinned: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  rules: [{
    title: String,
    description: String,
    order: Number
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowMemberPosts: {
      type: Boolean,
      default: true
    },
    allowEventCreation: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalMembers: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    totalPosts: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Community', communitySchema);