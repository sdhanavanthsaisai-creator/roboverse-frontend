export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="grid-floor absolute inset-x-0 bottom-0 h-40 opacity-60" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <div className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Roboverse
          </div>
          <p className="mt-1 max-w-md font-mono text-[11px] leading-relaxed text-mute">
            Project site for Team Roboto's autonomous maze explorer. Built &amp; committed daily —
            sections unlock as the crew submits their work.
          </p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-widest md:items-end">
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-cyan hover:underline">
            github ↗
          </a>
          <span className="text-mute">built daily · committed daily</span>
          <span className="text-mute/60">© 2026 team roboto</span>
        </div>
      </div>

      {/* marquee strip */}
      <div className="relative overflow-hidden border-t border-line bg-panel/70 py-2">
        <div className="marquee-track flex w-max gap-8 font-mono text-[10px] uppercase tracking-[0.3em] text-mute">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-8">
              <span>multi-sensor fusion</span>
              <span className="text-cyan">·</span>
              <span>autonomous navigation</span>
              <span className="text-cyan">·</span>
              <span>≤5 kg payload</span>
              <span className="text-cyan">·</span>
              <span>maps as it moves</span>
              <span className="text-cyan">·</span>
              <span className="text-lime">faster every attempt</span>
              <span className="text-cyan">·</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
