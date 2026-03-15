"use client";

import { useEffect, useState } from "react";

type ThreadKey = "bahrain" | "qatar" | "uae" | "dubai" | "saudi";

type ThreadItem = {
  key: ThreadKey;
  label: string;
  country: string;
  url: string;
};

export default function AdminThreadsPage() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [threads, setThreads] = useState<Record<ThreadKey, string>>({
    bahrain: "",
    qatar: "",
    uae: "",
    dubai: "",
    saudi: "",
  });

  async function loadThreads() {
    setError("");
    const res = await fetch("/api/admin/threads", { cache: "no-store" });

    if (res.status === 401) {
      setAuthorized(false);
      setChecking(false);
      return;
    }

    const json = await res.json();
    const list: ThreadItem[] = json.threads || [];

    const nextThreads: Record<ThreadKey, string> = {
      bahrain: "",
      qatar: "",
      uae: "",
      dubai: "",
      saudi: "",
    };

    for (const item of list) {
      nextThreads[item.key] = item.url;
    }

    setThreads(nextThreads);
    setAuthorized(true);
    setChecking(false);
  }

  useEffect(() => {
    loadThreads().catch(() => {
      setChecking(false);
      setAuthorized(false);
      setError("Failed to load admin state.");
    });
  }, []);

  async function login() {
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Wrong password.");
      return;
    }

    setPassword("");
    await loadThreads();
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(threads),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Failed to save.");
        return;
      }

      setMessage("Threads saved successfully.");
      await loadThreads();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8">
            <div className="text-xl font-semibold">Loading admin panel...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Hidden Admin
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
              Reddit Thread Control
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Enter your admin password to manage the current megathread links.
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") login();
                  }}
                  placeholder="Enter admin password"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={login}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const fields: Array<{ key: ThreadKey; label: string }> = [
    { key: "bahrain", label: "Bahrain" },
    { key: "qatar", label: "Qatar" },
    { key: "uae", label: "UAE" },
    { key: "dubai", label: "Dubai" },
    { key: "saudi", label: "Saudi" },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Hidden Admin
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-50">
                Reddit Thread Settings
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                Paste the current Reddit megathread links here. These saved URLs
                override the fallback defaults in code and can be updated any time
                after deployment.
              </p>
            </div>

            <div className="text-xs text-zinc-500">
              Route: <span className="text-zinc-300">/admin/threads</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8">
          <div className="grid gap-5">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  {field.label} thread URL
                </label>

                <input
                  type="url"
                  value={threads[field.key]}
                  onChange={(e) =>
                    setThreads((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={`Paste ${field.label} megathread URL`}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Threads"}
            </button>

            {message && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}