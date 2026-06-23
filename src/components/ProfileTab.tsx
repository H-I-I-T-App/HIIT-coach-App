import { useState } from 'react';
import { X } from 'lucide-react';
import type { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface Props {
  profile: UserProfile;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function renderMonth(
  year: number, 
  month: number, 
  completedDates: string[], 
  startDate: Date | null, 
  today: Date, 
  onClick?: (month: number) => void,
  isExpanded: boolean = false
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });

  const days = [];
  
  if (isExpanded) {
    DAYS_OF_WEEK.forEach((d, i) => {
      days.push(
        <div key={`header-${i}`} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.9rem', paddingBottom: '8px' }}>
          {d}
        </div>
      );
    });
  }

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '2px' }}></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const dateStr = currentDate.toDateString();
    const isCompleted = completedDates.includes(dateStr);
    const isToday = dateStr === today.toDateString();
    
    const isPast = currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let isMissed = false;
    if (isPast && !isCompleted && startDate && currentDate >= startDate) {
      isMissed = true;
    }

    const bgColor = isCompleted ? '#10b981' : isMissed ? 'rgba(239, 68, 68, 0.2)' : 'transparent';
    const textColor = isCompleted ? '#000' : isMissed ? '#ef4444' : 'var(--text-muted)';
    
    const cellPadding = isExpanded ? '12px 0' : '2px 0';
    const cellFontSize = isExpanded ? '1rem' : '0.65rem';

    days.push(
      <div 
        key={d} 
        style={{ 
          padding: cellPadding, 
          textAlign: 'center', 
          borderRadius: isExpanded ? '8px' : '4px',
          background: bgColor,
          color: textColor,
          fontSize: cellFontSize,
          border: isToday && !isCompleted ? '1px solid var(--primary-color)' : 'none',
          fontWeight: isCompleted || isToday ? 'bold' : 'normal',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: isExpanded ? '1' : 'auto'
        }}
      >
        {d}
      </div>
    );
  }

  return (
    <div 
      key={month} 
      onClick={() => onClick && onClick(month)}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isExpanded ? '16px' : '4px',
        cursor: onClick ? 'pointer' : 'default',
        background: onClick ? 'rgba(255,255,255,0.02)' : 'transparent',
        padding: onClick ? '8px' : '0',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
      }}
      className={onClick ? "hover-month" : ""}
    >
      <div style={{ textAlign: 'center', fontSize: isExpanded ? '1.5rem' : '0.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>{monthName}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isExpanded ? '8px' : '2px' }}>
        {days}
      </div>
    </div>
  );
}

export default function ProfileTab({ profile }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  
  const completedDates = profile.history
    .filter(record => record.completed)
    .map(record => new Date(record.date).toDateString());

  let startDate: Date | null = null;
  if (profile.history.length > 0) {
    const firstWorkout = profile.history.reduce((min, record) => {
      const d = new Date(record.date);
      return d < min ? d : min;
    }, new Date(profile.history[0].date));
    startDate = new Date(firstWorkout.getFullYear(), firstWorkout.getMonth(), firstWorkout.getDate());
  }

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-color)' }}>My Profile</h2>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Stats</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Current Level: <strong style={{ color: 'var(--primary-color)' }}>{profile.currentLevel}</strong></p>
        <p style={{ color: 'var(--text-muted)' }}>Total Workouts: <strong>{profile.history.filter(h => h.completed).length}</strong></p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', textAlign: 'center' }}>
          {year} Tracker
        </h3>
        
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Tap any month to expand</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', rowGap: '16px' }}>
          {Array.from({ length: 12 }, (_, i) => renderMonth(year, i, completedDates, startDate, today, setSelectedMonth, false))}
        </div>
      </div>
      
      <button onClick={() => supabase.auth.signOut()} style={{ padding: '16px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '100px', fontWeight: 'bold', marginTop: '24px', width: '100%' }}>
        Sign Out
      </button>

      {selectedMonth !== null && (
        <div 
          className="fade-in"
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.9)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(8px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMonth(null);
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px 24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button 
              onClick={() => setSelectedMonth(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            {renderMonth(year, selectedMonth, completedDates, startDate, today, undefined, true)}
          </div>
        </div>
      )}
    </div>
  );
}
