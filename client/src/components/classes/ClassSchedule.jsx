import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen, ChevronRight, Play, Lock } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

const ClassSchedule = ({ classes = [] }) => {
  const { hasAccess } = usePayment();

  // Helper: Get Sunday of the current week
  const getCalendarDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Find Sunday of this week
    const start = new Date(today);
    start.setDate(today.getDate() - currentDayOfWeek);
    
    const days = [];
    // Spanning 14 days (this week + next week)
    for (let i = 0; i < 14; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper: Get classes for a specific day
  const getClassesForDate = (date) => {
    return classes.filter((cls) => {
      const clsDate = new Date(cls.scheduleTime);
      return (
        clsDate.getDate() === date.getDate() &&
        clsDate.getMonth() === date.getMonth() &&
        clsDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDay = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Desktop Calendar Grid */}
      <div className="hidden md:block">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-3 mb-3 text-center">
          {weekdayNames.map((name) => (
            <div key={name} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
              {name}
            </div>
          ))}
        </div>

        {/* 14 Calendar cells */}
        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((day, idx) => {
            const dayClasses = getClassesForDate(day);
            const todayActive = isToday(day);
            const pastDay = isPastDay(day);

            return (
              <div
                key={idx}
                className={`min-h-[140px] p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  todayActive
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : pastDay
                    ? 'bg-slate-950/40 border-slate-900/60 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Day Header */}
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-mono font-bold ${
                    todayActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}>
                    {day.toLocaleDateString([], { month: 'short' })}
                  </span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    todayActive ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Day Classes Content */}
                <div className="flex-grow space-y-2 overflow-y-auto max-h-[85px] pr-1 scrollbar-thin">
                  {dayClasses.map((cls) => {
                    const price = cls.week?.price || 0;
                    const unlocked = price === 0 || hasAccess(cls.week?._id || cls.week, 'week');
                    const classTimeStr = new Date(cls.scheduleTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Link
                        key={cls._id}
                        to={unlocked ? `/live-classroom/${cls._id}` : `/checkout/week/${cls.week?._id || cls.week}`}
                        className={`block p-1.5 rounded-lg border text-left transition-all ${
                          unlocked
                            ? 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 hover:border-indigo-500/40'
                            : 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/40 hover:border-amber-500/40'
                        }`}
                        title={unlocked ? 'Join Class' : 'Locked - Click to Unlock'}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="text-[10px] font-bold text-white truncate leading-tight flex-1">
                            {cls.title}
                          </div>
                          {!unlocked && <Lock className="w-2.5 h-2.5 text-amber-500 flex-shrink-0 mt-0.5" />}
                        </div>
                        {cls.subject && (
                          <div className="text-[8px] font-semibold text-indigo-400 uppercase tracking-wide mt-0.5">
                            {cls.subject}
                          </div>
                        )}
                        <div className="text-[8px] font-mono text-slate-500 mt-0.5">
                          {classTimeStr}
                        </div>
                      </Link>
                    );
                  })}
                  {dayClasses.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic text-center pt-4">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Agenda List View */}
      <div className="block md:hidden space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
          Agenda (Next 2 Weeks)
        </h3>
        <div className="space-y-3">
          {calendarDays.map((day, idx) => {
            const dayClasses = getClassesForDate(day);
            const todayActive = isToday(day);
            if (dayClasses.length === 0) return null; // Only show days with classes on mobile

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  todayActive
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {/* Header for the Day */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/50 mb-3">
                  <span className="text-xs font-bold text-white">
                    {day.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {todayActive && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Classes list */}
                <div className="space-y-3">
                  {dayClasses.map((cls) => {
                    const price = cls.week?.price || 0;
                    const unlocked = price === 0 || hasAccess(cls.week?._id || cls.week, 'week');
                    const classTimeStr = new Date(cls.scheduleTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div key={cls._id} className="flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-white">{cls.title}</h4>
                            {cls.subject && (
                              <span className="text-[8px] uppercase font-bold tracking-wider bg-brand-500/10 text-indigo-400 border border-brand-500/20 px-1.5 py-0.2 rounded-full">
                                {cls.subject}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{classTimeStr}</span>
                            </span>
                            <span>•</span>
                            <span>{cls.duration} mins</span>
                          </div>
                        </div>

                        <Link
                          to={unlocked ? `/live-classroom/${cls._id}` : `/checkout/week/${cls.week?._id || cls.week}`}
                          className={`py-1.5 px-3 rounded-lg text-[10px] flex items-center space-x-1 flex-shrink-0 font-bold transition-all ${
                            unlocked 
                              ? 'btn-primary' 
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/10'
                          }`}
                        >
                          {unlocked ? <Play className="w-3 h-3 fill-white" /> : <Lock className="w-3 h-3" />}
                          <span>{unlocked ? 'Enter Room' : 'Unlock'}</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {classes.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 p-8 text-center rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <div className="text-xs text-slate-400 font-medium">No live lectures scheduled.</div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ClassSchedule;
