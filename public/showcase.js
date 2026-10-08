/* ============================================================
   ROBOTO® RB/25 — 3D showcase engine (Three.js r160, dynamic CDN import)
   Loaded as a plain (non-module) async script from index.html.
   Explosive hardware view · A* maze simulator · firmware viewer
   · themed flip ID badges for the real 5-member crew.
   ============================================================ */
window.__stage = 'waiting';
window.__fb = function (title, detail) {
  var f = document.getElementById('fallback');
  document.getElementById('fbTitle').textContent = title;
  document.getElementById('fbErr').textContent = detail || '(no details)';
  f.style.display = 'grid';
  var l = document.getElementById('loader'); if (l) l.style.display = 'none';
};

const setStage = s => { window.__stage = s; const el = document.getElementById('loadStage'); if (el) el.textContent = s; };
setStage('Booting…');

/* ---------- WebGL capability pre-check ---------- */
(function () {
  try {
    var c = document.createElement('canvas');
    var gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) throw new Error('WebGL context creation returned null. Hardware acceleration is likely disabled in the browser settings.');
  } catch (e) {
    window.__fb('WebGL is not available', e.message);
  }
})();

/* ---------- Libraries watchdog ---------- */
setTimeout(function () {
  if (!window.__libs) {
    window.__fb('Libraries did not load in time',
      'Stage: ' + window.__stage + '\n\nMost likely causes:\n' +
      '· No internet connection (Three.js loads from a CDN)\n' +
      '· An ad-blocker / privacy extension blocked the CDN\n' +
      '· A very old browser without ES module support\n\n' +
      (window.__err ? ('Last error:\n' + window.__err) : 'Try: disable the blocker for this page, or open on a normal network, then hit RETRY.'));
  }
}, 14000);

(async function boot() {
  window.__stage = 'loading three.js';

  async function loadThree() {
    const CDNS = [
      'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
      'https://unpkg.com/three@0.160.0/build/three.module.js',
      'https://esm.sh/three@0.160.0'
    ];
    let lastErr;
    for (const url of CDNS) {
      try {
        setStage('loading three.js — ' + new URL(url).host);
        const mod = await import(/* @vite-ignore */ url);
        if (mod && mod.WebGLRenderer) return mod;
        throw new Error('module loaded but WebGLRenderer missing');
      } catch (e) { lastErr = e; }
    }
    throw new Error('All three.js CDNs failed. Last error: ' + (lastErr && lastErr.message));
  }

  let THREE;
  try {
    THREE = await loadThree();
    window.__libs = true;
  } catch (e) {
    window.__err = e.message;
    window.__fb('Three.js failed to load', e.message + '\n\nCheck your internet connection / ad-blocker and hit RETRY.');
    return;
  }

  /* roundRect polyfill (older Safari) */
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); return this;
    };
  }

  setStage('building scene');
  try {

    /* ============ helpers ============ */
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const clamp01 = x => clamp(x, 0, 1);
    const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t;
    const mul32 = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MOBILE = matchMedia('(max-width:768px)').matches;
    function tween(dur, fn, ease, done) {
      ease = ease || (p => 1 - Math.pow(1 - p, 3));
      const t0 = performance.now();
      (function s(n) { const p = clamp01((n - t0) / dur); fn(ease(p)); p < 1 ? requestAnimationFrame(s) : done && done(); })(t0);
    }
    function toast(m) {
      const t = document.createElement('div'); t.className = 'toast'; t.textContent = m;
      $('#toasts').appendChild(t); requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2400);
    }

    /* ============ SFX — synthesized sound design (Web Audio, zero files) ============
       Boot chime, servo sweep tied to explode progress, wall ticks, replan blips,
       arrival arpeggio, record fanfare, ambient hum that opens with scroll speed.
       AudioContext is created/resumed on the first user gesture (autoplay policy). */
    const SFX = (() => {
      let ctx = null, master = null, humFilter = null;
      let muted = false;
      try { muted = localStorage.getItem('rb25_mute') === '1'; } catch (e) {}
      let chimed = false;
      function ensure() {
        if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return true; }
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return false;
          ctx = new AC();
          master = ctx.createGain(); master.gain.value = muted ? 0 : .4; master.connect(ctx.destination);
          const humOsc = ctx.createOscillator(); humOsc.type = 'sawtooth'; humOsc.frequency.value = 42;
          humFilter = ctx.createBiquadFilter(); humFilter.type = 'lowpass'; humFilter.frequency.value = 90; humFilter.Q.value = 6;
          const humLvl = ctx.createGain(); humLvl.gain.value = .05;
          humOsc.connect(humFilter); humFilter.connect(humLvl); humLvl.connect(master); humOsc.start();
          return true;
        } catch (e) { ctx = null; return false; }
      }
      function tone(f, dur, type, vol, when, slide) {
        if (!ctx || muted) return;
        try {
          const t0 = ctx.currentTime + (when || 0);
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
          if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(vol || .15, t0 + .012);
          g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
          o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
        } catch (e) {}
      }
      return {
        get muted() { return muted; },
        toggle() {
          muted = !muted;
          try { localStorage.setItem('rb25_mute', muted ? '1' : '0'); } catch (e) {}
          if (master) master.gain.value = muted ? 0 : .4;
          return muted;
        },
        unlock() { if (!chimed && ensure()) { chimed = true; [523, 659, 784, 1047].forEach((f, i) => tone(f, .5, 'sine', .12, i * .09)); tone(65, 1.2, 'sine', .1); } },
        tick() { tone(1400, .06, 'square', .07); tone(700, .05, 'square', .05, .02); },
        blip() { tone(880, .09, 'triangle', .1); },
        servo(p) { tone(180 + 420 * p, .12, 'sawtooth', .05, 0, 240 + 900 * p); },
        replan() { [330, 440].forEach((f, i) => tone(f, .14, 'triangle', .09, i * .08)); },
        arrive() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .4, 'sine', .12, i * .1)); tone(78, 1.4, 'sine', .08); },
        record() { [659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, .35, 'triangle', .11, i * .09)); },
        hum(v) { if (humFilter && ctx && ctx.state === 'running') humFilter.frequency.value = 90 + v * 500; },
      };
    })();
    addEventListener('pointerdown', () => SFX.unlock(), { passive: true });
    addEventListener('keydown', () => SFX.unlock(), { passive: true });
    window.__sfx = SFX; /* debug hook */

    const state = { mode: 'explore', e: 0, teamE: 0, time: 0, mouse: { x: 0, y: 0 }, heroDriving: false, hover: null, hoverCell: null };
    const GM = { x: 34, z: -18 };
    const TEAM = { x: 0, z: -58 };
