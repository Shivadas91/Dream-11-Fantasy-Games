import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ02MbMiLiOIRTa8AkxNuCYoAr07vat6V79VOK8gZUhbmCGjkZgF4OIfbb9iWfS3ck8dMrlHdIdl7yt/pub?gid=2095786768&single=true&output=csv";

interface PlayerEntry {
  player: string;
  points: number;
  multiplier: number;
  total: number;
  isCaptain: boolean;
}

interface Participant {
  name: string;
  players: PlayerEntry[];
  grandTotal: number;
}

/**
 * CSV Layout (3 participants side-by-side, 3 groups stacked):
 *   Name row:    col0=name1, col5=name2, col10=name3  — col1 is empty
 *   Header row:  Player, Points, Multiplier, Total, ...   (skip)
 *   Player rows: data at column offsets 0, 5, 10
 *   Total row:   col0 empty, col3=total1, col8=total2, col13=total3
 *   Separator:   all-empty row (may be absent between groups)
 *
 * KEY FIX: detect a new name row by (col0 non-empty AND col1 empty AND col0 !== "Player")
 * regardless of whether an empty separator row exists beforehand.
 */
function parseCSV(text: string): Participant[] {
  // Normalise CRLF → LF, split into rows, split each row on commas
  const rows = text
    .replace(/\r/g, "")
    .trim()
    .split("\n")
    .map((l) => l.split(",").map((c) => c.trim()));

  const BLOCK_OFFSETS = [0, 5, 10];
  const participants: Participant[] = [];
  let i = 0;

  const isNameRow = (r: string[]) => {
    const c0 = r[0] ?? "";
    const c1 = r[1] ?? "";
    // A name row has a non-empty name in col0, empty col1,
    // and is NOT the header row ("Player")
    return c0 !== "" && c1 === "" && c0.toLowerCase() !== "player";
  };

  while (i < rows.length) {
    const row = rows[i];

    if (!isNameRow(row)) {
      i++;
      continue;
    }

    // ── We're on a name row ──────────────────────────────────────────────────
    const names = BLOCK_OFFSETS.map((o) => row[o] ?? "").filter(Boolean);
    const blocks: PlayerEntry[][] = [[], [], []];
    const grandTotals: number[] = [0, 0, 0];

    i++; // skip name row
    i++; // skip header row (Player, Points, Multiplier, Total…)

    // ── Collect player rows until we hit the next section or EOF ─────────────
    while (i < rows.length) {
      const pr = rows[i];
      const p0 = pr[0] ?? "";
      const p1 = pr[1] ?? "";

      // New name row → start of the next section; do NOT consume this row
      if (isNameRow(pr)) break;

      // All-empty separator row → consume and stop
      if (pr.every((c) => c === "")) {
        i++;
        break;
      }

      // Grand-total row: col0 empty, col3/col8/col13 contain totals
      if (p0 === "" && p1 === "") {
        grandTotals[0] = parseFloat(pr[3] ?? "0") || 0;
        grandTotals[1] = parseFloat(pr[8] ?? "0") || 0;
        grandTotals[2] = parseFloat(pr[13] ?? "0") || 0;
        i++;
        continue;
      }

      // Header row inside inner section (shouldn't happen, but guard)
      if (p0.toLowerCase() === "player") {
        i++;
        continue;
      }

      // ── Player data row ──────────────────────────────────────────────────
      BLOCK_OFFSETS.forEach((offset, b) => {
        const playerName = pr[offset] ?? "";
        if (!playerName) return;
        const points = parseFloat(pr[offset + 1] ?? "0") || 0;
        const multiplier = parseFloat(pr[offset + 2] ?? "1") || 1;
        const total = parseFloat(pr[offset + 3] ?? "0") || 0;
        blocks[b].push({
          player: playerName,
          points,
          multiplier,
          total,
          isCaptain: multiplier === 2,
        });
      });

      i++;
    }

    // Push participants for this group
    names.forEach((name, b) => {
      participants.push({
        name,
        players: blocks[b],
        grandTotal: grandTotals[b],
      });
    });
  }

  return participants;
}

