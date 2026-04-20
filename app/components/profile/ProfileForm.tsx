"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "creator" | "consumer";
  createdAt: string;
};

export default function ProfileForm() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const result = await response.json();

      if (response.ok) {
        setUser(result.user);
        setForm({
          name: result.user.name,
          username: result.user.username,
        });
      }

      setLoading(false);
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message ?? "Profile update failed.");
        return;
      }

      setUser(result.user);
      toast.success("Profile updated.");
    } catch {
      toast.error("Something went wrong while updating your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-cyan-200">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-center text-rose-300">Please log in to view your profile.</p>;
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6 shadow-xl backdrop-blur">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-3xl font-bold text-slate-950">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-5 text-3xl font-bold text-white">{user.name}</h1>
        <p className="mt-1 text-cyan-200">@{user.username}</p>

        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-white">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold text-white">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-semibold text-white">Joined:</span>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6 shadow-xl backdrop-blur">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
        <p className="mt-2 text-sm text-slate-300">
          Update your display name and username.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Username
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-400">
            Email
            <input
              type="email"
              value={user.email}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-400"
              disabled
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-400">
            Role
            <input
              type="text"
              value={user.role}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 capitalize text-slate-400"
              disabled
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
