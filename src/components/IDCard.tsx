import { useRef, useState, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Member } from '../data/members';

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
};

function Photo({ member }: { member: Member }) {
  const [failed, setFailed] = useState(false);
  const initials = member.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (failed || !member.photo) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0e141d,#05070a)]">
        <span className="font-display text-5xl font-bold text-cyan/70">{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={member.photo}
      alt={member.name}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );
}

export default function IDCard({ member }: { member: Member }) {
  const [flipped, setFlipped] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-12, 12]), { stiffness: 220, damping: 20 });
  const sheen = useTransform(px, [0, 1], [
    'linear-gradient(105deg, transparent 35%, rgba(0,229,255,0.10) 10%, transparent 65%)',
    'linear-gradient(105deg, transparent 35%, rgba(0,229,255,0.10) 90%, transparent 65%)',
  ]);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  const serial = `RB-2026-${String(member.id).padStart(3, '0')}`;

  return (
    <div
      ref={sceneRef}
      className="flip-scene h-[26rem]"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        whileHover={{ y: -8 }}
        className="h-full w-full"
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={`Flip ID card for ${member.name}`}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          className={`flip-inner relative h-full w-full cursor-pointer ${flipped ? 'is-flipped' : ''}`}
        >
          {/* ─────────────── FRONT ─────────────── */}
          <div className="flip-face glass absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-line bg-panel-2/80 px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-cyan">TEAM ROBOTO</span>
              <span className="font-mono text-[10px] tracking-widest text-mute">
                Nº {String(member.id).padStart(3, '0')}
              </span>
            </div>

            <div className="relative mx-auto mt-4 h-40 w-36 overflow-hidden rounded-xl border border-line hud-corners">
              <Photo member={member} />
              <div className="absolute inset-0 bg-gradient-to-t from-void/70 to-transparent" />
            </div>

            <div className="mt-4 px-5">
              <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-ink">
                {member.name}
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-lime">
                {member.role}
              </p>
            </div>

            <div className="mt-auto border-t border-line px-5 py-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-mute">
                <span>{serial}</span>
                <span className="text-cyan">ACTIVE</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-mute/70">
                <span>EXP 12/2027</span>
                <span className="group">tap to flip ↻</span>
              </div>
            </div>

            {/* sheen */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: sheen }}
            />
          </div>

          {/* ─────────────── BACK ─────────────── */}
          <div className="flip-face flip-back glass absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-line bg-panel-2/80 px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-lime">CREW DOSSIER</span>
              <span className="font-mono text-[10px] text-mute">BACK</span>
            </div>

            <p className="px-5 pt-5 font-mono text-[11px] leading-relaxed text-mute">
              {member.bio}
            </p>

            <div className="mt-5 flex flex-col gap-2 px-5">
              {(
                [
                  member.instagram && { key: 'instagram', label: 'Instagram', href: member.instagram },
                  member.github && { key: 'github', label: 'GitHub', href: member.github },
                  member.linkedin && { key: 'linkedin', label: 'LinkedIn', href: member.linkedin },
                  member.email && { key: 'email', label: 'Email', href: member.email },
                ].filter(Boolean) as { key: keyof typeof ICONS; label: string; href: string }[]
              ).map(({ key, label, href }) => (
                <a
                  key={key}
                  href={key === 'email' ? `mailto:${href}` : href}
                  target={key === 'email' ? undefined : '_blank'}
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center gap-3 rounded-lg border border-line bg-panel/70 px-3 py-2.5 transition-colors hover:border-cyan/70 hover:bg-cyan/5"
                >
                  <span className="text-cyan">{ICONS[key]}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mute group-hover:text-ink">
                    {label}
                  </span>
                  <span className="ml-auto truncate font-mono text-[10px] text-ink/80">
                    {key === 'email' ? href : href.replace(/^https?:\/\//, '')}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-auto border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-mute">
              <div className="flex justify-between">
                <span>{serial}</span>
                <span className="text-cyan">tap to flip ↺</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
