const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a class title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a class description'],
  },
  scheduleTime: {
    type: Date,
    required: [true, 'Please schedule a date and time for the live class'],
  },
  duration: {
    type: Number, // In minutes
    default: 60,
  },
  meetingUrl: {
    type: String,
    default: '', // Zoom or Google Meet link fallback
  },
  meetingLink: {
    type: String,
    default: '', // Zoom or Google Meet URL
  },
  subject: {
    type: String,
    default: '',
  },
  teacherNotes: {
    type: String,
    default: '',
  },
  jitsiRoomName: {
    type: String,
    required: true,
    unique: true, // Unique session identifier for embedding the classroom
  },
  week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Class', ClassSchema);
