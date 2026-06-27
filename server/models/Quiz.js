const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  week: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: true,
    unique: true,
  },
  questions: [
    {
      questionText: { 
        type: String, 
        required: [true, 'Please add a question text'],
        trim: true,
      },
      options: {
        type: [String],
        validate: [
          (val) => val.length >= 2,
          'Please provide at least 2 options for the multiple-choice question'
        ],
        required: true,
      },
      correctOptionIndex: {
        type: Number,
        required: [true, 'Please select the correct option index'],
        min: 0,
      },
      explanation: {
        type: String,
        default: '',
        trim: true,
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', QuizSchema);
