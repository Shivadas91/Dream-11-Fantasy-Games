import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ02MbMiLiOIRTa8AkxNuCYoAr07vat6V79VOK8gZUhbmCGjkZgF4OIfbb9iWfS3ck8dMrlHdIdl7yt/pub?gid=2095786768&single=true&output=csv";

interface PlayerEntry {
  player: string;
  points: number;
  multiplier: number;
  total: number;
}

interface Participant {
  name: string;
  players: PlayerEntry[];
  grandTotal: number;
}

/**
 * The sheet layout is 3 participants side-by-side, repeated 3 times vertically.
 * Column offsets per block: 0, 5, 10
 * Within each block: [Player, Points, Multiplier, Total]
 *
 * Name row:   col0=name1, col5=name2, col10=name3  (col1 is empty)
 * Header row: Player,Points,Multiplier,Total (skip)
 * Player rows: data at offsets above
 * Total row:  col0 empty, col3=total1, col8=total2, col13=total3
 * Empty row:  separator
 */
function parseCSV(text: string): Participant[] {
  const rows = text
    .trim()
    .split("\n")
    .map((l) => l.replace(/\r/g, "").split(",").map((c) => c.trim()));

  const participants: Participant[] = [];
  let i = 0;

  while (i < rows.length) {
    const row = rows[i];
    const col0 = row[0] ?? "";
    const col1 = row[1] ?? "";

    // Detect a participant-name row: col0 is a non-empty name, col1 is empty
    // and it's not the header "Player" row
    const isNameRow =
      col0 !== "" && col1 === "" && col0.toLowerCase() !== "player";

    if (isNameRow) {
      const BLOCK_OFFSETS = [0, 5, 10];
      const names = BLOCK_OFFSETS.map((o) => row[o] ?? "").filter(Boolean);
      const blocks: PlayerEntry[][] = [[], [], []];
      const grandTotals: number[] = [0, 0, 0];

      i++; // skip this name row
      i++; // skip the header row (Player,Points,Multiplier,Total,...)

      while (i < rows.length) {
        const pr = rows[i];
        const p0 = pr[0] ?? "";
        const p1 = pr[1] ?? "";

        // Empty separator row → end of this block group
        if (p0 === "" && p1 === "" && pr.every((c) => c === "")) {
          i++;
          break;
        }

        // Grand-total row: col0 empty but col3/col8/col13 have numbers
        if (p0 === "" && p1 === "") {
          grandTotals[0] = parseFloat(pr[3] ?? "0") || 0;
          grandTotals[1] = parseFloat(pr[8] ?? "0") || 0;
          grandTotals[2] = parseFloat(pr[13] ?? "0") || 0;
          i++;
          continue;
        }

        // Player data row
        BLOCK_OFFSETS.forEach((offset, b) => {
          const playerName = pr[offset] ?? "";
          if (!playerName) return;
          const points = parseFloat(pr[offset + 1] ?? "0") || 0;
          const multiplier = parseFloat(pr[offset + 2] ?? "1") || 1;
          const total = parseFloat(pr[offset + 3] ?? "0") || 0;
          blocks[b].push({ player: playerName, points, multiplier, total });
        });

        i++;
      }

      names.forEach((name, b) => {
        participants.push({
          name,
          players: blocks[b],
          grandTotal: grandTotals[b],
        });
      });
    } else {
      i++;
    }
  }

  return participants;
}

