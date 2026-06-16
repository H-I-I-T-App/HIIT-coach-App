import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Home, User, Users } from 'lucide-react';
import TimerRing from './components/TimerRing';
import ConfigSlider from './components/ConfigSlider';
import PostWorkoutSurvey from './components/PostWorkoutSurvey';
import ProfileTab from './components/ProfileTab';
import GroupTab from './components/GroupTab';
import logo from './assets/logo.png';
import type { WorkoutConfig, WorkoutRecord, UserProfile } from './types';
import { LEVEL_WORKOUTS } from './data/workouts';

type AppState = 'home' | 'profile' | 'group' | 'custom-config' | 'active' | 'survey' | 'finished';
type Phase = 'warmup' | 'prep' | 'work' | 'rest' | 'cooldown';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const DEFAULT_PROFILE: UserProfile = { age: 30, currentLevel: 1, history: [], joinedGroup: null };

function App() {
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
    const saved = localStorage.getItem('hiit_profile');
    if (saved) {
      try {
        const p: UserProfile = JSON.parse(saved);
        // Miss 2 weeks logic
        if (p.history.length > 0) {
          const lastWorkout = new Date(p.history[p.history.length - 1].date).getTime();
          const twoWeeks = 14 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastWorkout > twoWeeks && p.currentLevel > 1) {
            p.currentLevel -= 1;
            alert("It's been over 2 weeks since your last workout. We've bumped you down a level to ease you back in!");
            p.history.push({ id: 'demotion', date: new Date().toISOString(), workoutId: 'system', completed: true, rpe: 0, averageHr: 0, recoveryFeeling: 'N/A' });
          }
        }
        setProfile(p);
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('hiit_profile', JSON.stringify(newProfile));
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

  const startCustomWorkout = () => {
    startWorkoutConfig({
      id: 'custom',
      name: 'Custom Workout',
      warmupTime: 0,
      workTime,
      restTime,
      rounds,
      cooldownTime: 0,
      rpeTarget: 'N/A'
    });
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

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', flex: 1, position: 'relative' }}>
      {appState !== 'home' && appState !== 'profile' && appState !== 'group' && (
        <img 
          src={logo} 
          alt="Back to Dashboard" 
          style={{ position: 'absolute', top: 24, left: 24, width: '48px', height: '48px', cursor: 'pointer', zIndex: 100 }} 
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setAppState('home');
          }}
        />
      )}
      {appState === 'home' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '24px' }}>
            <img src={logo} alt="HIIT Logo" style={{ width: '120px', height: '120px', borderRadius: '24px', marginBottom: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} />
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              H.I.I.T
            </h1>
            <div style={{ marginTop: '8px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              Current Level: {profile.currentLevel}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px', textAlign: 'center' }}>Workouts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {LEVEL_WORKOUTS.map(w => (
                <div key={w.id} className="glass-panel" style={{ padding: '12px 24px', cursor: 'pointer', textAlign: 'center', width: '280px' }} onClick={() => startWorkoutConfig(w)}>
                  <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>{w.name}</h4>
                </div>
              ))}
            </div>

            <button style={{ width: '100%', padding: '16px', marginTop: '16px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '100px', fontWeight: 'bold' }} onClick={() => setAppState('custom-config')}>
              Create Custom Workout
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
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '16px', textAlign: 'center' }}>Workout Complete!</h2>
          <button className="btn-primary" onClick={() => setAppState('home')}>
            <RotateCcw size={24} /> Return Home
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

export default App;
