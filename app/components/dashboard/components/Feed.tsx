'use client'

import { useEffect, useState } from 'react';
import { Post } from '@/lib/types';
import PostCard from './PostCard';

export default function Feed() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const limit = 5;
    const hasMorePosts = page * limit < allPosts.length;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("/api/posts", { cache: "no-store" });
                const result = await response.json();

                if (!response.ok) {
                    setError(result.message ?? "Unable to load posts.");
                    return;
                }

                setAllPosts(result.posts);
                setPosts(result.posts.slice(0, limit));
            } catch {
                setError("Unable to load posts right now.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
                !loading &&
                hasMorePosts
            ) {
                setLoading(true);
                setTimeout(() => {
                    const nextPosts = allPosts.slice(page * limit, (page + 1) * limit);
                    setPosts((prev) => [...prev, ...nextPosts]);
                    setPage((prev) => prev + 1);
                    setLoading(false);
                }, 500);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMorePosts, loading, page, allPosts]);

    if (initialLoading) {
        return <p className="py-8 text-center text-sm font-medium text-cyan-200">Loading feed...</p>;
    }

    if (error) {
        return <p className="py-8 text-center text-sm text-rose-300">{error}</p>;
    }

    return (
        <div className="mt-4 flex w-full flex-col items-center space-y-5">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
            {loading && <p className="py-4 text-center text-sm font-medium text-cyan-200">Loading more posts...</p>}
            {!hasMorePosts && <p className="py-2 text-center text-sm text-slate-400">You&apos;re all caught up.</p>}
        </div>
    );
}
