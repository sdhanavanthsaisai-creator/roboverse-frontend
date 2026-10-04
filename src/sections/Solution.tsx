import { motion } from 'framer-motion';
import SectionShell from '../components/SectionShell';
import Placeholder from '../components/Placeholder';
import { subdivisions } from '../data/content';

export default function Solution() {
  return (
    <SectionShell
      id="solution"
      index="02 / SOLUTION"
      title="How the robot thinks"
      kicker="Five subdivisions — team submissions land here. Slots stay visibly pending until real content arrives."
    >
      <div className="flex flex-col gap-6">
        {subdivisions.map((sub, i) => (
          <motion.div
            key={sub.index}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-5 rounded-2xl border border-line bg-panel/50 p-5 md:grid-cols-[minmax(0,20rem)_1fr] md:p-7"
          >
            <div>
              <div className="mb-2 font-mono text-xs tracking-[0.3em] text-lime">SUB/{sub.index}</div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink md:text-2xl">
                {sub.title}
              </h3>
              <p className="mt-3 font-mono text-xs leading-relaxed text-mute">{sub.blurb}</p>
              {sub.index === '05' && (
                <a
                  href="#code"
                  className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-cyan underline-offset-4 hover:underline"
                >
                  jump to code vault ↓
                </a>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {sub.slots.map((slot) => (
                <Placeholder key={slot} label={slot} note="awaiting team submission" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
