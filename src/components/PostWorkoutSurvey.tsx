import { useState } from 'react';
import type { WorkoutRecord } from '../types';

interface Props {
  workoutId: string;
  onSave: (record: WorkoutRecord) => void;
  onCancel: () => void;
}

export default function PostWorkoutSurvey({ workoutId, onSave, onCancel }: Props) {
  const [completed, setCompleted] = useState(true);
  const [rpe, setRpe] = useState(5);
  const [averageHr, setAverageHr] = useState(130);
  const [recoveryFeeling, setRecoveryFeeling] = useState('Good');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
      date: new Date().toISOString(),
      workoutId,
      completed,
      rpe,
      averageHr,
      recoveryFeeling
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'left' }}>
      <h3 style={{ marginBottom: '24px', color: 'var(--primary-color)', textAlign: 'center' }}>Workout Survey</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Did you complete the workout?</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" checked={completed} onChange={() => setCompleted(true)} /> Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" checked={!completed} onChange={() => setCompleted(false)} /> No
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
            RPE (Rate of Perceived Exertion: 1-10)
          </label>
          <input 
            type="range" min={1} max={10} value={rpe} onChange={e => setRpe(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary-color)' }}
          />
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{rpe} / 10</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
            Average Heart Rate (bpm)
          </label>
          <input 
            type="number" min={50} max={220} value={averageHr} onChange={e => setAverageHr(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
            Recovery Feeling
          </label>
          <select 
            value={recoveryFeeling} onChange={e => setRecoveryFeeling(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          >
            <option>Excellent</option>
            <option>Good</option>
            <option>Okay</option>
            <option>Poor</option>
            <option>Terrible</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '100px', background: 'transparent', border: '1px solid #334155', color: '#fff' }}>
            Skip
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
