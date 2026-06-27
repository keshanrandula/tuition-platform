const mongoose = require('mongoose');

const VideoSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a video set title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description for the video set'],
  },
  price: {
    type: Number,
    required: [true, 'Please set a price for this video set'],
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VideoSet', VideoSetSchema);
