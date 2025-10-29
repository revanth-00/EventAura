const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Query = require('../models/Query');
const Chat = require('../models/Chat');
const Attendance = require('../models/Attendance');
const EventFeedback = require('../models/EventFeedback');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    await Community.deleteMany({});
    await Event.deleteMany({});
    await Query.deleteMany({});
    await Chat.deleteMany({});
    await Attendance.deleteMany({});
    await EventFeedback.deleteMany({});
    await Notification.deleteMany({});
    await Analytics.deleteMany({});

    console.log('Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();