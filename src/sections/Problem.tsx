import { motion } from 'framer-motion';
import SectionShell from '../components/SectionShell';
import { problemStatement } from '../data/content';

export default function Problem() {
  return (
    <SectionShell
      id="problem"
      index="01 / PROBLEM STATEMENT"
      title="The maze does not stay still"
      kicker="Brief: a ≤5 kg autonomous vehicle must exit an unfamiliar, ever-changing maze — with no human guidance."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problemStatement.map((card, i) => (
          <motion.article
            key={card.code}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className={`hud-corners group relative flex flex-col gap-3 rounded-xl border border-line bg-panel/60 p-5 transition-colors hover:border-cyan/60 ${
              i === problemStatement.length - 1 ? 'sm:col-span-2 lg:col-span-3' : ''
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em]">
              <span className="text-cyan">{card.code}</span>
              <span className="text-mute/60">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
              {card.title}
            </h3>
            <p className="font-mono text-xs leading-relaxed text-mute">{card.body}</p>
            <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-cyan transition-transform duration-500 group-hover:scale-x-100" />
          </motion.article>
        ))}
      </div>
    </SectionShell>
  );
}
