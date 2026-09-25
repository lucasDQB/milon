"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogWeightForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    setSaving(true);
    await supabase.from("body_metrics").insert({
      user_id: userId,
      weight_kg: Number(weight),
      recorded_at: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    setWeight("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        inputMode="decimal"
        placeholder="Today's weight (kg)"
        className="input-field flex-1 text-left"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl border border-dashed border-line px-4 text-sm font-semibold text-accent"
      >
        {saving ? "…" : "Log"}
      </button>
    </form>
  );
}
