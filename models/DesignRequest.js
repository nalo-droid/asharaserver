const mongoose = require('mongoose');

const designRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  designType: {
    type: String,
    required: true,
    enum: ['residential', 'commercial', 'industrial']
  },
  plotArea: {
    type: String,
    required: true
  },
  description: String,
  titleDeedPath: {
    type: String,
    required: true
  },
  sketchPath: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DesignRequest', designRequestSchema); 