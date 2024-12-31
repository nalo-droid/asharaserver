const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a design name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['residential', 'commercial', 'industrial']
  },
  area: {
    type: String,
    required: [true, 'Please specify the area']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  features: {
    type: String,
    required: [true, 'Please add features']
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image']
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Design', designSchema); 