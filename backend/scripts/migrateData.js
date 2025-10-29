const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Community = require('../models/Community');
const { generateSlug, generateUniqueSlug } = require('../utils/slugGenerator');
require('dotenv').config();

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate Users
    console.log('Migrating users...');
    const users = await User.find({});
    
    for (const user of users) {
      const updateData = {};
      
      // Initialize stats if not present
      if (!user.stats) {
        updateData.stats = {
          totalEvents: user.certificates ? user.certificates.length : 0,
          totalCertificates: user.certificates ? user.certificates.length : 0,
          totalBadges: user.badges ? user.badges.length : 0,
          points: (user.badges ? user.badges.length : 0) * 10
        };
      }

      // Initialize preferences if not present
      if (!user.preferences) {
        updateData.preferences = {
          emailNotifications: true,
          pushNotifications: true,
          eventReminders: true,
          theme: 'auto'
        };
      }

      // Convert old communities format
      if (user.communitiesJoined && user.communitiesJoined.length > 0 && 
          typeof user.communitiesJoined[0] === 'string') {
        updateData.communitiesJoined = user.communitiesJoined.map(communityId => ({
          communityId: communityId,
          joinedDate: user.dateCreated || new Date(),
          role: 'member'
        }));
      }

      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(user._id, updateData);
      }
    }

    // Migrate Events
    console.log('Migrating events...');
    const events = await Event.find({});
    const existingSlugs = [];
    
    for (const event of events) {
      const updateData = {};
      
      // Generate slug if not present
      if (!event.slug) {
        const baseSlug = generateSlug(event.name);
        const slug = generateUniqueSlug(baseSlug, existingSlugs);
        existingSlugs.push(slug);
        updateData.slug = slug;
      }

      // Convert location string to object
      if (typeof event.location === 'string') {
        updateData.location = {
          venue: event.location,
          isOnline: false
        };
      }

      // Initialize stats if not present
      if (!event.stats) {
        updateData.stats = {
          views: 0,
          registrations: event.participants ? event.participants.length : 0,
          attendance: 0,
          averageRating: 0,
          totalRatings: 0
        };
      }

      // Convert participants array to new format
      if (event.participants && event.participants.length > 0 && 
          typeof event.participants[0] === 'string') {
        updateData.participants = event.participants.map(participantId => ({
          userId: participantId,
          registeredAt: event.dateCreated || new Date(),
          status: 'registered'
        }));
      }

      // Set default category if not present
      if (!event.category) {
        updateData.category = 'other';
      }

      // Set default status if not present
      if (!event.status) {
        const now = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        if (now < startDate) {
          updateData.status = 'published';
        } else if (now >= startDate && now <= endDate) {
          updateData.status = 'ongoing';
        } else {
          updateData.status = 'completed';
        }
      }

      if (Object.keys(updateData).length > 0) {
        await Event.findByIdAndUpdate(event._id, updateData);
      }
    }

    // Migrate Communities
    console.log('Migrating communities...');
    const communities = await Community.find({});
    const existingCommunitySlugs = [];
    
    for (const community of communities) {
      const updateData = {};
      
      // Generate slug if not present
      if (!community.slug) {
        const baseSlug = generateSlug(community.name);
        const slug = generateUniqueSlug(baseSlug, existingCommunitySlugs);
        existingCommunitySlugs.push(slug);
        updateData.slug = slug;
      }

      // Initialize stats if not present
      if (!community.stats) {
        updateData.stats = {
          totalMembers: community.members ? community.members.length : 0,
          totalEvents: community.events ? community.events.length : 0,
          totalPosts: 0
        };
      }

      // Initialize settings if not present
      if (!community.settings) {
        updateData.settings = {
          isPublic: true,
          requireApproval: false,
          allowMemberPosts: true,
          allowEventCreation: false
        };
      }

      if (Object.keys(updateData).length > 0) {
        await Community.findByIdAndUpdate(community._id, updateData);
      }
    }

    console.log('Data migration completed successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateData();
}

module.exports = migrateData;