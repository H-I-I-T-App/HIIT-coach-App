import { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

interface Member {
  name: string;
  level: number;
  workouts: number;
}

export default function GroupTab({ profile, onUpdateProfile }: Props) {
  const [groupInput, setGroupInput] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!profile.joinedGroup) return;
      setLoading(true);
      
      const { data: groupUsers } = await supabase.from('users').select('id, current_level').eq('joined_group', profile.joinedGroup);
      
      if (groupUsers) {
        const membersData: Member[] = await Promise.all(groupUsers.map(async (u) => {
          const { count } = await supabase.from('workout_records').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('completed', true);
          return {
            name: u.id === profile.id ? 'You' : `User ${u.id.substring(0,4)}`,
            level: u.current_level,
            workouts: count || 0
          };
        }));
        
        setMembers(membersData.sort((a, b) => b.workouts - a.workouts));
      }
      setLoading(false);
    };

    fetchGroupData();
  }, [profile.joinedGroup, profile.id]);

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

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary-color)' }}>{profile.joinedGroup}</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Group Leaderboard</p>
      
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Loading group data...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No members found.</div>
        ) : (
          members.map((member, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < members.length - 1 ? '1px solid #334155' : 'none' }}>
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
          ))
        )}
      </div>

      <button onClick={handleLeave} style={{ padding: '16px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '100px', fontWeight: 'bold', marginTop: 'auto' }}>
        Leave Group
      </button>
    </div>
  );
}
