import type { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface Props {
  profile: UserProfile;
}

function renderMonth(year: number, month: number, completedDates: string[], startDate: Date | null, today: Date) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'short' });

  const days = [];
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

    days.push(
      <div 
        key={d} 
        style={{ 
          padding: '2px 0', 
          textAlign: 'center', 
          borderRadius: '4px',
          background: bgColor,
          color: textColor,
          fontSize: '0.65rem',
          border: isToday && !isCompleted ? '1px solid var(--primary-color)' : 'none',
          fontWeight: isCompleted || isToday ? 'bold' : 'normal'
        }}
      >
        {d}
      </div>
    );
  }

  return (
    <div key={month} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>{monthName}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {days}
      </div>
    </div>
  );
}

export default function ProfileTab({ profile }: Props) {
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', rowGap: '24px' }}>
          {Array.from({ length: 12 }, (_, i) => renderMonth(year, i, completedDates, startDate, today))}
        </div>
      </div>
      <button onClick={() => supabase.auth.signOut()} style={{ padding: '16px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '100px', fontWeight: 'bold', marginTop: '24px', width: '100%' }}>
        Sign Out
      </button>
    </div>
  );
}
