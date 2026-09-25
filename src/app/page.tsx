import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, started_at, finished_at, workout_exercises(id, sets(id))")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const { data: latestWeight } = await supabase
    .from("body_metrics")
    .select("weight_kg")
    .eq("user_id", user!.id)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weekCount } = await supabase
    .from("workouts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("started_at", weekAgo.toISOString());

  return (
    <>
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-[5] bg-bg px-5 pb-2.5 pt-[18px]">
        <div className="font-display text-[22px] font-bold tracking-tight">
          Mi<span className="text-accent">lon</span>
        </div>
        <div className="mt-0.5 text-[13px] text-sub">
          {new Date().toLocaleDateString(undefined, { weekday: "long" })}
        </div>
      </header>

      <main className="px-5 pb-[100px] pt-1">
        <div className="my-3.5 grid grid-cols-3 gap-2.5">
          <Stat value={weekCount ?? 0} label="This week" />
          <Stat value={workouts?.length ?? 0} label="Recent logs" />
          <Stat
            value={latestWeight ? `${latestWeight.weight_kg}kg` : "—"}
            label="Bodyweight"
          />
        </div>

        <Link href="/workout/new" className="btn-primary mb-5 block text-center">
          Start Workout
        </Link>

        <h2 className="mb-2.5 mt-4 text-[13px] font-semibold text-sub">
          Recent workouts
        </h2>

        {!workouts || workouts.length === 0 ? (
          <p className="py-6 text-center text-sm text-sub">
            No workouts yet — start your first one above.
          </p>
        ) : (
          workouts.map((w) => {
            const setCount = w.workout_exercises?.reduce(
              (n, ex) => n + (ex.sets?.length ?? 0),
              0
            );
            return (
              <div key={w.id} className="card mb-2.5 px-4 py-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] font-bold">{w.name}</span>
                  <span className="text-xs text-sub">
                    {new Date(w.started_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1.5 text-[13px] text-sub">
                  {w.workout_exercises?.length ?? 0} exercises · {setCount} sets
                </div>
              </div>
            );
          })
        )}
      </main>

      <BottomNav />
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card px-2.5 py-3.5 text-center">
      <b className="font-display block text-xl">{value}</b>
      <span className="text-[11px] text-sub">{label}</span>
    </div>
  );
}
