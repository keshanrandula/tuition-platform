const User = require('../models/User');
const Payment = require('../models/Payment');
const Video = require('../models/Video');
const Class = require('../models/Class');
const Week = require('../models/Week');

// @desc    Get dashboard summary metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
exports.getMetrics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalVideos = await Video.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalWeeks = await Week.countDocuments();

    // Aggregating total earnings from completed payments
    const payments = await Payment.find({ status: 'completed' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Get recently registered students
    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      metrics: {
        totalStudents,
        totalVideos,
        totalClasses,
        totalWeeks,
        totalRevenue,
        recentStudents,
        transactions: payments,
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard metrics' });
  }
};

// @desc    Get analytics data: revenue trends, payment breakdown, student growth
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // --- 1. Monthly Revenue for past 6 months ---
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const payments = await Payment.find({ status: 'completed', createdAt: { $gte: date, $lt: endDate } });
      const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
      monthlyRevenue.push({ month: monthNames[date.getMonth()], revenue: parseFloat(revenue.toFixed(2)), transactions: payments.length });
    }

    // --- 2. Payment Method Breakdown ---
    const cardPayments = await Payment.countDocuments({ status: 'completed', paymentMethod: 'card' });
    const bankPayments = await Payment.countDocuments({ status: 'completed', paymentMethod: 'bank' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    const paymentMethodBreakdown = [
      { name: 'Card Payment', value: cardPayments, color: '#a2380c' },
      { name: 'Bank Transfer', value: bankPayments, color: '#6366f1' },
    ];
    const paymentStatusBreakdown = [
      { name: 'Completed', value: cardPayments + bankPayments, color: '#10b981' },
      { name: 'Pending', value: pendingPayments, color: '#f59e0b' },
      { name: 'Failed', value: failedPayments, color: '#ef4444' },
    ];

    // --- 3. Student Growth (registrations per month for past 6 months) ---
    const studentGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await User.countDocuments({ role: 'student', createdAt: { $gte: date, $lt: endDate } });
      studentGrowth.push({ month: monthNames[date.getMonth()], students: count });
    }

    // --- 4. Item Type Breakdown ---
    const weekPayments = await Payment.countDocuments({ status: 'completed', itemType: 'week' });
    const videoSetPayments = await Payment.countDocuments({ status: 'completed', itemType: 'videoSet' });
    const itemTypeBreakdown = [
      { name: 'Weekly Modules', value: weekPayments, color: '#6366f1' },
      { name: 'Video Packages', value: videoSetPayments, color: '#ec4899' },
    ];

    // --- 5. Top paying students ---
    const allPayments = await Payment.find({ status: 'completed' }).populate('user', 'name email');
    const studentSpendMap = {};
    for (const p of allPayments) {
      if (!p.user) continue;
      const id = p.user._id.toString();
      if (!studentSpendMap[id]) studentSpendMap[id] = { name: p.user.name, email: p.user.email, total: 0, count: 0 };
      studentSpendMap[id].total += p.amount;
      studentSpendMap[id].count += 1;
    }
    const topStudents = Object.values(studentSpendMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(s => ({ ...s, total: parseFloat(s.total.toFixed(2)) }));

    res.json({
      success: true,
      analytics: { monthlyRevenue, studentGrowth, paymentMethodBreakdown, paymentStatusBreakdown, itemTypeBreakdown, topStudents }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving analytics data' });
  }
};

// @desc    Get student progress overview for admin
// @route   GET /api/admin/progress-overview
// @access  Private/Admin
exports.getProgressOverview = async (req, res) => {
  try {
    const Progress = require('../models/Progress');
    const allProgress = await Progress.find()
      .populate('user', 'name email')
      .populate('quizScores.week', 'title weekNumber');

    const studentStats = allProgress.map(p => {
      const completedVideos = p.watchedVideos.filter(v => v.completed).length;
      const totalWatched = p.watchedVideos.length;
      const avgQuizScore = p.quizScores.length > 0
        ? Math.round(p.quizScores.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / p.quizScores.length)
        : 0;
      return {
        name: p.user?.name || 'Unknown',
        email: p.user?.email || '',
        completedVideos,
        totalWatched,
        avgQuizScore,
        classesAttended: p.attendedClasses.length,
        quizAttempts: p.quizScores.length,
      };
    });

    const videoCompletionData = [
      { name: 'Completed', value: allProgress.reduce((sum, p) => sum + p.watchedVideos.filter(v => v.completed).length, 0), color: '#10b981' },
      { name: 'In Progress', value: allProgress.reduce((sum, p) => sum + p.watchedVideos.filter(v => !v.completed).length, 0), color: '#f59e0b' },
    ];

    const quizScoreRanges = { 'Below 40%': 0, '40-60%': 0, '60-80%': 0, 'Above 80%': 0 };
    for (const p of allProgress) {
      for (const q of p.quizScores) {
        const pct = (q.score / q.totalQuestions) * 100;
        if (pct < 40) quizScoreRanges['Below 40%']++;
        else if (pct < 60) quizScoreRanges['40-60%']++;
        else if (pct < 80) quizScoreRanges['60-80%']++;
        else quizScoreRanges['Above 80%']++;
      }
    }
    const quizDistribution = Object.entries(quizScoreRanges).map(([name, value]) => ({ name, value }));

    res.json({
      success: true,
      progressOverview: { studentStats, videoCompletionData, quizDistribution, totalStudentsTracked: allProgress.length }
    });
  } catch (error) {
    console.error('Get progress overview error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving progress overview' });
  }
};

// @desc    Get list of all students with access details
// @route   GET /api/admin/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('purchasedWeeks', 'weekNumber title')
      .populate('purchasedVideoSets', 'title');
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students list error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving student list' });
  }
};

// @desc    Manually grant/revoke student content access
// @route   PUT /api/admin/students/:id/access
// @access  Private/Admin
exports.updateStudentAccess = async (req, res) => {
  try {
    const { purchasedWeeks, purchasedVideoSets } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    if (purchasedWeeks !== undefined) {
      student.purchasedWeeks = purchasedWeeks;
    }
    if (purchasedVideoSets !== undefined) {
      student.purchasedVideoSets = purchasedVideoSets;
    }

    await student.save();
    
    // Fetch fresh populated user
    const updatedStudent = await User.findById(student._id)
      .populate('purchasedWeeks', 'weekNumber title')
      .populate('purchasedVideoSets', 'title');

    res.json({
      success: true,
      message: 'Student access permissions updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Update student access error:', error);
    res.status(500).json({ success: false, message: 'Server error updating student permissions' });
  }
};
