import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import SectionShell from '../components/SectionShell';
import {
  getStats,
  insertMessage,
  isSupabaseConfigured,
  type Stats,
} from '../lib/db';

type State = 'idle' | 'sending' | 'sent' | 'error' | 'disabled';

export default function Contact() {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<State>('idle');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    if (isSupabaseConfigured) {
      getStats().then((s) => {
        if (alive) setStats(s);
      });
    }
    if (!isSupabaseConfigured) setState('disabled');
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || state === 'sending') return;
    setState('sending');
    const ok = await insertMessage({ name: name.trim() || 'anonymous', body: body.trim() });
    if (ok) {
      setName('');
      setBody('');
      setState('sent');
    } else {
      setState('error');
    }
  }

  const statCells = [
    ['ATTEMPTS LOGGED', stats ? String(stats.attempts) : '—'],
    ['BEST PATH COST', stats && stats.best_cost ? String(stats.best_cost) : '—'],
    ['FASTEST RUN', stats && stats.best_time ? `${(stats.best_time / 1000).toFixed(1)}s` : '—'],
    ['MESSAGES', stats ? String(stats.messages) : '—'],
  ] as const;

  return (
    <SectionShell
      id="contact"
      index="06 / SIGNAL"
      title="Message the crew"
      kicker="Stats and guestbook messages sync to Supabase — schema ships in supabase/schema.sql."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="grid grid-cols-2 gap-3 self-start"
        >
          {statCells.map(([label, value]) => (
            <div
              key={label}
              className="hud-corners rounded-xl border border-line bg-panel/60 p-5"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-mute">
                {label}
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-cyan">{value}</div>
            </div>
          ))}
        </motion.div>

        {/* form */}
        <motion.form
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1 }}
          onSubmit={onSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/60 p-6"
        >
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute" htmlFor="msg-name">
            Handle
          </label>
          <input
            id="msg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            disabled={!isSupabaseConfigured || state === 'sending'}
            className="rounded-lg border border-line bg-void/70 px-4 py-3 font-mono text-sm text-ink outline-none transition-colors placeholder:text-mute/60 focus:border-cyan disabled:opacity-50"
          />

          <label className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-mute" htmlFor="msg-body">
            Message
          </label>
          <textarea
            id="msg-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="drop a note for the team…"
            disabled={!isSupabaseConfigured || state === 'sending'}
            className="resize-none rounded-lg border border-line bg-void/70 px-4 py-3 font-mono text-sm text-ink outline-none transition-colors placeholder:text-mute/60 focus:border-cyan disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!isSupabaseConfigured || state === 'sending'}
            className="mt-2 rounded-lg border border-cyan bg-cyan/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan transition-all hover:bg-cyan hover:text-void disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-mute/60"
          >
            {state === 'sending' ? 'transmitting…' : 'transmit'}
          </button>

          <p className="font-mono text-[10px] leading-relaxed text-mute">
            {state === 'disabled' &&
              'Supabase not configured — copy .env.example to .env and add your keys to go live.'}
            {state === 'sent' && <span className="text-lime">message delivered ✓</span>}
            {state === 'error' && <span className="text-red-400">send failed — check your keys.</span>}
            {state === 'idle' && isSupabaseConfigured && 'Writes to the messages table (RLS: public insert).'}
          </p>
        </motion.form>
      </div>
    </SectionShell>
  );
}
