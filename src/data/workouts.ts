import type { WorkoutConfig } from '../types';

export const LEVEL_WORKOUTS: WorkoutConfig[] = [
  {
    id: 'level-1',
    name: 'Level 1 – Beginner',
    warmupTime: 300, // 5 mins
    workTime: 30,
    restTime: 90,
    rounds: 6,
    cooldownTime: 300, // 5 mins
    rpeTarget: '4-6/10'
  },
  {
    id: 'level-2',
    name: 'Level 2 – Foundation',
    warmupTime: 300,
    workTime: 45,
    restTime: 75,
    rounds: 8,
    cooldownTime: 300,
    rpeTarget: '5-7/10'
  },
  {
    id: 'level-3',
    name: 'Level 3 – Intermediate',
    warmupTime: 300,
    workTime: 60,
    restTime: 60,
    rounds: 10,
    cooldownTime: 300,
    rpeTarget: '7-8/10'
  },
  {
    id: 'level-4',
    name: 'Level 4 – Advanced',
    warmupTime: 300,
    workTime: 90,
    restTime: 45,
    rounds: 11, // "10-12"
    cooldownTime: 300,
    rpeTarget: '8-9/10'
  },
  {
    id: 'level-5',
    name: 'Level 5 – Elite',
    warmupTime: 300,
    workTime: 120,
    restTime: 30,
    rounds: 14, // "12-16"
    cooldownTime: 300,
    rpeTarget: '9-10/10'
  }
];

export const SPECIAL_WORKOUTS: WorkoutConfig[] = [
  {
    id: 'special-fat-burn',
    name: 'Fat-Burning Session',
    warmupTime: 300,
    workTime: 60,
    restTime: 60,
    rounds: 10,
    cooldownTime: 300,
    rpeTarget: 'Moderate-Hard'
  },
  {
    id: 'special-vo2-max',
    name: 'VO₂ Max Builder',
    warmupTime: 300,
    workTime: 120,
    restTime: 60,
    rounds: 8,
    cooldownTime: 300,
    rpeTarget: 'Hard'
  }
];

export const getHeartRateZones = (age: number) => {
  const maxHr = 220 - age;
  return {
    max: maxHr,
    zone1: { min: Math.round(maxHr * 0.5), max: Math.round(maxHr * 0.6) },
    zone2: { min: Math.round(maxHr * 0.6), max: Math.round(maxHr * 0.7) },
    zone3: { min: Math.round(maxHr * 0.7), max: Math.round(maxHr * 0.8) },
    zone4: { min: Math.round(maxHr * 0.8), max: Math.round(maxHr * 0.9) },
    zone5: { min: Math.round(maxHr * 0.9), max: Math.round(maxHr * 0.95) }
  };
};
