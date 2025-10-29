# Database Schema Documentation

## Overview
This document outlines the enhanced database schema for the Event Management System with improved features for attendance tracking, badge management, notifications, and analytics.

## Models

### 1. User Model (Enhanced)
**File:** `models/User.js`

**New Features:**
- Enhanced profile information (avatar, bio, social links)
- Improved badge system with references to Badge model
- Certificate tracking with status management
- User preferences and settings
- Statistics tracking (events, certificates, badges, points)
- Better community membership tracking

**Key Changes:**
- `badges`: Now references Badge model instead of embedded objects
- `certificates`: Added status tracking and certificate IDs
- `communitiesJoined`: Enhanced with join date and role
- `profile`: New section for user profile data
- `preferences`: User notification and theme preferences
- `stats`: Aggregated statistics for leaderboards

### 2. Event Model (Enhanced)
**File:** `models/Event.js`

**New Features:**
- URL-friendly slugs for better SEO
- Enhanced location handling (online/offline events)
- Event categories and difficulty levels
- Image gallery and speaker information
- Agenda and requirements tracking
- Improved participant management with status
- Event statistics and ratings

**Key Changes:**
- `location`: Now an object supporting both physical and online events
- `participants`: Enhanced with registration date and status
- `category`: Structured event categorization
- `stats`: View counts, registrations, attendance tracking
- `images`, `speakers`, `agenda`: Rich content support

### 3. Community Model (Enhanced)
**File:** `models/Community.js`

**New Features:**
- Community branding (logo, cover image)
- Social media links and contact information
- Community rules and settings
- Enhanced announcements with attachments
- Statistics tracking
- Verification system

**Key Changes:**
- `settings`: Community configuration options
- `socialLinks`: Social media integration
- `announcements`: Enhanced with types and attachments
- `stats`: Member and activity statistics

### 4. Chat Model (Enhanced)
**File:** `models/Chat.js`

**New Features:**
- File attachments support
- Message reactions and replies
- Edit history tracking
- Enhanced moderation features
- User mentions

**Key Changes:**
- `attachments`: File sharing capabilities
- `reactions`: Emoji reactions
- `replyTo`: Message threading
- `editHistory`: Track message edits

### 5. New Models

#### Attendance Model
**File:** `models/Attendance.js`
- Tracks event attendance with status (present/absent/late)
- Links to events and users
- Includes attendance marking metadata

#### Badge Model
**File:** `models/Badge.js`
- Defines available badges and earning criteria
- Supports different badge types and rarity levels
- Points system for gamification

#### Notification Model
**File:** `models/Notification.js`
- User notification system
- Supports different notification types
- Read/unread status tracking
- Priority levels and expiration

#### EventFeedback Model
**File:** `models/EventFeedback.js`
- Collects user feedback for events
- Rating system with categories
- Anonymous feedback support

#### Analytics Model
**File:** `models/Analytics.js`
- Tracks user interactions and system usage
- Supports various event types
- Metadata collection for insights

#### File Model
**File:** `models/File.js`
- Manages file uploads and downloads
- Categorization and access control
- Usage tracking and expiration

## New Routes

### Notifications API
**File:** `routes/notifications.js`
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics API
**File:** `routes/analytics.js`
- `POST /api/analytics/track` - Track user interactions
- `GET /api/analytics/dashboard` - Admin analytics dashboard

## Utilities

### Badge Manager
**File:** `utils/badgeManager.js`
- Automatic badge awarding based on criteria
- Badge checking and notification system
- User badge retrieval

### Slug Generator
**File:** `utils/slugGenerator.js`
- URL-friendly slug generation
- Unique slug handling for SEO

## Migration and Setup

### Initial Setup
```bash
npm run setup
```
This command will:
1. Install dependencies
2. Initialize default badges
3. Migrate existing data

### Individual Commands
```bash
npm run init-badges    # Initialize badge system
npm run migrate        # Migrate existing data
```

## Database Indexes

### Performance Optimizations
- User email uniqueness
- Event and Community slug uniqueness
- Attendance compound index (eventId + userId)
- Analytics indexes for efficient querying
- Notification indexes for user queries

## Key Improvements

1. **Better Data Structure**: More normalized and flexible schema
2. **Performance**: Optimized indexes and aggregation pipelines
3. **Scalability**: Separated concerns into focused models
4. **User Experience**: Rich features like notifications and badges
5. **Analytics**: Comprehensive tracking for insights
6. **File Management**: Proper file handling and organization
7. **SEO**: URL-friendly slugs for better discoverability

## Migration Notes

- Existing data is automatically migrated to new schema
- Old participant arrays converted to new object format
- Statistics are calculated from existing data
- Default values applied where needed
- Backward compatibility maintained during transition

## Future Enhancements

- Real-time notifications with WebSocket support
- Advanced analytics with machine learning insights
- Integration with external calendar systems
- Mobile app push notifications
- Advanced file processing and thumbnails