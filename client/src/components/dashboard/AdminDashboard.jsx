import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getMediaUrl } from '../../utils/api';
import { 
  Users, Video, Calendar, DollarSign, Plus, Upload, Play, Clock, 
  Trash2, ShieldAlert, CheckCircle, AlertCircle, FileText, ToggleLeft, ToggleRight, Edit, HelpCircle, Megaphone,
  LayoutDashboard, TrendingUp, BarChart2, PieChart, Award, BookOpen, GraduationCap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [videoSets, setVideoSets] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editingClassId, setEditingClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourceForm, setResourceForm] = useState({ title: '', weekId: '', file: null, fileUrl: '' });
  
  // Analytics States
  const [analytics, setAnalytics] = useState(null);
  const [progressOverview, setProgressOverview] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // MCQ Quiz states
  const [mcqForm, setMcqForm] = useState({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOptionIndex: '0', explanation: '', weekId: '' });
  const [mcqViewWeekId, setMcqViewWeekId] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Bank Slips states
  const [pendingBankSlips, setPendingBankSlips] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', targetType: 'all', targetClass: '' });

  // Forms States
  const [weekForm, setWeekForm] = useState({ weekNumber: '', subject: '', title: '', description: '', price: '' });
  const [videoSetForm, setVideoSetForm] = useState({ title: '', description: '', price: '', thumbnailUrl: '' });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoUrl: '', thumbnailUrl: '', weekId: '', videoSetId: '', duration: '' });
  const [classForm, setClassForm] = useState({ title: '', description: '', scheduleTime: '', duration: '60', meetingUrl: '', meetingLink: '', weekId: '', subject: '', teacherNotes: '' });

  // Upload progress simulation states
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const [metricsRes, studentsRes, weeksRes, setsRes, classesRes, slipsRes, noticesRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/students'),
        api.get('/videos/weeks'),
        api.get('/videos/sets'),
        api.get('/classes'),
        api.get('/payments/admin/pending'),
        api.get('/notices/admin')
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.metrics);
      if (studentsRes.data.success) setStudents(studentsRes.data.students);
      if (weeksRes.data.success) setWeeks(weeksRes.data.weeks);
      if (setsRes.data.success) setVideoSets(setsRes.data.videoSets);
      if (classesRes.data.success) setClasses(classesRes.data.classes);
      if (slipsRes.data.success) setPendingBankSlips(slipsRes.data.payments || []);
      if (noticesRes.data.success) setNotices(noticesRes.data.notices || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showAlert('danger', 'Failed to retrieve administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [analyticsRes, progressRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/progress-overview')
      ]);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
      if (progressRes.data.success) setProgressOverview(progressRes.data.progressOverview);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAnalytics();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 4000);
  };

  // 1. Handle Week Creation
  const handleWeekSubmit = async (e) => {
    e.preventDefault();
    if (!weekForm.weekNumber || !weekForm.subject || !weekForm.title || !weekForm.description || weekForm.price === '') {
      showAlert('danger', 'Please fill in all Week fields');
      return;
    }

    try {
      const response = await api.post('/videos/weeks', {
        weekNumber: parseInt(weekForm.weekNumber),
        subject: weekForm.subject,
        title: weekForm.title,
        description: weekForm.description,
        price: parseFloat(weekForm.price),
        isLockedByDefault: parseFloat(weekForm.price) > 0
      });

      if (response.data.success) {
        showAlert('success', `Week ${weekForm.weekNumber} module created successfully!`);
        setWeekForm({ weekNumber: '', subject: '', title: '', description: '', price: '' });
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error creating week');
    }
  };

  // 1.5. Handle Standalone Package Creation
  const handleVideoSetSubmit = async (e) => {
    e.preventDefault();
    if (!videoSetForm.title || !videoSetForm.description || videoSetForm.price === '') {
      showAlert('danger', 'Please provide a title, description, and price');
      return;
    }

    try {
      const response = await api.post('/videos/sets', {
        title: videoSetForm.title,
        description: videoSetForm.description,
        price: parseFloat(videoSetForm.price),
        thumbnailUrl: videoSetForm.thumbnailUrl || ''
      });

      if (response.data.success) {
        showAlert('success', `Standalone Course "${videoSetForm.title}" created successfully!`);
        setVideoSetForm({ title: '', description: '', price: '', thumbnailUrl: '' });
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error creating subject package');
    }
  };

  // 2. Handle Video Creation
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.description || !videoForm.videoUrl) {
      showAlert('danger', 'Please provide a Title, Description, and Video URL');
      return;
    }

    setUploading(true);
    try {
      const response = await api.post('/videos', {
        title: videoForm.title,
        description: videoForm.description,
        videoUrl: videoForm.videoUrl,
        thumbnailUrl: videoForm.thumbnailUrl,
        weekId: videoForm.weekId || null,
        videoSetId: videoForm.videoSetId || null,
        duration: videoForm.duration ? parseInt(videoForm.duration) : 0
      });

      if (response.data.success) {
        showAlert('success', 'Video content cataloged successfully!');
        setVideoForm({ title: '', description: '', videoUrl: '', thumbnailUrl: '', weekId: '', videoSetId: '', duration: '' });
        fetchData();
      }
    } catch (err) {
      showAlert('danger', 'Failed to catalog video record.');
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Live Class Scheduling & Editing
  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.title || !classForm.description || !classForm.scheduleTime || !classForm.weekId) {
      showAlert('danger', 'Please complete all live class fields');
      return;
    }

    try {
      let response;
      const classData = {
        title: classForm.title,
        description: classForm.description,
        scheduleTime: new Date(classForm.scheduleTime),
        duration: parseInt(classForm.duration),
        meetingUrl: classForm.meetingLink || classForm.meetingUrl,
        meetingLink: classForm.meetingLink || classForm.meetingUrl,
        weekId: classForm.weekId,
        subject: classForm.subject,
        teacherNotes: classForm.teacherNotes
      };

      if (editingClassId) {
        response = await api.put(`/classes/${editingClassId}`, classData);
        if (response.data.success) {
          showAlert('success', 'Live classroom stream updated successfully!');
          setEditingClassId(null);
        }
      } else {
        response = await api.post('/classes', classData);
        if (response.data.success) {
          showAlert('success', 'Live classroom stream scheduled successfully!');
        }
      }

      if (response.data.success) {
        setClassForm({ title: '', description: '', scheduleTime: '', duration: '60', meetingUrl: '', meetingLink: '', weekId: '', subject: '', teacherNotes: '' });
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || `Error ${editingClassId ? 'updating' : 'scheduling'} live class`);
    }
  };

  const startEditClass = (cls) => {
    const date = new Date(cls.scheduleTime);
    const pad = (num) => String(num).padStart(2, '0');
    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

    setClassForm({
      title: cls.title,
      description: cls.description,
      scheduleTime: formattedDate,
      duration: String(cls.duration),
      meetingUrl: cls.meetingUrl || '',
      meetingLink: cls.meetingLink || cls.meetingUrl || '',
      weekId: cls.week?._id || cls.week || '',
      subject: cls.subject || '',
      teacherNotes: cls.teacherNotes || ''
    });
    setEditingClassId(cls._id);

    // Scroll smoothly to the form
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled class?')) {
      return;
    }
    try {
      const response = await api.delete(`/classes/${id}`);
      if (response.data.success) {
        showAlert('success', 'Live class deleted successfully!');
        if (editingClassId === id) {
          setEditingClassId(null);
          setClassForm({ title: '', description: '', scheduleTime: '', duration: '60', meetingUrl: '', weekId: '' });
        }
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error deleting class');
    }
  };

  // Handle PDF Resource Upload / Submission
  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.weekId) {
      showAlert('danger', 'Please provide a Title and Select a Week');
      return;
    }
    if (!resourceForm.file && !resourceForm.fileUrl) {
      showAlert('danger', 'Please upload a PDF file or enter a document URL');
      return;
    }

    setUploading(true);
    try {
      let response;
      if (resourceForm.file) {
        const formData = new FormData();
        formData.append('title', resourceForm.title);
        formData.append('file', resourceForm.file);
        
        response = await api.post(`/videos/weeks/${resourceForm.weekId}/resources`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post(`/videos/weeks/${resourceForm.weekId}/resources`, {
          title: resourceForm.title,
          fileUrl: resourceForm.fileUrl
        });
      }

      if (response.data.success) {
        showAlert('success', 'PDF resource uploaded and linked successfully!');
        setResourceForm({ title: '', weekId: '', file: null, fileUrl: '' });
        // Clear file input manually
        const fileInput = document.getElementById('resource-file-input');
        if (fileInput) fileInput.value = '';
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Failed to upload/catalog PDF resource.');
    } finally {
      setUploading(false);
    }
  };

  // Handle PDF Resource Deletion
  const handleDeleteResource = async (weekId, resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource file?')) return;

    try {
      const response = await api.delete(`/videos/weeks/${weekId}/resources/${resourceId}`);
      if (response.data.success) {
        showAlert('success', 'PDF resource removed successfully!');
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error deleting resource');
    }
  };

  // Fetch MCQ Quiz questions for a week
  const fetchQuizQuestions = async (weekId) => {
    if (!weekId) return;
    try {
      const response = await api.get(`/quizzes/week/${weekId}`);
      if (response.data.success && response.data.quiz) {
        setQuizQuestions(response.data.quiz.questions || []);
      }
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
    }
  };

  // Load questions automatically when the selected week changes in manager
  useEffect(() => {
    fetchQuizQuestions(mcqViewWeekId);
  }, [mcqViewWeekId]);

  // Handle MCQ Question Creation Submit
  const handleMcqSubmit = async (e) => {
    e.preventDefault();
    const { questionText, optionA, optionB, optionC, optionD, correctOptionIndex, explanation, weekId } = mcqForm;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !weekId) {
      showAlert('danger', 'Please fill in all MCQ fields (Question and 4 Options)');
      return;
    }

    try {
      const response = await api.post(`/quizzes/week/${weekId}/questions`, {
        questionText,
        options: [optionA, optionB, optionC, optionD],
        correctOptionIndex: parseInt(correctOptionIndex),
        explanation
      });

      if (response.data.success) {
        showAlert('success', 'MCQ question cataloged successfully!');
        setMcqForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOptionIndex: '0', explanation: '', weekId });
        
        // If the added question is for the currently viewed week, refresh the list
        if (weekId === mcqViewWeekId) {
          fetchQuizQuestions(weekId);
        }
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Failed to catalog MCQ question.');
    }
  };

  // Handle MCQ Deletion
  const handleDeleteMcq = async (weekId, questionId) => {
    if (!window.confirm('Are you sure you want to delete this MCQ question?')) return;

    try {
      const response = await api.delete(`/quizzes/week/${weekId}/questions/${questionId}`);
      if (response.data.success) {
        showAlert('success', 'MCQ question removed successfully!');
        fetchQuizQuestions(weekId);
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error deleting MCQ question');
    }
  };

  // Handle Bank Slip manual confirmation approvals
  const handleApproveSlip = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this bank slip? This will unlock the content for the student.')) return;
    try {
      const response = await api.put(`/payments/admin/approve/${paymentId}`);
      if (response.data.success) {
        showAlert('success', 'Bank slip approved successfully! Content unlocked.');
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error approving bank slip');
    }
  };

  const handleRejectSlip = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this bank slip?')) return;
    try {
      const response = await api.put(`/payments/admin/reject/${paymentId}`);
      if (response.data.success) {
        showAlert('success', 'Bank slip transaction rejected.');
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error rejecting bank slip');
    }
  };

  // Handle Notice Board submit & deletion
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    const { title, content, targetType, targetClass } = noticeForm;

    if (!title || !content) {
      showAlert('danger', 'Please provide a title and content for the notice');
      return;
    }

    if (targetType === 'class' && !targetClass) {
      showAlert('danger', 'Please select a target class for the announcement');
      return;
    }

    try {
      const response = await api.post('/notices', {
        title,
        content,
        targetType,
        targetClass: targetType === 'class' ? targetClass : null
      });

      if (response.data.success) {
        showAlert('success', 'Announcement posted successfully!');
        setNoticeForm({ title: '', content: '', targetType: 'all', targetClass: '' });
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Failed to post announcement.');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await api.delete(`/notices/${id}`);
      if (response.data.success) {
        showAlert('success', 'Announcement deleted successfully!');
        fetchData();
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error deleting notice');
    }
  };

  // 4. Handle Manual Student Permissions Override
  const toggleStudentWeekAccess = async (studentId, weekId, currentAccess) => {
    const student = students.find((s) => s._id === studentId);
    if (!student) return;

    let updatedWeeks = [...student.purchasedWeeks.map((w) => w._id || w)];

    if (currentAccess) {
      updatedWeeks = updatedWeeks.filter((id) => id !== weekId);
    } else {
      updatedWeeks.push(weekId);
    }

    try {
      const response = await api.put(`/admin/students/${studentId}/access`, {
        purchasedWeeks: updatedWeeks
      });

      if (response.data.success) {
        showAlert('success', 'Student access updated successfully!');
        setStudents(
          students.map((s) => (s._id === studentId ? response.data.student : s))
        );
      }
    } catch (err) {
      showAlert('danger', 'Failed to update student permissions override.');
    }
  };

  if (loading || !metrics) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Floating Toast Notification */}
      {alert.message && (
        <div className={`fixed bottom-5 right-5 z-50 border rounded-2xl p-4 flex items-start space-x-3 text-sm shadow-xl max-w-sm animate-slide-up bg-white ${
          alert.type === 'success' 
            ? 'border-emerald-100 text-emerald-800 shadow-emerald-100/50' 
            : 'border-red-100 text-red-800 shadow-red-100/50'
        }`}>
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="space-y-1 flex-1">
            <span className="font-bold block text-sm">{alert.type === 'success' ? 'Success' : 'Error'}</span>
            <span className="text-xs text-slate-500 font-medium block leading-normal">{alert.message}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin <span className="text-brand-500">Control Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage curriculum, schedule live broadcasts, issue notices, and override student access locks.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Logged in as: {user?.name || 'Administrator'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Menu Dashboard</p>
          {[
            { id: 'overview', name: 'Overview / Metrics', icon: LayoutDashboard },
            { id: 'analytics', name: 'Analytics & Charts', icon: BarChart2 },
            { id: 'curriculum', name: 'Curriculum & Media', icon: Video },
            { id: 'live', name: 'Live Classrooms', icon: Calendar },
            { id: 'quizzes', name: 'MCQ Quizzes', icon: HelpCircle },
            { id: 'announcements', name: 'Notice Board', icon: Megaphone },
            { 
              id: 'payments', 
              name: 'Bank Slips', 
              icon: DollarSign,
              badge: pendingBankSlips.length > 0 ? pendingBankSlips.length : null
            },
            { id: 'students', name: 'Student Access', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-650 to-brand-500 text-white shadow-md shadow-brand-600/10' 
                    : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-left">{tab.name}</span>
                {tab.badge && (
                  <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-brand-600' : 'bg-amber-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Main Content Panel */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Platform Revenue', value: `$${metrics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                  { label: 'Registered Students', value: metrics.totalStudents, icon: Users, color: 'text-brand-500 bg-brand-50 border-brand-100' },
                  { label: 'Cataloged Videos', value: metrics.totalVideos, icon: Video, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
                  { label: 'Course Weeks', value: metrics.totalWeeks, icon: Calendar, color: 'text-pink-500 bg-pink-50 border-pink-100' },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="glass-panel p-6 rounded-3xl border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">{card.label}</span>
                        <span className="text-3xl font-extrabold text-slate-900">{card.value}</span>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.color}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transaction Records Log */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <span>Completed Platform Invoices</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Real-time payment logs and digital receipts.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Invoice Ref</th>
                        <th className="py-3 px-4 font-semibold">Student</th>
                        <th className="py-3 px-4 font-semibold">Product Description</th>
                        <th className="py-3 px-4 font-semibold text-right">Amount Paid</th>
                        <th className="py-3 px-4 font-semibold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {metrics.transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs text-brand-500">{tx.transactionId}</td>
                          <td className="py-4 px-4 font-semibold text-slate-800">{tx.user?.name || 'Deleted Account'}</td>
                          <td className="py-4 px-4 text-xs">{tx.itemType === 'week' ? 'Weekly Modules' : 'Crash Package'} (ID: {tx.itemId.slice(-6).toUpperCase()})</td>
                          <td className="py-4 px-4 text-right font-extrabold text-emerald-600 font-mono">${tx.amount.toFixed(2)}</td>
                          <td className="py-4 px-4 text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {metrics.transactions.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 italic">No sales logs stored in the database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-400 font-medium">Loading analytics data...</p>
                  </div>
                </div>
              ) : !analytics ? (
                <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 border-slate-100">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Analytics data unavailable. Make sure the backend is running.</p>
                </div>
              ) : (
                <>
                  {/* ── Row 1: Summary KPI Strip ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Revenue', value: `LKR ${analytics.monthlyRevenue.reduce((s,m)=>s+m.revenue,0).toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                      { label: 'New Students (6mo)', value: analytics.studentGrowth.reduce((s,m)=>s+m.students,0), icon: GraduationCap, color: 'indigo' },
                      { label: 'Total Transactions', value: analytics.monthlyRevenue.reduce((s,m)=>s+m.transactions,0), icon: FileText, color: 'pink' },
                      { label: 'Pending Payments', value: (analytics.paymentStatusBreakdown.find(p=>p.name==='Pending')?.value || 0), icon: Clock, color: 'amber' },
                    ].map((kpi, i) => {
                      const Icon = kpi.icon;
                      const colors = {
                        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
                        pink: 'bg-pink-50 border-pink-100 text-pink-600',
                        amber: 'bg-amber-50 border-amber-100 text-amber-600',
                      };
                      return (
                        <div key={i} className="glass-panel p-5 rounded-2xl border-slate-100 flex flex-col space-y-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[kpi.color]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{kpi.label}</p>
                            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kpi.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Row 2: Revenue Trend + Student Growth ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Area Chart */}
                    <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                      <div className="flex items-center space-x-2 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Monthly Revenue</h3>
                          <p className="text-xs text-slate-400">Past 6 months earnings trend</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={analytics.monthlyRevenue}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v) => [`LKR ${v}`, 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Student Growth Bar Chart */}
                    <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                      <div className="flex items-center space-x-2 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">New Student Registrations</h3>
                          <p className="text-xs text-slate-400">Monthly enrollment count</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.studentGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                          <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} name="New Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Row 3: Pie Charts ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { title: 'Payment Method', data: analytics.paymentMethodBreakdown, sub: 'Card vs Bank transfer split' },
                      { title: 'Payment Status', data: analytics.paymentStatusBreakdown, sub: 'Completed, pending & failed' },
                      { title: 'Product Type Sales', data: analytics.itemTypeBreakdown, sub: 'Weekly modules vs video packages' },
                    ].map((pie, idx) => (
                      <div key={idx} className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                        <div className="mb-4">
                          <h3 className="text-sm font-bold text-slate-900">{pie.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{pie.sub}</p>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                          <RechartsPie>
                            <Pie data={pie.data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                              {pie.data.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                          </RechartsPie>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {pie.data.map((d, i) => (
                            <div key={i} className="flex items-center space-x-1.5">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                              <span className="text-[10px] font-semibold text-slate-500">{d.name} ({d.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Row 4: Transactions Bar + Top Students ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Transaction Volume */}
                    <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                      <div className="flex items-center space-x-2 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
                          <BarChart2 className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Monthly Transaction Volume</h3>
                          <p className="text-xs text-slate-400">Number of completed payments</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.monthlyRevenue}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                          <Bar dataKey="transactions" fill="#ec4899" radius={[6, 6, 0, 0]} name="Transactions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Paying Students */}
                    <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                      <div className="flex items-center space-x-2 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                          <Award className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Top Paying Students</h3>
                          <p className="text-xs text-slate-400">Highest platform spend</p>
                        </div>
                      </div>
                      {analytics.topStudents.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-8">No payment data available yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {analytics.topStudents.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-brand-500'
                                }`}>{i + 1}</div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{s.name}</p>
                                  <p className="text-[10px] text-slate-400">{s.count} purchase{s.count > 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <span className="text-sm font-extrabold text-emerald-600 font-mono">LKR {s.total.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Row 5: Student Progress Overview ── */}
                  {progressOverview && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-5 h-5 text-brand-500" />
                          <h2 className="text-lg font-bold text-slate-900">Student Progress Overview</h2>
                        </div>
                        <span className="text-xs bg-brand-50 text-brand-600 font-bold px-3 py-1 rounded-full border border-brand-100">
                          {progressOverview.totalStudentsTracked} Students Tracked
                        </span>
                      </div>

                      {/* Progress charts row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Video Completion Pie */}
                        <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-900 mb-1">Video Completion Rate</h3>
                          <p className="text-xs text-slate-400 mb-4">Completed vs in-progress videos</p>
                          <ResponsiveContainer width="100%" height={160}>
                            <RechartsPie>
                              <Pie data={progressOverview.videoCompletionData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                            </RechartsPie>
                          </ResponsiveContainer>
                          <div className="flex gap-4 justify-center mt-2">
                            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-[10px] font-semibold text-slate-500">Completed ({progressOverview.videoCompletionData[0]?.value || 0})</span></div>
                            <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="text-[10px] font-semibold text-slate-500">In Progress ({progressOverview.videoCompletionData[1]?.value || 0})</span></div>
                          </div>
                        </div>

                        {/* Quiz Score Distribution */}
                        <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-900 mb-1">Quiz Score Distribution</h3>
                          <p className="text-xs text-slate-400 mb-4">All quiz attempts categorized by score range</p>
                          <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={progressOverview.quizDistribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                              <Bar dataKey="value" name="Students" radius={[5, 5, 0, 0]}>
                                <Cell fill="#ef4444" />
                                <Cell fill="#f59e0b" />
                                <Cell fill="#6366f1" />
                                <Cell fill="#10b981" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Per-student progress table */}
                      {progressOverview.studentStats.length > 0 && (
                        <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm">
                          <div className="p-6 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-brand-500" />
                              <span>Individual Student Progress</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Detailed learning metrics per student</p>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Videos Watched</th>
                                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Completed</th>
                                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Avg Quiz Score</th>
                                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Classes Attended</th>
                                  <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Quiz Attempts</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {progressOverview.studentStats.map((s, i) => (
                                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">{s.name[0]}</div>
                                        <div>
                                          <p className="text-xs font-bold text-slate-800">{s.name}</p>
                                          <p className="text-[10px] text-slate-400">{s.email}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xs font-semibold text-slate-700">{s.totalWatched}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xs font-semibold text-emerald-600">{s.completedVideos}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <div className="flex flex-col items-center">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                          s.avgQuizScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
                                          s.avgQuizScore >= 60 ? 'bg-indigo-50 text-indigo-700' :
                                          s.avgQuizScore >= 40 ? 'bg-amber-50 text-amber-700' :
                                          s.quizAttempts === 0 ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-700'
                                        }`}>{s.quizAttempts === 0 ? 'N/A' : `${s.avgQuizScore}%`}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xs font-semibold text-slate-700">{s.classesAttended}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xs font-semibold text-slate-700">{s.quizAttempts}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {progressOverview.studentStats.length === 0 && (
                        <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 border-slate-100">
                          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">No student progress data recorded yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {activeTab === 'curriculum' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Side: Module & Standalone Course Creators */}
                <div className="space-y-8">
                  {/* Form: Create Week Module */}
                  <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-4 bg-white">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <Plus className="w-5 h-5 text-brand-500" />
                        <span>Create Weekly Study Module</span>
                      </h2>
                      <p className="text-[11px] text-slate-450 mt-1">
                        Use this to add a new weekly study folder to the curriculum. Students will see these categorized by subject.
                      </p>
                    </div>
                    <form onSubmit={handleWeekSubmit} className="space-y-4 pt-2 border-t border-slate-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Week Index (Number)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 5" 
                            value={weekForm.weekNumber} 
                            onChange={(e) => setWeekForm({ ...weekForm, weekNumber: e.target.value })}
                            className="glass-input w-full py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Physics, Math" 
                            value={weekForm.subject} 
                            onChange={(e) => setWeekForm({ ...weekForm, subject: e.target.value })}
                            className="glass-input w-full py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Module Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Circular Motion, Trigonometry" 
                          value={weekForm.title} 
                          onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })}
                          className="glass-input w-full py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea 
                          rows="2" 
                          placeholder="What will students learn in this week module?" 
                          value={weekForm.description} 
                          onChange={(e) => setWeekForm({ ...weekForm, description: e.target.value })}
                          className="glass-input w-full py-2 text-xs"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unlock Price ($ USD)</label>
                        <input 
                          type="number" 
                          placeholder="0 for Free/Intro Module, otherwise set Price" 
                          value={weekForm.price} 
                          onChange={(e) => setWeekForm({ ...weekForm, price: e.target.value })}
                          className="glass-input w-full py-2"
                        />
                      </div>
                      <button type="submit" className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider">Create Weekly Module</button>
                    </form>
                  </div>

                  {/* Form: Create Stand-alone Subject Package */}
                  <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-4 bg-white">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <Plus className="w-5 h-5 text-indigo-500" />
                        <span>Create Stand-alone Subject Package</span>
                      </h2>
                      <p className="text-[11px] text-slate-455 mt-1">
                        Create a standalone course package (e.g. Crash Course, Revision Pack) sold separately from the weekly syllabus.
                      </p>
                    </div>
                    <form onSubmit={handleVideoSetSubmit} className="space-y-4 pt-2 border-t border-slate-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Package Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Physics Revision Pack" 
                            value={videoSetForm.title} 
                            onChange={(e) => setVideoSetForm({ ...videoSetForm, title: e.target.value })}
                            className="glass-input w-full py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price ($ USD)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 25" 
                            value={videoSetForm.price} 
                            onChange={(e) => setVideoSetForm({ ...videoSetForm, price: e.target.value })}
                            className="glass-input w-full py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea 
                          rows="2" 
                          placeholder="Summarize course content and goals..." 
                          value={videoSetForm.description} 
                          onChange={(e) => setVideoSetForm({ ...videoSetForm, description: e.target.value })}
                          className="glass-input w-full py-2 text-xs"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preview Thumbnail Image URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/..." 
                          value={videoSetForm.thumbnailUrl} 
                          onChange={(e) => setVideoSetForm({ ...videoSetForm, thumbnailUrl: e.target.value })}
                          className="glass-input w-full py-2"
                        />
                      </div>
                      <button type="submit" className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider">Create Standalone Package</button>
                    </form>
                  </div>
                </div>

                {/* Right Side: Video Lecture Uploader & Cataloger */}
                <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-4 bg-white h-fit">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-indigo-500" />
                      <span>Upload & Catalog Video Asset</span>
                    </h2>
                    <p className="text-[11px] text-slate-450 mt-1">
                      Add a recorded lecture stream into the platform. You must select whether this belongs inside a weekly syllabus or a standalone package.
                    </p>
                  </div>
                  <form onSubmit={handleVideoSubmit} className="space-y-4 pt-2 border-t border-slate-50">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Video Lesson Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Introduction to Derivatives" 
                        value={videoForm.title} 
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Video Description</label>
                      <textarea 
                        rows="2" 
                        placeholder="Detail the topics discussed in this session..." 
                        value={videoForm.description} 
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        className="glass-input w-full py-2 text-xs"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Video Stream URL</label>
                      <input 
                        type="text" 
                        placeholder="e.g. YouTube watch URL or custom raw mp4 stream link" 
                        value={videoForm.videoUrl} 
                        onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preview Thumbnail Image URL</label>
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash.com/..." 
                        value={videoForm.thumbnailUrl} 
                        onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    
                    {/* Visual Radio Selector for Video Placement */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                      <label className="block text-[10px] font-extrabold text-slate-550 uppercase tracking-wider">Video Placement Destination</label>
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="videoPlacement" 
                            checked={videoForm.videoSetId === ''} 
                            onChange={() => setVideoForm({ ...videoForm, weekId: weeks[0]?._id || '', videoSetId: '' })}
                            className="text-brand-500 focus:ring-brand-500" 
                          />
                          <span>Weekly Syllabus Module</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="videoPlacement" 
                            checked={videoForm.videoSetId !== ''} 
                            onChange={() => setVideoForm({ ...videoForm, videoSetId: videoSets[0]?._id || '', weekId: '' })}
                            className="text-brand-500 focus:ring-brand-500" 
                          />
                          <span>Standalone Crash Course Package</span>
                        </label>
                      </div>

                      {videoForm.videoSetId === '' ? (
                        <div className="pt-2 animate-fade-in">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Week Module</label>
                          <select 
                            value={videoForm.weekId} 
                            onChange={(e) => setVideoForm({ ...videoForm, weekId: e.target.value, videoSetId: '' })}
                            className="glass-input w-full py-2 text-xs bg-white"
                          >
                            <option value="">-- Choose target Week module --</option>
                            {weeks.map((w) => <option key={w._id} value={w._id}>Week {w.weekNumber}: {w.title} ({w.subject || 'General'})</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="pt-2 animate-fade-in">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Standalone Package</label>
                          <select 
                            value={videoForm.videoSetId} 
                            onChange={(e) => setVideoForm({ ...videoForm, videoSetId: e.target.value, weekId: '' })}
                            className="glass-input w-full py-2 text-xs bg-white"
                          >
                            <option value="">-- Choose target Standalone pack --</option>
                            {videoSets.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={uploading} className="w-full btn-primary py-2.5 text-xs font-bold uppercase tracking-wider">
                      {uploading ? 'Cataloging asset...' : 'Publish & Catalog Video'}
                    </button>
                  </form>
                </div>

              </div>

              {/* Form: Upload PDF Resource */}
              <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 text-red-500" />
                  <span>Upload PDF Resource</span>
                </h2>
                <form onSubmit={handleResourceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Resource Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mechanics Lecture Note" 
                        value={resourceForm.title} 
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Select Week Module</label>
                      <select 
                        value={resourceForm.weekId} 
                        onChange={(e) => setResourceForm({ ...resourceForm, weekId: e.target.value })}
                        className="glass-input w-full py-2 text-xs"
                      >
                        <option value="">Select Week</option>
                        {weeks.map((w) => <option key={w._id} value={w._id}>Week {w.weekNumber}: {w.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Upload PDF File</label>
                      <input 
                        id="resource-file-input"
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files[0], fileUrl: '' })}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 glass-input w-full py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Manual Document URL</label>
                      <input 
                        type="text" 
                        placeholder="Google Drive, Dropbox, or custom URL" 
                        value={resourceForm.fileUrl} 
                        onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value, file: null })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={uploading} className="w-full btn-primary py-2 text-sm bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-red-650 border-red-500 text-white font-semibold shadow-md shadow-red-550/10">
                    {uploading ? 'Uploading PDF...' : 'Upload PDF Resource'}
                  </button>
                </form>
              </div>

              {/* Syllabus Resources Management List */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 text-red-500" />
                  <span>Syllabus PDF Resources & Note Materials</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Document Title</th>
                        <th className="py-3 px-4 font-semibold">Associated Week</th>
                        <th className="py-3 px-4 font-semibold">File URL / Source</th>
                        <th className="py-3 px-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {weeks.flatMap(w => (w.resources || []).map(r => ({ ...r, weekNumber: w.weekNumber, weekTitle: w.title, weekId: w._id }))).map((resrc) => (
                        <tr key={resrc._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-900">{resrc.title}</td>
                          <td className="py-4 px-4 text-slate-500">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-500 border border-brand-100 px-2.5 py-0.5 rounded-full">
                              Week {resrc.weekNumber}: {resrc.weekTitle}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-slate-500 truncate max-w-xs" title={resrc.fileUrl}>
                            <a href={getMediaUrl(resrc.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                              {resrc.fileUrl}
                            </a>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDeleteResource(resrc.weekId, resrc._id)}
                              title="Delete Resource PDF"
                              className="p-1.5 rounded-xl text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {weeks.every(w => !w.resources || w.resources.length === 0) && (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-slate-400 italic">No PDF lecture notes or resources uploaded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CLASSROOMS */}
          {activeTab === 'live' && (
            <div className="space-y-8">
              {/* Form: Schedule Live Streaming Class */}
              <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <span>{editingClassId ? 'Edit Live Broadcast' : 'Schedule Live Broadcast'}</span>
                </h2>
                <form onSubmit={classForm.weekId === 'loading' ? null : handleClassSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Class Title</label>
                      <input 
                        type="text" 
                        placeholder="Interactive Q&A Session" 
                        value={classForm.title} 
                        onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Subject</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mathematics, Physics" 
                        value={classForm.subject} 
                        onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Description</label>
                    <textarea 
                      rows="2" 
                      placeholder="Class agenda points..." 
                      value={classForm.description} 
                      onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                      className="glass-input w-full py-2 text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Meeting Link (Zoom/Meet URL)</label>
                    <input 
                      type="text" 
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..." 
                      value={classForm.meetingLink} 
                      onChange={(e) => setClassForm({ ...classForm, meetingLink: e.target.value })}
                      className="glass-input w-full py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Target Week</label>
                      <select 
                        value={classForm.weekId} 
                        onChange={(e) => setClassForm({ ...classForm, weekId: e.target.value })}
                        className="glass-input w-full py-2 text-xs"
                      >
                        <option value="">Select Week</option>
                        {weeks.map((w) => <option key={w._id} value={w._id}>Week {w.weekNumber}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Mins Length</label>
                      <input 
                        type="number" 
                        value={classForm.duration} 
                        onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Broadcast Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={classForm.scheduleTime} 
                        onChange={(e) => setClassForm({ ...classForm, scheduleTime: e.target.value })}
                        className="glass-input w-full py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Teacher Notes</label>
                    <textarea 
                      rows="2" 
                      placeholder="Formulas, instructions, or files..." 
                      value={classForm.teacherNotes} 
                      onChange={(e) => setClassForm({ ...classForm, teacherNotes: e.target.value })}
                      className="glass-input w-full py-2 text-sm"
                    ></textarea>
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="flex-1 btn-primary py-2 text-sm">
                      {editingClassId ? 'Update Live Event' : 'Schedule Live Event'}
                    </button>
                    {editingClassId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClassId(null);
                          setClassForm({ title: '', description: '', scheduleTime: '', duration: '60', meetingUrl: '', meetingLink: '', weekId: '', subject: '', teacherNotes: '' });
                        }}
                        className="px-4 bg-slate-200 hover:bg-slate-350 text-slate-700 font-semibold py-2 rounded-xl text-sm transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Scheduled Live Broadcasts Management List */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <span>Scheduled Live Broadcasts</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Title / Description</th>
                        <th className="py-3 px-4 font-semibold">Associated Week</th>
                        <th className="py-3 px-4 font-semibold">Date & Time</th>
                        <th className="py-3 px-4 font-semibold">Duration</th>
                        <th className="py-3 px-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classes.map((cls) => {
                        const dateObj = new Date(cls.scheduleTime);
                        const weekNumber = cls.week?.weekNumber || (weeks.find(w => w._id === cls.week)?.weekNumber) || 'N/A';
                        const weekTitle = cls.week?.title || (weeks.find(w => w._id === cls.week)?.title) || 'N/A';

                        return (
                          <tr key={cls._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="font-semibold text-slate-900">{cls.title}</div>
                                {cls.subject && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                    {cls.subject}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{cls.description}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-500">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-500 border border-brand-100 px-2.5 py-0.5 rounded-full">
                                Week {weekNumber}: {weekTitle}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-slate-500">
                              <div>{dateObj.toLocaleDateString()}</div>
                              <div>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-500 font-mono text-xs">
                              {cls.duration} mins
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center items-center space-x-2">
                                <button
                                  onClick={() => startEditClass(cls)}
                                  title="Edit Class Schedule"
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-brand-500 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(cls._id)}
                                  title="Delete Class Schedule"
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {classes.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 italic">No live lectures scheduled in the database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MCQ QUIZZES */}
          {activeTab === 'quizzes' && (
            <div className="space-y-8">
              {/* Form: Create MCQ Question */}
              <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  <span>Create MCQ Question</span>
                </h2>
                <form onSubmit={handleMcqSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Question Text</label>
                    <textarea 
                      rows="2" 
                      placeholder="What is the derivative of x^2?" 
                      value={mcqForm.questionText} 
                      onChange={(e) => setMcqForm({ ...mcqForm, questionText: e.target.value })}
                      className="glass-input w-full py-2 text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Option A</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2x" 
                        value={mcqForm.optionA} 
                        onChange={(e) => setMcqForm({ ...mcqForm, optionA: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Option B</label>
                      <input 
                        type="text" 
                        placeholder="e.g. x^3" 
                        value={mcqForm.optionB} 
                        onChange={(e) => setMcqForm({ ...mcqForm, optionB: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Option C</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2" 
                        value={mcqForm.optionC} 
                        onChange={(e) => setMcqForm({ ...mcqForm, optionC: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Option D</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0" 
                        value={mcqForm.optionD} 
                        onChange={(e) => setMcqForm({ ...mcqForm, optionD: e.target.value })}
                        className="glass-input w-full py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Correct Option</label>
                      <select 
                        value={mcqForm.correctOptionIndex} 
                        onChange={(e) => setMcqForm({ ...mcqForm, correctOptionIndex: e.target.value })}
                        className="glass-input w-full py-2 text-xs"
                      >
                        <option value="0">Option A</option>
                        <option value="1">Option B</option>
                        <option value="2">Option C</option>
                        <option value="3">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Syllabus Week</label>
                      <select 
                        value={mcqForm.weekId} 
                        onChange={(e) => setMcqForm({ ...mcqForm, weekId: e.target.value })}
                        className="glass-input w-full py-2 text-xs"
                      >
                        <option value="">Select Week</option>
                        {weeks.map((w) => <option key={w._id} value={w._id}>Week {w.weekNumber}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Explanatory Note (Optional)</label>
                    <textarea 
                      rows="2" 
                      placeholder="Explain why this option is correct..." 
                      value={mcqForm.explanation} 
                      onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
                      className="glass-input w-full py-2 text-sm"
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full btn-primary py-2 text-sm bg-gradient-to-r from-brand-650 to-brand-500 hover:from-brand-500 hover:to-brand-650 border-brand-500 text-white font-semibold">
                    Catalog MCQ Question
                  </button>
                </form>
              </div>

              {/* Practice MCQ Quizzes Management list */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <span>Syllabus MCQ Quizzes Manager</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Filter Week:</label>
                    <select
                      value={mcqViewWeekId}
                      onChange={(e) => setMcqViewWeekId(e.target.value)}
                      className="glass-input py-1.5 px-3 text-xs font-semibold text-slate-655 bg-slate-50"
                    >
                      <option value="">-- Choose Week --</option>
                      {weeks.map((w) => <option key={w._id} value={w._id}>Week {w.weekNumber}: {w.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {mcqViewWeekId ? (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="py-3 px-4 font-semibold w-1/3">Question Detail</th>
                          <th className="py-3 px-4 font-semibold w-1/3">MCQ Options (correct highlighted)</th>
                          <th className="py-3 px-4 font-semibold w-1/4">Explanation Note</th>
                          <th className="py-3 px-4 font-semibold text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quizQuestions.map((q, index) => (
                          <tr key={q._id || index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-slate-900 align-top">
                              <div>Q{index + 1}. {q.questionText}</div>
                            </td>
                            <td className="py-4 px-4 text-xs space-y-1 align-top">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctOptionIndex === oIdx;
                                return (
                                  <div 
                                    key={oIdx} 
                                    className={`px-2.5 py-1 rounded-lg border font-medium ${
                                      isCorrect 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800 font-bold' 
                                        : 'bg-slate-50 border-slate-100 text-slate-500'
                                    }`}
                                  >
                                    <span className="font-mono mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-500 leading-normal align-top italic">
                              {q.explanation || 'No explanatory details added.'}
                            </td>
                            <td className="py-4 px-4 text-center align-top">
                              <button
                                onClick={() => handleDeleteMcq(mcqViewWeekId, q._id)}
                                title="Remove MCQ Question"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {quizQuestions.length === 0 && (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-slate-400 italic">No multiple-choice questions added for this week yet. Use form above to add questions.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400 italic">Please select a week module from the dropdown filter at the top right to load and manage quiz questions.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-8">
              {/* Form: Create Notice / Announcement */}
              <div className="glass-panel rounded-3xl p-6 border-slate-100 shadow-md space-y-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Megaphone className="w-5 h-5 text-brand-500" />
                  <span>Create Announcement / නිවේදනයක්</span>
                </h2>
                <form onSubmit={handleNoticeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Notice Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Schedule Change, Exam Notice" 
                      value={noticeForm.title} 
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      className="glass-input w-full py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Announcement Content</label>
                    <textarea 
                      rows="3" 
                      placeholder="Details of the announcement..." 
                      value={noticeForm.content} 
                      onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                      className="glass-input w-full py-2 text-sm"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Target Audience</label>
                      <select 
                        value={noticeForm.targetType} 
                        onChange={(e) => setNoticeForm({ ...noticeForm, targetType: e.target.value, targetClass: '' })}
                        className="glass-input w-full py-2 text-xs"
                      >
                        <option value="all">All Students (සියලුම සිසුන්)</option>
                        <option value="class">Specific Live Class (අදාළ පන්තියේ සිසුන් පමණක්)</option>
                      </select>
                    </div>

                    {noticeForm.targetType === 'class' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Select Target Class</label>
                        <select 
                          value={noticeForm.targetClass} 
                          onChange={(e) => setNoticeForm({ ...noticeForm, targetClass: e.target.value })}
                          className="glass-input w-full py-2 text-xs"
                        >
                          <option value="">-- Choose Class --</option>
                          {classes.map((cls) => {
                            const weekNum = cls.week?.weekNumber || (weeks.find(w => w._id === cls.week)?.weekNumber) || 'N/A';
                            return (
                              <option key={cls._id} value={cls._id}>
                                Week {weekNum}: {cls.title}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full btn-primary py-2 text-sm bg-gradient-to-r from-brand-650 to-brand-500 hover:from-brand-500 hover:to-brand-650 border-brand-500 text-white font-semibold">
                    Post Announcement
                  </button>
                </form>
              </div>

              {/* Announcements / Notice Board manager */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Megaphone className="w-5 h-5 text-brand-500" />
                  <span>Announcements & Notice Board Manager</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-3 px-4 font-semibold w-1/4">Title</th>
                        <th className="py-3 px-4 font-semibold w-1/3">Announcement Content</th>
                        <th className="py-3 px-4 font-semibold">Audience Target</th>
                        <th className="py-3 px-4 font-semibold">Date Posted</th>
                        <th className="py-3 px-4 font-semibold text-center w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notices.map((notice) => {
                        let audienceText = 'All Students (සියලුම සිසුන්)';
                        if (notice.targetType === 'class' && notice.targetClass) {
                          const targetCls = notice.targetClass;
                          const weekNum = targetCls.week?.weekNumber || (weeks.find(w => w._id === targetCls.week)?.weekNumber) || 'N/A';
                          audienceText = `Class: Week ${weekNum} - ${targetCls.title}`;
                        }

                        return (
                          <tr key={notice._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-slate-900 align-top">{notice.title}</td>
                            <td className="py-4 px-4 text-xs text-slate-500 align-top whitespace-pre-line leading-relaxed max-w-sm">{notice.content}</td>
                            <td className="py-4 px-4 align-top">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                notice.targetType === 'all'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                              }`}>
                                {audienceText}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-500 align-top font-mono">
                              {new Date(notice.createdAt).toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-center align-top">
                              <button
                                onClick={() => handleDeleteNotice(notice._id)}
                                title="Delete Announcement"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {notices.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 italic">No notices or announcements posted yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS & BANK SLIPS */}
          {activeTab === 'payments' && (
            <div className="space-y-8">
              {/* Pending Bank Slip Approvals table */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span>Pending Bank Slip Approvals</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Review physical deposit receipts submitted by students to unlock paid modules.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Student Name</th>
                        <th className="py-3 px-4 font-semibold">Email</th>
                        <th className="py-3 px-4 font-semibold">Product Description</th>
                        <th className="py-3 px-4 font-semibold">Amount</th>
                        <th className="py-3 px-4 font-semibold">Receipt Slip</th>
                        <th className="py-3 px-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {pendingBankSlips.map((payment) => {
                        let itemName = 'Syllabus Item';
                        if (payment.itemType === 'week') {
                          const week = weeks.find((w) => w._id === payment.itemId);
                          itemName = week ? `Week ${week.weekNumber}: ${week.title}` : 'Week Module';
                        } else {
                          const videoSet = videoSets.find((s) => s._id === payment.itemId);
                          itemName = videoSet ? videoSet.title : 'Video Set';
                        }

                        return (
                          <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-slate-800">{payment.user?.name || 'Student'}</td>
                            <td className="py-4 px-4 text-xs font-mono text-slate-400">{payment.user?.email}</td>
                            <td className="py-4 px-4 text-xs font-medium">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-500 border border-brand-100 px-2 py-0.5 rounded-full">
                                {itemName}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-extrabold text-emerald-600 font-mono">${payment.amount.toFixed(2)}</td>
                            <td className="py-4 px-4 text-xs">
                              <a 
                                href={getMediaUrl(payment.slipUrl)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-500 font-bold hover:underline"
                              >
                                View Receipt Slip
                              </a>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center items-center space-x-3">
                                <button
                                  onClick={() => handleApproveSlip(payment._id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-650 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition-colors shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectSlip(payment._id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-650 hover:bg-red-100 font-bold text-xs border border-red-200 transition-colors shadow-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {pendingBankSlips.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400 italic">No bank receipts awaiting manual approval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-8">
              {/* Student List & Permissions Matrix Override */}
              <div className="glass-panel rounded-3xl border-slate-100 overflow-hidden shadow-sm space-y-6 p-6 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-brand-500" />
                    <span>Student Access Controls (Manual Overrides)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Directly grant or revoke access to individual syllabus weeks for any student.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Student Name</th>
                        <th className="py-3 px-4 font-semibold">Email</th>
                        <th className="py-3 px-4 font-semibold">ID Card (NIC)</th>
                        <th className="py-3 px-4 font-semibold">Phone Number</th>
                        <th className="py-3 px-4 font-semibold">Unlocked Course Weeks (Click to Toggle access)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-900">{student.name}</td>
                          <td className="py-4 px-4 text-slate-500">{student.email}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-xs">{student.idNumber || 'N/A'}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-xs">{student.phoneNumber || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {weeks.map((week) => {
                                const hasWeekAccess = student.purchasedWeeks && student.purchasedWeeks.some(
                                  (w) => (w._id || w) === week._id
                                );
                                
                                return (
                                  <button
                                    key={week._id}
                                    onClick={() => toggleStudentWeekAccess(student._id, week._id, hasWeekAccess)}
                                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                      hasWeekAccess 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                                        : 'bg-red-50 text-red-650 border-red-200 hover:bg-red-100'
                                    }`}
                                  >
                                    <span>Week {week.weekNumber}</span>
                                    {hasWeekAccess ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 italic">No registered student profiles found on platform.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
