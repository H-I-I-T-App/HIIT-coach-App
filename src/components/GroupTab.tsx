import { useState } from 'react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export default function GroupTab({ profile, onUpdateProfile }: Props) {
  const [groupInput, setGroupInput] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupInput.trim()) return;
    onUpdateProfile({ ...profile, joinedGroup: groupInput.trim() });
    setGroupInput('');
  };

  const handleLeave = () => {
    onUpdateProfile({ ...profile, joinedGroup: null });
  };

  if (!profile.joinedGroup) {
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>My Group</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>
          You aren't in a group yet. Join one to share progress with friends!
        </p>
        
        <form onSubmit={handleJoin} className="glass-panel" style={{ padding: '24px', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Enter Group Name..." 
            value={groupInput}
            onChange={e => setGroupInput(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          />
          <button type="submit" className="btn-primary">Join Group</button>
        </form>
      </div>
    );
  }

  // Mock Leaderboard Data
  const mockMembers = [
    { name: 'Alex T.', level: 4, workouts: 24 },
    { name: 'You', level: profile.currentLevel, workouts: profile.history.filter(h => h.completed).length },
    { name: 'Sam R.', level: 3, workouts: 18 },
    { name: 'Jordan P.', level: 2, workouts: 9 },
  ].sort((a, b) => b.workouts - a.workouts);

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary-color)' }}>{profile.joinedGroup}</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Group Leaderboard</p>
      
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
        {mockMembers.map((member, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < mockMembers.length - 1 ? '1px solid #334155' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{index + 1}</div>
              <div style={{ fontWeight: member.name === 'You' ? 'bold' : 'normal', color: member.name === 'You' ? 'var(--primary-color)' : '#fff' }}>
                {member.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#fff' }}>Lvl {member.level}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.workouts} workouts</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleLeave} style={{ padding: '16px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '100px', fontWeight: 'bold', marginTop: 'auto' }}>
        Leave Group
      </button>
    </div>
  );
}
