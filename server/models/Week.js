const mongoose = require('mongoose');

const WeekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: [true, 'Please add a week number'],
    unique: true,
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject name'],
    default: 'General',
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a week title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a week description'],
  },
  price: {
    type: Number,
    required: [true, 'Please set a price for this week'],
    default: 0, // 0 means free
  },
  isLockedByDefault: {
    type: Boolean,
    default: true,
  },
  resources: [
    {
      title: {
        type: String,
        required: [true, 'Please add a resource title'],
        trim: true,
      },
      fileUrl: {
        type: String,
        required: [true, 'Please add a resource file URL'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Week', WeekSchema);
