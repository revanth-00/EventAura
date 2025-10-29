const mongoose = require('mongoose');
const Badge = require('../models/Badge');
require('dotenv').config();

const defaultBadges = [
  {
    name: 'First Event',
    description: 'Participated in your first event',
    icon: '🎉',
    criteria: { type: 'event_count', value: 1 },
    rarity: 'common',
    points: 10
  },
  {
    name: 'Event Enthusiast',
    description: 'Participated in 5 events',
    icon: '🎯',
    criteria: { type: 'event_count', value: 5 },
    rarity: 'rare',
    points: 25
  },
  {
    name: 'Event Master',
    description: 'Participated in 10 events',
    icon: '🏆',
    criteria: { type: 'event_count', value: 10 },
    rarity: 'epic',
    points: 50
  },
  {
    name: 'Community Builder',
    description: 'Joined your first community',
    icon: '🤝',
    criteria: { type: 'community_join', value: 1 },
    rarity: 'common',
    points: 5
  },
  {
    name: 'Certificate Collector',
    description: 'Earned 5 certificates',
    icon: '📜',
    criteria: { type: 'certificate_count', value: 5 },
    rarity: 'rare',
    points: 30
  },
  {
    name: 'Achievement Hunter',
    description: 'Earned 15 certificates',
    icon: '🎖️',
    criteria: { type: 'certificate_count', value: 15 },
    rarity: 'legendary',
    points: 100
  },
  {
    name: 'Early Bird',
    description: 'One of the first 100 users',
    icon: '🐦',
    criteria: { type: 'special', special: 'early_user' },
    rarity: 'legendary',
    points: 75
  }
];

async function initializeBadges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing badges
    await Badge.deleteMany({});
    console.log('Cleared existing badges');

    // Insert default badges
    await Badge.insertMany(defaultBadges);
    console.log('Default badges created successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error initializing badges:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeBadges();
}

module.exports = { initializeBadges, defaultBadges };