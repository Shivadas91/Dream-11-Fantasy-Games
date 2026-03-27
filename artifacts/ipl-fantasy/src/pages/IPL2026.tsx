import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const SHEET_CSV_URL = "YOUR_GOOGLE_SHEETS_CSV_URL_HERE";

interface Participant {
  name: string;
  players: PlayerEntry[];
}

interface PlayerEntry {
  player: string;
  basePoints: number;
  isCaptain: boolean;
  total: number;
}

function parseCSV(text: string): Participant[] {
  const lines = text.trim().split("\n").map((l) => l.replace(/\r/g, ""));
  if (lines.length < 2) return [];

  const participants: Participant[] = [];
  const headers = lines[0].split(",").map((h) => h.trim());

  const nameIdx = headers.findIndex((h) => h.toLowerCase().includes("name") || h.toLowerCase().includes("player"));
  const pointsIdx = headers.findIndex((h) => h.toLowerCase().includes("point") || h.toLowerCase().includes("base"));
  const captainIdx = headers.findIndex((h) => h.toLowerCase().includes("captain") || h.toLowerCase().includes("cap"));
  const groupIdx = headers.findIndex((h) => h.toLowerCase().includes("participant") || h.toLowerCase().includes("team") || h.toLowerCase().includes("owner"));

  if (nameIdx === -1 || pointsIdx === -1) {
    return buildMockData();
  }

  const grouped: Record<string, PlayerEntry[]> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 2) continue;

    const groupName = groupIdx >= 0 ? cols[groupIdx] || "Unknown" : `Team ${Math.ceil(i / 5)}`;
    const playerName = cols[nameIdx] || "";
    const basePoints = parseFloat(cols[pointsIdx]) || 0;
    const isCaptain = captainIdx >= 0 ? cols[captainIdx]?.toLowerCase() === "yes" || cols[captainIdx] === "1" || cols[captainIdx]?.toLowerCase() === "true" : false;
    const multiplier = isCaptain ? 2 : 1;

    if (!grouped[groupName]) grouped[groupName] = [];
    grouped[groupName].push({
      player: playerName,
      basePoints,
      isCaptain,
      total: basePoints * multiplier,
    });
  }

  for (const [name, players] of Object.entries(grouped)) {
    participants.push({ name, players });
  }

  return participants.length > 0 ? participants : buildMockData();
}

function buildMockData(): Participant[] {
  const names = ["Shawn", "Jishnu", "Mobin", "Sivdas", "Jolly", "Sidharth", "Shiva", "Rijo", "Vaisakh"];
  return names.map((name) => ({
    name,
    players: [
      { player: "Player A", basePoints: 0, isCaptain: true, total: 0 },
      { player: "Player B", basePoints: 0, isCaptain: false, total: 0 },
      { player: "Player C", basePoints: 0, isCaptain: false, total: 0 },
      { player: "Player D", basePoints: 0, isCaptain: false, total: 0 },
      { player: "Player E", basePoints: 0, isCaptain: false, total: 0 },
    ],
  }));
}

function ParticipantTable({ participant }: { participant: Participant }) {
  const totalPoints = participant.players.reduce((s, p) => s + p.total, 0);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(220 40% 12%), hsl(220 45% 15%))',
        border: '1px solid hsl(220 30% 22%)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, hsl(220 45% 16%), hsl(220 50% 19%))',
          borderBottom: '1px solid hsl(45 100% 50% / 0.25)',
        }}
      >
        <span className="font-bold text-sm" style={{ color: 'hsl(45 100% 70%)' }}>
          🏏 {participant.name}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(45 100% 50% / 0.15)', color: 'hsl(45 100% 65%)' }}>
          {totalPoints} pts
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid hsl(220 30% 18%)' }}>
            <th className="py-2 px-3 text-left font-semibold" style={{ color: 'hsl(45 60% 60%)' }}>Player</th>
            <th className="py-2 px-2 text-right font-semibold" style={{ color: 'hsl(45 60% 60%)' }}>Base</th>
            <th className="py-2 px-2 text-center font-semibold" style={{ color: 'hsl(45 60% 60%)' }}>Mult</th>
            <th className="py-2 px-3 text-right font-semibold" style={{ color: 'hsl(45 60% 60%)' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {participant.players.map((p, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid hsl(220 30% 15%)',
                background: p.isCaptain ? 'hsl(45 100% 50% / 0.06)' : 'transparent',
              }}
            >
              <td className="py-2 px-3 font-medium" style={{ color: p.isCaptain ? 'hsl(45 100% 75%)' : 'hsl(45 20% 80%)' }}>
                {p.isCaptain && <span className="mr-1">©</span>}
                {p.player}
              </td>
              <td className="py-2 px-2 text-right" style={{ color: 'hsl(220 15% 65%)' }}>{p.basePoints}</td>
              <td className="py-2 px-2 text-center font-bold" style={{ color: p.isCaptain ? 'hsl(45 100% 65%)' : 'hsl(220 15% 55%)' }}>
                {p.isCaptain ? "2x" : "1x"}
              </td>
              <td className="py-2 px-3 text-right font-bold" style={{ color: 'hsl(45 100% 65%)' }}>{p.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function IPL2026() {
  const [, navigate] = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (SHEET_CSV_URL === "YOUR_GOOGLE_SHEETS_CSV_URL_HERE" || !SHEET_CSV_URL) {
      setParticipants(buildMockData());
      setUsingPlaceholder(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      setParticipants(parsed);
      setLastUpdated(new Date());
      setUsingPlaceholder(false);
    } catch (err) {
      setError("Could not load live data. Showing placeholder.");
      setParticipants(buildMockData());
      setUsingPlaceholder(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="fade-in min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'hsl(45 100% 60%)' }}
        >
          ← Back to Home
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl trophy-glow">🏆</span>
            <div>
              <h1 className="text-2xl font-extrabold gold-gradient">IPL 2026 Live</h1>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(220 15% 50%)' }}>
                {lastUpdated
                  ? `Updated: ${lastUpdated.toLocaleTimeString()}`
                  : "Live fantasy standings"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="gold-button px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 self-start sm:self-auto"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        </div>

        {usingPlaceholder && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
            style={{
              background: 'hsl(220 40% 13%)',
              border: '1px solid hsl(45 100% 50% / 0.25)',
              color: 'hsl(45 80% 75%)',
            }}
          >
            <span className="text-lg shrink-0">📌</span>
            <div>
              <p className="font-semibold">Google Sheets URL not configured</p>
              <p className="text-xs mt-1" style={{ color: 'hsl(220 15% 55%)' }}>
                To show live data, update <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'hsl(220 30% 20%)' }}>SHEET_CSV_URL</code> in <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'hsl(220 30% 20%)' }}>IPL2026.tsx</code> with your published Google Sheet CSV link.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: 'hsl(0 60% 15%)', border: '1px solid hsl(0 60% 35%)', color: 'hsl(0 80% 80%)' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-spin" style={{ display: 'inline-block' }}>⏳</div>
              <p style={{ color: 'hsl(220 15% 55%)' }}>Loading live data…</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((p) => (
              <ParticipantTable key={p.name} participant={p} />
            ))}
          </div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: 'hsl(220 15% 35%)' }}>
          © Refreshes on every page load · Data from Google Sheets
        </p>
      </div>
    </div>
  );
}
