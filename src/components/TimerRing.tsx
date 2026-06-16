import React from 'react';

interface TimerRingProps {
  progress: number; // 0 to 1
  timeLeft: number;
  label: string;
  color: string;
}

const TimerRing: React.FC<TimerRingProps> = ({ progress, timeLeft, label, color }) => {
  const size = 300;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em', color: '#fff' }}>
          {formatTime(timeLeft)}
        </span>
        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: color, textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.1em' }}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default TimerRing;
