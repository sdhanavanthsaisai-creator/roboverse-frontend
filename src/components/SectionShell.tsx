import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  id: string;
  index: string;
  title: string;
  kicker?: string;
  children: ReactNode;
};

/** Shared section frame: HUD-corner header + scroll reveal motion. */
export default function SectionShell({ id, index, title, kicker, children }: Props) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-5 py-24 md:px-10 md:py-32">
      <motion.header
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6"
      >
        <div>
          <div className="mb-2 font-mono text-xs tracking-[0.35em] text-cyan">{index}</div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-ink md:text-5xl">
            {title}
          </h2>
        </div>
        {kicker && (
          <p className="max-w-xs font-mono text-xs leading-relaxed text-mute md:text-right">
            {kicker}
          </p>
        )}
      </motion.header>
      {children}
    </section>
  );
}
