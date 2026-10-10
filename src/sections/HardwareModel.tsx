import { useEffect, useRef, useState } from 'react';
import SectionShell from '../components/SectionShell';

const MODEL_URL = '/models/action-camera.glb';
const THREE_BASE = 'https://esm.sh/three@0.160.0';

export default function HardwareModel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const explodedRef = useRef(false);
  const [exploded, setExploded] = useState(false);
  const [status, setStatus] = useState('Loading 3D engine…');
  const [ready, setReady] = useState(false);

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

        controls = new controlsModule.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.minDistance = 1.2;
        controls.maxDistance = 14;
        controls.target.set(0, 0, 0);

        setStatus('Loading assembly…');
        const loader = new loaderModule.GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(MODEL_URL, resolve, undefined, reject);
        });
        if (disposed) return;

        const model = gltf.scene;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        model.position.sub(center);
        model.scale.setScalar(3.2 / maxDimension);
        scene.add(model);
        model.updateMatrixWorld(true);

        // Explode top-level assembly branches, preserving each branch's own sub-hierarchy.
        let branches = [...model.children].filter((child: any) => child.visible);
        while (branches.length === 1 && branches[0].children?.length > 1) {
          branches = [...branches[0].children].filter((child: any) => child.visible);
        }
        const modelBounds = new THREE.Box3().setFromObject(model);
        const modelCenter = modelBounds.getCenter(new THREE.Vector3());
        const scaledSize = modelBounds.getSize(new THREE.Vector3());
        const distance = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.48;
        partRecords = branches.map((object: any) => {
          const partBounds = new THREE.Box3().setFromObject(object);
          const direction = partBounds.getCenter(new THREE.Vector3()).sub(modelCenter);
          if (direction.lengthSq() < 0.0001) direction.set(0, 1, 0);
          direction.normalize();
          return { object, base: object.position.clone(), offset: direction.multiplyScalar(distance) };
        });

        camera.position.set(4.2, 2.8, 5.2);
        controls.target.set(0, 0, 0);
        controls.update();
        setReady(true);
        setStatus(partRecords.length > 1 ? `${partRecords.length} assembly branches detected` : 'Model loaded — single root branch detected');
      } catch (error) {
        if (!disposed) {
          console.error('Unable to load the 3D assembly:', error);
          setStatus(`Model not loaded. Add the converted GLB at public${MODEL_URL} and refresh.`);
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
      kicker="Orbit the converted CAD assembly, inspect its part hierarchy, and pull the components apart."
    >
      <div className="overflow-hidden border border-line bg-panel/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute md:px-6">
          <span><span className="mr-2 inline-block h-2 w-2 bg-lime" />GLB ASSEMBLY VIEWER</span>
          <span aria-live="polite">{status}</span>
        </div>
        <div className="relative h-[52vh] min-h-[340px] max-h-[680px] bg-[#080d14]">
          <div ref={mountRef} className="absolute inset-0" aria-label="Interactive 3D assembly viewer" />
          {!ready && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
              <p className="max-w-md border border-line bg-void/90 p-5 font-mono text-xs leading-relaxed text-mute">
                {status.includes('not loaded')
                  ? <>The viewer is ready for your converted model. Place <span className="text-cyan">action-camera.glb</span> in <span className="text-cyan">public/models/</span> to enable interactive inspection.</>
                  : status}
              </p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-widest text-mute/80">Drag to orbit · Scroll to zoom</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4 md:px-6">
          <p className="font-mono text-[10px] leading-relaxed text-mute">Part separation follows the GLB scene’s top-level component hierarchy.</p>
          <button
            type="button"
            onClick={toggleExploded}
            disabled={!ready}
            className="border border-cyan/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan transition-colors hover:bg-cyan hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exploded ? 'Reassemble' : 'Explode assembly'}
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
