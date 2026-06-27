const Quiz = require('../models/Quiz');
const Week = require('../models/Week');

// ==========================================
// QUIZ CONTROLLER
// ==========================================

// @desc    Get quiz for a specific week (unlocked check)
// @route   GET /api/quizzes/week/:weekId
// @access  Private
exports.getQuizByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;

    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({ success: false, message: 'Week module not found' });
    }

    // Check student access
    const isUnlocked = 
      req.user.role === 'admin' || 
      week.price === 0 || 
      (req.user.purchasedWeeks && req.user.purchasedWeeks.includes(weekId));

    if (!isUnlocked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Week content must be purchased to take this quiz',
        requiresPayment: true,
        itemId: week._id,
        itemType: 'week',
        price: week.price
      });
    }

    let quiz = await Quiz.findOne({ week: weekId });
    
    // If no quiz exists yet, return empty questions array structure
    if (!quiz) {
      return res.json({ 
        success: true, 
        quiz: { 
          week: weekId, 
          questions: [] 
        } 
      });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving quiz details' });
  }
};

// @desc    Add a question to a week's quiz (creates quiz document if missing)
// @route   POST /api/quizzes/week/:weekId/questions
// @access  Private/Admin
exports.addQuestionToQuiz = async (req, res) => {
  try {
    const { weekId } = req.params;
    const { questionText, options, correctOptionIndex, explanation } = req.body;

    if (!questionText || !options || options.length < 2 || correctOptionIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide question text, at least 2 options, and the correct option index' 
      });
    }

    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({ success: false, message: 'Week module not found' });
    }

    let quiz = await Quiz.findOne({ week: weekId });

    if (!quiz) {
      quiz = new Quiz({
        week: weekId,
        questions: []
      });
    }

    quiz.questions.push({
      questionText,
      options,
      correctOptionIndex: parseInt(correctOptionIndex),
      explanation: explanation || ''
    });

    await quiz.save();

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Add quiz question error:', error);
    res.status(500).json({ success: false, message: 'Server error adding question to quiz' });
  }
};

// @desc    Delete a question from a week's quiz
// @route   DELETE /api/quizzes/week/:weekId/questions/:questionId
// @access  Private/Admin
exports.deleteQuestionFromQuiz = async (req, res) => {
  try {
    const { weekId, questionId } = req.params;

    const quiz = await Quiz.findOne({ week: weekId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this week' });
    }

    quiz.questions = quiz.questions.filter(q => q._id.toString() !== questionId);
    await quiz.save();

    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Delete quiz question error:', error);
    res.status(500).json({ success: false, message: 'Server error removing question from quiz' });
  }
};
