import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../context/PaymentContext';
import api, { getMediaUrl } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { ArrowLeft, Play, Lock, AlertCircle, FileText, ChevronRight, Video, Calendar, ShieldCheck } from 'lucide-react';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAccess } = usePayment();

  const [video, setVideo] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch current video and sidebar playlist items
  useEffect(() => {
    const fetchVideoAndPlaylist = async () => {
      try {
        setLoading(true);
        setError('');

        const videoRes = await api.get(`/videos/${id}`);
        if (videoRes.data.success) {
          const fetchedVideo = videoRes.data.video;
          setVideo(fetchedVideo);

          const weekId = fetchedVideo.week?._id || fetchedVideo.week;
          const setId = fetchedVideo.videoSet?._id || fetchedVideo.videoSet;
          const isWeekVideo = weekId !== null && weekId !== undefined;
          
          let unlocked = false;
          if (isWeekVideo) {
            unlocked = fetchedVideo.week?.price === 0 || hasAccess(weekId, 'week');
          } else if (setId) {
            unlocked = hasAccess(setId, 'videoSet');
          }

          if (!unlocked) {
            setError('Access Denied: You must purchase this module to view the lecture.');
            return;
          }

          // Fetch related videos (same week / same set)
          const allVidsRes = await api.get('/videos');
          if (allVidsRes.data.success) {
            const list = allVidsRes.data.videos.filter((v) => {
              if (isWeekVideo) {
                return (v.week?._id || v.week) === weekId;
              } else {
                return (v.videoSet?._id || v.videoSet) === setId;
              }
            });
            setPlaylist(list);
          }
        }
      } catch (err) {
        console.error('Error loading video player:', err);
        setError(err.response?.data?.message || 'Access Denied: Payment verification failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoAndPlaylist();
  }, [id]);

  // 2. Prevent keyboard shortcut downloads (e.g. Ctrl+S, Ctrl+U)
  useEffect(() => {
    const preventShortcuts = (e) => {
      if ((e.ctrlKey && (e.key === 's' || e.key === 'S')) || (e.ctrlKey && (e.key === 'u' || e.key === 'U'))) {
        e.preventDefault();
        alert('Downloading or viewing source is disabled for copyright security.');
      }
    };
    window.addEventListener('keydown', preventShortcuts);
    return () => window.removeEventListener('keydown', preventShortcuts);
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4 bg-white text-slate-800">
        <div className="glass-panel p-8 text-center rounded-2xl border-red-200 space-y-6 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Playback Locked</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
          <div className="pt-4">
            <Link to="/video-library" className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isWeekVideo = video.week !== null && video.week !== undefined;

  return (
    <div className="min-h-[90vh] bg-slate-950 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back navigation & header metadata */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/video-library')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-850 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400 block mb-0.5">
              {isWeekVideo ? `Week ${video.week.weekNumber} Recorded Session` : 'Crash Course Playlist'}
            </span>
            <h1 className="text-lg font-extrabold text-white leading-tight">{video.title}</h1>
          </div>
        </div>

        {/* Video Player + Related Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Video Viewport */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Custom wrapper with right-click block */}
            <div 
              onContextMenu={handleContextMenu}
              className="aspect-video rounded-3xl overflow-hidden border border-slate-850 shadow-2xl relative bg-slate-900 select-none shadow-black/40"
            >
              <ReactPlayer
                src={getMediaUrl(video.videoUrl)}
                controls
                playing
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
                onTimeUpdate={(e) => {
                  const currentTime = Math.round(e.target.currentTime);
                  const duration = e.target.duration;
                  const isCompleted = duration > 0 ? (e.target.currentTime / duration) >= 0.90 : false;
                  // Send every 5 seconds or when nearly finished (90%+)
                  if (currentTime % 5 === 0 || isCompleted) {
                    api.post(`/progress/video/${id}`, {
                      watchTime: currentTime,
                      completed: isCompleted
                    }).catch((err) => console.error('Error updating video progress:', err));
                  }
                }}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload', // Disable chrome download option
                      onContextMenu: handleContextMenu, // Double secure context-menu
                      disablePictureInPicture: true
                    }
                  }
                }}
              />
            </div>

            {/* Video description card */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
                <h2 className="text-md font-bold text-white leading-normal">{video.title}</h2>
                <div className="flex items-center space-x-1 text-[10px] bg-slate-950 border border-slate-800 text-emerald-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure Stream</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">{video.description}</p>
              
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-850">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Notice: Recorded broadcast playback is copyrighted. Screen recording or distribution is strictly prohibited.</span>
              </div>
            </div>

          </div>

          {/* Related Playlist Sidebar */}
          <div className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden flex flex-col h-[500px] lg:h-auto shadow-2xl">
            <div className="p-5 border-b border-slate-850 bg-slate-900/50 flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center space-x-2">
                <Video className="w-4.5 h-4.5 text-indigo-400" />
                <span>Related Videos (Same Week)</span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-950/20">
              {playlist.map((item) => {
                const isActive = item._id === video._id;
                return (
                  <button
                    key={item._id}
                    onClick={() => {
                      if (!isActive) navigate(`/video-player/${item._id}`);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                      isActive
                        ? 'bg-indigo-650/10 border-indigo-500/30 text-indigo-400 font-bold shadow-md shadow-indigo-650/5'
                        : 'border-slate-850 bg-slate-900/40 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-850 text-slate-500'
                    }`}>
                      <Play className={`w-3.5 h-3.5 ${isActive ? 'fill-white ml-0.5' : ''}`} />
                    </div>
                    
                    <div className="truncate flex-1">
                      <h4 className="text-xs font-bold truncate">{item.title}</h4>
                      {item.duration > 0 && (
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          Duration: {Math.round(item.duration / 60)} mins
                        </span>
                      )}
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  </button>
                );
              })}
              {playlist.length <= 1 && (
                <div className="text-center py-10 text-slate-600 italic text-xs">
                  No other recordings cataloged for this week.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
