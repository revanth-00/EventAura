const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.model'
    },
    model: {
      type: String,
      enum: ['Event', 'Community', 'User', 'Chat']
    }
  },
  category: {
    type: String,
    enum: ['avatar', 'cover', 'document', 'certificate', 'event_image', 'attachment'],
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  dateUploaded: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

// Index for efficient querying
fileSchema.index({ uploadedBy: 1, category: 1 });
fileSchema.index({ 'relatedTo.id': 1, 'relatedTo.model': 1 });

module.exports = mongoose.model('File', fileSchema);