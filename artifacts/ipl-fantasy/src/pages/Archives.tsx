import { useState } from "react";
import { useLocation } from "wouter";

type View = "main" | "contest" | "fantasy";

const contestPoints = [
  {
    rank: 1,
    name: "Shawn",
    medals: "🥇🥈🥉🥇🥉🥇🥈🥈🥉🥉🥇🥈🥇🥇🥇🥇🥇🥇🥉🥉🥈🥈🥈🥈🥇🥇🥈🥈",
    total: 62,
    champion: true,
  },
  {
    rank: 2,
    name: "Sidharth",
    medals: "🥈🥉🥈🥉🥈🥇🥇🥈🥇🥇🥈🥇🥈🥉🥉🥇🥈🥉🥈🥇🥉🥉🥉🥇🥈🥈",
    total: 52,
    champion: false,
  },
  {
    rank: 3,
    name: "Shiva",
    medals: "🥉🥇🥇🥈🥈🥈🥈🥈🥉🥈🥉🥉🥉🥈🥇🥇🥇🥇🥉🥉🥉🥉🥈🥈🥉🥇🥈",
    total: 51,
    champion: false,
  },
  {
    rank: 4,
    name: "Jishnu",
    medals: "🥈🥈🥇🥈🥇🥇🥇🥈🥉🥈🥈🥈🥈🥉🥉🥈🥈🥇🥇🥉🥈",
    total: 44,
    champion: false,
  },
  {
    rank: 5,
    name: "Fenu",
    medals: "🥈🥈🥇🥇🥉🥈🥉🥉🥈🥈🥈🥇🥈🥈🥇🥈🥈🥈",
    total: 37,
    champion: false,
  },
  {
    rank: 6,
    name: "Mobin",
    medals: "🥇🥇🥈🥈🥈🥇🥈🥇🥇🥇🥇🥇🥇",
    total: 35,
    champion: false,
  },
  {
    rank: 7,
    name: "Jolly",
    medals: "🥈🥈🥈🥈🥈🥇🥈🥇🥈🥇🥉🥉",
    total: 25,
    champion: false,
  },
  {
    rank: 8,
    name: "Rijo",
    medals: "🥇",
    total: 3,
    champion: false,
  },
  {
    rank: 9,
    name: "Vaisakh",
    medals: "🥈",
    total: 2,
    champion: false,
  },
];

const fantasyPoints = [
  { rank: 1, name: "Jolly", score: "6️⃣9️⃣4️⃣9️⃣", numScore: 6949, champion: true },
  { rank: 2, name: "Mobin", score: "6️⃣0️⃣1️⃣5️⃣", numScore: 6015, champion: false },
  { rank: 3, name: "Shawn", score: "5️⃣5️⃣8️⃣5️⃣", numScore: 5585, champion: false },
  { rank: 4, name: "Shiva", score: "5️⃣4️⃣2️⃣5️⃣", numScore: 5425, champion: false },
  { rank: 5, name: "Jishnu", score: "5️⃣0️⃣2️⃣0️⃣", numScore: 5020, champion: false },
  { rank: 6, name: "Sidharth", score: "4️⃣7️⃣4️⃣8️⃣", numScore: 4748, champion: false },
  { rank: 7, name: "Rijo", score: "4️⃣6️⃣2️⃣9️⃣", numScore: 4629, champion: false },
  { rank: 8, name: "Vaisakh", score: "4️⃣5️⃣4️⃣6️⃣", numScore: 4546, champion: false },
  { rank: 9, name: "Amit", score: "4️⃣2️⃣6️⃣6️⃣", numScore: 4266, champion: false },
];

