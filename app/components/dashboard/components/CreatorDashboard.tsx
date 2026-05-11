"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCamera, FiMessageCircle, FiStar, FiTrendingUp } from "react-icons/fi";
import { Post } from "@/lib/types";

type CreatorDashboardData = {
  stats: {
    totalUploads: number;
    totalComments: number;
    totalRatings: number;
    averageRating: number;
    topPost: Post | null;
  };
  posts: Post[];
};

const emptyData: CreatorDashboardData = {
  stats: {
    totalUploads: 0,
    totalComments: 0,
    totalRatings: 0,
    averageRating: 0,
    topPost: null,
  },
  posts: [],
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function CreatorDashboard() {
  const [data, setData] = useState<CreatorDashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/creator/dashboard", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Unable to load creator dashboard.");
          return;
        }

        setData(result);
      } catch {
        setError("Unable to load creator dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <section className="w-full rounded-[2rem] border border-white/10 bg-slate-900/55 p-8 text-center text-cyan-200 shadow-2xl">
        Loading creator dashboard...
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-center text-rose-200 shadow-2xl">
        {error}
      </section>
    );
  }

  return (
    <section className="w-full space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/55 p-4 shadow-2xl backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-200">
            Creator dashboard
          </span>
          <h2 className="mt-3 text-2xl font-bold text-white">Your content performance</h2>
          <p className="mt-1 text-sm text-slate-300">
            Track uploads, ratings, and community response across your photo posts.
          </p>
        </div>
        <Link
          href="/creator/upload"
          className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
        >
          Upload Photo
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Photos uploaded" value={data.stats.totalUploads} icon={<FiCamera size={20} />} />
        <StatCard label="Comments received" value={data.stats.totalComments} icon={<FiMessageCircle size={20} />} />
        <StatCard label="Ratings submitted" value={data.stats.totalRatings} icon={<FiStar size={20} />} />
        <StatCard label="Average rating" value={`${data.stats.averageRating.toFixed(1)} / 5`} icon={<FiTrendingUp size={20} />} />
      </div>

      {data.stats.topPost && (
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
          <p className="text-sm font-semibold uppercase text-cyan-200">Top post</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={data.stats.topPost.image} alt={data.stats.topPost.title} className="h-28 w-full rounded-xl object-cover sm:w-40" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-white">{data.stats.topPost.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-300">{data.stats.topPost.caption}</p>
              <p className="mt-2 text-sm text-cyan-200">
                {(data.stats.topPost.averageRating ?? 0).toFixed(1)} / 5 from {data.stats.topPost.ratingCount ?? 0} ratings
              </p>
            </div>
            <Link href={`/photos/${data.stats.topPost.id}`} className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:text-white">
              View
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Your uploads</h3>
            <p className="text-sm text-slate-300">Review how each photo is performing.</p>
          </div>
          <Link href="/photos" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Open gallery
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {data.posts.map((post) => (
            <Link
              key={post.id}
              href={`/photos/${post.id}`}
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-300/30 sm:grid-cols-[7rem_1fr_auto]"
            >
              <img src={post.image} alt={post.title} className="h-28 w-full rounded-xl object-cover sm:h-24" />
              <div className="min-w-0">
                <h4 className="truncate text-lg font-semibold text-white">{post.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-slate-300">{post.caption}</p>
                <p className="mt-2 text-xs text-slate-400">{post.location}</p>
              </div>
              <div className="flex gap-3 text-sm text-slate-300 sm:flex-col sm:items-end sm:justify-center">
                <span>{post.comments.length} comments</span>
                <span>{(post.averageRating ?? 0).toFixed(1)} / 5</span>
              </div>
            </Link>
          ))}

          {data.posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
              <p className="text-lg font-semibold text-white">No uploads yet</p>
              <p className="mt-2 text-sm text-slate-300">Upload your first photo to start building your creator dashboard.</p>
              <Link
                href="/creator/upload"
                className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
              >
                Upload Photo
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
