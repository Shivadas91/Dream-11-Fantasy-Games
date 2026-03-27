import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="fade-in min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-10">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full navy-card flex items-center justify-center border-2 gold-border shadow-[0_0_40px_hsl(45_100%_50%/0.2)]">
            <span className="text-5xl">🏏</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gold-gradient">
              IPL Fantasy
            </h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(220 15% 55%)' }}>
              Private League Dashboard
            </p>
          </div>
        </div>

        <div className="shimmer-line" />

        {/* Navigation buttons */}
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => navigate("/ipl-2026")}
            className="nav-button w-full py-5 px-6 rounded-xl text-lg flex items-center gap-4"
          >
            <span className="text-3xl">🏆</span>
            <span>IPL 2026</span>
            <span className="ml-auto text-xl" style={{ color: 'hsl(45 100% 50%)' }}>›</span>
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="nav-button w-full py-5 px-6 rounded-xl text-lg flex items-center gap-4"
          >
            <span className="text-3xl">🥇</span>
            <span>Overall Leaderboard</span>
            <span className="ml-auto text-xl" style={{ color: 'hsl(45 100% 50%)' }}>›</span>
          </button>

          <button
            onClick={() => navigate("/archives")}
            className="nav-button w-full py-5 px-6 rounded-xl text-lg flex items-center gap-4"
          >
            <span className="text-3xl">📂</span>
            <span>Archives</span>
            <span className="ml-auto text-xl" style={{ color: 'hsl(45 100% 50%)' }}>›</span>
          </button>
        </div>

        <p className="text-xs text-center" style={{ color: 'hsl(220 15% 40%)' }}>
          Private League · Members Only
        </p>
      </div>
    </div>
  );
}
