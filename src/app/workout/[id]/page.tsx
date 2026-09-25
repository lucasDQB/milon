import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ActiveWorkout from "./ActiveWorkout";

export default async function WorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      "id, name, finished_at, workout_exercises(id, exercise_name, position, sets(id, set_index, weight_kg, reps, completed))"
    )
    .eq("id", params.id)
    .single();

  if (!workout) notFound();

  return <ActiveWorkout initialWorkout={workout} />;
}
