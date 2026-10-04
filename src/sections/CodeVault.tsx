import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionShell from '../components/SectionShell';
import { getSnippets } from '../lib/db';
import type { CodeSnippet } from '../data/snippets';

export default function CodeVault() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [open, setOpen] = useState<CodeSnippet | null>(null);

  useEffect(() => {
    let alive = true;
    getSnippets().then((s) => {
      if (alive) setSnippets(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <SectionShell
      id="code"
      index="04 / CODE VAULT"
      title="Show me the source"
      kicker="Every subsystem gets a View Code button — modules unlock as teammates submit their code."
    >
      <div className="flex flex-col gap-3">
        {snippets.map((snip, i) => (
          <motion.div
            key={snip.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-panel/60 px-5 py-4 transition-colors hover:border-cyan/50"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-mute/60">
                {String(snip.id).padStart(2, '0')}
              </span>
              <div>
                <div className="font-mono text-sm text-ink">{snip.module}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-mute">
                  {snip.language}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-lime/70">
                {snip.source ? 'ready' : 'source pending'}
              </span>
              <button
                type="button"
                onClick={() => setOpen(snip)}
                className={`rounded-md border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
                  snip.source
                    ? 'border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void'
                    : 'border-line bg-panel-2 text-mute hover:border-mute hover:text-ink'
                }`}
              >
                view code
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-void/85 p-4 backdrop-blur"
          >
            <motion.div
              initial={{ y: 28, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4 font-mono text-[11px]">
                <span className="text-cyan">{open.module}</span>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="text-mute transition-colors hover:text-ink"
                  aria-label="Close code viewer"
                >
                  ✕ esc
                </button>
              </div>

              <div className="overflow-auto p-6">
                {open.source ? (
                  <pre className="font-mono text-xs leading-relaxed text-ink">{open.source}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-lime">
                      source pending
                    </span>
                    <p className="max-w-md font-mono text-xs leading-relaxed text-mute">
                      This module has not been submitted yet. The team can drop the source into the{' '}
                      <span className="text-cyan">code_snippets</span> table in Supabase (or edit{' '}
                      <span className="text-cyan">src/data/snippets.ts</span>) and it renders here
                      instantly.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
