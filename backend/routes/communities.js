const express = require('express');
const Community = require('../models/Community');
const User = require('../models/User');
const Event = require('../models/Event');
const Query = require('../models/Query');
const Chat = require('../models/Chat');
const { verifyToken, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true })
      .populate('adminId', 'name email')
      .populate('events');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available communities to join
router.get('/available', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const joinedCommunityIds = user.communitiesJoined || [];
    
    const availableCommunities = await Community.find({ 
      isActive: true,
      _id: { $nin: joinedCommunityIds }
    })
    .populate('adminId', 'name email')
    .select('name collegeName description category members');
    
    res.json(availableCommunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get admin communities
router.get('/admin/my-communities', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const communities = await Community.find({ adminId: req.user.userId })
      .populate('members.userId', 'name email')
      .populate('events');

    const communitiesWithStats = await Promise.all(
      communities.map(async (community) => {
        let totalQueries = 0;
        let pendingQueries = 0;
        let totalMessages = 0;
        
        try {
          totalQueries = await Query.countDocuments({ communityId: community._id });
          pendingQueries = await Query.countDocuments({ 
            communityId: community._id, 
            status: 'open' 
          });
          totalMessages = await Chat.countDocuments({ communityId: community._id });
        } catch (err) {
          console.log('Stats error:', err.message);
        }

        return {
          ...community.toObject(),
          stats: {
            totalMembers: community.members.length,
            totalEvents: community.events.length,
            totalQueries,
            pendingQueries,
            totalMessages
          }
        };
      })
    );

    res.json(communitiesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create community (Admin only)
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { name, collegeName, description, category } = req.body;

    if (!name || !collegeName) {
      return res.status(400).json({ message: 'Name and college name are required' });
    }

    // Check if community with same college name exists
    const existingCommunity = await Community.findOne({ collegeName });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community for this college already exists' });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const community = new Community({
      name,
      slug,
      collegeName,
      description: description || '',
      category: category || 'other',
      adminId: req.user.userId,
      members: [{ userId: req.user.userId, role: 'member' }]
    });

    await community.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { communitiesJoined: community._id }
    });

    res.status(201).json({ message: 'Community created successfully', community });
  } catch (error) {
    console.error('Community creation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Community with this college name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join community
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const isAlreadyMember = community.members.some(member => 
      member.userId && member.userId.toString() === req.user.userId
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    // Check if already joined in user's communities
    if (user.communitiesJoined && user.communitiesJoined.includes(community._id)) {
      return res.status(400).json({ message: 'Already joined this community' });
    }

    const memberRole = user.role === 'admin' && community.adminId.toString() === req.user.userId ? 'admin' : 'member';

    community.members.push({ 
      userId: req.user.userId, 
      role: memberRole
    });
    await community.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { communitiesJoined: community._id }
    });

    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    console.error('Join error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave community
router.post('/:id/leave', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.adminId.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Admin cannot leave their own community' });
    }

    community.members = community.members.filter(member => 
      member.userId.toString() !== req.user.userId
    );
    await community.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { communitiesJoined: community._id }
    });

    res.json({ message: 'Left community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get community details with channels
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('adminId', 'name email')
      .populate('members.userId', 'name email')
      .populate('events')
      .populate('announcements.createdBy', 'name');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Get recent queries
    const queries = await Query.find({ communityId: req.params.id })
      .populate('userId', 'name')
      .populate('eventId', 'name')
      .sort({ dateCreated: -1 })
      .limit(10);

    // Get recent chat messages
    const chatMessages = await Chat.find({ communityId: req.params.id })
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      community,
      queries,
      chatMessages: chatMessages.reverse() // Show oldest first
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add announcement (Admin only)
router.post('/:id/announcements', verifyToken, async (req, res) => {
  try {
    const { title, content, pinned } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    community.announcements.push({
      title,
      content,
      createdBy: req.user.userId,
      pinned: pinned || false
    });

    await community.save();
    res.json({ message: 'Announcement added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send chat message
router.post('/:id/chat', verifyToken, async (req, res) => {
  try {
    const { message, messageType } = req.body;

    const chatMessage = new Chat({
      communityId: req.params.id,
      userId: req.user.userId,
      message: message || 'Hello',
      messageType: messageType || 'text'
    });

    await chatMessage.save();
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Update member role (Admin only)
router.put('/:id/members/:userId/role', verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const member = community.members.find(m => m.userId.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await community.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove member from community (Admin only)
router.delete('/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (community.adminId.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove community creator' });
    }

    community.members = community.members.filter(member => 
      member.userId.toString() !== req.params.userId
    );
    await community.save();

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { communitiesJoined: community._id }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;