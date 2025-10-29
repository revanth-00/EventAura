const express = require('express');
const Event = require('../models/Event');
const Community = require('../models/Community');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth');

const router = express.Router();

// Create event (Admin only)
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { 
      name, 
      startDate, 
      endDate, 
      registrationDeadline, 
      location, 
      attendanceProvided, 
      certificatesProvided, 
      theme, 
      description, 
      prizes, 
      registrationFields,
      communityId 
    } = req.body;

    // Validation
    if (!name || !startDate || !endDate || !registrationDeadline || !location || !theme || !description) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(registrationDeadline);

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (deadline >= start) {
      return res.status(400).json({ message: 'Registration deadline must be before start date' });
    }

    // Validate prizes
    if (prizes && prizes.length > 0) {
      for (let prize of prizes) {
        if (prize.amount <= 0) {
          return res.status(400).json({ message: 'Prize amount must be greater than 0' });
        }
      }
    }

    const community = await Community.findById(communityId);
    if (!community || community.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to create events for this community' });
    }

    const event = new Event({
      name,
      startDate,
      endDate,
      registrationDeadline,
      location,
      attendanceProvided: attendanceProvided || false,
      certificatesProvided: certificatesProvided || false,
      theme,
      description,
      prizes: prizes || [],
      registrationFields: registrationFields || [],
      communityId
    });

    await event.save();

    community.events.push(event._id);
    await community.save();

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const { theme, search } = req.query;
    let filter = {};
    
    if (theme) filter.theme = theme;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const events = await Event.find(filter)
      .populate('communityId', 'name collegeName')
      .populate('participants', 'name');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('communityId', 'name collegeName')
      .populate('participants', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for event
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const { registrationData } = req.body;
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user.communitiesJoined.includes(event.communityId._id)) {
      return res.status(403).json({ message: 'Must join community first' });
    }

    // Check if already registered (handle both old and new format)
    const isAlreadyRegistered = event.participants.some(p => 
      typeof p === 'string' ? p === req.user.userId : p.userId?.toString() === req.user.userId
    );
    
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'Already registered' });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline passed' });
    }

    // Add participant with registration data
    event.participants.push({
      userId: req.user.userId,
      registrationData: registrationData || {},
      registeredAt: new Date()
    });
    await event.save();

    await Community.findByIdAndUpdate(event.communityId._id, {
      $addToSet: { events: event._id }
    });

    // Award badge for first event
    const userEventCount = await Event.countDocuments({ 
      $or: [
        { participants: req.user.userId },
        { 'participants.userId': req.user.userId }
      ]
    });
    if (userEventCount === 1) {
      await User.findByIdAndUpdate(req.user.userId, {
        $push: { badges: { name: 'First Event', earnedDate: new Date() } }
      });
    }

    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unregister from event
router.delete('/:id/unregister', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.participants.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Cannot unregister after deadline' });
    }

    event.participants = event.participants.filter(p => p.toString() !== req.user.userId);
    await event.save();

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance (Admin only)
router.post('/:id/attendance', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { participantIds } = req.body;
    const event = await Event.findById(req.params.id).populate('communityId');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let attendanceCount = 0;

    // Mark attendance and generate certificates
    for (const participantId of participantIds) {
      // Create attendance record
      await Attendance.findOneAndUpdate(
        { eventId: event._id, userId: participantId },
        {
          eventId: event._id,
          userId: participantId,
          status: 'present',
          markedBy: req.user.userId,
          markedAt: new Date()
        },
        { upsert: true }
      );

      // Update participant status
      const participantIndex = event.participants.findIndex(p => 
        p.userId.toString() === participantId
      );
      if (participantIndex !== -1) {
        event.participants[participantIndex].status = 'attended';
      }

      attendanceCount++;

      // Generate certificates if provided
      if (event.certificatesProvided) {
        const certificateId = `cert_${event._id}_${participantId}_${Date.now()}`;
        
        await User.findByIdAndUpdate(participantId, {
          $push: { 
            certificates: { 
              eventId: event._id,
              certificateId: certificateId,
              downloadUrl: `certificates/${certificateId}.pdf`,
              status: 'generated',
              earnedDate: new Date() 
            }
          },
          $inc: { 'stats.totalCertificates': 1 }
        });

        // Check and award certificate-based badges
        const participantUser = await User.findById(participantId);
        await BadgeManager.checkAndAwardBadges(participantId, 'certificate_count', participantUser.stats.totalCertificates + 1);
      }
    }

    // Update event stats
    event.stats.attendance = attendanceCount;
    await event.save();

    res.json({ 
      message: 'Attendance marked successfully',
      attendanceCount,
      certificatesGenerated: event.certificatesProvided ? attendanceCount : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event (Admin only)
router.put('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event success rate
router.get('/:id/success-rate', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalRegistered = event.participants.length;
    const totalAttended = await User.countDocuments({
      'certificates.eventId': event._id
    });

    const successRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

    res.json({
      totalRegistered,
      totalAttended,
      successRate: Math.round(successRate * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('communityId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.communityId.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Community.findByIdAndUpdate(event.communityId._id, {
      $pull: { events: event._id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;