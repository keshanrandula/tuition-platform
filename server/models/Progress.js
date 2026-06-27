const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  watchedVideos: [
    {
      video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
      },
      watchTime: {
        type: Number,
        default: 0, // in seconds
      },
      completed: {
        type: Boolean,
        default: false,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  quizScores: [
    {
      week: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Week',
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      totalQuestions: {
        type: Number,
        required: true,
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  attendedClasses: [
    {
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
      },
      attendedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Progress', ProgressSchema);
