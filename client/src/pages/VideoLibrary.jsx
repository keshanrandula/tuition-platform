import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';
import api, { getMediaUrl } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WeeklyVideoList from '../components/videos/WeeklyVideoList';
import { Video, BookOpen, Lock, Unlock, Play, ChevronRight, Award, Search } from 'lucide-react';

const VideoLibrary = () => {
  const { hasAccess } = usePayment();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedWeekParam = searchParams.get('week');

  // API states
  const [weeks, setWeeks] = useState([]);
  const [videoSets, setVideoSets] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/view states
  const [activeTab, setActiveTab] = useState('weekly');
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const [weeksRes, setsRes, vidsRes] = await Promise.all([
          api.get('/videos/weeks'),
          api.get('/videos/sets'),
          api.get('/videos')
        ]);

        if (weeksRes.data.success) {
          const sortedWeeks = weeksRes.data.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
          setWeeks(sortedWeeks);
          
          if (selectedWeekParam) {
            setExpandedWeek(selectedWeekParam);
          } else if (sortedWeeks.length > 0) {
            setExpandedWeek(sortedWeeks[0]._id);
          }
        }
        
        if (setsRes.data.success) setVideoSets(setsRes.data.videoSets);
        if (vidsRes.data.success) setVideos(vidsRes.data.videos);

      } catch (err) {
        console.error('Error fetching library:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [selectedWeekParam]);

  const handlePlayVideo = (video) => {
    const isWeekVideo = video.week !== null && video.week !== undefined;
    const parentId = isWeekVideo ? (video.week._id || video.week) : (video.videoSet._id || video.videoSet);
    const parentType = isWeekVideo ? 'week' : 'videoSet';
    
    let isUnlocked = false;
    
    if (isWeekVideo) {
      const associatedWeek = weeks.find((w) => w._id === parentId);
      isUnlocked = associatedWeek?.price === 0 || hasAccess(parentId, 'week');
    } else {
      isUnlocked = hasAccess(parentId, 'videoSet');
    }

    if (isUnlocked) {
      navigate(`/video-player/${video._id}`);
    } else {
      navigate(`/checkout/${parentType}/${parentId}`);
    }
  };

  const filteredWeeks = weeks.filter((w) => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPackages = videoSets.filter((s) => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-10 bg-white text-slate-800">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center space-x-2">
            <Video className="w-8 h-8 text-brand-500" />
            <span>Course Study <span className="text-brand-500">Library</span></span>
          </h1>
          <p className="text-sm text-slate-400">
            Review recorded tutorials and complete syllabus milestones.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input !pl-9 w-full text-sm py-2"
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'weekly' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Weekly Syllabus Modules</span>
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'packages' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Crash Course Packages</span>
        </button>
      </div>

      {/* Tab Contents: 1. Weekly Modules */}
      {activeTab === 'weekly' && (
        <WeeklyVideoList />
      )}

      {/* Tab Contents: 2. Standalone Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in">
          {filteredPackages.map((set) => {
            const hasSetAccess = hasAccess(set._id, 'videoSet');
            const setVideos = videos.filter((v) => (v.videoSet?._id || v.videoSet) === set._id);

            return (
              <div key={set._id} className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border-slate-100 shadow-sm bg-white">
                <div>
                  <div className="h-40 relative bg-slate-50 border-b border-slate-100">
                    {set.thumbnailUrl && <img src={getMediaUrl(set.thumbnailUrl)} alt="" className="w-full h-full object-cover opacity-80" />}
                    <div className="absolute top-4 right-4 bg-brand-50 border border-brand-100 text-brand-500 text-xs font-extrabold px-3 py-1 rounded-full">
                      ${set.price.toFixed(2)} USD
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full mb-1 inline-block">
                        Stand-alone Subject Package
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{set.title}</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">{set.description}</p>
                    
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Video Playlist</span>
                      {setVideos.map((video) => (
                        <button
                          key={video._id}
                          onClick={() => handlePlayVideo(video)}
                          className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between group"
                        >
                          <span className="truncate pr-4 font-semibold group-hover:text-brand-500 transition-colors">
                            {video.title}
                          </span>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            {hasSetAccess ? (
                              <Play className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                            ) : (
                              <Lock className="w-3 h-3 text-amber-600" />
                            )}
                          </div>
                        </button>
                      ))}
                      {setVideos.length === 0 && <p className="text-xs text-slate-400 italic">No playlist tutorials added to this set yet.</p>}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {hasSetAccess ? (
                    <div className="text-center text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 py-2.5 rounded-lg">
                      Full Package Unlocked
                    </div>
                  ) : (
                    <Link
                      to={`/checkout/videoSet/${set._id}`}
                      className="w-full btn-primary py-2.5 text-center flex items-center justify-center space-x-2 text-xs font-semibold"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Buy Package for ${set.price}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default VideoLibrary;