/* NOTE: no hanging lanyards anywhere — crew badges stand on the display deck */

    /* ============ renderer / scene ============ */
    const canvas = $('#gl');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 1.8));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070A);
    scene.fog = new THREE.FogExp2(0x05070A, .024);
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 220);
    camera.position.set(7, 3, 9);

    {
      const env = new THREE.Scene();
      const panel = (c, i, x, y, z, rx, ry) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 8),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
        m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
      };
      panel(0x67e8f9, 2.4, 0, 7, 0, Math.PI / 2, 0);
      panel(0xffffff, 1.6, 0, 2, 9, 0, Math.PI);
      panel(0x8b5cf6, 1.2, -9, 3, 0, 0, Math.PI / 2);
      panel(0x22d3ee, 1.0, 9, 3, 0, 0, -Math.PI / 2);
      panel(0x0a0e14, 1.0, 0, -4, 0, -Math.PI / 2, 0);
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(env, .04).texture;
      pmrem.dispose();
    }

    scene.add(new THREE.HemisphereLight(0x8ab4ff, 0x0a0d12, .4));
    const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(6, 9, 4); scene.add(key);
    const pOrigin = new THREE.PointLight(0x22d3ee, 14, 22, 2); pOrigin.position.set(-5, 3.5, -5); scene.add(pOrigin);
    const pGame = new THREE.PointLight(0x22d3ee, 20, 28, 2); pGame.position.set(GM.x, 7, GM.z); scene.add(pGame);
    const pTeam = new THREE.PointLight(0xbfe8ff, 18, 24, 2); pTeam.position.set(TEAM.x, 4.2, TEAM.z + 3); scene.add(pTeam);

    function glowTex() {
      const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
      const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.4, 'rgba(255,255,255,.4)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
    }
    const glow = glowTex();

    /* floor */
    {
      const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
      g.fillStyle = '#070b11'; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = 'rgba(56,189,248,.09)'; g.lineWidth = 1;
      for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i + .5, 0); g.lineTo(i + .5, 512); g.stroke(); g.beginPath(); g.moveTo(0, i + .5); g.lineTo(512, i + .5); g.stroke(); }
      const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(46, 46);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshStandardMaterial({ map: tex, roughness: .92, metalness: .15, color: 0xbfd8e8 }));
      m.rotation.x = -Math.PI / 2; m.position.set(0, -.01, -24); scene.add(m);
    }
    /* particles */
    {
      const n = MOBILE ? 280 : 620, arr = new Float32Array(n * 3), r = mul32(9);
      for (let i = 0; i < n; i++) { arr[i * 3] = (r() - .5) * 120; arr[i * 3 + 1] = r() * 8 + .2; arr[i * 3 + 2] = (r() - .5) * 120 - 24; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glow, color: 0x67e8f9, size: .1, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
      scene.add(pts); state._pts = pts;
    }

    /* ============ MATERIALS ============ */
    const MAT = {
      ti: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: .92, roughness: .34 }),
      al: new THREE.MeshStandardMaterial({ color: 0xb9c0c7, metalness: 1, roughness: .24 }),
      cb: new THREE.MeshStandardMaterial({ color: 0x14171c, metalness: .55, roughness: .52 }),
      rb: new THREE.MeshStandardMaterial({ color: 0x0b0d10, metalness: 0, roughness: .95 }),
      dk: new THREE.MeshStandardMaterial({ color: 0x0e1116, metalness: .3, roughness: .6 }),
      pcb: new THREE.MeshStandardMaterial({ color: 0x0f3a30, metalness: .2, roughness: .5 }),
      pcbB: new THREE.MeshStandardMaterial({ color: 0x123a5c, metalness: .25, roughness: .5 }),
      cu: new THREE.MeshStandardMaterial({ color: 0xc98a4b, metalness: .95, roughness: .35 }),
      led: new THREE.MeshStandardMaterial({ color: 0x06272c, emissive: 0x22d3ee, emissiveIntensity: 3 }),
      ledA: new THREE.MeshStandardMaterial({ color: 0x2a1802, emissive: 0xf59e0b, emissiveIntensity: 2.4 }),
      acr: new THREE.MeshPhysicalMaterial({ color: 0x7dd3fc, transparent: true, opacity: .2, roughness: .08, side: THREE.DoubleSide }),
      lens: new THREE.MeshStandardMaterial({ color: 0x0a2030, metalness: .1, roughness: .05, emissive: 0x22d3ee, emissiveIntensity: .9 }),
    };
    function labelTex(txt) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d');
      g.fillStyle = '#0b0f14'; g.fillRect(0, 0, 256, 96);
      g.font = '700 40px sans-serif'; g.fillStyle = '#67E8F9'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, 128, 50); return new THREE.CanvasTexture(c);
    }
    function bx(p, w, h, d, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); p.add(o); return o; }
    function cy(p, rt, rb, h, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 24) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); p.add(o); return o; }

    /* ============ ROBOT — the 11 real components ============ */
    const robot = new THREE.Group(); scene.add(robot);
    const parts = [], partByName = {};
    function reg(name, g, { dir = [0, 1, 0], dist = 0, layer = 'B', ay = .2 } = {}) {
      g.userData.partName = name;
      parts.push({ name, g, dir: new THREE.Vector3(...dir), dist, layer, base: g.position.clone(), cur: 0, ay });
      partByName[name] = g; return g;
    }
    {
      const tri = new THREE.Shape(); const R = 1.5;
      for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * 2 * Math.PI / 3; const x = Math.cos(a) * R, y = Math.sin(a) * R; i ? tri.lineTo(x, y) : tri.moveTo(x, y); }
      const geo = new THREE.ExtrudeGeometry(tri, { depth: .12, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2 });
      geo.rotateX(-Math.PI / 2);
      const g = new THREE.Group(); robot.add(g);
      const mesh = new THREE.Mesh(geo, MAT.ti); mesh.position.y = .24; g.add(mesh);
      reg('chassis', g, { dist: 0, layer: 'C', ay: .35 });
    }
    const wheelSpins = [];
    [90, 210, 330].forEach((deg, i) => {
      const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = 1.5;
      /* FIX 1: consistent zero-indexed names — motor0, motor1, motor2 */
      const mg = new THREE.Group(); robot.add(mg);
      cy(mg, .09, .09, .26, MAT.al, ca * (R - .32), .34, sa * (R - .32), 0, 0, Math.PI / 2);
      bx(mg, .2, .18, .16, MAT.dk, ca * (R - .12), .34, sa * (R - .12), 0, -a + Math.PI / 2, 0);
      reg('motor' + i, mg, { dir: [ca, .15, sa], dist: .7, layer: 'C', ay: .45 });
      /* FIX 2: consistent zero-indexed names — wheel0, wheel1, wheel2 */
      const wg = new THREE.Group(); wg.position.set(ca * R, .34, sa * R); wg.rotation.y = -(a + Math.PI / 2); robot.add(wg);
      const spin = new THREE.Group(); wg.add(spin);
      cy(spin, .34, .34, .16, MAT.rb, 0, 0, 0, 0, 0, Math.PI / 2);
      for (let k = 0; k < 12; k++) { const b = k / 12 * Math.PI * 2; cy(spin, .05, .05, .17, MAT.al, 0, Math.cos(b) * .34, Math.sin(b) * .34, 0, 0, Math.PI / 2); }
      cy(spin, .13, .13, .18, MAT.ti, 0, 0, 0, 0, 0, Math.PI / 2);
      cy(spin, .05, .05, .2, MAT.led, 0, 0, 0, 0, 0, Math.PI / 2);
      wheelSpins.push(spin);
      reg('wheel' + i, wg, { dir: [ca, .18, sa], dist: 1.5, layer: 'C', ay: .5 });
    });
    {
      const g = new THREE.Group(); robot.add(g);
      cy(g, .98, 1.02, .07, MAT.cb, 0, .78, 0);
      [[-.55, -.4], [.55, -.4], [-.55, .4], [.55, .4]].forEach(([x, z]) => cy(g, .04, .04, .18, MAT.ti, x, .9, z));
      bx(g, .62, .02, .34, new THREE.MeshStandardMaterial({ map: labelTex('5 KG MAX'), roughness: .6 }), 0, .822, .42);
      reg('deck', g, { dir: [0, 1, 0], dist: .85, layer: 'B', ay: 1 });
    }
    {
      const g = new THREE.Group(); robot.add(g);
      bx(g, .85, .3, 1.15, MAT.dk, 0, 1.0, 0);
      bx(g, .87, .05, .2, MAT.ledA, 0, 1.0, -.42);
      bx(g, .7, .02, .5, new THREE.MeshStandardMaterial({ map: labelTex('6S LiPo'), roughness: .6 }), 0, 1.155, .15);
      reg('battery', g, { dir: [.25, 1, 0], dist: 1.4, layer: 'B', ay: 1.18 });
    }
    {
      const g = new THREE.Group(); robot.add(g);
      bx(g, .9, .09, .7, MAT.pcbB, 0, 1.28, .15);
      for (let i = 0; i < 6; i++) bx(g, .08, .14, .5, MAT.al, -.32 + i * .13, 1.39, .15);
      bx(g, .4, .02, .22, new THREE.MeshStandardMaterial({ map: labelTex('MD20A'), roughness: .6 }), 0, 1.335, -.22);
      reg('cytron', g, { dir: [-.3, 1, .2], dist: 2.0, layer: 'B', ay: 1.45 });
    }
    {
      const g = new THREE.Group(); robot.add(g);
      cy(g, .07, .07, .22, MAT.dk, .45, 1.42, .42);
      bx(g, .15, .03, .02, MAT.ledA, .45, 1.5, .42);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .16, 12), MAT.dk);
      d.rotation.z = Math.PI / 2; d.position.set(.62, 1.35, .42); g.add(d);
      bx(g, .03, .03, .03, MAT.al, .71, 1.35, .42);
      reg('cap', g, { dir: [.7, 1, .5], dist: 2.9, layer: 'B', ay: 1.6 });
      const g2 = new THREE.Group(); robot.add(g2);
      const d2 = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .2, 12), MAT.dk);
      d2.rotation.z = Math.PI / 2; d2.position.set(-.55, 1.33, -.28); g2.add(d2);
      bx(g2, .03, .035, .035, MAT.al, -.64, 1.33, -.28);
      reg('diode', g2, { dir: [.95, 1, .15], dist: 3.2, layer: 'B', ay: 1.5 });
    }
    {
      const g = new THREE.Group(); robot.add(g);
      bx(g, .5, .05, .32, MAT.pcb, .35, 1.45, -.45);
      bx(g, .3, .09, .22, MAT.al, .35, 1.52, -.45);
      bx(g, .12, .02, .3, MAT.al, .62, 1.48, -.45);
      bx(g, .08, .03, .03, MAT.led, .18, 1.49, -.55);
      reg('esp32', g, { dir: [.4, 1, -.4], dist: 2.5, layer: 'B', ay: 1.62 });
    }
    {
      const g = new THREE.Group(); robot.add(g);
      bx(g, .42, .07, .3, MAT.pcb, -.6, 1.4, -.35);
      const coil = new THREE.Mesh(new THREE.TorusGeometry(.09, .035, 10, 20), MAT.cu);
      coil.rotation.x = Math.PI / 2; coil.position.set(-.6, 1.47, -.35); g.add(coil);
      reg('buck', g, { dir: [-.6, 1, -.3], dist: 2.2, layer: 'B', ay: 1.55 });
    }
    const lidarTops = [];
    {
      const g = new THREE.Group(); robot.add(g);
      cy(g, .5, .52, .05, MAT.cb, 0, 1.72, 0);
      [[-.28, -.28], [.28, -.28], [-.28, .28], [.28, .28]].forEach(([x, z]) => {
        cy(g, .11, .13, .09, MAT.dk, x, 1.79, z);
        const top = cy(g, .09, .09, .05, MAT.ti, x, 1.86, z); lidarTops.push(top);
        cy(g, .07, .07, .02, MAT.led, x, 1.895, z);
      });
      reg('lidar', g, { dir: [0, 1, 0], dist: 3.3, layer: 'A', ay: 2.1 });
    }
    {
      const g = new THREE.Group(); robot.add(g);
      bx(g, .3, .16, .04, MAT.pcb, 1.28, 1.05, 0);
      cy(g, .05, .05, .05, MAT.al, 1.31, 1.05, .08, 0, 0, Math.PI / 2);
      cy(g, .05, .05, .05, MAT.al, 1.31, 1.05, -.08, 0, 0, Math.PI / 2);
      cy(g, .035, .035, .02, MAT.lens, 1.345, 1.05, .08, 0, 0, Math.PI / 2);
      cy(g, .035, .035, .02, MAT.lens, 1.345, 1.05, -.08, 0, 0, Math.PI / 2);
      reg('ultra', g, { dir: [1.3, .4, 0], dist: 1.7, layer: 'A', ay: 1.25 });
    }
    robot.traverse(o => { if (o.isMesh) { let p = o; while (p && !p.userData.partName) p = p.parent; o.userData.part = p ? p.userData.partName : null; } });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.9, 40), new THREE.MeshBasicMaterial({ map: glow, color: 0x22d3ee, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = .02; scene.add(disc);

    const WIN = { A: [.05, .16], B: [.14, .30], C: [.26, .44] };
    const layerVal = { A: 0, B: 0, C: 0 };

    /* ============ HOTSPOT PINS ============ */
    const PINMETA = [
      ['esp32', 'ESP32', 'MCU-01', '240 MHz dual-core · FreeRTOS on both cores · Wi-Fi telemetry'],
      ['cytron', 'Cytron MD20A', 'DRV-02', '30 V / 20 A H-bridge · PWM + dir · drives the omni array'],
      ['battery', '6S LiPo', 'PWR-03', '22.2 V nominal · 5000 mAh · 60C discharge for peak torque'],
      ['cap', '470 µF Capacitor', 'PWR-04', 'Smooths motor-bus ripple during sudden direction flips'],
      ['diode', 'Schottky Diode', 'PWR-05', 'Reverse-polarity guard · 40 V / 10 A low-drop'],
      ['motor0', '3× PG36555', 'MTR-06', '12 V geared motors · 55 rpm · 28 kg·cm stall torque'],
      ['wheel0', '127 mm Omni Wheels', 'DRV-07', 'Offset rollers → true holonomic traction, zero scrub'],
      ['chassis', 'Triangle Chassis', 'STR-08', '6061 alloy holonomic base · 30×30 cm footprint'],
      ['buck', '40 V Buck Converter', 'PWR-09', '6S rail → 5 V logic, 5 A continuous for ESP32 + sensors'],
      ['lidar', '4× LiDAR Pucks', 'SNS-10', '360° Time-of-Flight array · 8 m · fused occupancy map'],
      ['ultra', 'Ultrasonic Sensor', 'SNS-11', 'HC-SR04 forward ranging · 2–400 cm collision guard'],
    ];
    const pinsEl = $('#pins');
    PINMETA.forEach(([key, title, tag, spec], i) => {
      const g = partByName[key];
      const rec = parts.find(p => p.name === key);
      /* FIX 3: never crash if a name drifts again */
      if (!g || !rec) { console.warn('Hotspot skipped — no such part:', key); return; }
      const anchor = new THREE.Object3D(); anchor.position.set(0, rec.ay, 0); g.add(anchor);
      const el = document.createElement('div'); el.className = 'pin' + (i % 2 ? ' R' : '');
      el.innerHTML = '<span class="stem"></span><span class="dot"></span><div class="card"><b>' + title + '<i>' + tag + '</i></b><p>' + spec + '</p></div>';
      pinsEl.appendChild(el);
      rec.anchor = anchor; rec.el = el;
      el.querySelector('.dot').addEventListener('click', () => el.classList.toggle('open'));
    });

    /* ============ GAME ISLAND ============ */
    const G = 13, CS = 1.15;
    const gameGrid = new Uint8Array(G * G);
    const cellW = (cx, cy) => ({ x: GM.x + (cx - (G - 1) / 2) * CS, z: GM.z + (cy - (G - 1) / 2) * CS });
    const START = { x: 1, y: G - 2 }, GOAL = { x: G - 2, y: 1 };
    const isBorder = (x, y) => x === 0 || y === 0 || x === G - 1 || y === G - 1;
    const gi = (x, y) => y * G + x;
    {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(G * CS + .7, .08, G * CS + .7), new THREE.MeshStandardMaterial({ color: 0x0a0f16, roughness: .85, metalness: .3 }));
      plate.position.set(GM.x, .03, GM.z); scene.add(plate);
      const fm = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const f1 = new THREE.BoxGeometry(G * CS + .9, .05, .06), f2 = new THREE.BoxGeometry(.06, .05, G * CS + .9);
      [[0, -(G * CS + .9) / 2], [0, (G * CS + .9) / 2]].forEach(([x, z]) => { const m = new THREE.Mesh(f1, fm); m.position.set(GM.x + x, .09, GM.z + z); scene.add(m); });
      [[-(G * CS + .9) / 2, 0], [(G * CS + .9) / 2, 0]].forEach(([x, z]) => { const m = new THREE.Mesh(f2, fm); m.position.set(GM.x + x, .09, GM.z + z); scene.add(m); });
    }
    const wallsIM = new THREE.InstancedMesh(new THREE.BoxGeometry(CS * .94, .9, CS * .94),
      new THREE.MeshStandardMaterial({ color: 0x10151d, roughness: .55, metalness: .5, emissive: 0x22d3ee, emissiveIntensity: .05 }), G * G);
    wallsIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    wallsIM.frustumCulled = false;
    scene.add(wallsIM);
    const _d = new THREE.Object3D();
    function wallScale(i, s) {
      const cx = i % G, cy = (i / G) | 0, w = cellW(cx, cy);
      _d.position.set(w.x, .45 * s, w.z); _d.scale.setScalar(Math.max(.001, s)); _d.updateMatrix();
      wallsIM.setMatrixAt(i, _d.matrix);
    }
    function refreshWalls() { for (let i = 0; i < G * G; i++) wallScale(i, gameGrid[i] && fog[i] ? 1 : .001); wallsIM.instanceMatrix.needsUpdate = true; }
    function marker(cell, color) {
      const m = new THREE.Mesh(new THREE.RingGeometry(.3, .44, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      const w = cellW(cell.x, cell.y); m.rotation.x = -Math.PI / 2; m.position.set(w.x, .1, w.z); scene.add(m); return m;
    }
    const startMk = marker(START, 0x22d3ee), goalMk = marker(GOAL, 0xf59e0b);
    const bot = new THREE.Group(); scene.add(bot);
    {
      bx(bot, .5, .18, .6, MAT.cb, 0, .3, 0);
      bx(bot, .34, .03, .4, MAT.dk, 0, .42, 0);
      bx(bot, .36, .02, .05, MAT.led, 0, .435, .28);
      bx(bot, .12, .08, .08, MAT.dk, 0, .36, .34);
      cy(bot, .05, .05, .04, MAT.lens, 0, .36, .39, Math.PI / 2);
      [[-.28, 1], [.28, 1], [-.28, -1], [.28, -1]].forEach(([x, z]) => cy(bot, .09, .09, .06, MAT.rb, x * .9, .22, z * .75, 0, 0, Math.PI / 2));
    }
    const pathLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
    pathLine.visible = false; scene.add(pathLine);
    const DOTS = 12, dots = [];
    for (let i = 0; i < DOTS; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), new THREE.MeshBasicMaterial({ map: glow, color: 0x67e8f9, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); dots.push(m);
    }
    const POOL = 44, flashes = [];
    for (let i = 0; i < POOL; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(CS * .8, CS * .8), new THREE.MeshBasicMaterial({ color: 0x2997ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); flashes.push({ m, t0: 0 });
    }
    let flashCursor = 0;
    function flashCells(cells) {
      const now = performance.now();
      cells.slice(0, POOL).forEach((c, i) => {
        const f = flashes[flashCursor++ % POOL], w = cellW(c.x, c.y);
        f.m.position.set(w.x, .06, w.z); f.t0 = now + i * 14; f.m.visible = true;
      });
    }
    const RAYS = 24;
    const rayGeo = new THREE.BufferGeometry();
    rayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAYS * 6), 3));
    const rays = new THREE.LineSegments(rayGeo, new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false }));
    rays.visible = false; scene.add(rays);
    const hitGeo = new THREE.BufferGeometry();
    hitGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAYS * 3), 3));
    const hits = new THREE.Points(hitGeo, new THREE.PointsMaterial({ map: glow, color: 0x67e8f9, size: .22, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
    hits.visible = false; scene.add(hits);
    const rayCaster = new THREE.Raycaster(); rayCaster.far = 5.5;

    /* ---- LIDAR FOG-OF-WAR: the maze starts unseen. Cells materialize only where
       the bot's ray sweep has passed and persist as a dim point-cloud memory —
       you watch SLAM build the map in real time. ---- */
    const fog = new Uint8Array(G * G);
    const fogGeo = new THREE.BufferGeometry();
    fogGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(G * G * 3), 3));
    const fogPos = fogGeo.attributes.position.array;
    for (let i = 0; i < G * G; i++) fogPos[i * 3 + 1] = -99;
    const fogPts = new THREE.Points(fogGeo, new THREE.PointsMaterial({ map: glow, color: 0x67e8f9, size: .16, transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false }));
    fogPts.frustumCulled = false; fogPts.visible = false; scene.add(fogPts);
    function seeCell(cx, cy) {
      if (cx < 0 || cy < 0 || cx >= G || cy >= G) return;
      const i = gi(cx, cy);
      if (fog[i]) return;
      fog[i] = 1;
      if (gameGrid[i]) { wallScale(i, 1); wallsIM.instanceMatrix.needsUpdate = true; }
      const w = cellW(cx, cy), k = i * 3;
      fogPos[k] = w.x; fogPos[k + 1] = .05; fogPos[k + 2] = w.z;
      fogGeo.attributes.position.needsUpdate = true;
    }
    function fogReset() {
      fog.fill(0);
      for (let i = 0; i < G * G; i++) fogPos[i * 3 + 1] = -99;
      fogGeo.attributes.position.needsUpdate = true;
      seeCell(START.x, START.y);
    }
    function seeAlongRay(dir, dist) {
      const step = CS * .34, n = Math.floor(dist / step);
      for (let s = 1; s <= n; s++) {
        const px = bot.position.x + dir.x * s * step, pz = bot.position.z + dir.z * s * step;
        seeCell(Math.round((px - GM.x) / CS + (G - 1) / 2), Math.round((pz - GM.z) / CS + (G - 1) / 2));
      }
    }
    const hoverBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(CS * .96, .94, CS * .96)), new THREE.LineBasicMaterial({ color: 0x67e8f9 }));
    hoverBox.visible = false; scene.add(hoverBox);

    class Heap {
      constructor() { this.a = []; }
      push(n) { const a = this.a; a.push(n); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[i].f < a[p].f) { [a[i], a[p]] = [a[p], a[i]]; i = p; } else break; } }
      pop() { const a = this.a, t = a[0], l = a.pop(); if (a.length) { a[0] = l; let i = 0; for (; ;) { const L = 2 * i + 1, R = L + 1; let m = i; if (L < a.length && a[L].f < a[m].f) m = L; if (R < a.length && a[R].f < a[m].f) m = R; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } } return t; }
      get size() { return this.a.length; }
    }
    function astar(s, g2) {
      const open = new Heap(), gc = new Float32Array(G * G).fill(1e9), came = new Int16Array(G * G).fill(-1), closed = new Uint8Array(G * G);
      const H = i => Math.abs(i % G - g2.x) + Math.abs(((i / G) | 0) - g2.y);
      const si = gi(s.x, s.y); gc[si] = 0; open.push({ i: si, f: H(si) });
      const visited = [];
      while (open.size) {
        const n = open.pop(); if (closed[n.i]) continue;
        closed[n.i] = 1; visited.push({ x: n.i % G, y: (n.i / G) | 0 });
        if (n.i === gi(g2.x, g2.y)) {
          const path = []; let c = n.i;
          while (c !== -1) { path.push({ x: c % G, y: (c / G) | 0 }); c = came[c]; }
          return { path: path.reverse(), visited };
        }
        const x = n.i % G, y = (n.i / G) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= G || ny >= G) continue;
          const ni = gi(nx, ny);
          if (gameGrid[ni] || closed[ni]) continue;
          const ng = gc[n.i] + 1;
          if (ng < gc[ni]) { gc[ni] = ng; came[ni] = n.i; open.push({ i: ni, f: ng + H(ni) }); }
        }
      }
      return { path: null, visited };
    }
    const game = { path: null, idx: 0, running: false, replans: 0, moves: 0, curve: null };
    const gCost = $('#gCost'), gMoves = $('#gMoves'), gReplans = $('#gReplans'), gStatus = $('#gStatus');
    function gstat(m, err) { gStatus.textContent = m; gStatus.style.color = err ? '#F59E0B' : '#67E8F9'; }
    function setPath(cells) {
      game.path = cells; game.idx = 0;
      const pts = cells.map(c => { const w = cellW(c.x, c.y); return new THREE.Vector3(w.x, .12, w.z); });
      game.curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0);
      pathLine.geometry.dispose();
      pathLine.geometry = new THREE.BufferGeometry().setFromPoints(game.curve.getPoints(200));
      pathLine.geometry.setDrawRange(0, 200);
      pathLine.visible = true;
      gCost.textContent = cells.length - 1;
    }
    function clearPath(msg) {
      game.path = null; game.running = false; pathLine.visible = false; dots.forEach(d => d.visible = false);
      if (msg) gstat(msg);
    }
    function planFrom(cell, silent) {
      const r = astar(cell, GOAL);
      flashCells(r.visited);
      if (!r.path) { gstat('Exit is sealed — clear some walls.', true); game.running = false; pathLine.visible = false; return false; }
      setPath(r.path);
      if (!silent) gstat('Route locked — cost ' + (r.path.length - 1) + ' moves.');
      return true;
    }
    function botCell() {
      let best = 0, bd = 1e9;
      for (let i = 0; i < G * G; i++) { const w = cellW(i % G, (i / G) | 0); const d = (w.x - bot.position.x) ** 2 + (w.z - bot.position.z) ** 2; if (d < bd) { bd = d; best = i; } }
      return { x: best % G, y: (best / G) | 0 };
    }
    function toggleWall(cx, cy) {
      if (isBorder(cx, cy) || (cx === START.x && cy === START.y) || (cx === GOAL.x && cy === GOAL.y)) return;
      const i = gi(cx, cy); gameGrid[i] ^= 1; fog[i] = 1; wallScale(i, gameGrid[i] ? 1 : .001); wallsIM.instanceMatrix.needsUpdate = true;
      SFX.tick();
      if (game.running) {
        const rem = game.path.slice(game.idx);
        if (rem.some(c => c.x === cx && c.y === cy)) {
          game.replans++; gReplans.textContent = game.replans;
          gstat('WALL DETECTED — replanning from cell ' + cx + ',' + cy);
          SFX.replan();
          planFrom(botCell(), true);
        }
      } else if (game.path) { clearPath('Edited — run again to replan.'); gCost.textContent = '—'; }
    }
    function shuffle() {
      const r = mul32((Math.random() * 1e9) | 0);
      for (let t = 0; t < 50; t++) {
        gameGrid.fill(0);
        for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++)
          if (!(x === START.x && y === START.y) && !(x === GOAL.x && y === GOAL.y) && r() < .24) gameGrid[gi(x, y)] = 1;
        refreshWalls();
        if (astar(START, GOAL).path) break;
      }
      resetRun(); gstat('New maze generated — run it.');
    }
    function resetRun() {
      clearPath(); game.replans = 0; game.moves = 0;
      gReplans.textContent = 0; gMoves.textContent = 0; gCost.textContent = '—';
      if (gTime) gTime.textContent = '—';
      fogReset();
      const w = cellW(START.x, START.y); bot.position.set(w.x, .22, w.z); bot.rotation.y = Math.PI;
      gstat('Idle — toggle walls, then run.');
    }
    /* ---- speedrun timer + local leaderboard ---- */
    const gTime = $('#gTime'), gBest = $('#gBest');
    let bestRun = null;
    try { bestRun = JSON.parse(localStorage.getItem('rb25_best') || 'null'); } catch (e) {}
    if (gBest) gBest.textContent = bestRun ? bestRun.t.toFixed(1) + 's' : '—';
    function stopTimerAndRecord() {
      const secs = (performance.now() - game.t0) / 1000;
      const eff = game.optimal ? Math.round(game.optimal / Math.max(1, game.moves) * 100) : 100;
      SFX.arrive();
      if (!bestRun || secs < bestRun.t) {
        bestRun = { t: secs, eff };
        try { localStorage.setItem('rb25_best', JSON.stringify(bestRun)); } catch (e) {}
        if (gBest) gBest.textContent = secs.toFixed(1) + 's';
        toast('NEW RECORD — ' + secs.toFixed(1) + 's · ' + eff + '% optimal');
        SFX.record();
      } else {
        toast('Goal reached — ' + secs.toFixed(1) + 's · ' + eff + '% optimal');
      }
      return secs;
    }
    $('#gRun').addEventListener('click', () => {
      if (game.running) return toast('Already executing.');
      if (planFrom(START)) {
        game.running = true;
        game.t0 = performance.now();
        game.optimal = game.path.length - 1;
        SFX.blip();
      }
    });
    $('#gShuffle').addEventListener('click', () => { SFX.tick(); shuffle(); });
    $('#gReset').addEventListener('click', () => {
      for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) gameGrid[gi(x, y)] = 0;
      refreshWalls(); resetRun(); toast('Grid cleared.');
    });
    {
      const r = mul32(20250101);
      for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++)
        if (!(x === START.x && y === START.y) && !(x === GOAL.x && y === GOAL.y) && r() < .24) gameGrid[gi(x, y)] = 1;
      refreshWalls(); resetRun();
    }
    function updateGame(dt) {
      const active = state.mode === 'game';
      rays.visible = active; hits.visible = active; fogPts.visible = active;
      startMk.scale.setScalar(1 + Math.sin(state.time * 3) * .1);
      goalMk.scale.setScalar(1 + Math.sin(state.time * 3 + 1.3) * .1);
      if (game.running && game.path) {
        const tgt = game.path[game.idx + 1];
        if (!tgt) {
          game.running = false;
          const secs = stopTimerAndRecord();
          gstat('Arrived — ' + game.moves + ' moves · ' + game.replans + ' replans · ' + secs.toFixed(1) + 's · ' + (game.optimal ? Math.round(game.optimal / Math.max(1, game.moves) * 100) : 100) + '% optimal.');
        } else {
          const w = cellW(tgt.x, tgt.y);
          if (gameGrid[gi(tgt.x, tgt.y)]) {
            game.replans++; gReplans.textContent = game.replans;
            gstat('ROUTE BLOCKED MID-DRIVE — replanning…');
            planFrom(botCell(), true);
          } else {
            const dx = w.x - bot.position.x, dz = w.z - bot.position.z, d = Math.hypot(dx, dz), step = 3.4 * dt;
            bot.rotation.y = lerp(bot.rotation.y, Math.atan2(dx, dz), .18);
            if (d <= step) {
              bot.position.set(w.x, .22, w.z); game.idx++; game.moves++; gMoves.textContent = game.moves;
              const fr = game.idx / Math.max(1, game.path.length - 1);
              pathLine.geometry.setDrawRange(Math.floor(200 * fr), 200);
            } else bot.position.add(new THREE.Vector3(dx / d * step, 0, dz / d * step));
          }
        }
        if (gTime) gTime.textContent = ((performance.now() - game.t0) / 1000).toFixed(1) + 's';
      }
      dots.forEach((d, i) => {
        if (game.curve && game.path) {
          const t = ((i / DOTS) + state.time * .13) % 1;
          const p = game.curve.getPoint(t);
          d.position.set(p.x, .16, p.z); d.visible = true;
          d.material.opacity = .4 + .5 * Math.sin(state.time * 5 - i);
        } else d.visible = false;
      });
      if (active) {
        const pos = rayGeo.attributes.position.array, hp = hitGeo.attributes.position.array;
        const dir = new THREE.Vector3();
        for (let i = 0; i < RAYS; i++) {
          const a = i / RAYS * Math.PI * 2 + state.time * .4;
          dir.set(Math.cos(a), 0, Math.sin(a));
          rayCaster.set(new THREE.Vector3(bot.position.x, .3, bot.position.z), dir);
          const hit = rayCaster.intersectObject(wallsIM)[0];
          const d = hit ? hit.distance : 5.5;
          pos[i * 6] = bot.position.x; pos[i * 6 + 1] = .3; pos[i * 6 + 2] = bot.position.z;
          pos[i * 6 + 3] = bot.position.x + dir.x * d; pos[i * 6 + 4] = .3; pos[i * 6 + 5] = bot.position.z + dir.z * d;
          if (hit) { hp[i * 3] = pos[i * 6 + 3]; hp[i * 3 + 1] = .3; hp[i * 3 + 2] = pos[i * 6 + 5]; }
          else { hp[i * 3] = 0; hp[i * 3 + 1] = -99; hp[i * 3 + 2] = 0; }
          seeAlongRay(dir, d); /* fog-of-war: LiDAR sweep builds the map */
          if (hit) seeCell(Math.round((pos[i * 6 + 3] - GM.x) / CS + (G - 1) / 2), Math.round((pos[i * 6 + 5] - GM.z) / CS + (G - 1) / 2));
        }
        rayGeo.attributes.position.needsUpdate = true;
        hitGeo.attributes.position.needsUpdate = true;
      }
      const now = performance.now();
      flashes.forEach(f => {
        if (!f.m.visible) return;
        const a = (now - f.t0) / 650;
        if (a > 1) { f.m.visible = false; return; }
        if (a < 0) return;
        f.m.material.opacity = (1 - a) * .4;
        f.m.scale.setScalar(.6 + a * .7);
      });
      hoverBox.visible = active && !!state.hoverCell;
      if (state.hoverCell) {
        const w = cellW(state.hoverCell.x, state.hoverCell.y);
        hoverBox.position.set(w.x, .45, w.z);
        hoverBox.material.color.setHex(state.hoverCell.wall ? 0xF59E0B : 0x67e8f9);
      }
    }

    /* ============ TEAM ISLAND — themed flip ID badges ============ */
    /* Real Team Roboto / Roboverse crew — single source of truth is
       public/crew.js (window.ROBO_CREW), shared with the DOM cards in
       index.html. Mapped here to the legacy [name,role,ig,gh,li,email] shape. */
    const CREW = (window.ROBO_CREW || []).map(m => [m.n, m.r, m.ig, m.gh, m.li, m.em]);
    {
      const d2 = new THREE.Mesh(new THREE.CircleGeometry(7.5, 48), new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: .9, metalness: .2 }));
      d2.rotation.x = -Math.PI / 2; d2.rotation.z = 0; d2.position.set(TEAM.x, .02, TEAM.z); scene.add(d2);
      /* slanted display pedestal — replaces the old hanging clothes-bar */
      const baseM = new THREE.MeshStandardMaterial({ color: 0x10161f, roughness: .4, metalness: .7 });
      [[-5.4, -2.4], [5.4, -2.4], [-5.4, 2.4], [5.4, 2.4]].forEach(([x, z]) => bx(scene, .14, 1.6, .14, baseM, TEAM.x + x, .8, TEAM.z + z));
      bx(scene, 11.9, .12, 5.5, new THREE.MeshStandardMaterial({ color: 0x0c1119, roughness: .55, metalness: .5 }), TEAM.x, 1.66, TEAM.z);
      bx(scene, 11.7, .03, .05, MAT.led, TEAM.x, 1.735, TEAM.z - 2.62);
      bx(scene, 11.7, .03, .05, MAT.led, TEAM.x, 1.735, TEAM.z + 2.62);
      [[-5.2, 0], [0, 0], [5.2, 0]].forEach(([x]) => bx(scene, .05, .03, 5.1, MAT.led, TEAM.x + x, 1.735, TEAM.z));
    }
    function crewCanvas(m, i, back) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 384; const g = c.getContext('2d');
      g.fillStyle = '#0D1117'; g.fillRect(0, 0, 256, 384);
      const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, 'rgba(34,211,238,.10)'); gr.addColorStop(1, 'rgba(167,139,250,.05)');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
      g.strokeStyle = 'rgba(103,232,249,.4)'; g.lineWidth = 3;
      g.strokeRect(6, 6, 244, 372);
      g.fillStyle = '#05070A'; g.fillRect(98, 10, 60, 12);
      g.strokeStyle = 'rgba(103,232,249,.5)'; g.strokeRect(98, 10, 60, 12);
      const rr = (x, y, w, h) => { g.beginPath(); g.roundRect(x, y, w, h, 8); };
      if (!back) {
        g.font = '600 13px monospace'; g.fillStyle = '#7C8894'; g.textAlign = 'center';
        g.fillText('ROBOTO · CREW', 128, 44);
        g.fillStyle = '#22D3EE'; g.font = '600 11px monospace'; g.fillText('MEM ' + String(i + 1).padStart(2, '0'), 128, 62);
        rr(56, 76, 144, 144); g.fillStyle = '#131922'; g.fill();
        g.save(); g.beginPath(); g.roundRect(56, 76, 144, 144, 8); g.clip();
        if (m._img) g.drawImage(m._img, 56, 76, 144, 144);
        else { g.fillStyle = '#1a2230'; g.fillRect(56, 76, 144, 144); g.fillStyle = '#22D3EE'; g.font = '700 44px sans-serif'; g.fillText(m[0].replace(/^M\.\s*/i, '')[0].toUpperCase(), 128, 158); }
        g.restore();
        g.fillStyle = '#E6EDF3'; g.font = '700 22px "Space Grotesk", sans-serif'; g.fillText(m[0], 128, 252);
        g.fillStyle = '#7C8894'; g.font = '400 10px monospace'; g.fillText(m[1].toUpperCase(), 128, 272);
        /* pseudo-QR crew block (decorative, deterministic) */
        const r = mul32(i * 77 + 3); let bx2 = 74;
        for (let k = 0; k < 22; k++) { const w = 1 + r() * 3; g.fillStyle = '#E6EDF3'; if (r() > .25) g.fillRect(bx2, 316, w, 18); bx2 += w + 1 + r() * 2; }
        g.font = '400 9px monospace'; g.fillStyle = '#7C8894'; g.fillText('RB-25-' + String(i + 1).padStart(2, '0'), 128, 358);
      } else {
        g.fillStyle = '#22D3EE'; g.fillRect(6, 6, 244, 5);
        g.fillStyle = '#7C8894'; g.font = '600 10px monospace'; g.textAlign = 'center';
        g.fillText('ROBOTO · CREW — CONTACT', 128, 40);
        g.fillStyle = '#E6EDF3'; g.font = '700 21px "Space Grotesk", sans-serif'; g.fillText(m[0], 128, 70);
        g.fillStyle = '#22D3EE'; g.font = '600 9px monospace'; g.fillText(m[1].toUpperCase(), 128, 88);
        const rows = [];
        if (m[2]) rows.push(['IG', '@' + m[2]]);
        if (m[4]) rows.push(['LI', 'linkedin.com/in/' + m[4]]);
        if (m[3]) rows.push(['GH', 'github.com/' + m[3]]);
        if (m[5]) rows.push(['MAIL', m[5]]);
        rows.forEach((r2, k) => {
          const y = 108 + k * 52;
          rr(20, y, 216, 42); g.fillStyle = 'rgba(255,255,255,.04)'; g.fill();
          g.strokeStyle = 'rgba(103,232,249,.25)'; g.stroke();
          g.fillStyle = '#22D3EE'; g.font = '600 9px monospace'; g.textAlign = 'left'; g.fillText(r2[0], 32, y + 17);
          let fs = 11; g.font = '600 ' + fs + 'px monospace';
          while (g.measureText(r2[1]).width > 180 && fs > 7) { fs--; g.font = '600 ' + fs + 'px monospace'; }
          g.fillStyle = '#E6EDF3'; g.fillText(r2[1], 32, y + 33);
        });
        g.fillStyle = '#7C8894'; g.font = '400 9px monospace'; g.textAlign = 'center';
        g.fillText('CLICK TO FLIP BACK', 128, 364);
      }
      return c;
    }
    /* NOTE: no hanging lanyards — badges stand upright on the lit deck,
       gently breathing. Click a badge to flip it to its contact side. */
    const CARD_W = .86, CARD_H = 1.26, CARD_T = .04;
    const DECK_TOP = 1.72;
    const badges = [];
    CREW.forEach((m, i) => {
      const x = TEAM.x + (i - 2) * 1.42;
      const baseY = DECK_TOP + CARD_H / 2 + .01;
      const texF = new THREE.CanvasTexture(crewCanvas(m, i, false));
      const texB = new THREE.CanvasTexture(crewCanvas(m, i, true));
      texF.colorSpace = texB.colorSpace = THREE.SRGBColorSpace;
      texF.anisotropy = texB.anisotropy = 4;
      const side = new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: .5 });
      const card = new THREE.Mesh(new THREE.BoxGeometry(CARD_W, CARD_H, CARD_T),
        [side, side, side, side, new THREE.MeshBasicMaterial({ map: texF }), new THREE.MeshBasicMaterial({ map: texB })]);
      const cg = new THREE.Group();
      cg.position.set(x, baseY, TEAM.z);
      cg.add(card);
      scene.add(cg);
      /* thin under-glow strip so the card reads as themed hardware, not paper */
      const strip = new THREE.Mesh(new THREE.BoxGeometry(CARD_W * .7, .02, .02), MAT.led);
      strip.position.y = -CARD_H / 2 - .06; cg.add(strip);
      const rec = { m, i, cg, card, baseY, flipped: false, phase: i * 1.3 };
      m._img = null;
      const img = new Image();
      img.onload = () => { m._img = img; texF.image = crewCanvas(m, i, false); texF.needsUpdate = true; };
      img.onerror = () => { m._img = null; texF.image = crewCanvas(m, i, false); texF.needsUpdate = true; };
      /* real crew portraits, same-origin (no CORS needed); falls back to the initial block */
      img.src = './photos/member' + (i + 1) + '.jpg';
      card.userData.badge = rec;
      badges.push(rec);
    });
    function flip(rec) {
      rec.flipped = !rec.flipped;
      const from = rec.card.rotation.y, to = rec.flipped ? Math.PI : 0;
      tween(750, p => { rec.card.rotation.y = from + (to - from) * p; }, p => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2));
    }
    function updateTeam(dt) {
      badges.forEach(L => {
        /* idle breathing — upright, no swinging */
        L.cg.position.y = L.baseY + Math.sin(state.time * 1.2 + L.phase) * .028;
        L.card.rotation.z = Math.sin(state.time * .9 + L.phase) * .016;
      });
    }

    /* ============ POINTER ============ */
    const raycaster2 = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const gamePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const wv = new THREE.Vector3();
    let downInfo = null;
    function setNDC(e) { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); raycaster2.setFromCamera(ndc, camera); }
    canvas.addEventListener('pointermove', e => {
      state.mouse.x = (e.clientX / innerWidth - .5) * 2;
      state.mouse.y = (e.clientY / innerHeight - .5) * 2;
      setNDC(e);
      state.hover = null; state.hoverCell = null;
      if (state.mode === 'hardware') {
        const hit = raycaster2.intersectObject(robot, true)[0];
        if (hit) state.hover = hit.object.userData.part || null;
        canvas.style.cursor = state.hover ? 'pointer' : 'default';
      } else if (state.mode === 'game') {
        if (raycaster2.ray.intersectPlane(gamePlane, wv)) {
          const cx = Math.round((wv.x - GM.x) / CS + (G - 1) / 2), cy = Math.round((wv.z - GM.z) / CS + (G - 1) / 2);
          if (cx >= 0 && cy >= 0 && cx < G && cy < G) state.hoverCell = { x: cx, y: cy, wall: !!gameGrid[gi(cx, cy)] };
        }
        canvas.style.cursor = state.hoverCell ? 'crosshair' : 'default';
      } else if (state.mode === 'team') {
        const hit = raycaster2.intersectObjects(badges.map(L => L.card))[0];
        canvas.style.cursor = hit ? 'pointer' : 'default';
      } else canvas.style.cursor = 'default';
    });
    canvas.addEventListener('pointerdown', e => {
      setNDC(e); downInfo = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    addEventListener('pointerup', e => {
      if (state.mode === 'team' && downInfo) {
        const d = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
        if (d < 8 && performance.now() - downInfo.t < 600) {
          setNDC(e);
          const hit = raycaster2.intersectObjects(badges.map(L => L.card))[0];
          if (hit) flip(hit.object.userData.badge);
        }
      } else if (state.mode === 'game' && downInfo) {
        const d = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
        if (d < 6 && state.hoverCell) toggleWall(state.hoverCell.x, state.hoverCell.y);
      }
      downInfo = null;
    });

    /* ============ CAMERA ============ */
    const camT = new THREE.Vector3(), lookT = new THREE.Vector3(), curLook = new THREE.Vector3(0, .9, 0);
    function cameraTarget() {
      const t = state.time;
      switch (state.mode) {
        case 'hardware': camT.set(4.4 - state.e * .6, 2.3 + state.e * 2.1, 5.6 - state.e * .5); lookT.set(0, .9 + state.e * 1.25, 0); break;
        case 'math': camT.set(10.5, 5.5, 13); lookT.set(0, 1, 0); break;
        case 'game': camT.set(GM.x + state.mouse.x * .9, 15.4 - state.mouse.y * .5, GM.z + 8.8); lookT.set(GM.x, 0, GM.z + .4); break;
        case 'code': camT.set(GM.x + 11, 7.5, GM.z + 13); lookT.set(GM.x, .5, GM.z); break;
        case 'team': camT.set(TEAM.x + (state.teamE - .5) * 3.2 + state.mouse.x * .5, 2.35 - state.mouse.y * .3, TEAM.z + 6.8); lookT.set(TEAM.x, 2.25, TEAM.z); break;
        case 'footer': camT.set(TEAM.x + 7, 4.8, TEAM.z + 11); lookT.set(TEAM.x, 1.9, TEAM.z); break;
        default: {
          const a = t * .06;
          camT.set(Math.sin(a) * 7.6 + state.mouse.x * .9, 3.0 + Math.sin(t * .13) * .35 - state.mouse.y * .5, Math.cos(a) * 7.6 + .6);
          lookT.set(0, .9, 0);
        }
      }
    }

    /* ============ MODE / SCROLL ============ */
    const modeSecs = $$('[data-mode]');
    let lastMode = '';
    function computeMode() {
      const y = innerHeight / 2; let m = 'explore';
      for (const s of modeSecs) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) { m = s.dataset.mode; break; } }
      if (m !== lastMode) {
        lastMode = m; state.mode = m;
        pinsEl.classList.toggle('on', m === 'hardware');
        $('#explodeTag').classList.toggle('on', m === 'hardware');
      }
      const hw = $('#hardware').getBoundingClientRect();
      state.e = clamp01(-hw.top / Math.max(1, hw.height - innerHeight));
      const tm = $('#team').getBoundingClientRect();
      state.teamE = clamp01(-tm.top / Math.max(1, tm.height - innerHeight));
    }
    let humV = 0, lastSY = scrollY;
    addEventListener('scroll', () => {
      const sy = scrollY;
      humV = clamp01(Math.abs(sy - lastSY) / 60); lastSY = sy;
      requestAnimationFrame(computeMode);
    }, { passive: true });
    computeMode();
    {
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15 });
      $$('[data-reveal]').forEach(el => io.observe(el));
    }

    /* ============ KATEX ============ */
    if (window.katex) {
      $$('.tex[data-tex]').forEach(el => {
        try { katex.render(el.dataset.tex, el, { throwOnError: false, displayMode: true }); }
        catch (e) { el.textContent = el.dataset.tex; }
      });
    }

    /* ============ CODE VIEWER ============ */
    const FILES = {
      main: `// RB/25 - ESP32 firmware entry (Arduino framework + FreeRTOS)
#include <Arduino.h>
#include "kinematics.h"
#include "planner.h"

QueueHandle_t scanQueue;        // lidar task -> drive task

void lidarTask(void *arg) {     // CORE 0 - sensing @ 50 Hz
  ScanFrame f;
  for (;;) {
    lidar.read(f);              // 4x ToF pucks, 360 deg sweep
    occupancy.update(f);        // log-odds mapping (EQ 04)
    xQueueOverwrite(scanQueue, &f);
    vTaskDelay(pdMS_TO_TICKS(20));
  }
}

void driveTask(void *arg) {     // CORE 1 - control @ 100 Hz
  ScanFrame latest;
  Pose target;
  for (;;) {
    if (xQueuePeek(scanQueue, &latest, 0)) {
      if (planner.blockedAhead(latest))
        planner.replan(pose);   // dynamic reroute, no pause
      planner.next(target);
    }
    Kinematics::driveTo(target, pid);   // EQ 02 + EQ 05
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void setup() {
  Serial.begin(115200);
  scanQueue = xQueueCreate(1, sizeof(ScanFrame));
  xTaskCreatePinnedToCore(lidarTask, "lidar", 4096, NULL, 2, NULL, 0);
  xTaskCreatePinnedToCore(driveTask, "drive", 4096, NULL, 3, NULL, 1);
}

void loop() {}    // all work lives in the tasks`,
      kin: `// Holonomic inverse kinematics - 3x PG36555 + 127mm omni wheels
#include "kinematics.h"

static constexpr float R_WHEEL = 0.0635f;              // 127 mm dia -> m
static constexpr float THETA[3] = {1.5708f, 3.6652f, 5.7596f}; // 90/210/330

// EQ 01 inverted:  v_i = -sin(t)*vx + cos(t)*vy + R*omega
WheelSpeeds Kinematics::inverse(const Twist& t) {
  WheelSpeeds w;
  for (int i = 0; i < 3; ++i) {
    float v = -sin(THETA[i]) * t.vx
            +  cos(THETA[i]) * t.vy
            +  R_WHEEL * t.omega;
    w.rpm[i] = v / R_WHEEL * 60.0f / (2.0f * PI);   // rad/s -> rpm
  }
  return w;                                          // det(J) != 0 always
}

// EQ 05 - PID heading loop, called at 1 kHz from driveTask
float pidStep(PID& p, float err, float dt) {
  p.i += err * dt;
  p.i  = constrain(p.i, -p.imax, p.imax);            // anti-windup
  float d = (err - p.prev) / dt;
  p.prev = err;
  return p.kp * err + p.ki * p.i + p.kd * d;         // -> omega command
}`,
      plan: `// Grid A* with dynamic replanning (13x13 occupancy, 4-connected)
#include "planner.h"

struct Node { int i; float f; };        // min-heap keyed on f = g + h
static float h(int a, int b) {          // EQ 03 - Manhattan, admissible
  return abs(a % G - b % G) + abs(a / G - b / G);
}

bool Planner::plan(int start, int goal, const uint8_t* occ) {
  heap.push({start, h(start, goal)});
  g[start] = 0;
  while (heap.size()) {
    Node n = heap.pop();
    if (n.i == goal) { rebuild(came, goal); return true; }
    for (int d : {1, -1, G, -G}) {
      int nxt = n.i + d;
      if (occ[nxt] || closed[nxt]) continue;
      float ng = g[n.i] + 1.0f;
      if (ng < g[nxt]) {
        g[nxt]  = ng;
        came[nxt] = n.i;
        heap.push({nxt, ng + h(nxt, goal)});
      }
    }
  }
  return false;                         // sealed - hover, rescan, replan
}`
    };
    const codeBox = $('#codeBox'); let curFile = 'main';
    function loadFile(k) {
      curFile = k; codeBox.className = 'language-cpp';
      codeBox.removeAttribute('data-highlighted');
      codeBox.textContent = FILES[k];
      if (window.hljs) try { hljs.highlightElement(codeBox); } catch (e) { }
      $$('.ttab').forEach(t => t.classList.toggle('active', t.dataset.file === k));
    }
    $$('.ttab').forEach(t => t.addEventListener('click', () => loadFile(t.dataset.file)));
    loadFile('main');
    $('#copyBtn').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(FILES[curFile]); }
      catch (e) {
        const ta = document.createElement('textarea'); ta.value = FILES[curFile];
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      toast('Copied to clipboard.');
    });

    /* ============ LOADER + HERO DRIVE-IN ============ */
    robot.position.x = -16;
    function finishLoader() {
      const l = $('#loader'); if (l) { l.classList.add('done'); setTimeout(() => l.remove(), 1000); }
      const v = $('#veil'); if (v) { v.style.opacity = 0; setTimeout(() => v.remove(), 1400); }
      state.heroDriving = true;
      if (!REDUCE) tween(2600, p => { robot.position.x = lerp(-16, 0, p); }, p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, () => { state.heroDriving = false; });
      else { robot.position.x = 0; state.heroDriving = false; }
    }
    {
      const n = $('#loaderNum'), dur = REDUCE ? 200 : 1300, t0 = performance.now();
      (function s(now) {
        const p = clamp01((now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        n.innerHTML = String(Math.round(e * 100)).padStart(3, '0') + '<i>%</i>';
        if (p < 1) requestAnimationFrame(s); else finishLoader();
      })(t0);
    }

    /* ============ MAIN LOOP ============ */
    const explodeTagB = $('#explodeTag').querySelector('b');
    const clock = new THREE.Clock();
    let lastServoE = -1;
    /* header sound toggle — persisted in localStorage via SFX */
    const sndBtn = $('#sndBtn');
    if (sndBtn) {
      const paintSnd = () => { sndBtn.textContent = SFX.muted ? 'SOUND OFF' : 'SOUND ON'; sndBtn.setAttribute('aria-pressed', String(!SFX.muted)); };
      paintSnd();
      sndBtn.addEventListener('click', () => { SFX.unlock(); SFX.toggle(); paintSnd(); if (!SFX.muted) SFX.blip(); });
    }
    function loop() {
      const dt = Math.min(.05, clock.getDelta());
      state.time += dt;
      cameraTarget();
      camera.position.lerp(camT, .07);
      curLook.lerp(lookT, .07);
      camera.lookAt(curLook);
      for (const k of ['A', 'B', 'C']) {
        const [u0, u1] = WIN[k];
        const target = state.mode === 'hardware' ? smooth(u0, u1, state.e) : 0;
        layerVal[k] = lerp(layerVal[k], target, .12);
      }
      const ease = x => x * x * (3 - 2 * x);
      parts.forEach(p => {
        const t = ease(layerVal[p.layer]);
        p.g.position.copy(p.base).addScaledVector(p.dir, p.dist * t);
      });
      const eAvg = (layerVal.A + layerVal.B + layerVal.C) / 3;
      explodeTagB.textContent = Math.round(state.mode === 'hardware' ? state.e * 100 : eAvg * 100) + '%';
      const wob = (1 - eAvg) * (state.heroDriving ? 0 : 1);
      robot.position.y = Math.sin(state.time * 1.3) * .04 * wob;
      robot.rotation.y = Math.sin(state.time * .4) * .05 * wob;
      disc.position.x = robot.position.x;
      disc.material.opacity = .28 + Math.sin(state.time * 2) * .07;
      const spinSpd = state.heroDriving ? 14 : 1.6;
      wheelSpins.forEach(w => w.rotation.x += dt * spinSpd);
      lidarTops.forEach((t, i) => t.rotation.y += dt * (2 + i * .3));
      MAT.led.emissiveIntensity = 2.6 + Math.sin(state.time * 5) * .9;
      parts.forEach(p => {
        const s = state.hover === p.name ? 1.045 : 1;
        p.g.scale.setScalar(lerp(p.g.scale.x, s, .18));
        if (p.el) p.el.classList.toggle('open', state.hover === p.name);
      });
      if (state.mode === 'hardware') {
        parts.forEach(p => {
          if (!p.anchor) return;
          p.anchor.getWorldPosition(wv); wv.project(camera);
          p.el.style.transform = 'translate(' + ((wv.x * .5 + .5) * innerWidth).toFixed(1) + 'px,' + ((-wv.y * .5 + .5) * innerHeight).toFixed(1) + 'px)';
          p.el.style.opacity = wv.z < 1 ? 1 : 0;
        });
      }
      if (state.mode === 'hardware' && Math.abs(state.e - lastServoE) > .06) { lastServoE = state.e; SFX.servo(state.e); }
      humV = lerp(humV, 0, .05); SFX.hum(humV);
      updateGame(dt);
      updateTeam(dt);
      state._pts.rotation.y += dt * .01;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    loop();

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      computeMode();
    });
    window.__ok = true;
    window.__tickGame = updateGame;   /* debug hooks, same pattern as __stage/__ok */
    window.__dbg = { state, game, fog, cellW };
    setStage('Live — RB/25 online');

  } catch (err) {
    console.error(err);
    window.__err = (err && (err.stack || err.message)) || String(err);
    window.__fb('Scene crashed while starting', 'Stage: ' + window.__stage + '\n\n' + window.__err);
  }
})();
