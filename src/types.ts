export interface WorkoutConfig {
  id: string;
  name: string;
  warmupTime: number; // in seconds
  workTime: number;   // in seconds
  restTime: number;   // in seconds
  rounds: number;     // number of work/rest cycles
  cooldownTime: number; // in seconds
  rpeTarget: string;
}

export interface WorkoutRecord {
  id: string;
  date: string; // ISO string
  workoutId: string;
  completed: boolean;
  rpe: number;
  averageHr: number;
  recoveryFeeling: string;
}

export interface UserProfile {
  age: number;
  currentLevel: number;
  history: WorkoutRecord[];
  joinedGroup: string | null;
}
