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
  const [createName, setCreateName] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!profile.joinedGroup) return;
      setLoading(true);
      
      // Fetch group name
      const { data: groupData } = await supabase.from('groups').select('name').eq('token', profile.joinedGroup).single();
      if (groupData) {
        setGroupName(groupData.name);
      } else {
        setGroupName('Unknown Group');
      }

      const { data: groupUsers } = await supabase.from('users').select('id, current_level, name').eq('joined_group', profile.joinedGroup);
      
      if (groupUsers) {
        const membersData: Member[] = await Promise.all(groupUsers.map(async (u) => {
          const { count } = await supabase.from('workout_records').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('completed', true);
          return {
            name: u.id === profile.id ? 'You' : (u.name || `User ${u.id.substring(0,4)}`),
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create group in DB
    const { error } = await supabase.from('groups').insert({
      name: createName.trim(),
      token: token
    });

    if (error) {
      alert("Error creating group. Please try again.");
      return;
    }

    onUpdateProfile({ ...profile, joinedGroup: token });
    setCreateName('');
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinToken.trim()) return;
    
    const token = joinToken.trim().toUpperCase();
    
    // Check if token exists
    const { data: groupData } = await supabase.from('groups').select('name').eq('token', token).single();
    
    if (groupData) {
      onUpdateProfile({ ...profile, joinedGroup: token });
      setJoinToken('');
    } else {
      alert("Invalid Invite Token. Please check and try again.");
    }
  };

  const handleLeave = () => {
    onUpdateProfile({ ...profile, joinedGroup: null });
  };

  if (!profile.joinedGroup) {
    return (
      <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>Groups</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>
          Create a group or join one with an invite token!
        </p>
        
        <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '24px', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-main)', textAlign: 'center', marginBottom: '8px' }}>Create New Group</h3>
          <input 
            type="text" 
            placeholder="Group Name (e.g. My Family)" 
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          />
          <button type="submit" className="btn-primary">Create Group</button>
        </form>

        <form onSubmit={handleJoin} className="glass-panel" style={{ padding: '24px', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-main)', textAlign: 'center', marginBottom: '8px' }}>Join Existing Group</h3>
          <input 
            type="text" 
            placeholder="Invite Token (e.g. X7B92A)" 
            value={joinToken}
            onChange={e => setJoinToken(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>Join Group</button>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary-color)' }}>{groupName}</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '16px' }}>Group Leaderboard</p>
      
      <button 
        onClick={() => {
          if (profile.joinedGroup) {
            navigator.clipboard.writeText(profile.joinedGroup);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }}
        style={{ padding: '12px', width: '100%', background: copied ? '#10b981' : 'var(--primary-color)', color: '#000', borderRadius: '100px', fontWeight: 'bold', marginBottom: '24px', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }}
      >
        {copied ? 'Token Copied!' : `Share Invite Token: ${profile.joinedGroup}`}
      </button>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Loading group data...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No members found.</div>
        ) : (
          members.map((member, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < members.length - 1 ? '1px solid #334155' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '24px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{index + 1}</div>
                <div style={{ fontWeight: member.name === 'You' ? 'bold' : 'normal', color: member.name === 'You' ? 'var(--primary-color)' : '#fff' }}>
                  {member.name}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
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
