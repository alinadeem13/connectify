// components/Feed.tsx
'use client'
import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { mockPosts } from '../mockPosts';

export default function Feed() {
    const [posts, setPosts] = useState(mockPosts.slice(0, 5)); // initial posts
    const [page, setPage] = useState(1); // page number
    const [loading, setLoading] = useState(false);
    const limit = 5; // posts per load
    const hasMorePosts = page * limit < mockPosts.length;

    const loadMorePosts = () => {
        if (loading || !hasMorePosts) return;

        setLoading(true);
        setTimeout(() => {
            const nextPosts = mockPosts.slice(page * limit, (page + 1) * limit);
            setPosts((prev) => [...prev, ...nextPosts]);
            setPage((prev) => prev + 1);
            setLoading(false);
        }, 500); // simulate API delay
    };

    // Scroll event listener for lazy loading
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
                !loading &&
                hasMorePosts
            ) {
                loadMorePosts();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMorePosts, loading, page]);

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
