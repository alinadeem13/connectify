export const HomePage = () => {
    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-900/40 to-slate-800/40 px-4 py-10 text-white">
            <h1 className="mb-3 text-center text-4xl font-bold sm:text-5xl">Welcome to Connectify!</h1>
            <p className="mb-8 max-w-2xl text-center text-lg text-slate-200">Your social hub with quick access to profile, posts, and discovery.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4">
                <button className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-900 shadow-lg transition hover:from-sky-400 hover:to-cyan-300">View Profile</button>
                <button className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-3 font-semibold text-slate-900 shadow-lg transition hover:from-emerald-400 hover:to-lime-300">Create Post</button>
                <button className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-fuchsia-400 hover:to-purple-400">Explore</button>
            </div>
        </div>
    );
}
