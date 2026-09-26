import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ActiveWorkout from "./ActiveWorkout";

export default async function WorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      "id, name, finished_at, workout_exercises(id, exercise_name, position, sets(id, set_index, weight_kg, reps, completed))"
    )
    .eq("id", params.id)
    .single();

  if (!workout) notFound();

  const workoutWithIds = {
    ...workout,
    workout_exercises: workout.workout_exercises.map((ex) => ({
      ...ex,
      workout_id: workout.id,
      user_id: user.id,
      sets: ex.sets.map((s) => ({
        ...s,
        workout_exercise_id: ex.id,
        user_id: user.id,
      })),
    })),
  };

  return <ActiveWorkout initialWorkout={workoutWithIds} />;
}