const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a video title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a video description'],
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL'],
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: Number, // In seconds
    default: 0,
  },
  week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: false, // Optional if it belongs to a VideoSet package
  },
  videoSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoSet',
    required: false, // Optional if it belongs to a weekly content set
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Video', VideoSchema);
