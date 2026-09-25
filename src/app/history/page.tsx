import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, started_at, finished_at, workout_exercises(sets(id))")
    .eq("user_id", user!.id)
    .not("finished_at", "is", null)
    .order("started_at", { ascending: false });

  return (
    <>
      <header className="px-5 pb-2.5 pt-[18px]">
        <h2 className="text-[13px] font-semibold text-sub">All workouts</h2>
      </header>

      <main className="px-5 pb-[100px]">
        {!workouts || workouts.length === 0 ? (
          <p className="py-6 text-center text-sm text-sub">
            Nothing here yet — finished workouts will show up in this list.
          </p>
        ) : (
          workouts.map((w) => {
            const sets = w.workout_exercises?.reduce(
              (n, ex) => n + (ex.sets?.length ?? 0),
              0
            );
            const minutes = w.finished_at
              ? Math.round(
                  (new Date(w.finished_at).getTime() -
                    new Date(w.started_at).getTime()) /
                    60000
                )
              : null;
            return (
              <div
                key={w.id}
                className="flex justify-between border-b border-line py-3.5"
              >
                <div>
                  <b className="block text-sm">{w.name}</b>
                  <span className="text-xs text-sub">
                    {new Date(w.started_at).toLocaleDateString()}
                    {minutes ? ` · ${minutes} min` : ""}
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-accent2">
                  {sets} sets
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
