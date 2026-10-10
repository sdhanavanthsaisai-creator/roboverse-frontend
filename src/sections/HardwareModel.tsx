import { useEffect, useRef, useState } from 'react';
import SectionShell from '../components/SectionShell';

const MODEL_URL = '/models/rover.glb';
const THREE_BASE = 'https://esm.sh/three@0.160.0';

type PartSpec = {
  names: string[];
  label: string;
  tag: string;
  detail: string;
  dir: [number, number, number];
  dist: number;
};

// Explosion map for the RB/25 SolidWorks assembly ("FINAL MODEL.glb").
// Directions are in model space (Y up): decks lift, wheels split sideways,
// motors slide out with them, caster hardware pulls away from the drive side.
const PART_SPECS: PartSpec[] = [
  {
    names: ['ply wood 250x200-1'],
    label: 'Main chassis deck',
    tag: 'CHS-01',
    detail: '250 × 200 plywood base — stays put as the assembly reference',
    dir: [0, 0, 0],
    dist: 0,
  },
  {
    names: ['plywood l2-1'],
    label: 'Upper deck L2',
    tag: 'CHS-02',
    detail: 'Second plywood level — lifts straight up',
    dir: [0, 1, 0],
    dist: 1.5,
  },
  {
    names: ['Traction Wheel-1'],
    label: 'Traction wheels ×2',
    tag: 'DRV-01',
    detail: 'Rubber traction wheels — split outward along the axle',
    dir: [0, 0.25, 1],
    dist: 1.8,
  },
  {
    names: ['MOTOR 1-1', 'motor 2-1'],
    label: 'Drive motors ×4',
    tag: 'DRV-02',
    detail: 'Gear motors — slide out with the wheels, slightly raised',
    dir: [0, 0.5, 1],
    dist: 1.1,
  },
  {
    names: ['motor mount-2'],
    label: 'Motor mounts ×2',
    tag: 'DRV-03',
    detail: 'Motor mounting brackets — follow the motors out',
    dir: [0, 0.45, 1],
    dist: 0.75,
  },
  {
    names: ['FLANGE PCD=47.5-1'],
    label: 'Wheel flanges ×2',
    tag: 'DRV-04',
    detail: 'PCD 47.5 hub flanges — follow the motors out',
    dir: [0, 0.45, 1],
    dist: 0.75,
  },
  {
    names: ['Part1-1', 'Part2-1'],
    label: 'Caster brackets',
    tag: 'SUP-01',
    detail: 'Caster support brackets — pull away from the drive side',
    dir: [-1, 0.15, 0],
    dist: 1.3,
  },
  {
    names: ['Castor Wheel-1'],
    label: 'Caster wheel',
    tag: 'SUP-02',
    detail: 'Swivel caster — drops out with the bracket assembly',
    dir: [-1, -0.25, 0],
    dist: 1.5,
  },
  {
    names: ['Part4-1', '8-1'],
    label: 'Caster hardware',
    tag: 'SUP-03',
    detail: 'Small bracket fasteners — float highest for visibility',
    dir: [-0.4, 1, 0],
    dist: 2.0,
  },
];

