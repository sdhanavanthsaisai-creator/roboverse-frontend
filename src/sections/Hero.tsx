import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollRobot from '../components/ScrollRobot';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // robot drives in from the left as the user scrolls the hero
  const x = useTransform(scrollYProgress, [0, 0.55], ['-70vw', '0vw']);
  const scale = useTransform(scrollYProgress, [0, 0.55], [0.72, 1]);
  const robotOpacity = useTransform(scrollYProgress, [0, 0.1, 0.5, 0.85], [0.35, 1, 1, 0.25]);
  const titleY = useTransform(scrollYProgress, [0.1, 0.6], [40, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.55], [0.55, 1]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section id="hero" ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* perspective grid floor */}
        <div className="grid-floor absolute inset-x-0 bottom-0 h-[55%] [transform:perspective(600px)_rotateX(58deg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(0,229,255,0.14),transparent_60%)]" />

        {/* top HUD bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-mute md:px-10">
          <span className="text-ink">TEAM ROBOTO</span>
          <span className="hidden sm:block">Autonomous Maze Explorer</span>
          <span className="text-lime">UNIT ONLINE</span>
        </div>

        {/* scroll-driven robot */}
        <ScrollRobot
          className="absolute bottom-[8%] left-0 z-10 h-[38vh] w-[80vw] max-w-[720px] md:h-[42vh]"
          style={{ x, scale, opacity: robotOpacity }}
        />

        {/* title */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="absolute inset-x-0 top-[22%] z-20 px-5 text-center md:px-10"
        >
          <div className="mb-3 font-mono text-[11px] tracking-[0.5em] text-cyan">
            AUTONOMOUS_UNIT // INTRO SEQUENCE PENDING
          </div>
          <h1 className="text-glow font-display text-6xl font-bold uppercase leading-none tracking-tight text-ink sm:text-8xl md:text-9xl">
            Roboverse
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-mono text-xs leading-relaxed text-mute md:text-sm">
            A 5 kg vehicle. An unfamiliar maze that rewrites itself between attempts. No human on
            the sticks — only sensors, fusion, and a planner that gets sharper every run.
          </p>
        </motion.div>

        {/* telemetry strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-1 border-t border-line/60 bg-void/70 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-mute backdrop-blur md:px-10"
        >
          <span>SENSORS <span className="text-cyan">4/4</span></span>
          <span>MAP <span className="text-cyan">BUILDING</span></span>
          <span>PAYLOAD <span className="text-lime">≤5 KG</span></span>
          <span>GUIDANCE <span className="text-lime">AUTONOMOUS</span></span>
          <span className="hidden sm:inline">CREW <span className="text-cyan">8</span></span>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-mute"
        >
          scroll to drive
          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-cyan to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
