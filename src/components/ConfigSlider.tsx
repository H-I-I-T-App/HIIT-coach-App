import React from 'react';

interface ConfigSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const ConfigSlider: React.FC<ConfigSliderProps> = ({ label, value, min, max, step = 1, onChange, formatValue }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          appearance: 'none',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          outline: 'none',
          accentColor: 'var(--primary-color)',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};

export default ConfigSlider;
