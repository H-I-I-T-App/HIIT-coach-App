import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Home, User, Users, LogOut, Flame } from 'lucide-react';
import TimerRing from './components/TimerRing';
import ConfigSlider from './components/ConfigSlider';
import PostWorkoutSurvey from './components/PostWorkoutSurvey';
import ProfileTab from './components/ProfileTab';
import GroupTab from './components/GroupTab';
import type { WorkoutConfig, WorkoutRecord, UserProfile } from './types';
import { LEVEL_WORKOUTS } from './data/workouts';
import { supabase } from './supabaseClient';
import LoginScreen from './components/LoginScreen';
import type { Session } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

type AppState = 'home' | 'profile' | 'group' | 'custom-config' | 'active' | 'survey' | 'finished';
type Phase = 'warmup' | 'prep' | 'work' | 'rest' | 'cooldown';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const DEFAULT_PROFILE: UserProfile = { age: 30, currentLevel: 1, history: [], joinedGroup: null };

export default function WebApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [appState, setAppState] = useState<AppState>('home');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activeWorkoutConfig, setActiveWorkoutConfig] = useState<WorkoutConfig | null>(null);
  
  // Custom Config
  const [prepTime, setPrepTime] = useState(10);
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(8);
  
  // Active Timer State
  const [currentPhase, setCurrentPhase] = useState<Phase>('prep');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (session) {
        initProfile(session.user.id, session);
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initProfile(session.user.id, session);
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (appState === 'finished') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6'],
        zIndex: 1000
      });
    }
  }, [appState]);

  const initProfile = async (userId: string, currentSession: any) => {
    let p: UserProfile = { ...DEFAULT_PROFILE, id: userId };

    const userName = currentSession?.user?.user_metadata?.full_name || currentSession?.user?.email?.split('@')[0] || 'Unknown User';

    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (user) {
      p = { 
        id: user.id, 
        name: user.name || userName,
        age: user.age || 30, 
        currentLevel: user.current_level, 
        joinedGroup: user.joined_group,
        customWorkouts: user.custom_workouts || [],
        history: [] 
      };
      
      // Update name in DB if missing or different
      if (!user.name || user.name !== userName) {
        await supabase.from('users').update({ name: userName }).eq('id', userId);
        p.name = userName;
      }
      
      const { data: records } = await supabase.from('workout_records').select('*').eq('user_id', user.id).order('date', { ascending: true });
      if (records) {
        p.history = records.map(r => ({
          id: r.id,
          date: r.date,
          workoutId: r.workout_id,
          completed: r.completed,
          rpe: r.rpe,
          averageHr: r.average_hr,
          recoveryFeeling: r.recovery_feeling
        }));
      }
    }

    if (p.history.length > 0) {
      const lastWorkout = new Date(p.history[p.history.length - 1].date).getTime();
      const twoWeeks = 14 * 24 * 60 * 60 * 1000;
      if (Date.now() - lastWorkout > twoWeeks && p.currentLevel > 1) {
        p.currentLevel -= 1;
        alert("It's been over 2 weeks since your last workout. We've bumped you down a level to ease you back in!");
        p.history.push({ id: 'demotion', date: new Date().toISOString(), workoutId: 'system', completed: true, rpe: 0, averageHr: 0, recoveryFeeling: 'N/A' });
        await supabase.from('users').update({ current_level: p.currentLevel }).eq('id', p.id);
      }
    }
    setProfile(p);
  };

  const saveProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (!newProfile.id) return;
    
    await supabase.from('users').update({
      name: newProfile.name,
      age: newProfile.age,
      current_level: newProfile.currentLevel,
      joined_group: newProfile.joinedGroup,
      custom_workouts: newProfile.customWorkouts || []
    }).eq('id', newProfile.id);

    const records = newProfile.history.filter(r => r.id !== 'demotion' && r.id !== 'promotion').map(r => ({
      id: r.id,
      user_id: newProfile.id,
      date: r.date,
      workout_id: r.workoutId,
      completed: r.completed,
      rpe: r.rpe,
      average_hr: r.averageHr,
      recovery_feeling: r.recoveryFeeling
    }));
    
    if (records.length > 0) {
      await supabase.from('workout_records').upsert(records);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playTickTock = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Heart monitor sound: sine wave, ~700Hz
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    
    // Sharp attack and release
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gain.gain.setValueAtTime(0.5, ctx.currentTime + 0.08);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  };

  const startWorkoutConfig = (config: WorkoutConfig) => {
    setActiveWorkoutConfig(config);
    setAppState('active');
    
    if (config.warmupTime > 0) {
      setCurrentPhase('warmup');
      setTimeLeft(config.warmupTime);
    } else {
      speak("get ready");
      setCurrentPhase('prep');
      setTimeLeft(10); // Standard prep time
    }
    setCurrentRound(1);
    setIsPaused(false);
  };

  const startCustomWorkout = async () => {
    let customWorkouts = profile.customWorkouts || [];
    let workoutName = `My Level ${customWorkouts.length + 1}`;
    let isNew = false;
    
    if (customWorkouts.length < 3) {
      isNew = true;
    } else {
      workoutName = 'Custom Workout';
    }

    const config: WorkoutConfig = {
      id: isNew ? `custom-${Date.now()}` : 'custom',
      name: workoutName,
      warmupTime: 0,
      workTime,
      restTime,
      rounds,
      cooldownTime: 0,
      rpeTarget: 'N/A'
    };

    if (isNew) {
      const updatedProfile = { ...profile, customWorkouts: [...customWorkouts, config] };
      saveProfile(updatedProfile);
    }

    startWorkoutConfig(config);
  };

  const deleteCustomWorkout = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedCustomWorkouts = (profile.customWorkouts || []).filter(w => w.id !== id);
    const updatedProfile = { ...profile, customWorkouts: updatedCustomWorkouts };
    saveProfile(updatedProfile);
  };

  const stopWorkout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState('home');
  };

  const pauseResumeWorkout = () => setIsPaused(!isPaused);

  const handlePhaseComplete = () => {
    if (!activeWorkoutConfig) return;

    if (currentPhase === 'warmup') {
      speak("get ready");
      setCurrentPhase('prep');
      setTimeLeft(10);
    } else if (currentPhase === 'prep') {
      speak("GO!");
      setCurrentPhase('work');
      setTimeLeft(activeWorkoutConfig.workTime);
    } else if (currentPhase === 'work') {
      if (currentRound >= activeWorkoutConfig.rounds) {
        speak("interval complete slow down!");
        if (activeWorkoutConfig.cooldownTime > 0) {
          setCurrentPhase('cooldown');
          setTimeLeft(activeWorkoutConfig.cooldownTime);
        } else {
          finishWorkout();
        }
      } else {
        speak("interval complete slow down!");
        setCurrentPhase('rest');
        setTimeLeft(activeWorkoutConfig.restTime);
      }
    } else if (currentPhase === 'rest') {
      speak("GO!");
      setCurrentRound(prev => prev + 1);
      setCurrentPhase('work');
      setTimeLeft(activeWorkoutConfig.workTime);
    } else if (currentPhase === 'cooldown') {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState('survey');
  };

  // Main Timer loop
  useEffect(() => {
    if (appState === 'active' && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          if (prev === 4 && currentPhase === 'rest') {
            speak("get ready");
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, isPaused, currentPhase, currentRound, activeWorkoutConfig]);

  // Metronome loop
  useEffect(() => {
    if (appState !== 'active' || isPaused) return;

    let intervalMs = 1000;
    if (currentPhase === 'work') intervalMs = 333; // Fast
    else if (currentPhase === 'prep') intervalMs = 600; // Medium
    else intervalMs = 1000; // Slow (warmup, rest, cooldown)

    const metronomeId = setInterval(() => {
      playTickTock();
    }, intervalMs);

    return () => clearInterval(metronomeId);
  }, [appState, isPaused, currentPhase]);

  const handleSurveySave = (record: WorkoutRecord) => {
    const newHistory = [...profile.history, record];
    let newLevel = profile.currentLevel;

    // Progression Logic: Complete 3 workouts with RPE <= 6 -> increase level
    if (record.id !== 'custom') {
      const recent = newHistory.filter(r => r.workoutId.startsWith('level-')).slice(-3);
      if (recent.length === 3 && recent.every(r => r.rpe <= 6 && r.completed)) {
        if (newLevel < 5) {
          newLevel++;
          alert(`Congratulations! You've mastered Level ${newLevel - 1}. You are now promoted to Level ${newLevel}!`);
          // clear history of level- ups so we don't double trigger
          newHistory.push({ id: 'promotion', date: new Date().toISOString(), workoutId: 'system', completed: true, rpe: 0, averageHr: 0, recoveryFeeling: 'N/A' });
        }
      }
    }

    saveProfile({ ...profile, currentLevel: newLevel, history: newHistory });
    setAppState('finished');
  };

  const getPhaseColor = () => {
    if (currentPhase === 'warmup' || currentPhase === 'cooldown') return '#3b82f6'; // Blue
    if (currentPhase === 'prep') return '#eab308'; // Yellow
    if (currentPhase === 'work') return '#fbbf24'; // Gold
    if (currentPhase === 'rest') return '#ef4444'; // Red
    return '#3b82f6';
  };

  const getPhaseProgress = () => {
    if (!activeWorkoutConfig) return 0;
    let total = 10;
    if (currentPhase === 'warmup') total = activeWorkoutConfig.warmupTime;
    if (currentPhase === 'cooldown') total = activeWorkoutConfig.cooldownTime;
    if (currentPhase === 'work') total = activeWorkoutConfig.workTime;
    if (currentPhase === 'rest') total = activeWorkoutConfig.restTime;
    return 1 - (timeLeft / total);
  };

  if (loadingAuth) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--primary-color)' }}>Loading...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px', position: 'relative' }}>
      <button 
        onClick={() => supabase.auth.signOut()} 
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 100 }}
        title="Sign Out"
      >
        <LogOut size={24} />
      </button>
      {appState !== 'home' && appState !== 'profile' && appState !== 'group' && (
        <button 
          className="btn-icon"
          style={{ position: 'absolute', top: 24, left: 24, background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', zIndex: 100 }} 
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setAppState('home');
          }}
        >
          <Flame size={32} />
        </button>
      )}
      {appState === 'home' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '32px' }}>
            <div className="glowing-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <Flame size={80} color="var(--primary-color)" strokeWidth={1.5} />
            </div>
            <h1 style={{ fontSize: '3rem', marginBottom: '8px', background: 'linear-gradient(to right, #fbbf24, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
              H.I.I.T
            </h1>
            <div style={{ marginTop: '12px', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              Current Level &bull; {profile.currentLevel}
            </div>
            <div style={{ marginTop: '12px', color: 'var(--text-muted)' }}>
              Welcome back, <strong style={{ color: 'var(--text-main)' }}>{session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}</strong>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '0 16px' }}>
            <h3 style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Select Workout</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {LEVEL_WORKOUTS.map(w => (
                <div key={w.id} className="glass-panel workout-card" style={{ padding: '20px 24px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => startWorkoutConfig(w)}>
                  <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.2rem' }}>{w.name}</h4>
                  <div style={{ color: 'var(--primary-color)' }}><Play size={24} fill="currentColor" /></div>
                </div>
              ))}
              
              {profile.customWorkouts && profile.customWorkouts.length > 0 && (
                <div style={{ width: '100%', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ color: '#10b981', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '8px' }}>Custom Workouts</h3>
                  {profile.customWorkouts.map(cw => (
                    <div key={cw.id} className="glass-panel workout-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', cursor: 'pointer', textAlign: 'left', width: '100%', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }} onClick={() => startWorkoutConfig(cw)}>
                      <h4 style={{ color: '#10b981', margin: 0, fontSize: '1.1rem' }}>{cw.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Play size={20} color="#10b981" fill="#10b981" />
                        <button 
                          onClick={(e) => deleteCustomWorkout(e, cw.id)} 
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                          title="Delete Custom Workout"
                        >
                          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="glass-panel" style={{ width: '100%', padding: '16px', marginTop: '32px', background: 'transparent', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.3s' }} onClick={() => setAppState('custom-config')}>
              + Create Custom Workout
            </button>
          </div>
        </div>
      )}

      {appState === 'custom-config' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-color)' }}>Custom Workout</h2>
          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <ConfigSlider label="Prep Time" value={prepTime} min={0} max={60} step={5} formatValue={formatTime} onChange={setPrepTime} />
            <ConfigSlider label="Work Time" value={workTime} min={5} max={120} step={5} formatValue={formatTime} onChange={setWorkTime} />
            <ConfigSlider label="Rest Time" value={restTime} min={0} max={120} step={5} formatValue={formatTime} onChange={setRestTime} />
            <ConfigSlider label="Rounds" value={rounds} min={1} max={30} step={1} onChange={setRounds} />
          </div>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <button className="btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid #fff' }} onClick={() => setAppState('home')}>Back</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={startCustomWorkout}><Play size={24} /> Start</button>
          </div>
        </div>
      )}

      {appState === 'active' && activeWorkoutConfig && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
            <div className="glass-panel" style={{ padding: '8px 24px', borderRadius: '100px', fontWeight: 600, fontSize: '1.25rem', textAlign: 'center', color: 'var(--primary-color)' }}>
              {activeWorkoutConfig.name}
            </div>
            {(currentPhase === 'work' || currentPhase === 'rest') && (
              <div className="glass-panel" style={{ padding: '4px 16px', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem' }}>
                Round {currentRound} / {activeWorkoutConfig.rounds}
              </div>
            )}
          </div>
          
          <div style={{ transform: isPaused ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.3s ease', opacity: isPaused ? 0.7 : 1 }}>
            <TimerRing 
              progress={getPhaseProgress()} 
              timeLeft={timeLeft} 
              label={currentPhase} 
              color={getPhaseColor()} 
            />
          </div>

          <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '24px', zIndex: 10 }}>
            <button className="btn-icon" onClick={stopWorkout}>
              <Square size={20} />
            </button>
            <button className="btn-icon" style={{ width: '64px', height: '64px', background: 'white', color: 'black' }} onClick={pauseResumeWorkout}>
              {isPaused ? <Play size={28} fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
            </button>
          </div>
        </div>
      )}

      {appState === 'survey' && activeWorkoutConfig && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PostWorkoutSurvey workoutId={activeWorkoutConfig.id} onSave={handleSurveySave} onCancel={() => setAppState('finished')} />
        </div>
      )}

      {appState === 'finished' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
          <h2 style={{ fontSize: '3rem', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
            Congratulations!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '32px' }}>
            You absolutely crushed <strong>{activeWorkoutConfig?.name || 'that workout'}</strong>.
          </p>
          
          <div className="glass-panel" style={{ padding: '24px', width: '100%', maxWidth: '300px', marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Workout Stats</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rounds:</span>
              <strong>{activeWorkoutConfig?.rounds}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Work:</span>
              <strong>{activeWorkoutConfig?.workTime}s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rest:</span>
              <strong>{activeWorkoutConfig?.restTime}s</strong>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setAppState('home')} style={{ padding: '16px 32px', fontSize: '1.2rem' }}>
            <RotateCcw size={24} style={{ marginRight: '8px' }} /> Return Home
          </button>
        </div>
      )}

      {appState === 'profile' && <ProfileTab profile={profile} />}
      
      {appState === 'group' && <GroupTab profile={profile} onUpdateProfile={saveProfile} />}

      {['home', 'profile', 'group'].includes(appState) && (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#1e293b', padding: '16px', borderRadius: '100px', marginTop: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', zIndex: 100 }}>
          <button onClick={() => setAppState('home')} style={{ background: 'transparent', color: appState === 'home' ? 'var(--primary-color)' : 'var(--text-muted)' }}><Home size={28} /></button>
          <button onClick={() => setAppState('profile')} style={{ background: 'transparent', color: appState === 'profile' ? 'var(--primary-color)' : 'var(--text-muted)' }}><User size={28} /></button>
          <button onClick={() => setAppState('group')} style={{ background: 'transparent', color: appState === 'group' ? 'var(--primary-color)' : 'var(--text-muted)' }}><Users size={28} /></button>
        </div>
      )}
    </div>
  );
}
