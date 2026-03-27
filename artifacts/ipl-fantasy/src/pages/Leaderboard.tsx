import { useLocation } from "wouter";

const leaderboard = [
  { name: "Shawn", trophies: "🎖️🎖️🎖️🎖️", rank: 1 },
  { name: "Jishnu", trophies: "🎖️🎖️", rank: 2 },
  { name: "Mobin", trophies: "🎖️⭐", rank: 3 },
  { name: "Sivdas", trophies: "🎖️", rank: 4 },
  { name: "Jolly", trophies: "⭐", rank: 5 },
];

export default function Leaderboard() {
  const [, navigate] = useLocation();

  return (
    <div className="fade-in min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'hsl(45 100% 60%)' }}
        >
          ← Back to Home
        </button>

        <div className="navy-card rounded-2xl p-6 shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl trophy-glow">🏆</span>
            <div>
              <h1 className="text-2xl font-extrabold gold-gradient">Fantasy Trophy Club</h1>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(220 15% 50%)' }}>All-time champions</p>
            </div>
          </div>

          <div className="shimmer-line mb-6" />

          <div className="flex flex-col gap-3">
            {leaderboard.map((player) => (
              <div
                key={player.name}
                className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                style={{
                  background: player.rank === 1
                    ? 'linear-gradient(135deg, hsl(45 100% 50% / 0.12), hsl(45 100% 50% / 0.06))'
                    : 'hsl(220 40% 10%)',
                  border: player.rank === 1
                    ? '1px solid hsl(45 100% 50% / 0.4)'
                    : '1px solid hsl(220 30% 18%)',
                }}
              >
                <span className="rank-badge text-sm">{player.rank}</span>
                <span className="font-bold text-lg flex-1" style={{ color: player.rank === 1 ? 'hsl(45 100% 70%)' : 'hsl(45 80% 90%)' }}>
                  {player.name}
                </span>
                <span className="text-xl tracking-wider">{player.trophies}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 text-center text-xs" style={{ borderTop: '1px solid hsl(220 30% 18%)', color: 'hsl(220 15% 45%)' }}>
            🎖️ = Contest &nbsp;·&nbsp; ⭐ = Fantasy Team
          </div>
        </div>
      </div>
    </div>
  );
}