const RANK_STYLES: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: "linear-gradient(135deg,hsl(45 100% 50%),hsl(38 100% 42%))", color: "hsl(220 45% 8%)", label: "🥇" },
  2: { bg: "linear-gradient(135deg,hsl(210 20% 72%),hsl(210 15% 58%))", color: "hsl(220 45% 8%)", label: "🥈" },
  3: { bg: "linear-gradient(135deg,hsl(25 80% 55%),hsl(20 70% 42%))",   color: "hsl(220 45% 8%)", label: "🥉" },
};

function ParticipantTable({ participant, rank, animKey }: {
  participant: Participant;
  rank: number;
  animKey: number;
}) {
  const rs = RANK_STYLES[rank];

  return (
    <div
      key={animKey}
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, hsl(220 40% 12%), hsl(220 45% 15%))",
        border: rank <= 3
          ? `1px solid hsl(45 100% 50% / ${rank === 1 ? "0.55" : rank === 2 ? "0.30" : "0.20"})`
          : "1px solid hsl(220 30% 22%)",
        animation: `cardSlideIn 0.35s ease-out both`,
        animationDelay: `${(rank - 1) * 0.04}s`,
      }}
    >
      {/* Card header */}
      <div
        className="px-3 py-2.5 flex items-center gap-2 shrink-0"
        style={{
          background: "linear-gradient(135deg, hsl(220 45% 16%), hsl(220 50% 19%))",
          borderBottom: "1px solid hsl(45 100% 50% / 0.25)",
        }}
      >
        {/* Rank badge */}
        <span
          className="text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={
            rs
              ? { background: rs.bg, color: rs.color }
              : { background: "hsl(220 30% 20%)", color: "hsl(220 15% 60%)" }
          }
        >
          {rs ? rs.label : rank}
        </span>

        <span className="font-bold text-sm flex-1" style={{ color: "hsl(45 100% 70%)" }}>
          {participant.name}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: rank === 1 ? "hsl(45 100% 50% / 0.25)" : "hsl(45 100% 50% / 0.12)",
            color: "hsl(45 100% 65%)",
          }}
        >
          {participant.grandTotal} pts
        </span>
      </div>

      {/* Table — only Player and Points columns */}
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
              className="py-2 px-3 text-right font-semibold"
              style={{ color: "hsl(45 60% 60%)" }}
            >
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {participant.players.map((p, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: "1px solid hsl(220 30% 15%)",
                background: p.isCaptain ? "hsl(45 100% 50% / 0.07)" : "transparent",
              }}
            >
              <td
                className="py-2 px-3 font-medium"
                style={{
                  color: p.isCaptain ? "hsl(45 100% 75%)" : "hsl(45 20% 80%)",
                }}
              >
                {p.isCaptain && (
                  <span
                    className="mr-1 text-xs font-bold"
                    style={{ color: "hsl(45 100% 65%)" }}
                  >
                    ©
                  </span>
                )}
                {p.player}
              </td>
              <td
                className="py-2 px-3 text-right font-bold"
                style={{ color: "hsl(45 100% 65%)" }}
              >
                {p.points}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr
            style={{
              borderTop: "1px solid hsl(45 100% 50% / 0.2)",
              background: "hsl(45 100% 50% / 0.05)",
            }}
          >
            <td
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
  // Incremented each fetch so cards re-animate when the order changes
  const [animKey, setAnimKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error("No data found in sheet.");
      // Sort descending by grandTotal — handles numerical comparison correctly
      const sorted = [...parsed].sort((a, b) => b.grandTotal - a.grandTotal);
      setParticipants(sorted);
      setAnimKey((k) => k + 1);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Could not load data: ${msg}`);
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
          style={{ color: "hsl(45 100% 60%)" }}
        >
          ← Back to Home
        </button>

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl trophy-glow">🏆</span>
            <div>
              <h1 className="text-2xl font-extrabold gold-gradient">IPL 2026 Live</h1>
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

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <p className="text-4xl mb-3">⏳</p>
              <p style={{ color: "hsl(220 15% 55%)" }}>Loading live data…</p>
            </div>
          </div>
        ) : (
          <>
            {/* 3×3 grid on desktop, 1 col on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((p, idx) => (
                <ParticipantTable
                  key={p.name}
                  participant={p}
                  rank={idx + 1}
                  animKey={animKey}
                />
              ))}
            </div>
            <p className="text-center text-xs mt-6" style={{ color: "hsl(220 15% 35%)" }}>
              © Captain (2× points) · Data refreshes on every page load
            </p>
          </>
        )}
      </div>
    </div>
  );
}
