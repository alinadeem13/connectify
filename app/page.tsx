export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-10 rounded-2xl shadow-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Social made simple</p>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">Welcome to Connectify</h1>
        <p className="text-lg text-slate-200">
          Stay connected, manage your dashboard, and engage with your community from any device.
        </p>
      </div>
    </div>
  );
}
