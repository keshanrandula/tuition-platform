import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../context/PaymentContext';
import api from '../../utils/api';
import { BookOpen, Video, Calendar, Lock, Unlock, Play, ChevronRight, Award, Clock, Megaphone } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { hasAccess } = usePayment();
  const [weeks, setWeeks] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [progressSummary, setProgressSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'analytics'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [weeksRes, classesRes, noticesRes, progressRes] = await Promise.all([
          api.get('/videos/weeks'),
          api.get('/classes'),
          api.get('/notices'),
          api.get('/progress/summary')
        ]);
        if (weeksRes.data.success) setWeeks(weeksRes.data.weeks);
        if (classesRes.data.success) {
          const sortedClasses = classesRes.data.classes
            .filter((c) => new Date(c.scheduleTime) > new Date(Date.now() - 3 * 3600000))
            .sort((a, b) => new Date(a.scheduleTime) - new Date(b.scheduleTime));
          setLiveClasses(sortedClasses);
        }
        if (noticesRes.data.success) {
          setNotices(noticesRes.data.notices || []);
        }
        if (progressRes.data.success) {
          setProgressSummary(progressRes.data.summary);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getUpcomingClass = () => {
    if (liveClasses.length === 0) return null;
    return liveClasses[0];
  };

  const generateCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
    bgGrad.addColorStop(0, '#fbfbfb');
    bgGrad.addColorStop(0.5, '#f4f4f5');
    bgGrad.addColorStop(1, '#e4e4e7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1130);

    // Luxury outer borders
    ctx.strokeStyle = '#d97706'; // Gold
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 1520, 1050);

    ctx.strokeStyle = '#4f46e5'; // Indigo
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1480, 1010);

    // Corners
    ctx.fillStyle = '#d97706';
    ctx.fillRect(40, 40, 80, 20);
    ctx.fillRect(40, 40, 20, 80);
    ctx.fillRect(1480, 40, 80, 20);
    ctx.fillRect(1540, 40, 20, 80);
    ctx.fillRect(40, 1070, 80, 20);
    ctx.fillRect(40, 1010, 20, 80);
    ctx.fillRect(1480, 1070, 80, 20);
    ctx.fillRect(1540, 1010, 20, 80);

    // Content
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText('ACADEMIC COMPLETION CERTIFICATE', 800, 220);

    ctx.fillStyle = '#6b7280';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('This is proudly presented to', 800, 310);

    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 68px Georgia, serif';
    ctx.fillText(user?.name || 'STUDENT NAME', 800, 430);

    // Line under name
    ctx.beginPath();
    ctx.moveTo(500, 470);
    ctx.lineTo(1100, 470);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = '22px sans-serif';
    ctx.fillText('for successfully completing all syllabus modules, participating in live lessons,', 800, 550);
    ctx.fillText('and scoring above the required average on all weekly practice examinations.', 800, 595);

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('ADVANCED CURRICULUM TUITION PLATFORM', 800, 680);

    // Signatures
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Professor Smith', 450, 890);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Chief Academic Instructor', 450, 920);

    ctx.beginPath();
    ctx.moveTo(350, 850);
    ctx.lineTo(550, 850);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Date
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(new Date().toLocaleDateString(), 1150, 890);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Date of Completion', 1150, 920);

    ctx.beginPath();
    ctx.moveTo(1050, 850);
    ctx.lineTo(1250, 850);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Gold verified seal
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(800, 870, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('OFFICIAL', 800, 855);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('VERIFIED', 800, 880);
    ctx.font = '11px sans-serif';
    ctx.fillText('EXCELLENCE', 800, 902);

    // Download PNG
    const link = document.createElement('a');
    link.download = `${user?.name.replace(/\s+/g, '_')}_completion_certificate.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const upcomingClass = getUpcomingClass();
  const totalWeeksCount = weeks.length;
  const unlockedWeeksCount = weeks.filter((w) => w.price === 0 || hasAccess(w._id, 'week')).length;
  const unlockPercentage = totalWeeksCount > 0 ? Math.round((unlockedWeeksCount / totalWeeksCount) * 100) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-10 bg-white">
      
      {/* Head Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-brand-600 to-brand-500 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-brand-500/10 text-white">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="space-y-1.5 relative">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hello, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-sm text-brand-100">
            Welcome to your tuition portal. Keep track of scheduled streams and homework targets.
          </p>
        </div>

        {/* Progress gauge */}
        <div className="flex items-center space-x-4 bg-brand-700/30 px-5 py-3 rounded-xl border border-white/10">
          <div className="text-right">
            <span className="text-xs text-brand-100 font-semibold block">Curriculum Progress</span>
            <span className="text-lg font-bold text-white">{unlockedWeeksCount} / {totalWeeksCount} Modules</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.15)" strokeWidth="4" fill="transparent" />
              <circle 
                cx="24" cy="24" r="20" stroke="#ffffff" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - unlockPercentage / 100)}
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">{unlockPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'courses'
              ? 'border-brand-500 text-brand-650'
              : 'border-transparent text-slate-450 hover:text-slate-600'
          }`}
        >
          My Courses
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-brand-500 text-brand-650'
              : 'border-transparent text-slate-450 hover:text-slate-600'
          }`}
        >
          Learning Progress & Analytics
        </button>
      </div>

      {activeTab === 'courses' ? (
        /* Main Courses View Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Left 2 Cols: Weeks Syllabus list */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-brand-500" />
              <span>Course Syllabus Modules</span>
            </h2>

            <div className="space-y-8">
              {Object.entries(
                weeks.reduce((acc, week) => {
                  const subject = week.subject || 'General';
                  if (!acc[subject]) acc[subject] = [];
                  acc[subject].push(week);
                  return acc;
                }, {})
              ).map(([subject, subjectWeeks]) => (
                <div key={subject} className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                    <span>{subject} Modules</span>
                  </h3>
                  <div className="space-y-4">
                    {subjectWeeks.map((week) => {
                      const weekUnlocked = week.price === 0 || hasAccess(week._id, 'week');
                      return (
                        <div 
                          key={week._id} 
                          className={`glass-panel border-l-4 p-5 rounded-r-xl transition-all duration-300 bg-white shadow-sm ${
                            weekUnlocked 
                              ? 'border-l-emerald-500 hover:border-l-emerald-450 hover:shadow-md' 
                              : 'border-l-amber-500 hover:border-l-amber-450 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                                  Week {week.weekNumber}
                                </span>
                                {weekUnlocked ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center">
                                    <Unlock className="w-3 h-3 mr-1" /> Unlocked
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center">
                                    <Lock className="w-3 h-3 mr-1" /> Locked
                                  </span>
                                )}
                              </div>
                              <h3 className="text-md font-bold text-slate-900">{week.title}</h3>
                              <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                                {week.description}
                              </p>
                            </div>

                            <div className="flex-shrink-0 w-full sm:w-auto">
                              {weekUnlocked ? (
                                <Link
                                  to={`/video-library?week=${week._id}`}
                                  className="w-full btn-primary py-2 px-4 text-xs flex items-center justify-center space-x-2 font-bold"
                                >
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                  <span>Enter Module</span>
                                </Link>
                              ) : (
                                <Link
                                  to={`/checkout/week/${week._id}`}
                                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Buy for ${week.price.toFixed(2)}</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Live Class Highlight & Notice Board */}
          <div className="space-y-10">
            {/* Live Schedule */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                <span>Live Schedule</span>
              </h2>

              {upcomingClass ? (
                <div className="glass-panel p-6 rounded-2xl border-brand-500/10 shadow-md space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-500/5 to-transparent rounded-bl-full"></div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
                      Upcoming Stream
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{upcomingClass.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {upcomingClass.description}
                    </p>
                  </div>

                  {/* Time Display */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-brand-500 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(upcomingClass.scheduleTime).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Time: {new Date(upcomingClass.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({upcomingClass.duration} mins)
                    </div>
                  </div>

                  {/* Action pathway depending on week access */}
                  {hasAccess(upcomingClass.week?._id, 'week') || upcomingClass.week?.price === 0 ? (
                    <Link
                      to={`/live-classroom/${upcomingClass._id}`}
                      className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Join Classroom</span>
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-1.5 text-xs text-amber-600 bg-amber-55 p-3 rounded-lg border border-amber-100">
                        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>You must buy Week {upcomingClass.week?.weekNumber} to access this stream.</span>
                      </div>
                      <Link
                        to={`/checkout/week/${upcomingClass.week?._id}`}
                        className="w-full bg-amber-605 hover:bg-amber-505 text-white font-semibold py-2.5 rounded-lg text-sm transition-all text-center block"
                      >
                        Unlock Week {upcomingClass.week?.weekNumber}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-panel p-6 rounded-2xl text-center space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-800">No Streams Scheduled</h3>
                  <p className="text-xs text-slate-400">Check back later for newly scheduled review lectures.</p>
                </div>
              )}
            </div>

            {/* Notice Board Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-brand-500" />
                <span>Announcements / නිවේදන</span>
              </h2>

              <div className="space-y-4">
                {notices.length > 0 ? (
                  notices.map((notice) => (
                    <div key={notice._id} className="glass-panel p-5 rounded-2xl border-slate-100 bg-white shadow-sm space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-brand-500/5 to-transparent rounded-bl-full"></div>
                      
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold text-slate-800 pr-4">{notice.title}</h3>
                        {notice.targetType === 'class' && (
                          <span className="text-[8px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap border border-brand-100">
                            Class Specific
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                        {notice.content}
                      </p>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold pt-2 border-t border-slate-50">
                        <span>Posted: {new Date(notice.createdAt).toLocaleDateString()}</span>
                        {notice.targetClass && (
                          <span className="text-brand-500 font-semibold max-w-[120px] truncate" title={notice.targetClass.title}>
                            Class: {notice.targetClass.title}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel p-6 rounded-2xl text-center space-y-2">
                    <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-semibold text-slate-850">No New Announcements</h3>
                    <p className="text-xs text-slate-400">All caught up! Check back later for official class notices.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics and Progress Tracking Tab */
        <div className="space-y-8 animate-fade-in text-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Completion Gauge / Certificate Card */}
            <div className="glass-panel p-6 rounded-2xl border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Overall Progress Score</h3>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="72" cy="72" r="62" stroke="#4f46e5" strokeWidth="12" fill="transparent"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - (progressSummary?.overallCompletionRate || 0) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-indigo-950">{progressSummary?.overallCompletionRate || 0}%</span>
              </div>

              <div className="space-y-2 max-w-xs">
                {progressSummary && progressSummary.overallCompletionRate >= 80 ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl">
                      🎉 Congratulations! You have unlocked your Course Completion Certificate.
                    </div>
                    <button
                      onClick={generateCertificate}
                      className="w-full btn-primary py-3 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-md shadow-brand-500/10"
                    >
                      <Award className="w-5 h-5" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 leading-normal bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-0.5">Certificate Locked</span>
                    Reach an overall progress score of <strong>80% or higher</strong> across watched lectures, quiz tests, and live attendance to claim your certificate.
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics Columns */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Metric 1: Videos */}
              <div className="glass-panel p-5 rounded-2xl border-slate-100 bg-white shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Lectures Watched</span>
                  <h4 className="text-2xl font-black text-slate-900">
                    {progressSummary?.watchedVideosCount || 0} <span className="text-xs text-slate-400 font-bold">/ {progressSummary?.totalVideosCount || 0}</span>
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
                      style={{ width: `${progressSummary?.videoCompletionRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase">{progressSummary?.videoCompletionRate || 0}% Completed</span>
                </div>
              </div>

              {/* Metric 2: Quiz Marks */}
              <div className="glass-panel p-5 rounded-2xl border-slate-100 bg-white shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Quiz Accuracy</span>
                  <h4 className="text-2xl font-black text-slate-900">
                    {progressSummary?.averageQuizScore || 0}% <span className="text-xs text-slate-400 font-bold">Avg</span>
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                      style={{ width: `${progressSummary?.averageQuizScore || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase">Attempted {progressSummary?.completedQuizzesCount || 0} Quizzes</span>
                </div>
              </div>

              {/* Metric 3: Live Class Attendance */}
              <div className="glass-panel p-5 rounded-2xl border-slate-100 bg-white shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Live Attendance</span>
                  <h4 className="text-2xl font-black text-slate-900">
                    {progressSummary?.attendedClassesCount || 0} <span className="text-xs text-slate-400 font-bold">/ {progressSummary?.totalClassesCount || 0}</span>
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                      style={{ width: `${progressSummary?.classAttendanceRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase">{progressSummary?.classAttendanceRate || 0}% Attended</span>
                </div>
              </div>

            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            
            {/* Quizzes Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border-slate-100 bg-white shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Award className="w-4.5 h-4.5 text-amber-500" />
                <span>Practice Quiz Results</span>
              </h3>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {progressSummary?.details?.quizScores && progressSummary.details.quizScores.length > 0 ? (
                  progressSummary.details.quizScores.map((q, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Week Module</span>
                        <span className="text-xs font-bold text-slate-800">Attempted Test {idx + 1}</span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg">
                        {q.score} / {q.totalQuestions} ({Math.round((q.score / q.totalQuestions) * 100)}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No quiz submissions logged yet.</p>
                )}
              </div>
            </div>

            {/* Live Class Attendance Logs */}
            <div className="glass-panel p-6 rounded-2xl border-slate-100 bg-white shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Calendar className="w-4.5 h-4.5 text-emerald-500" />
                <span>Attendance Logs</span>
              </h3>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {progressSummary?.details?.attendedClasses && progressSummary.details.attendedClasses.length > 0 ? (
                  progressSummary.details.attendedClasses.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                        <span className="text-xs font-bold text-slate-800">Participated in Live Session</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                        {new Date(c.attendedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No attendance records logged yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
