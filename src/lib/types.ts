export type Workout = {
  id: string;
  user_id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  user_id: string;
  exercise_name: string;
  position: number;
};

export type SetRow = {
  id: string;
  workout_exercise_id: string;
  user_id: string;
  set_index: number;
  weight_kg: number | null;
  reps: number | null;
  completed: boolean;
};

export type BodyMetric = {
  id: string;
  user_id: string;
  recorded_at: string;
  weight_kg: number;
};

export type WorkoutWithDetails = Workout & {
  workout_exercises: (WorkoutExercise & { sets: SetRow[] })[];
};
