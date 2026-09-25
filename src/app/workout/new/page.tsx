import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewWorkoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("workouts")
    .insert({ user_id: user!.id, name: "Workout" })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/");
  }

  redirect(`/workout/${data.id}`);
}
