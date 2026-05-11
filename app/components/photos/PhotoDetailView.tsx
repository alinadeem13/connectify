'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Post } from "@/lib/types";

export default function PhotoDetailView({ photoId }: { photoId: string }) {
    const [photo, setPhoto] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [ratingValue, setRatingValue] = useState("5");
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        let ignore = false;

        const loadPhoto = async () => {
            const response = await fetch(`/api/photos/${photoId}`, { cache: "no-store" });
            const result = await response.json();

            if (!ignore) {
                if (response.ok) {
                    setPhoto(result.photo);
                }
                setLoading(false);
            }
        };

        void loadPhoto();

        return () => {
            ignore = true;
        };
    }, [photoId]);

    const submitComment = async () => {
        if (!commentText.trim()) return;

        const response = await fetch(`/api/photos/${photoId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: commentText }),
        });
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                setShowAuthModal(true);
                return;
            }

            toast.error(result.message ?? "Unable to add comment.");
            return;
        }

        setPhoto(result.photo);
        setCommentText("");
        toast.success("Comment added.");
    };

    const submitRating = async () => {
        const response = await fetch(`/api/photos/${photoId}/ratings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ value: Number(ratingValue) }),
        });
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                setShowAuthModal(true);
                return;
            }

            toast.error(result.message ?? "Unable to save rating.");
            return;
        }

        setPhoto(result.photo);
        toast.success("Rating saved.");
    };

    if (loading) {
        return <p className="text-center text-cyan-200">Loading photo...</p>;
    }

    if (!photo) {
        return <p className="text-center text-rose-300">Photo not found.</p>;
    }

    return (
        <>
            <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 shadow-2xl">
                    <img src={photo.image} alt={photo.title} className="h-full w-full object-cover" />
                </section>

                <section className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-2xl backdrop-blur">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{photo.title}</h1>
                        <p className="mt-2 text-cyan-200">@{photo.username}</p>
                        <p className="mt-4 text-slate-300">{photo.caption}</p>
                    </div>

                    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                        <p><span className="font-semibold text-white">Location:</span> {photo.location}</p>
                        <p><span className="font-semibold text-white">People Present:</span> {photo.people.join(", ") || "None listed"}</p>
                        <p><span className="font-semibold text-white">Average Rating:</span> {photo.averageRating?.toFixed(1) ?? "0.0"} / 5</p>
                        <p><span className="font-semibold text-white">Ratings Submitted:</span> {photo.ratingCount ?? 0}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h2 className="text-lg font-semibold text-white">Rate this photo</h2>
                        <div className="mt-4 flex gap-3">
                            <select
                                value={ratingValue}
                                onChange={(e) => setRatingValue(e.target.value)}
                                className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            >
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <option key={value} value={value}>
                                        {value} stars
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => void submitRating()}
                                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
                            >
                                Save Rating
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h2 className="text-lg font-semibold text-white">Comments</h2>
                        <div className="mt-4 space-y-3">
                            {photo.comments.map((comment) => (
                                <div key={comment.id} className="rounded-xl bg-slate-950/60 px-4 py-3">
                                    <p className="text-sm font-semibold text-cyan-200">{comment.author}</p>
                                    <p className="mt-1 text-sm text-slate-200">{comment.text}</p>
                                </div>
                            ))}
                            {photo.comments.length === 0 && (
                                <p className="text-sm text-slate-400">No comments yet.</p>
                            )}
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="min-h-28 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            />
                            <button
                                type="button"
                                onClick={() => void submitComment()}
                                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
                            >
                                Add Comment
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-required-title">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 text-center shadow-2xl">
                        <h2 id="auth-required-title" className="text-2xl font-bold text-white">Create an account first</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            You can browse photos freely, but you need an account to comment or rate posts.
                        </p>

                        <div className="mt-6 grid gap-3">
                            <Link
                                href="/signup"
                                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
                            >
                                Sign up
                            </Link>
                            <Link href="/login" className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
                                Already have an account? Sign in
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAuthModal(false)}
                            className="mt-5 text-sm text-slate-400 transition hover:text-white"
                        >
                            Keep browsing
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
