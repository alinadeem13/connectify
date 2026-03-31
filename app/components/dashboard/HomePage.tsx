import Carousel from "./components/Carousel";
import Feed from "./components/Feed";

export const HomePage = () => {
    return (
        <div className="min-h-full w-full bg-[radial-gradient(circle_at_top,#12345c_0%,#0b1224_38%,#08101d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
                <section className="w-full rounded-[2rem] border border-cyan-400/10 bg-slate-950/40 px-6 py-8 text-center shadow-[0_30px_90px_rgba(3,7,18,0.55)] backdrop-blur sm:px-8">
                    <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                        Connectify Feed
                    </span>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Explore people, places, and moments from your global circle.
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                        A brighter, clearer dashboard experience with stories up top and a cleaner social feed below.
                    </p>
                </section>

                <section className="w-full rounded-[2rem] border border-white/10 bg-slate-900/55 p-4 shadow-2xl backdrop-blur sm:p-6">
                    {/* Optional: Stories carousel */}
                    <Carousel />

                    {/* Feed with lazy loading */}
                    <Feed />
                </section>
            </div>
        </div>
    );
}
