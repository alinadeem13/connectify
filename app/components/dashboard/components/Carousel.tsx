// components/Carousel.tsx
'use client'
import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Carousel() {
    const stories = Array.from({ length: 20 }, (_, i) => `/images/post${(i % 5) + 1}.jpg`);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = 96;
        const gap = 16;
        const scrollAmount = (cardWidth + gap) * 3;

        container.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4 shadow-lg">
            <div className="mb-4 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                    <h2 className="text-lg font-semibold text-white">Stories</h2>
                    <p className="text-sm text-slate-300">Quick snapshots from your network.</p>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    Live circle
                </span>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => handleScroll("left")}
                    className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/85 p-2 text-slate-100 shadow-lg transition hover:border-cyan-300/40 hover:text-cyan-200 md:inline-flex"
                    aria-label="Scroll stories left"
                >
                    <FiChevronLeft size={18} />
                </button>

                <div
                    ref={scrollRef}
                    className="scrollbar-hidden flex snap-x snap-mandatory justify-start gap-4 overflow-x-auto px-1 pb-2 scroll-smooth"
                >
                    {stories.map((src, index) => (
                        <div key={index} className="flex w-20 flex-shrink-0 snap-start flex-col items-center gap-2">
                            <div className="rounded-full bg-gradient-to-br from-sky-400 via-cyan-300 to-cyan-500 p-[3px] shadow-[0_0_24px_rgba(56,189,248,0.25)]">
                                <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-900/80 bg-slate-900">
                                    <img src={src} alt={`Story ${index + 1}`} className="h-full w-full object-cover" />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-300">Story {index + 1}</span>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => handleScroll("right")}
                    className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/85 p-2 text-slate-100 shadow-lg transition hover:border-cyan-300/40 hover:text-cyan-200 md:inline-flex"
                    aria-label="Scroll stories right"
                >
                    <FiChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
