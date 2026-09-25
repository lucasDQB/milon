import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import LogWeightForm from "./LogWeightForm";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: metrics } = await supabase
    .from("body_metrics")
    .select("recorded_at, weight_kg")
    .eq("user_id", user!.id)
    .order("recorded_at", { ascending: true })
    .limit(8);

  // Best set per exercise (by weight) across all of this user's sets.
  const { data: sets } = await supabase
    .from("sets")
    .select(
      "weight_kg, reps, workout_exercises(exercise_name), created_at:workout_exercise_id"
    )
    .eq("user_id", user!.id)
    .not("weight_kg", "is", null)
    .order("weight_kg", { ascending: false });

  const prByExercise = new Map<string, number>();
  sets?.forEach((s: any) => {
    const name = s.workout_exercises?.exercise_name;
    if (!name) return;
    if (!prByExercise.has(name) || prByExercise.get(name)! < s.weight_kg) {
      prByExercise.set(name, s.weight_kg);
    }
  });
  const prs = Array.from(prByExercise.entries()).slice(0, 8);

  const weights = metrics?.map((m) => m.weight_kg) ?? [];
  const max = weights.length ? Math.max(...weights) : 1;
  const min = weights.length ? Math.min(...weights) - 0.5 : 0;

  return (
    <>
      <header className="px-5 pb-2.5 pt-[18px]">
        <h2 className="text-[13px] font-semibold text-sub">Profile</h2>
      </header>

      <main className="px-5 pb-[100px]">
        <h3 className="mb-2.5 mt-1 text-[13px] font-semibold text-sub">
          Bodyweight
        </h3>

        {weights.length > 0 && (
          <div className="my-4 flex h-[120px] items-end gap-1.5">
            {weights.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-b from-accent to-[#3A5ED9]"
                style={{ height: `${10 + ((v - min) / (max - min || 1)) * 100}px` }}
              />
            ))}
          </div>
        )}

        <LogWeightForm userId={user!.id} />

        <h3 className="mb-2.5 mt-7 text-[13px] font-semibold text-sub">
          Personal records
        </h3>
        {prs.length === 0 ? (
          <p className="py-4 text-center text-sm text-sub">
            Log some sets with weights to see PRs here.
          </p>
        ) : (
          prs.map(([name, weight]) => (
            <div
              key={name}
              className="flex items-center justify-between border-b border-line py-3"
            >
              <span className="text-sm">{name}</span>
              <span className="font-display text-base font-bold text-accent">
                {weight}kg
              </span>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </>
  );
}
