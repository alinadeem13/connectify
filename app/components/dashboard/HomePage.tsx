"use client";

import Carousel from "./components/Carousel";
import CreatorDashboard from "./components/CreatorDashboard";
import Feed from "./components/Feed";
import Link from "next/link";
import { useEffect, useState } from "react";

type CurrentUser = {
    name: string;
    role: "creator" | "consumer";
};

export const HomePage = () => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const response = await fetch("/api/auth/me", { cache: "no-store" });
            const result = await response.json();

            if (response.ok) {
                setUser(result.user);
            }

            setLoadingUser(false);
        };

        void loadUser();
    }, []);

    const isCreator = user?.role === "creator";

    return (
        <div className="min-h-full w-full bg-[radial-gradient(circle_at_top,#12345c_0%,#0b1224_38%,#08101d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
                <section className="w-full rounded-[2rem] border border-cyan-400/10 bg-slate-950/40 px-6 py-8 text-center shadow-[0_30px_90px_rgba(3,7,18,0.55)] backdrop-blur sm:px-8">
                    <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                        Connectify Feed
                    </span>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        {isCreator ? `Welcome back, ${user?.name ?? "creator"}.` : "Explore people, places, and moments from your global circle."}
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                        {isCreator
                            ? "Review your uploads, ratings, and audience activity from one Azure-powered creator view."
                            : "A brighter, clearer dashboard experience with stories up top and a cleaner social feed below."}
                    </p>
                </section>

                {loadingUser ? (
                    <section className="w-full rounded-[2rem] border border-white/10 bg-slate-900/55 p-8 text-center text-cyan-200 shadow-2xl">
                        Loading dashboard...
                    </section>
                ) : isCreator ? (
                    <CreatorDashboard />
                ) : (
                    <section className="w-full rounded-[2rem] border border-white/10 bg-slate-900/55 p-4 shadow-2xl backdrop-blur sm:p-6">
                        <div className="mb-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                                <p className="text-sm text-slate-300">
                                    Browse the live photo gallery and join the conversation.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href="/photos"
                                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:text-white"
                                >
                                    Open Gallery
                                </Link>
                            </div>
                        </div>

                        {/* Optional: Stories carousel */}
                        <Carousel />

                        {/* Feed with lazy loading */}
                        <Feed />
                    </section>
                )}
            </div>
        </div>
    );
}
