// components/PostCard.tsx
'use client'

import { useState } from "react";
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";

type Comment = {
    id: number;
    author: string;
    text: string;
};

type PostProps = {
    id: number;
    title: string;
    caption: string;
    location: string;
    people: string[];
    image: string;
    comments?: Comment[];
};

export default function PostCard({ post }: { post: PostProps }) {
    const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
    const [commentInput, setCommentInput] = useState("");
    const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

    const handleAddComment = () => {
        const trimmedComment = commentInput.trim();

        if (!trimmedComment) return;

        setComments((prev) => [
            ...prev,
            {
                id: Date.now(),
                author: "You",
                text: trimmedComment,
            },
        ]);
        setCommentInput("");
    };

    return (
        <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/55 shadow-[0_18px_60px_rgba(2,6,23,0.45)] backdrop-blur">
            <div className="border-b border-white/10 px-5 py-4 text-center sm:px-6">
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between sm:text-left">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                        {post.location && <p className="mt-1 text-sm text-cyan-200">{post.location}</p>}
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                        Shared now
                    </span>
                </div>
            </div>

            <img src={post.image} alt={post.title} className="h-72 w-full object-cover sm:h-96" />

            <div className="space-y-3 px-5 py-5 text-center sm:px-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="rounded-full p-2 text-slate-200 transition hover:bg-white/10 hover:text-cyan-200"
                            aria-label="Like post"
                        >
                            <FiHeart size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCommentBoxOpen((prev) => !prev)}
                            className="rounded-full p-2 text-slate-200 transition hover:bg-white/10 hover:text-cyan-200"
                            aria-label="Comment on post"
                        >
                            <FiMessageCircle size={20} />
                        </button>
                        <button
                            type="button"
                            className="rounded-full p-2 text-slate-200 transition hover:bg-white/10 hover:text-cyan-200"
                            aria-label="Share post"
                        >
                            <FiSend size={20} />
                        </button>
                    </div>

                    <button
                        type="button"
                        className="rounded-full p-2 text-slate-200 transition hover:bg-white/10 hover:text-cyan-200"
                        aria-label="Save post"
                    >
                        <FiBookmark size={20} />
                    </button>
                </div>

                <div className="space-y-1 text-left">
                    <p className="text-sm font-semibold text-white">Liked by your network</p>
                    <p className="text-sm text-slate-400">{comments.length} comments</p>
                </div>

                <p className="text-base leading-7 text-slate-200">{post.caption}</p>

                {post.people.length > 0 && (
                    <p className="text-sm text-slate-300">
                        People Present: {post.people.join(', ')}
                    </p>
                )}

                {isCommentBoxOpen && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div key={comment.id} className="rounded-xl bg-slate-950/60 px-4 py-3">
                                    <p className="text-sm font-semibold text-cyan-200">{comment.author}</p>
                                    <p className="mt-1 text-sm text-slate-200">{comment.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                                placeholder="Add a comment..."
                                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            />
                            <button
                                type="button"
                                onClick={handleAddComment}
                                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center gap-2 border-t border-white/10 pt-4 text-sm text-slate-400 sm:flex-row sm:justify-between sm:text-left">
                    <span>Connectify community post</span>
                    <span className="text-cyan-200">View conversation</span>
                </div>
            </div>
        </article>
    );
}
