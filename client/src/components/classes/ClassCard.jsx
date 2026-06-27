import React from 'react';
import { Link } from 'react-router-dom';
import { usePayment } from '../../context/PaymentContext';
import { Calendar, Clock, Lock, Play } from 'lucide-react';

const ClassCard = ({ liveClass }) => {
  const { hasAccess } = usePayment();
  const weekId = liveClass.week?._id || liveClass.week;
  const price = liveClass.week?.price || 0;
  
  const isUnlocked = price === 0 || hasAccess(weekId, 'week');
  const classDate = new Date(liveClass.scheduleTime);
  const isUpcoming = classDate > new Date();

  return (
    <div className="glass-panel p-5 rounded-2xl border-brand-500/10 shadow hover:border-brand-500/35 transition-all duration-300 flex flex-col justify-between h-full">
      <div className="space-y-4">
        
        {/* Header Tags */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-indigo-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
            Week {liveClass.week?.weekNumber || 'N/A'}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isUpcoming ? 'bg-indigo-500/15 text-indigo-300' : 'bg-slate-500/15 text-slate-400'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Past Session'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-snug">{liveClass.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{liveClass.description}</p>
        
        {/* Timing */}
        <div className="space-y-2 pt-2 text-slate-300 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{classDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({liveClass.duration} mins)</span>
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="pt-5 border-t border-darkBg-border/40 mt-5">
        {isUnlocked ? (
          <Link
            to={`/live-classroom/${liveClass._id}`}
            className="w-full btn-primary py-2 text-xs flex items-center justify-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Join Live Room</span>
          </Link>
        ) : (
          <Link
            to={`/checkout/week/${weekId}`}
            className="w-full bg-amber-600/90 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Week {liveClass.week?.weekNumber} for ${price}</span>
          </Link>
        )}
      </div>

    </div>
  );
};

export default ClassCard;
