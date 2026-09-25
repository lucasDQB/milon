"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6">
      <div className="mb-10 text-center">
        <div className="font-display text-3xl font-bold tracking-tight">
          Mi<span className="text-accent">lon</span>
        </div>
        <p className="mt-2 text-sm text-sub">
          {mode === "in" ? "Welcome back." : "Create your account."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink placeholder:text-sub"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink placeholder:text-sub"
        />

        {error && <p className="text-sm text-[#FF6B6B]">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? "Please wait…" : mode === "in" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="mt-5 text-center text-sm text-sub"
      >
        {mode === "in"
          ? "No account yet? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