function ParticipantTable({ participant }: { participant: Participant }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, hsl(220 40% 12%), hsl(220 45% 15%))",
        border: "1px solid hsl(220 30% 22%)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{
          background: "linear-gradient(135deg, hsl(220 45% 16%), hsl(220 50% 19%))",
          borderBottom: "1px solid hsl(45 100% 50% / 0.25)",
        }}
      >
        <span className="font-bold text-sm" style={{ color: "hsl(45 100% 70%)" }}>
          🏏 {participant.name}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "hsl(45 100% 50% / 0.15)",
            color: "hsl(45 100% 65%)",
          }}
        >
          {participant.grandTotal} pts
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(220 30% 18%)" }}>
            <th
              className="py-2 px-3 text-left font-semibold"
              style={{ color: "hsl(45 60% 60%)" }}
            >
              Player
            </th>
            <th
              className="py-2 px-2 text-right font-semibold"
              style={{ color: "hsl(45 60% 60%)" }}
            >
              Pts
            </th>
            <th
              className="py-2 px-2 text-center font-semibold"
              style={{ color: "hsl(45 60% 60%)" }}
            >
              ×
            </th>
            <th
              className="py-2 px-3 text-right font-semibold"
              style={{ color: "hsl(45 60% 60%)" }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {participant.players.map((p, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid hsl(220 30% 15%)",
                background:
                  p.multiplier === 2
                    ? "hsl(45 100% 50% / 0.07)"
                    : "transparent",
              }}
            >
              <td
                className="py-2 px-3 font-medium"
                style={{
                  color:
                    p.multiplier === 2
                      ? "hsl(45 100% 75%)"
                      : "hsl(45 20% 80%)",
                }}
              >
                {p.multiplier === 2 && (
                  <span className="mr-1 text-xs font-bold" style={{ color: "hsl(45 100% 65%)" }}>
                    ©
                  </span>
                )}
                {p.player}
              </td>
              <td
                className="py-2 px-2 text-right"
                style={{ color: "hsl(220 15% 65%)" }}
              >
                {p.points}
              </td>
              <td
                className="py-2 px-2 text-center font-bold"
                style={{
                  color:
                    p.multiplier === 2
                      ? "hsl(45 100% 65%)"
                      : "hsl(220 15% 45%)",
                }}
              >
                {p.multiplier}x
              </td>
              <td
                className="py-2 px-3 text-right font-bold"
                style={{ color: "hsl(45 100% 65%)" }}
              >
                {p.total}
              </td>
            </tr>
          ))}
        </tbody>
        {/* Grand total footer */}
        <tfoot>
          <tr
            style={{
              borderTop: "1px solid hsl(45 100% 50% / 0.2)",
              background: "hsl(45 100% 50% / 0.05)",
            }}
          >
            <td
              colSpan={3}
              className="py-2 px-3 text-right text-xs font-bold"
              style={{ color: "hsl(45 80% 60%)" }}
            >
              TOTAL
            </td>
            <td
              className="py-2 px-3 text-right font-extrabold text-sm"
              style={{ color: "hsl(45 100% 65%)" }}
            >
              {participant.grandTotal}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function IPL2026() {
  const [, navigate] = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error("No data found in sheet.");
      setParticipants(parsed);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Could not load data: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch fresh on every page load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="fade-in min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "hsl(45 100% 60%)" }}
        >
          ← Back to Home
        </button>

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl trophy-glow">🏆</span>
            <div>
              <h1 className="text-2xl font-extrabold gold-gradient">
                IPL 2026 Live
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 15% 50%)" }}>
                {lastUpdated
                  ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                  : "Fetching live data…"}
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

        {/* Error banner */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "hsl(0 60% 15%)",
              border: "1px solid hsl(0 60% 35%)",
              color: "hsl(0 80% 80%)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div
                className="text-5xl mb-4"
                style={{ display: "inline-block", animation: "spin 1s linear infinite" }}
              >
                ⏳
              </div>
              <p style={{ color: "hsl(220 15% 55%)" }}>Loading live data…</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((p) => (
              <ParticipantTable key={p.name} participant={p} />
            ))}
          </div>
        )}

        <p
          className="text-center text-xs mt-8"
          style={{ color: "hsl(220 15% 35%)" }}
        >
          Data refreshes on every page load · Powered by Google Sheets
        </p>
      </div>
    </div>
  );
}
