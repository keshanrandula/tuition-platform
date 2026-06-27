import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  ArrowLeft, BookOpen, AlertCircle, Edit, Save, Download, 
  Clock, Calendar, ExternalLink, FileText, CheckCircle 
} from 'lucide-react';

const LiveClassRoom = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiveToday, setIsLiveToday] = useState(false);
  const [fallbackToUpcoming, setFallbackToUpcoming] = useState(false);

  // Notes state
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState(null);

  // 1. Fetch class details (Specific ID or Today's Live or Next Upcoming)
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (id) {
          // If a specific ID is provided in the path
          const response = await api.get(`/classes/${id}`);
          if (response.data.success && response.data.class) {
            const cls = response.data.class;
            setLiveClass(cls);
            
            // Check if class is scheduled for today
            const classDate = new Date(cls.scheduleTime);
            const today = new Date();
            const isScheduledToday = classDate.getDate() === today.getDate() &&
                                     classDate.getMonth() === today.getMonth() &&
                                     classDate.getFullYear() === today.getFullYear();
            setIsLiveToday(isScheduledToday);
            setFallbackToUpcoming(false);
          } else {
            throw new Error('Class not found');
          }
        } else {
          // No ID: Try to load today's live class
          const response = await api.get('/classes/live');
          if (response.data.success && response.data.class) {
            setLiveClass(response.data.class);
            setIsLiveToday(true);
            setFallbackToUpcoming(false);
          } else {
            // No class today, fallback to the next upcoming class
            const upcomingRes = await api.get('/classes');
            if (upcomingRes.data.success && upcomingRes.data.classes && upcomingRes.data.classes.length > 0) {
              setLiveClass(upcomingRes.data.classes[0]);
              setIsLiveToday(false);
              setFallbackToUpcoming(true);
            } else {
              setLiveClass(null);
              setIsLiveToday(false);
              setFallbackToUpcoming(false);
            }
          }
        }
      } catch (err) {
        console.error('Error loading classroom:', err);
        setError(err.response?.data?.message || 'Access Denied: You do not have permissions for this room.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);

  // Load saved notes once liveClass is loaded
  useEffect(() => {
    if (liveClass) {
      const savedNotes = localStorage.getItem(`notes_class_${liveClass._id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      } else {
        setNotes('');
      }
    }
  }, [liveClass]);

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!liveClass) return;

    const timerFunc = () => {
      const difference = new Date(liveClass.scheduleTime) - new Date();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    timerFunc();
    const intervalId = setInterval(timerFunc, 1000);

    return () => clearInterval(intervalId);
  }, [liveClass]);

  const saveNotes = () => {
    if (liveClass) {
      localStorage.setItem(`notes_class_${liveClass._id}`, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const downloadNotes = () => {
    if (!liveClass) return;
    const element = document.createElement('a');
    const file = new Blob([notes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${liveClass.title.replace(/\s+/g, '_')}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleJoinClassClick = async () => {
    try {
      await api.post(`/progress/class/${liveClass._id}`);
    } catch (err) {
      console.error('Error logging class attendance:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="glass-panel p-8 text-center rounded-2xl border-red-500/20 space-y-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          <div className="pt-4">
            <Link to="/dashboard" className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="glass-panel p-8 text-center rounded-2xl border-brand-500/10 space-y-6">
          <Calendar className="w-12 h-12 text-indigo-400 mx-auto" />
          <h2 className="text-xl font-bold text-white font-sans">No Live Classes</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            There are no classes scheduled for today and no upcoming sessions in the schedule catalog.
          </p>
          <div className="pt-4">
            <Link to="/dashboard" className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isClassStarted = !timeLeft;
  const meetingLink = liveClass.meetingLink || liveClass.meetingUrl || '#';

  return (
    <div className="min-h-[90vh] bg-slate-950 flex flex-col font-sans">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="text-xl font-extrabold text-white">{liveClass.title}</h1>
              {liveClass.subject && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-500/10 text-indigo-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                  {liveClass.subject}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled for: {new Date(liveClass.scheduleTime).toLocaleString()} ({liveClass.duration} mins)
            </p>
          </div>
        </div>

        {/* Live Broadcast Badge Status */}
        {isLiveToday && isClassStarted ? (
          <div className="flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Class is Active</span>
          </div>
        ) : fallbackToUpcoming ? (
          <div className="flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-full">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Next Upcoming Class</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-indigo-500/15 border border-indigo-500/30 px-4 py-1.5 rounded-full">
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Upcoming Today</span>
          </div>
        )}
      </div>

      {/* Main split display: Details on Left, Notes on Right */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Live class details, countdown, Join Button */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-start">
          
          {fallbackToUpcoming && (
            <div className="bg-slate-900 border border-indigo-500/20 p-4 rounded-2xl flex items-start space-x-3.5 shadow-md">
              <AlertCircle className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-400 leading-normal">
                <span className="font-bold text-white block mb-0.5">No Active Classes Today</span>
                There are no live broadcasts scheduled for today. We are displaying the next upcoming lecture scheduled in the calendar below.
              </div>
            </div>
          )}

          {/* Interactive Widget Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden min-h-[320px]">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full"></div>
            
            {!isClassStarted ? (
              /* Count Down View */
              <div className="space-y-6 animate-fade-in w-full">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Broadcast Starts In</span>
                </div>
                
                {timeLeft && (
                  <div className="flex justify-center items-center gap-4 sm:gap-6">
                    {timeLeft.days > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-950 border border-slate-800 text-white text-3xl sm:text-4xl font-extrabold w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center shadow-inner font-mono">
                          {timeLeft.days}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Days</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950 border border-slate-800 text-white text-3xl sm:text-4xl font-extrabold w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center shadow-inner font-mono">
                        {timeLeft.hours}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Hours</span>
                    </div>
                    <span className="text-2xl text-slate-700 font-bold mb-6">:</span>
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950 border border-slate-800 text-white text-3xl sm:text-4xl font-extrabold w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center shadow-inner font-mono">
                        {timeLeft.minutes}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Mins</span>
                    </div>
                    <span className="text-2xl text-slate-700 font-bold mb-6">:</span>
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950 border border-slate-800 text-brand-400 text-3xl sm:text-4xl font-extrabold w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center shadow-inner font-mono">
                        {timeLeft.seconds}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Secs</span>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Please keep this window open or return when the countdown reaches zero to access the live stream link.
                </p>
              </div>
            ) : (
              /* Join Class Link Button view */
              <div className="space-y-6 animate-fade-in w-full max-w-md">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <BookOpen className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Lecture Broadcast is Live</h3>
                  <p className="text-xs text-slate-400">
                    The tuition broadcast room has been initiated. Click below to open the secure interactive classroom (Zoom/Jitsi/Google Meet) in a new browser tab. You can keep this page open to take study notes on the right!
                  </p>
                </div>

                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleJoinClassClick}
                  className="w-full inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-indigo-650 to-brand-650 hover:from-indigo-600 hover:to-brand-600 text-white font-extrabold py-4 px-8 rounded-2xl shadow-lg shadow-indigo-600/15 transform active:scale-95 transition-all text-sm uppercase tracking-wider"
                >
                  <span>Join Live Lecture Room</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Details & Notes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                <span>Class Agenda</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {liveClass.description || "No description provided for this session."}
              </p>
            </div>

            {/* Teacher Notes Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-indigo-400" />
                <span>Teacher Instructions</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                {liveClass.teacherNotes || "No specific instructions or references have been uploaded by the teacher."}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Personal Notepad */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden h-[500px] lg:h-auto shadow-2xl">
          <div className="p-5 border-b border-slate-850 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Edit className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                My Study Notes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={downloadNotes}
                title="Download notes file"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={saveNotes}
                className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-bold py-2 px-3.5 rounded-xl transition-all shadow-md shadow-indigo-650/10"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{notesSaved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-hidden flex flex-col bg-slate-950/20">
            <textarea
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 resize-none font-sans leading-relaxed shadow-inner"
              placeholder="Keep track of formulas, calculations, and whiteboard highlights during the lecture..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveClassRoom;