export default function HardwareModel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const explodedRef = useRef(false);
  const [exploded, setExploded] = useState(false);
  const [status, setStatus] = useState('Loading 3D engine…');
  const [ready, setReady] = useState(false);
  const [partCount, setPartCount] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let renderer: any;
    let controls: any;
    let scene: any;
    let camera: any;
    let partRecords: Array<{ object: any; base: any; offset: any }> = [];

    const boot = async () => {
      try {
        const [THREE, loaderModule, controlsModule] = await Promise.all([
          import(/* @vite-ignore */ THREE_BASE),
          import(/* @vite-ignore */ `${THREE_BASE}/examples/jsm/loaders/GLTFLoader.js`),
          import(/* @vite-ignore */ `${THREE_BASE}/examples/jsm/controls/OrbitControls.js`),
        ]);
        if (disposed) return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color('#080d14');
        camera = new THREE.PerspectiveCamera(36, 1, 0.01, 1000);
        camera.position.set(4.2, 2.8, 5.2);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xb7eaff, 0x16202d, 2.1));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
        keyLight.position.set(4, 6, 5);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0x00c8ff, 1.7);
        fillLight.position.set(-5, 1, -4);
        scene.add(fillLight);

        const grid = new THREE.GridHelper(8, 16, 0x1d2a3a, 0x111a26);
        grid.position.y = -1.7;
        scene.add(grid);

        controls = new controlsModule.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.minDistance = 1.2;
        controls.maxDistance = 14;
        controls.target.set(0, 0, 0);

        setStatus('Loading RB/25 assembly…');
        const loader = new loaderModule.GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(MODEL_URL, resolve, undefined, reject);
        });
        if (disposed) return;

        const roverGroup = new THREE.Group();
        scene.add(roverGroup);
        const model = gltf.scene;
        roverGroup.add(model);

        // Normalize: center the assembly and scale it to a predictable size.
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        model.position.sub(center);
        model.scale.setScalar(3.2 / maxDimension);
        model.updateMatrixWorld(true);

        const modelBounds = new THREE.Box3().setFromObject(model);
        const modelCenter = modelBounds.getCenter(new THREE.Vector3());

        // GLTFLoader sanitises node names: whitespace becomes "_", reserved
        // characters are dropped and repeats get an "_1" suffix
        // ("occurrence of FLANGE PCD=47.5-1" -> "occurrence_of_FLANGE_PCD=475-1").
        // Compare normalised names so the SolidWorks part names still match.
        const glbKey = (s: string) =>
          String(s || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_=<>-]/g, '');
        const occurrences: any[] = [];
        model.traverse((child: any) => {
          if (/^occurrence_of_/.test(child.name || '')) occurrences.push(child);
        });
        // Register every "occurrence of X" node matching the SolidWorks part
        // names below. Each occurrence is moved so duplicated parts
        // (two wheels, two motors, …) explode independently.
        const registerPart = (
          name: string,
          directionArray: [number, number, number],
          distance: number,
        ) => {
          const want = glbKey(name);
          const matches: any[] = occurrences.filter((node: any) => {
            const k = glbKey((node.name || '').replace(/^occurrence_of_/, ''));
            return k === want || k.indexOf(want + '_') === 0;
          });
          if (!matches.length) {
            console.warn(`Part "${name}" not found in rover.glb — check the export names.`);
            return;
          }
          matches.forEach((node) => {
            const partBounds = new THREE.Box3().setFromObject(node);
            const partCenter = partBounds.getCenter(new THREE.Vector3());
            const dir = new THREE.Vector3(...directionArray);
            // Mirror the sideways push per instance: the wheel on the far
            // side of the axle must travel the opposite way.
            if (directionArray[2] !== 0) {
              const side = Math.sign(partCenter.z - modelCenter.z) || 1;
              dir.z = Math.abs(dir.z) * side;
            }
            if (directionArray[0] !== 0 && directionArray[1] === 0 && directionArray[2] === 0) {
              const side = Math.sign(partCenter.x - modelCenter.x) || -1;
              dir.x = Math.abs(dir.x) * side;
            }
            dir.normalize();
            partRecords.push({
              object: node,
              base: node.position.clone(),
              offset: dir.multiplyScalar(distance),
            });
          });
        };

        PART_SPECS.forEach((spec) => {
          spec.names.forEach((name) => registerPart(name, spec.dir, spec.dist));
        });

        setPartCount(partRecords.length);
        controls.update();
        setReady(true);
        setStatus(
          partRecords.length > 1
            ? `${partRecords.length} registered part instances`
            : 'Model loaded — no named parts matched',
        );
      } catch (error) {
        if (!disposed) {
          console.error('Unable to load the 3D assembly:', error);
          setStatus('Model not loaded. Check public/models/rover.glb and refresh.');
        }
      }
    };

    const resize = () => {
      if (!renderer || !camera || !mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (partRecords.length) {
        const amount = explodedRef.current ? 1 : 0;
        for (const part of partRecords) {
          const target = part.base.clone().addScaledVector(part.offset, amount);
          part.object.position.lerp(target, 0.09);
        }
      }
      controls?.update();
      renderer?.render(scene, camera);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    void boot();
    frame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      controls?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  const toggleExploded = () => {
    explodedRef.current = !explodedRef.current;
    setExploded(explodedRef.current);
  };

  return (
    <SectionShell
      id="hardware-model"
      index="01 / HARDWARE MODEL"
      title="Explore the assembly"
      kicker="Orbit the real RB/25 CAD assembly, then pull its drivetrain, decks and caster apart."
    >
      <div className="overflow-hidden border border-line bg-panel/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute md:px-6">
          <span><span className="mr-2 inline-block h-2 w-2 bg-lime" />RB/25 ASSEMBLY · FINAL MODEL.GLB</span>
          <span aria-live="polite">{status}</span>
        </div>
        <div className="relative h-[52vh] min-h-[340px] max-h-[680px] bg-[#080d14]">
          <div ref={mountRef} className="absolute inset-0" aria-label="Interactive 3D assembly viewer" />
          {!ready && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
              <p className="max-w-md border border-line bg-void/90 p-5 font-mono text-xs leading-relaxed text-mute">
                {status.includes('not loaded')
                  ? <>The viewer could not load <span className="text-cyan">public/models/rover.glb</span>. Check the file exists and refresh.</>
                  : status}
              </p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-widest text-mute/80">Drag to orbit · Scroll to zoom</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4 md:px-6">
          <p className="font-mono text-[10px] leading-relaxed text-mute">
            {partCount > 0
              ? `Scroll-free teardown — ${partCount} part instances separate along their assembly vectors.`
              : 'Part separation follows the named SolidWorks part hierarchy.'}
          </p>
          <button
            type="button"
            onClick={toggleExploded}
            disabled={!ready}
            className="border border-cyan/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan transition-colors hover:bg-cyan hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exploded ? 'Reassemble' : 'Explode assembly'}
          </button>
        </div>
        <ul className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {PART_SPECS.map((spec) => (
            <li key={spec.tag} className="bg-panel px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">{spec.tag}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{spec.label}</p>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-mute">{spec.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
