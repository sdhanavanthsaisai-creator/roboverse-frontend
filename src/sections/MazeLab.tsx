import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionShell from '../components/SectionShell';
import { getStats, isSupabaseConfigured, type Stats } from '../lib/db';

const CONTROLS = ['RUN', 'RESET', 'NEW MAZE', 'SENSOR SWEEP'] as const;

const READOUTS = [
  ['ULTRASONIC', '— cm'],
  ['HEADING', '—°'],
  ['WHEEL TICKS', '—'],
  ['PATH COST', '—'],
] as const;

export default function MazeLab() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    getStats().then((s) => {
      if (alive) setStats(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SectionShell
      id="maze"
      index="03 / MAZE LAB"
      title="Paint obstacles. Let it learn."
      kicker="Interactive sandbox — place blockers, the rover plans around them and improves attempt over attempt."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ── game frame (not playable yet) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.6 }}
          className="hud-corners relative overflow-hidden rounded-2xl border border-line bg-panel/60"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
            <span>GRID 15 × 10</span>
            <span className="text-cyan">ARENA</span>
          </div>

          {/* grid */}
          <div
            className="grid gap-px bg-line/40 p-px"
            style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
          >
            {Array.from({ length: 150 }).map((_, i) => {
              const isWall = i % 7 === 3 || (i > 40 && i < 56 && i % 5 === 0);
              const isStart = i === 0;
              const isExit = i === 149;
              return (
                <div
                  key={i}
                  className={`aspect-square bg-void transition-colors ${
                    isStart ? 'bg-lime/40' : isExit ? 'bg-cyan/40' : isWall ? 'bg-cyan/15' : ''
                  }`}
                />
              );
            })}
          </div>

          {/* overlay */}
          <div className="absolute inset-0 top-[41px] flex flex-col items-center justify-center gap-3 bg-void/80 backdrop-blur-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-cyan">
              play — coming online
            </span>
            <p className="max-w-sm px-6 text-center font-mono text-[11px] leading-relaxed text-mute">
              Obstacle painting, sensor sweep and live replanning activate in the next build.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-2 px-6">
              {CONTROLS.map((c) => (
                <span
                  key={c}
                  className="cursor-not-allowed rounded-md border border-line bg-panel-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-mute/50"
                  aria-disabled
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── telemetry panel ── */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-panel/60 p-5"
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="text-ink">Telemetry</span>
            <span className={isSupabaseConfigured ? 'text-lime' : 'text-mute'}>
              {isSupabaseConfigured ? '● SYNCED' : '○ LOCAL'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {READOUTS.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-line bg-void/60 px-3 py-2.5 font-mono text-[11px]"
              >
                <span className="tracking-widest text-mute">{label}</span>
                <span className="text-cyan/70">{value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-line bg-void/60 p-3 font-mono text-[11px]">
            <div className="mb-2 flex justify-between text-[10px] uppercase tracking-widest text-mute">
              <span>Learning log</span>
              <span className="text-lime">heatmap</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="h-6 flex-1 rounded-sm bg-cyan/10"
                  style={{ opacity: 0.25 + (i / 12) * 0.65 }}
                />
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-mute/80">
              {stats && stats.attempts > 0
                ? `${stats.attempts} attempt${stats.attempts === 1 ? '' : 's'} logged · best cost ${stats.best_cost}`
                : 'No attempts logged yet — play mode ships next build.'}
            </p>
          </div>

          <p className="font-mono text-[10px] leading-relaxed text-mute/70">
            Scores persist to Supabase <span className="text-cyan">maze_attempts</span> once env
            vars are configured.
          </p>
        </motion.aside>
      </div>
    </SectionShell>
  );
}
