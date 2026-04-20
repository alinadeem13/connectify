'use client'

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Post } from "@/lib/types";

export default function PhotoGallery() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [photos, setPhotos] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [location, setLocation] = useState(searchParams.get("location") ?? "");
    const [person, setPerson] = useState(searchParams.get("person") ?? "");

    useEffect(() => {
        let ignore = false;

        const loadPhotos = async () => {
            setLoading(true);

            const response = await fetch(`/api/photos?${searchParams.toString()}`, { cache: "no-store" });
            const result = await response.json();

            if (!ignore) {
                setPhotos(result.photos ?? []);
                setLoading(false);
            }
        };

        void loadPhotos();

        return () => {
            ignore = true;
        };
    }, [searchParams]);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-2xl backdrop-blur">
                <h1 className="text-3xl font-bold text-white sm:text-4xl">Photo Gallery</h1>
                <p className="mt-2 text-slate-300">
                    Search photos by title, caption, location, or people present.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search photos"
                        className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Filter by location"
                        className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <input
                        value={person}
                        onChange={(e) => setPerson(e.target.value)}
                        placeholder="Filter by person"
                        className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (query.trim()) params.set("q", query.trim());
                            if (location.trim()) params.set("location", location.trim());
                            if (person.trim()) params.set("person", person.trim());
                            const queryString = params.toString();
                            router.push(queryString ? `/photos?${queryString}` : "/photos");
                        }}
                        className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
                    >
                        Search
                    </button>
                </div>
            </section>

            {loading ? (
                <p className="text-center text-cyan-200">Loading photos...</p>
            ) : (
                <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo) => (
                        <Link
                            key={photo.id}
                            href={`/photos/${photo.id}`}
                            className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/50 shadow-xl transition hover:-translate-y-1 hover:border-cyan-300/30"
                        >
                            <img src={photo.image} alt={photo.title} className="h-64 w-full object-cover" />
                            <div className="space-y-2 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{photo.title}</h2>
                                        <p className="text-sm text-cyan-200">@{photo.username}</p>
                                    </div>
                                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                                        {photo.averageRating?.toFixed(1) ?? "0.0"} / 5
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-sm text-slate-300">{photo.caption}</p>
                                <div className="flex items-center justify-between text-sm text-slate-400">
                                    <span>{photo.location}</span>
                                    <span>{photo.comments.length} comments</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>
            )}
        </div>
    );
}
