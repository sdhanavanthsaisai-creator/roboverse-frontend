import { useEffect, useState } from 'react';

export type NavItem = { id: string; label: string };

export const navItems: NavItem[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'maze', label: 'Maze Lab' },
  { id: 'code', label: 'Code' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
];

export default function Nav() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-16 flex-col items-center justify-center gap-5 md:flex">
      <div className="absolute left-3 top-6 font-mono text-[10px] tracking-[0.3em] text-cyan [writing-mode:vertical-rl]">
        ROBOVERSE
      </div>
      {navItems.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-label={label}
          className="group flex items-center gap-2"
          title={label}
        >
          <span
            className={`block h-px transition-all duration-300 ${
              active === id ? 'w-6 bg-cyan' : 'w-3 bg-line group-hover:w-5 group-hover:bg-mute'
            }`}
          />
          <span
            className={`font-mono text-[9px] uppercase tracking-widest transition-colors ${
              active === id ? 'text-cyan' : 'text-mute opacity-0 group-hover:opacity-100'
            }`}
          >
            {label}
          </span>
        </a>
      ))}
      <div className="absolute bottom-6 font-mono text-[10px] text-mute [writing-mode:vertical-rl]">
        8 CREW · 5 KG
      </div>
    </nav>
  );
}
