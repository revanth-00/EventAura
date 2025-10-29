const User = require('../models/User');
const Badge = require('../models/Badge');
const Notification = require('../models/Notification');

class BadgeManager {
  static async checkAndAwardBadges(userId, type, currentCount = null) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const badges = await Badge.find({ 
        'criteria.type': type,
        isActive: true 
      });

      for (const badge of badges) {
        // Check if user already has this badge
        const hasBadge = user.badges.some(userBadge => 
          userBadge.badgeId.toString() === badge._id.toString()
        );

        if (hasBadge) continue;

        let shouldAward = false;

        switch (type) {
          case 'event_count':
            const eventCount = currentCount || user.stats.totalEvents;
            shouldAward = eventCount >= badge.criteria.value;
            break;
          
          case 'certificate_count':
            const certCount = currentCount || user.stats.totalCertificates;
            shouldAward = certCount >= badge.criteria.value;
            break;
          
          case 'community_join':
            const communityCount = currentCount || user.communitiesJoined.length;
            shouldAward = communityCount >= badge.criteria.value;
            break;
        }

        if (shouldAward) {
          await this.awardBadge(userId, badge._id);
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  }

  static async awardBadge(userId, badgeId) {
    try {
      const badge = await Badge.findById(badgeId);
      if (!badge) return;

      // Add badge to user
      await User.findByIdAndUpdate(userId, {
        $push: { 
          badges: { 
            badgeId: badgeId,
            earnedDate: new Date()
          }
        },
        $inc: { 
          'stats.totalBadges': 1,
          'stats.points': badge.points
        }
      });

      // Create notification
      await Notification.create({
        userId: userId,
        title: 'New Badge Earned!',
        message: `Congratulations! You've earned the "${badge.name}" badge.`,
        type: 'badge',
        relatedId: badgeId,
        relatedModel: 'Badge',
        priority: 'high'
      });

      console.log(`Badge "${badge.name}" awarded to user ${userId}`);
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }

  static async getUserBadges(userId) {
    try {
      const user = await User.findById(userId)
        .populate('badges.badgeId');
      
      return user.badges.map(badge => ({
        ...badge.badgeId.toObject(),
        earnedDate: badge.earnedDate
      }));
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }
}

module.exports = BadgeManager;