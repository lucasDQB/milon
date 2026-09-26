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
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/");
      router.refresh();
      return;
    }

    // mode === "up"
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If "Confirm email" is enabled in Supabase, signUp succeeds but returns
    // no session until the user clicks the confirmation link. Show a
    // "check your email" message instead of redirecting into a session
    // that doesn't exist yet.
    if (!data.session) {
      setConfirmationSent(true);
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

      {confirmationSent ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-ink">
            Check <span className="font-medium">{email}</span> for a
            confirmation link to finish creating your account.
          </p>
          <button
            onClick={() => {
              setConfirmationSent(false);
              setMode("in");
            }}
            className="text-sm text-sub underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
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
      )}

      {!confirmationSent && (
        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-5 text-center text-sm text-sub"
        >
          {mode === "in"
            ? "No account yet? Sign up"
            : "Already have an account? Sign in"}
        </button>
      )}
    </div>
  );
}
