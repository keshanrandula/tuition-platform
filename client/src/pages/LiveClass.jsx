import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ClassSchedule from '../components/classes/ClassSchedule';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, HelpCircle } from 'lucide-react';

const LiveClass = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes');
        if (response.data.success) {
          setClasses(response.data.classes);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
          <Calendar className="w-8 h-8 text-indigo-400" />
          <span>Live Lectures <span className="text-gradient-primary">Schedule</span></span>
        </h1>
        <p className="text-sm text-slate-400">
          Join your class scheduled broadcast room. Lock tags display paid weekly modules access.
        </p>
      </div>

      <ClassSchedule classes={classes} />

      {/* Embedded instructions */}
      <div className="glass-panel p-5 rounded-2xl border-darkBg-border/40 max-w-3xl flex items-start space-x-3.5">
        <HelpCircle className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-200">How do Live Lectures work?</h4>
          <p>
            Scheduled classes will appear on your calendar. Click on any class to enter the classroom. 
            If a class is marked with a <strong>Lock Icon</strong>, click to navigate to the Checkout page and unlock that Week's module. 
            Inside the classroom page, the <strong>Join Class</strong> button will activate once the countdown finishes, directing you to the secure interactive lecture broadcast.
          </p>
        </div>
      </div>

    </div>
  );
};

export default LiveClass;