export default function Archives() {
  const [, navigate] = useLocation();
  const [year, setYear] = useState<string>("");
  const [view, setView] = useState<View>("main");

  const goBack = () => {
    if (view !== "main") {
      setView("main");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="fade-in min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'hsl(45 100% 60%)' }}
        >
          ← {view === "main" ? "Back to Home" : "Back to Archives"}
        </button>

        {view === "main" && (
          <div className="navy-card rounded-2xl p-6 shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📂</span>
              <div>
                <h1 className="text-2xl font-extrabold gold-gradient">Archives</h1>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(220 15% 50%)' }}>Historical seasons</p>
              </div>
            </div>

            <div className="shimmer-line mb-6" />

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(45 80% 70%)' }}>
                Select Season
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-2"
                style={{
                  background: 'hsl(220 40% 10%)',
                  border: '1px solid hsl(220 30% 22%)',
                  color: 'hsl(45 80% 90%)',
                  ringColor: 'hsl(45 100% 50%)',
                }}
              >
                <option value="">-- Select Year --</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {year === "2025" && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4 fade-in">
                <button
                  onClick={() => setView("contest")}
                  className="gold-button flex-1 py-4 px-6 rounded-xl text-base flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🏅</span>
                  CONTEST POINTS TABLE
                </button>
                <button
                  onClick={() => setView("fantasy")}
                  className="nav-button flex-1 py-4 px-6 rounded-xl text-base flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">⚡</span>
                  FANTASY TEAM
                </button>
              </div>
            )}
          </div>
        )}

        {view === "contest" && (
          <div className="navy-card rounded-2xl p-6 shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl trophy-glow">🏅</span>
              <div>
                <h2 className="text-xl font-extrabold gold-gradient">IPL 2025 Points Table</h2>
                <p className="text-xs" style={{ color: 'hsl(220 15% 50%)' }}>Contest medals per match</p>
              </div>
            </div>

            <div className="shimmer-line my-5" />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(220 30% 20%)' }}>
                    <th className="py-2 px-2 text-left font-semibold" style={{ color: 'hsl(45 80% 60%)', width: '2.5rem' }}>#</th>
                    <th className="py-2 px-2 text-left font-semibold" style={{ color: 'hsl(45 80% 60%)' }}>Player</th>
                    <th className="py-2 px-2 text-left font-semibold" style={{ color: 'hsl(45 80% 60%)' }}>Medals</th>
                    <th className="py-2 px-2 text-right font-semibold" style={{ color: 'hsl(45 80% 60%)' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {contestPoints.map((p) => (
                    <tr
                      key={p.name}
                      style={{
                        borderBottom: '1px solid hsl(220 30% 16%)',
                        background: p.champion ? 'hsl(45 100% 50% / 0.06)' : 'transparent',
                      }}
                    >
                      <td className="py-3 px-2">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                          style={{
                            background: p.champion ? 'linear-gradient(135deg, hsl(45 100% 55%), hsl(38 100% 45%))' : 'hsl(220 30% 18%)',
                            color: p.champion ? 'hsl(220 45% 8%)' : 'hsl(220 15% 60%)',
                          }}
                        >
                          {p.rank}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-semibold" style={{ color: p.champion ? 'hsl(45 100% 70%)' : 'hsl(45 80% 90%)' }}>
                        {p.name} {p.champion && "🏆"}
                      </td>
                      <td className="py-3 px-2 leading-relaxed" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', maxWidth: '180px', wordBreak: 'break-all' }}>
                        {p.medals}
                      </td>
                      <td className="py-3 px-2 text-right font-bold" style={{ color: 'hsl(45 100% 60%)' }}>
                        ({p.total})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 text-xs" style={{ borderTop: '1px solid hsl(220 30% 18%)', color: 'hsl(220 15% 45%)' }}>
              🥇 = 3pts &nbsp;·&nbsp; 🥈 = 2pts &nbsp;·&nbsp; 🥉 = 1pt
            </div>
          </div>
        )}

        {view === "fantasy" && (
          <div className="navy-card rounded-2xl p-6 shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl trophy-glow">⚡</span>
              <div>
                <h2 className="text-xl font-extrabold gold-gradient">IPL Fantasy Squad Points 2025</h2>
                <p className="text-xs" style={{ color: 'hsl(220 15% 50%)' }}>End of Season · Top 6 players' points</p>
              </div>
            </div>

            <div className="shimmer-line my-5" />

            <div className="text-xs mb-4 px-3 py-2 rounded-lg flex items-center gap-2"
              style={{ background: 'hsl(45 100% 50% / 0.08)', border: '1px solid hsl(45 100% 50% / 0.2)', color: 'hsl(45 80% 75%)' }}
            >
              ❗ Top 6 players' points counted per participant
            </div>

            <div className="flex flex-col gap-2">
              {fantasyPoints.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: p.champion
                      ? 'linear-gradient(135deg, hsl(45 100% 50% / 0.14), hsl(45 100% 50% / 0.06))'
                      : 'hsl(220 40% 10%)',
                    border: p.champion
                      ? '1px solid hsl(45 100% 50% / 0.4)'
                      : '1px solid hsl(220 30% 18%)',
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0"
                    style={{
                      background: p.champion ? 'linear-gradient(135deg, hsl(45 100% 55%), hsl(38 100% 45%))' : 'hsl(220 30% 18%)',
                      color: p.champion ? 'hsl(220 45% 8%)' : 'hsl(220 15% 60%)',
                    }}
                  >
                    {p.rank}
                  </span>
                  <span className="font-bold flex-1" style={{ color: p.champion ? 'hsl(45 100% 70%)' : 'hsl(45 80% 90%)' }}>
                    {p.name} {p.champion && "🏆"}
                  </span>
                  <span className="text-xl tracking-wider shrink-0">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
