// components/Carousel.tsx
'use client'
export default function Carousel() {
    const stories = Array.from({ length: 10 }, (_, i) => `/images/post${(i % 5) + 1}.jpg`);

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

            <div className="flex justify-center gap-4 overflow-x-auto pb-2">
            {stories.map((src, index) => (
                <div key={index} className="flex w-20 flex-shrink-0 flex-col items-center gap-2">
                    <div className="rounded-full bg-gradient-to-br from-sky-400 via-cyan-300 to-cyan-500 p-[3px] shadow-[0_0_24px_rgba(56,189,248,0.25)]">
                        <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-900/80 bg-slate-900">
                            <img src={src} alt={`Story ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                    </div>
                    <span className="text-xs font-medium text-slate-300">Story {index + 1}</span>
                </div>
            ))}
            </div>
        </div>
    );
}
