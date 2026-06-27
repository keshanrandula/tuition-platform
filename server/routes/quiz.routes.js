const express = require('express');
const router = express.Router();
const { 
  getQuizByWeek, 
  addQuestionToQuiz, 
  deleteQuestionFromQuiz 
} = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Quiz routes
router.get('/week/:weekId', protect, getQuizByWeek);
router.post('/week/:weekId/questions', protect, adminOnly, addQuestionToQuiz);
router.delete('/week/:weekId/questions/:questionId', protect, adminOnly, deleteQuestionFromQuiz);

module.exports = router;
