import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  note?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Dashed "awaiting submission" slot so pending sections read as intentional
 * layout rather than broken content.
 */
export default function Placeholder({ label, note, children, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={`relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line/80 bg-panel/50 px-5 py-7 text-center ${className}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/80">{label}</span>
      {note && <span className="font-mono text-[11px] text-mute">{note}</span>}
      {children}
      <span className="pointer-events-none absolute right-3 top-3 font-mono text-[9px] text-mute/60">
        PENDING
      </span>
    </motion.div>
  );
}
