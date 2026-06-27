import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePayment } from '../../context/PaymentContext';
import api, { getMediaUrl } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Play, Lock, Unlock, Calendar, Clock, Video, ChevronDown, FileText, Download, HelpCircle } from 'lucide-react';
import WeeklyQuiz from './WeeklyQuiz';

const WeeklyVideoList = () => {
  const navigate = useNavigate();
  const { hasAccess } = usePayment();

  // State
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('All');
  const [videosLoading, setVideosLoading] = useState(false);
  const [error, setError] = useState('');
  const [subTab, setSubTab] = useState('videos');
  const [pendingPayments, setPendingPayments] = useState([]);

  const fetchPendingPayments = async () => {
    try {
      const response = await api.get('/payments/my-pending');
      if (response.data.success) {
        setPendingPayments(response.data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching student pending payments:', err);
    }
  };

  // 1. Fetch weeks containing videos on mount
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/videos/weeks');
        if (response.data.success && response.data.weeks) {
          const sortedWeeks = response.data.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
          setWeeks(sortedWeeks);
          if (sortedWeeks.length > 0) {
            setSelectedWeek(sortedWeeks[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching weekly video structure:', err);
        setError('Failed to load weeks list.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeeks();
    fetchPendingPayments();
  }, []);

  // 2. Fetch videos for the selected week whenever it changes
  useEffect(() => {
    if (!selectedWeek) return;
    setSubTab('videos');

    const fetchWeekVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await api.get(`/videos/week/${selectedWeek.weekNumber}`);
        if (response.data.success && response.data.videos) {
          setVideos(response.data.videos);
        }
      } catch (err) {
        console.error('Error loading week videos:', err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchWeekVideos();
  }, [selectedWeek]);

  const isWeekPending = selectedWeek && pendingPayments.some(
    (p) => p.itemId === selectedWeek._id && p.itemType === 'week'
  );

  const handleDownload = async (fileUrl, title) => {
    try {
      const url = getMediaUrl(fileUrl);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      let filename = title || 'download';
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename = `${filename}.pdf`;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed, falling back to open in new tab:', error);
      const url = getMediaUrl(fileUrl);
      window.open(url, '_blank');
    }
  };

  const handleSubjectChange = (subj) => {
    setActiveSubject(subj);
    const filtered = subj === 'All' ? weeks : weeks.filter((w) => (w.subject || 'General') === subj);
    if (filtered.length > 0) {
      const currentStillVisible = filtered.some((w) => w._id === selectedWeek?._id);
      if (!currentStillVisible) {
        setSelectedWeek(filtered[0]);
      }
    } else {
      setSelectedWeek(null);
    }
  };

  const handlePlayVideo = (video) => {
    const price = selectedWeek?.price || 0;
    const isUnlocked = price === 0 || hasAccess(selectedWeek?._id, 'week');
    
    if (isUnlocked) {
      navigate(`/video-player/${video._id}`);
    } else if (isWeekPending) {
      alert('Your bank deposit slip is currently being reviewed by admin. Please wait.');
    } else {
      navigate(`/checkout/week/${selectedWeek?._id}`);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto p-6 space-y-4">
        <p className="text-sm font-semibold text-slate-500">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary py-2 px-4 text-xs font-semibold">
          Retry
        </button>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="text-center py-12 glass-panel border-slate-100 rounded-2xl max-w-lg mx-auto p-8 space-y-4 bg-white shadow-sm">
        <Video className="w-12 h-12 text-slate-350 mx-auto" />
        <h3 className="text-md font-bold text-slate-800">No Recorded Lectures Yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          No weekly lecture recordings have been uploaded to the tuition catalog database. Please check back later.
        </p>
      </div>
    );
  }

  const isWeekUnlocked = selectedWeek && (selectedWeek.price === 0 || hasAccess(selectedWeek._id, 'week'));

  const visibleWeeks = activeSubject === 'All' ? weeks : weeks.filter((w) => (w.subject || 'General') === activeSubject);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Subject Filter Pills */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-0.5">Filter by Subject</span>
        <div className="flex flex-wrap gap-2">
          {['All', ...new Set(weeks.map((w) => w.subject || 'General'))].map((subj) => {
            const isActive = activeSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => handleSubjectChange(subj)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/10'
                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Selection Layout (Tabs on desktop, Select Dropdown on Mobile) */}
      <div className="space-y-4">
        {/* Mobile Dropdown selection */}
        <div className="block sm:hidden relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Select Week Module</label>
          <div className="relative">
            <select
              value={selectedWeek?.weekNumber || ''}
              onChange={(e) => {
                const wk = weeks.find(w => w.weekNumber === parseInt(e.target.value));
                if (wk) setSelectedWeek(wk);
              }}
              className="glass-input w-full py-2.5 pl-4 pr-10 appearance-none text-xs font-semibold text-slate-700 bg-white"
            >
              {visibleWeeks.map((w) => (
                <option key={w._id} value={w.weekNumber}>
                  Week {w.weekNumber}: {w.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Desktop Tab Menu */}
        <div className="hidden sm:flex flex-wrap gap-2.5 border-b border-slate-100 pb-4">
          {visibleWeeks.map((w) => {
            const isSelected = selectedWeek?.weekNumber === w.weekNumber;
            const weekUnlocked = w.price === 0 || hasAccess(w._id, 'week');
            return (
              <button
                key={w._id}
                onClick={() => setSelectedWeek(w)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-brand-50 border-brand-100 text-brand-700 shadow-sm shadow-brand-500/5'
                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Week {w.weekNumber}</span>
                {!weekUnlocked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Week Info Banner */}
      {selectedWeek && (
        <div className="glass-panel p-6 rounded-2xl border-slate-100 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 block">
              Syllabus Module {selectedWeek.weekNumber}
            </span>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedWeek.title}</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{selectedWeek.description}</p>
          </div>

          <div className="flex-shrink-0">
            {isWeekUnlocked ? (
              <span className="inline-flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlocked Access</span>
              </span>
            ) : isWeekPending ? (
              <span className="inline-flex items-center space-x-1.5 text-amber-600 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-full text-xs font-bold animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-550" />
                <span>Pending Bank Approval</span>
              </span>
            ) : (
              <Link
                to={`/checkout/week/${selectedWeek._id}`}
                className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-amber-650/15"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock for ${selectedWeek.price}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Sub-navigation tabs: Videos vs Quiz */}
      {selectedWeek && (
        <div className="flex border-b border-slate-150 gap-6">
          <button
            onClick={() => setSubTab('videos')}
            className={`pb-2.5 font-bold text-xs transition-all border-b-2 flex items-center space-x-1.5 ${
              subTab === 'videos' 
                ? 'border-brand-500 text-brand-500' 
                : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Lecture Videos</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`pb-2.5 font-bold text-xs transition-all border-b-2 flex items-center space-x-1.5 ${
              subTab === 'quiz' 
                ? 'border-brand-500 text-brand-500' 
                : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice Quiz</span>
          </button>
        </div>
      )}

      {subTab === 'videos' ? (
        <>
          {/* PDF Resources / Notes Section */}
          {selectedWeek && selectedWeek.resources && selectedWeek.resources.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border-slate-100 bg-white shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Lecture Notes & PDF Resources
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWeek.resources.map((resource) => (
                  <div 
                    key={resource._id} 
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all bg-white"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-2.5 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-800 block truncate" title={resource.title}>
                          {resource.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Uploaded: {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 pl-2">
                      {!resource.isLocked ? (
                        <button
                          onClick={() => handleDownload(resource.fileUrl, resource.title)}
                          className="inline-flex items-center space-x-1 text-[10px] font-bold text-white bg-brand-500 hover:bg-brand-650 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-brand-500/10"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos List Grid */}
          {videosLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => handlePlayVideo(video)}
                  className={`group glass-panel rounded-2xl overflow-hidden border-slate-100 hover:border-brand-500/25 transition-all duration-300 shadow-sm hover:shadow-lg bg-white flex flex-col justify-between cursor-pointer ${
                    !isWeekUnlocked ? 'opacity-85' : ''
                  }`}
                >
                  <div>
                    {/* Video Preview Frame */}
                    <div className="aspect-video relative bg-slate-900 overflow-hidden flex items-center justify-center">
                      {video.thumbnailUrl ? (
                        <img 
                          src={getMediaUrl(video.thumbnailUrl)} 
                          alt="" 
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 opacity-80" 
                        />
                      ) : (
                        <Video className="w-8 h-8 text-slate-700" />
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300">
                          {isWeekUnlocked ? <Play className="w-5 h-5 fill-white text-white ml-0.5" /> : <Lock className="w-5 h-5 text-white" />}
                        </div>
                      </div>

                      {/* Duration overlay badge */}
                      {video.duration > 0 && (
                        <span className="absolute bottom-2.5 right-2.5 bg-slate-950/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </div>

                    {/* Video Info details */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(video.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{video.duration > 0 ? `${Math.round(video.duration / 60)} mins` : 'Video'}</span>
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-brand-500 transition-colors line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Card Footer Action path */}
                  <div className="p-4 pt-0 border-t border-slate-50/50 mt-2">
                    {isWeekUnlocked ? (
                      <span className="w-full text-center text-[10px] font-bold text-brand-500 hover:text-brand-600 flex items-center justify-center space-x-1.5 pt-3">
                        <Play className="w-3 h-3 fill-brand-500" />
                        <span>Watch Recording</span>
                      </span>
                    ) : isWeekPending ? (
                      <span className="w-full text-center text-[10px] font-bold text-amber-600 flex items-center justify-center space-x-1.5 pt-3 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Pending Bank Approval</span>
                      </span>
                    ) : (
                      <span className="w-full text-center text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center justify-center space-x-1.5 pt-3">
                        <Lock className="w-3 h-3" />
                        <span>Unlock Week {selectedWeek.weekNumber}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {videos.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 italic text-xs">
                  No lecture recordings cataloged for this week module yet.
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <WeeklyQuiz weekId={selectedWeek._id} isUnlocked={isWeekUnlocked} />
      )}

    </div>
  );
};

export default WeeklyVideoList;
