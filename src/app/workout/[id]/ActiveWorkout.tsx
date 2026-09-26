"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import type { SetRow, WorkoutExercise } from "@/lib/types";

type ExerciseWithSets = WorkoutExercise & { sets: SetRow[] };
type WorkoutData = {
  id: string;
  name: string;
  finished_at: string | null;
  workout_exercises: ExerciseWithSets[];
};

export default function ActiveWorkout({
  initialWorkout,
}: {
  initialWorkout: WorkoutData;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [workout, setWorkout] = useState(initialWorkout);
  const [newExercise, setNewExercise] = useState("");
  const [finishing, setFinishing] = useState(false);

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    const name = newExercise.trim();
    if (!name) return;

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: workout.id,
        user_id: userData.user!.id,
        exercise_name: name,
        position: workout.workout_exercises.length,
      })
      .select("id, exercise_name, position, sets(id, set_index, weight_kg, reps, completed)")
      .single();

    if (!error && data) {
      setWorkout((w) => ({
        ...w,
        workout_exercises: [
          ...w.workout_exercises,
          {
            ...data,
            workout_id: w.id,
            user_id: userData.user!.id,
            sets: data.sets.map((s: any) => ({
              ...s,
              workout_exercise_id: data.id,
              user_id: userData.user!.id,
            })),
          },
        ],
      }));
      setNewExercise("");
    }
  }

  async function addSet(exerciseId: string) {
    const exercise = workout.workout_exercises.find((e) => e.id === exerciseId)!;
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("sets")
      .insert({
        workout_exercise_id: exerciseId,
        user_id: userData.user!.id,
        set_index: exercise.sets.length + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setWorkout((w) => ({
        ...w,
        workout_exercises: w.workout_exercises.map((e) =>
          e.id === exerciseId ? { ...e, sets: [...e.sets, data] } : e
        ),
      }));
    }
  }

  async function updateSet(
    exerciseId: string,
    setId: string,
    patch: Partial<Pick<SetRow, "weight_kg" | "reps" | "completed">>
  ) {
    setWorkout((w) => ({
      ...w,
      workout_exercises: w.workout_exercises.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            }
          : e
      ),
    }));
    await supabase.from("sets").update(patch).eq("id", setId);
  }

  async function finishWorkout() {
    setFinishing(true);
    await supabase
      .from("workouts")
      .update({ finished_at: new Date().toISOString() })
      .eq("id", workout.id);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="px-5 pb-2.5 pt-[18px]">
        <h2 className="text-[13px] font-semibold text-sub">
          {workout.name} · in progress
        </h2>
      </header>

      <main className="px-5 pb-[100px]">
        {workout.workout_exercises.map((ex) => (
          <div key={ex.id} className="card mb-3 px-4 py-3.5">
            <div className="mb-2 text-[15px] font-bold">{ex.exercise_name}</div>
            <div className="mb-1.5 grid grid-cols-[28px_1fr_1fr_32px] gap-2 text-[11px] text-sub">
              <span>Set</span>
              <span>kg</span>
              <span>Reps</span>
              <span></span>
            </div>
            {ex.sets
              .slice()
              .sort((a, b) => a.set_index - b.set_index)
              .map((s) => (
                <div
                  key={s.id}
                  className="mb-1.5 grid grid-cols-[28px_1fr_1fr_32px] items-center gap-2"
                >
                  <span className="text-sm text-sub">{s.set_index}</span>
                  <input
                    className="input-field"
                    inputMode="decimal"
                    defaultValue={s.weight_kg ?? ""}
                    onBlur={(e) =>
                      updateSet(ex.id, s.id, {
                        weight_kg: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                  <input
                    className="input-field"
                    inputMode="numeric"
                    defaultValue={s.reps ?? ""}
                    onBlur={(e) =>
                      updateSet(ex.id, s.id, {
                        reps: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                  <button
                    onClick={() => updateSet(ex.id, s.id, { completed: !s.completed })}
                    className={`h-7 w-7 rounded-lg border text-sm ${
                      s.completed
                        ? "border-good bg-good text-[#0B0D12]"
                        : "border-line bg-panel2 text-sub"
                    }`}
                  >
                    {s.completed ? "✓" : "–"}
                  </button>
                </div>
              ))}
            <button
              onClick={() => addSet(ex.id)}
              className="mt-1 w-full rounded-[10px] border border-dashed border-line py-2 text-[13px] text-sub"
            >
              + Add set
            </button>
          </div>
        ))}

        <form onSubmit={addExercise} className="mb-5 flex gap-2">
          <input
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            placeholder="Exercise name (e.g. Bench Press)"
            className="input-field flex-1 text-left"
          />
          <button
            type="submit"
            className="rounded-xl border border-dashed border-line px-4 text-sm font-semibold text-accent"
          >
            Add
          </button>
        </form>

        <button
          onClick={finishWorkout}
          disabled={finishing}
          className="btn-primary"
        >
          {finishing ? "Saving…" : "Finish Workout"}
        </button>
      </main>

      <BottomNav />
    </>
  );
}
