import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { CheckCircle2, XCircle, AlertCircle, Clock, Award, HelpCircle, ArrowRight, RotateCcw, Lock } from 'lucide-react';

const WeeklyQuiz = ({ weekId, isUnlocked }) => {
  // API states
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz running states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Fetch quiz on mount/weekId change
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!isUnlocked) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/quizzes/week/${weekId}`);
        if (response.data.success) {
          setQuiz(response.data.quiz);
        }
      } catch (err) {
        console.error('Error fetching week quiz:', err);
        setError(err.response?.data?.message || 'Failed to retrieve quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    // Reset state on week change
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setTimerActive(false);
  }, [weekId, isUnlocked]);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  if (!isUnlocked) {
    return (
      <div className="text-center py-12 glass-panel border-slate-100 rounded-2xl max-w-lg mx-auto p-8 space-y-4 bg-white shadow-sm">
        <Lock className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-md font-bold text-slate-800">Quiz Content Locked</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          Please purchase this syllabus week module to unlock the practice quizzes, questions, and detail answers guide.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto p-6 space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-600">{error}</p>
      </div>
    );
  }

  const questions = quiz?.questions || [];

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 glass-panel border-slate-100 rounded-2xl max-w-lg mx-auto p-8 space-y-4 bg-white shadow-sm">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-md font-bold text-slate-800">No Quizzes Available Yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          The teacher has not added multiple-choice questions for this week module yet. Please check back later.
        </p>
      </div>
    );
  }

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    // Allocate 2 minutes per question
    setTimeLeft(questions.length * 120);
    setTimerActive(true);
  };
  const handleSelectOption = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setTimerActive(false);
    setQuizSubmitted(true);

    // Calculate score
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        finalScore++;
      }
    });

    try {
      await api.post(`/progress/quiz/${weekId}`, {
        score: finalScore,
        totalQuestions: questions.length
      });
    } catch (err) {
      console.error('Error saving quiz score to backend:', err);
    }
  };

  const handleRetakeQuiz = () => {
    handleStartQuiz();
  };

  // Calculations
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // 1. Intro Screen
  if (!quizStarted && !quizSubmitted) {
    return (
      <div className="glass-panel p-8 rounded-3xl border-slate-100 bg-white max-w-2xl mx-auto shadow-md space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 mx-auto border border-brand-100">
          <Award className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Practice Syllabus Quiz</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Test your understanding of this week's video lectures. This practice quiz contains multiple-choice questions designed to help prepare for exams.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left py-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Questions</span>
              <span className="text-xs font-bold text-slate-800">{questions.length} Questions</span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center space-x-3">
            <Clock className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Time Limit</span>
              <span className="text-xs font-bold text-slate-800">{questions.length * 2} Minutes</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleStartQuiz}
          className="btn-primary py-3 px-8 text-sm font-semibold rounded-2xl shadow-lg shadow-brand-500/10"
        >
          Start Practice Quiz
        </button>
      </div>
    );
  }

  // 2. Quiz Active Screen (Exam Paper Layout showing all questions)
  if (quizStarted && !quizSubmitted) {
    const answeredCount = Object.keys(selectedAnswers).length;
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
        {/* Exam Header Status Bar */}
        <div className="glass-panel p-5 rounded-3xl border-slate-100 bg-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-10">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
              <span>Active Practice Exam Paper</span>
            </h2>
            <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
              <span>Progress: {answeredCount} / {questions.length} Answered</span>
              <span>•</span>
              <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-500 transition-all duration-350"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold shadow-sm ${
            timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-650 border-slate-150'
          }`}>
            <Clock className="w-4 h-4" />
            <span>Time Remaining: {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Paper Content: List of all Questions */}
        <div className="space-y-6">
          {questions.map((question, qIdx) => {
            const selectedOptIdx = selectedAnswers[qIdx];
            return (
              <div key={question._id || qIdx} className="glass-panel p-6 rounded-3xl border-slate-100 bg-white shadow-sm space-y-4">
                {/* Question Label */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug flex items-start">
                  <span className="bg-brand-50 border border-brand-100 text-brand-500 text-xs font-mono font-bold w-6 h-6 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <span>{question.questionText}</span>
                </h3>

                {/* Option Buttons (Ticking Answers) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 pl-9">
                  {question.options.map((option, optIdx) => {
                    const isSelected = selectedOptIdx === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`text-left p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-50/40 text-brand-700 shadow-sm'
                            : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50 text-slate-600 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-5.5 h-5.5 rounded-lg text-[9px] font-bold flex items-center justify-center border ${
                            isSelected 
                              ? 'bg-brand-500 text-white border-brand-500' 
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Exam Paper footer */}
        <div className="glass-panel p-6 rounded-3xl border-slate-100 bg-white shadow-md text-center">
          <p className="text-xs text-slate-400 mb-4 font-semibold">Please make sure to double check all your answers before submitting the paper!</p>
          <button
            onClick={handleSubmitQuiz}
            className="btn-primary py-3 px-10 text-sm font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-md shadow-emerald-500/10"
          >
            Submit Completed Exam Paper
          </button>
        </div>
      </div>
    );
  }

  // 3. Results / Feedback Review Screen
  if (quizSubmitted) {
    return (
      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
        {/* Score Overview Panel */}
        <div className="glass-panel p-8 rounded-3xl border-slate-100 bg-white shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-550 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900">Quiz Completed!</h2>
            <p className="text-xs text-slate-500">Congratulations on finishing your practice questions module.</p>
          </div>

          <div className="max-w-xs mx-auto py-2.5 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 divide-x divide-slate-150">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Score</span>
              <span className="text-lg font-extrabold text-slate-800">{score} / {questions.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Accuracy</span>
              <span className="text-lg font-extrabold text-slate-800">{percentage}%</span>
            </div>
          </div>

          <button 
            onClick={handleRetakeQuiz}
            className="inline-flex items-center space-x-1.5 btn-secondary border-brand-500/20 text-brand-500 hover:bg-brand-50 py-2.5 px-6 text-xs font-bold rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Practice Test</span>
          </button>
        </div>

        {/* Detailed Correction Key Review */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Correction Review Keys</h3>
          
          <div className="space-y-6">
            {questions.map((question, qIdx) => {
              const studentAnswer = selectedAnswers[qIdx];
              const isCorrect = studentAnswer === question.correctOptionIndex;
              return (
                <div key={question._id} className="glass-panel p-6 rounded-2xl border-slate-100 bg-white shadow-sm space-y-4">
                  
                  {/* Question Header Status */}
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      <span className="text-slate-450 mr-1">Q{qIdx + 1}.</span> {question.questionText}
                    </h4>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isCorrect 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {question.options.map((option, optIdx) => {
                      const wasSelected = studentAnswer === optIdx;
                      const isCorrectOpt = question.correctOptionIndex === optIdx;
                      
                      let optClass = 'border-slate-100 bg-white text-slate-650';
                      if (isCorrectOpt) {
                        optClass = 'border-emerald-200 bg-emerald-50/20 text-emerald-800 font-semibold';
                      } else if (wasSelected && !isCorrect) {
                        optClass = 'border-red-200 bg-red-50/20 text-red-800 font-semibold';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}>
                          <span className="flex items-center space-x-2.5">
                            <span className={`w-5.5 h-5.5 rounded text-[9px] font-bold flex items-center justify-center border ${
                              isCorrectOpt 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : wasSelected 
                                  ? 'bg-red-500 border-red-500 text-white' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </span>

                          <div className="flex-shrink-0">
                            {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-555 fill-emerald-50 text-emerald-500" />}
                            {wasSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 fill-red-55" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Teacher's Explanatory note */}
                  {question.explanation && (
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 leading-relaxed flex items-start space-x-2.5">
                      <HelpCircle className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">Detailed Explanation</span>
                        <p>{question.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WeeklyQuiz;
