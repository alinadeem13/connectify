'use client'

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

const starterImages = [
    "/images/post1.jpg",
    "/images/post2.jpg",
    "/images/post3.jpg",
    "/images/post4.jpg",
    "/images/post5.jpg",
];

export default function PostComposer() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        caption: "",
        location: "",
        people: "",
        image: starterImages[0],
    });

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("/api/auth/me", { cache: "no-store" });
                const result = await response.json();
                if (response.ok) {
                    setUser(result.user);
                }
            } finally {
                setLoadingUser(false);
            }
        };

        fetchCurrentUser();
    }, []);

    if (loadingUser) {
        return (
            <div className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/40 px-6 py-5 text-sm text-slate-300">
                Loading creator tools...
            </div>
        );
    }

    if (!user) return null;

    if (user.role !== "creator") {
        return (
            <section className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/40 px-6 py-5 shadow-xl backdrop-blur">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Community Access</h2>
                        <p className="text-sm text-slate-300">
                            You are signed in as a consumer. Consumers can browse, comment, and engage with posts.
                        </p>
                    </div>
                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                        Consumer
                    </span>
                </div>
            </section>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: form.title,
                    caption: form.caption,
                    location: form.location,
                    people: form.people.split(",").map((entry) => entry.trim()).filter(Boolean),
                    image: form.image,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                toast.error(result.message ?? "Unable to publish post.");
                return;
            }

            toast.success("Post published successfully.");
            setForm({
                title: "",
                caption: "",
                location: "",
                people: "",
                image: starterImages[0],
            });
            window.dispatchEvent(new CustomEvent("connectify:post-created", { detail: result.post }));
        } catch {
            toast.error("Something went wrong while publishing your post.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6 shadow-xl backdrop-blur">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Create a Post</h2>
                    <p className="text-sm text-slate-300">
                        Signed in as {user.name} (@{user.username}). Publish directly to the live community feed.
                    </p>
                </div>
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                    Creator
                </span>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Post title"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    required
                />
                <textarea
                    placeholder="Write your caption"
                    value={form.caption}
                    onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
                    className="min-h-32 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 md:col-span-2"
                    required
                />
                <input
                    type="text"
                    placeholder="People present, separated by commas"
                    value={form.people}
                    onChange={(e) => setForm((prev) => ({ ...prev, people: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                />
                <select
                    value={form.image}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                >
                    {starterImages.map((image, index) => (
                        <option key={image} value={image}>
                            Demo image {index + 1}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
                >
                    {submitting ? "Publishing..." : "Publish Post"}
                </button>
            </form>
        </section>
    );
}
