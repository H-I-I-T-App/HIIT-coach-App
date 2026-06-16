import type { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface Props {
  profile: UserProfile;
}

export default function ProfileTab({ profile }: Props) {
  // Simple calendar rendering for the current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const completedDates = profile.history
    .filter(record => record.completed)
    .map(record => new Date(record.date).toDateString());

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '8px' }}></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(year, month, d).toDateString();
    const isCompleted = completedDates.includes(dateStr);
    const isToday = dateStr === today.toDateString();
    
    const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isMissed = isPast && !isCompleted;

    const bgColor = isCompleted ? '#10b981' : isMissed ? 'rgba(239, 68, 68, 0.15)' : 'transparent';
    const textColor = isCompleted ? '#000' : isMissed ? '#ef4444' : 'var(--text-main)';

    days.push(
      <div 
        key={d} 
        style={{ 
          padding: '8px 0', 
          textAlign: 'center', 
          borderRadius: '8px',
          background: bgColor,
          color: textColor,
          border: isToday && !isCompleted ? '1px solid var(--primary-color)' : 'none',
          fontWeight: isCompleted || isToday ? 'bold' : 'normal'
        }}
      >
        {d}
      </div>
    );
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
          {today.toLocaleString('default', { month: 'long' })} Tracker
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{day}</div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days}
        </div>
      </div>
      <button onClick={() => supabase.auth.signOut()} style={{ padding: '16px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '100px', fontWeight: 'bold', marginTop: '24px', width: '100%' }}>
        Sign Out
      </button>
    </div>
  );
}
