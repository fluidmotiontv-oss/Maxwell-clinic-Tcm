import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, RefreshCw, Cpu, Zap, ArrowRightLeft, ShieldCheck, Heart, Sparkles } from 'lucide-react';

type RoutingMode = 'network' | 'feedback' | 'organs';

interface NodePosition {
  name: string;
  pos: [number, number, number];
  color: number;
  element: string;
  baseKE: number;
  affinity: string;
  frequency: string;
  role: string;
}

const ORGANS: NodePosition[] = [
  {
    name: 'Liver (Gan)',
    pos: [-3.5, 1.5, 0],
    color: 0x10b981,
    element: 'Wood',
    baseKE: 3.42,
    affinity: '-9.4 kcal/mol (HPA Axis Coupling)',
    frequency: '174 Hz Solfeggio',
    role: 'Smooth Qi dispersal & blood storage coordination',
  },
  {
    name: 'Heart (Xin)',
    pos: [0, 3.2, -1],
    color: 0xef4444,
    element: 'Fire',
    baseKE: 4.18,
    affinity: '-10.2 kcal/mol (Vagal Tone Synapse)',
    frequency: '528 Hz Shen Harmony',
    role: 'Master governor of Shen consciousness and blood vessels',
  },
  {
    name: 'Spleen (Pi)',
    pos: [3.5, 1.2, 0],
    color: 0xf59e0b,
    element: 'Earth',
    baseKE: 2.85,
    affinity: '-8.9 kcal/mol (Metabolic Gut Axis)',
    frequency: '417 Hz Transformation',
    role: 'Nutrient transformation and post-natal Qi synthesis',
  },
  {
    name: 'Lung (Fei)',
    pos: [-2.5, -2, 1],
    color: 0x38bdf8,
    element: 'Metal',
    baseKE: 3.12,
    affinity: '-8.7 kcal/mol (Wei Qi Dispersion)',
    frequency: '741 Hz Cellular Defense',
    role: 'Governs defensive Wei Qi and respiratory rhythm',
  },
  {
    name: 'Kidney (Shen)',
    pos: [2.5, -2, 1],
    color: 0x8b5cf6,
    element: 'Water',
    baseKE: 3.75,
    affinity: '-9.6 kcal/mol (Mitochondrial Jing)',
    frequency: '285 Hz Adrenal Recharge',
    role: 'Root of primordial Yin/Yang and adrenal resilience',
  },
];

interface HoveredAgentNode {
  name: string;
  category: string;
  element: string;
  kineticEnergy: string;
  affinity: string;
  frequency: string;
  role: string;
  x: number;
  y: number;
}

export const BioAgentThreeVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('network');
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [hoveredNode, setHoveredNode] = useState<HoveredAgentNode | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 380;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 3, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2dd4bf, 3, 50);
    pointLight.position.set(4, 6, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xc084fc, 2.5, 50);
    pointLight2.position.set(-4, -4, -4);
    scene.add(pointLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    let activeGroup: THREE.Group | null = null;
    let pulseParticles: THREE.Points | null = null;
    const interactiveMeshes: THREE.Mesh[] = [];

    const buildRoutingScene = (mode: RoutingMode) => {
      if (activeGroup) {
        rootGroup.remove(activeGroup);
      }
      activeGroup = new THREE.Group();
      interactiveMeshes.length = 0;

      // Central Diagnostic AI Core
      const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x2dd4bf,
        emissive: 0x0f766e,
        emissiveIntensity: 0.7,
        wireframe: mode === 'organs' ? true : false,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.userData = {
        name: 'Maxwell AI Diagnostic Nexus',
        category: 'Bio-Agent Central Core',
        element: 'Harmonized Center',
        baseKE: 5.24,
        affinity: '-10.8 kcal/mol (Systemic Equilibrium)',
        frequency: '40 Hz Gamma Telemetry Sync',
        role: 'Autonomous multi-agent controller synchronizing bio-markers with TCM prescriptions',
      };
      activeGroup.add(coreMesh);
      interactiveMeshes.push(coreMesh);

      // Organ / Agent Nodes
      ORGANS.forEach((org) => {
        const nodeGeo = new THREE.SphereGeometry(0.5, 24, 24);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: org.color,
          emissive: org.color,
          emissiveIntensity: 0.65,
          roughness: 0.2,
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.set(...org.pos);
        nodeMesh.userData = {
          name: org.name,
          category: 'Zang-Fu Bio-Agent Endpoint',
          element: org.element,
          baseKE: org.baseKE,
          affinity: org.affinity,
          frequency: org.frequency,
          role: org.role,
        };
        activeGroup!.add(nodeMesh);
        interactiveMeshes.push(nodeMesh);

        // Connecting routing path (Curve)
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(org.pos[0] * 0.5, org.pos[1] * 0.5 + 1.2, org.pos[2] * 0.5 - 1),
          new THREE.Vector3(...org.pos)
        );

        const points = curve.getPoints(40);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: org.color,
          transparent: true,
          opacity: mode === 'network' ? 0.45 : 0.2,
        });
        const routingLine = new THREE.Line(lineGeo, lineMat);
        activeGroup!.add(routingLine);
      });

      // Physiological Signal Feedback Particles flowing along paths
      if (mode === 'feedback' || mode === 'network') {
        const pCount = 90;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const colors = new Float32Array(pCount * 3);

        for (let i = 0; i < pCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 7;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 7;

          colors[i * 3] = 0.18;
          colors[i * 3 + 1] = 0.83;
          colors[i * 3 + 2] = 0.75;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pMat = new THREE.PointsMaterial({
          size: 0.18,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
        });

        pulseParticles = new THREE.Points(pGeo, pMat);
        activeGroup.add(pulseParticles);
      }

      rootGroup.add(activeGroup);
    };

    buildRoutingScene(routingMode);

    // Raycaster for hover telemetry tooltips
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHoverMesh: THREE.Mesh | null = null;
    const clock = new THREE.Clock();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData;

        if (currentHoverMesh && currentHoverMesh !== hit) {
          currentHoverMesh.scale.set(1, 1, 1);
        }

        currentHoverMesh = hit;
        hit.scale.set(1.25, 1.25, 1.25);
        renderer.domElement.style.cursor = 'pointer';

        const t = clock.getElapsedTime();
        const liveKE = (data.baseKE + Math.sin(t * 3.0 + data.baseKE) * 0.16).toFixed(2);

        setHoveredNode({
          name: data.name,
          category: data.category,
          element: data.element,
          kineticEnergy: `${liveKE} kJ/mol (${(parseFloat(liveKE) * 0.01036).toFixed(2)} eV)`,
          affinity: data.affinity,
          frequency: data.frequency,
          role: data.role,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        if (currentHoverMesh) {
          currentHoverMesh.scale.set(1, 1, 1);
          currentHoverMesh = null;
        }
        renderer.domElement.style.cursor = 'default';
        setHoveredNode(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      frameCount++;
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      if (isAnimating && activeGroup) {
        activeGroup.rotation.y += 0.004;

        if (pulseParticles) {
          const posAttr = pulseParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i + 1] += 0.02;
            if (arr[i + 1] > 4) arr[i + 1] = -4;
          }
          posAttr.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [routingMode, isAnimating]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <ArrowRightLeft className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Three.js Bio-Agent Routing &amp; Physiological Feedback Loops</span>
              <span className="text-[10px] font-mono text-teal-400">({fps} FPS)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 3D tracking of bio-agent routing paths and feedback loops: hover nodes to inspect kinetic energy &amp; binding affinity
            </p>
          </div>
        </div>

        {/* Routing Mode & Animation Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {(
              [
                { id: 'network', label: 'Routing Network' },
                { id: 'feedback', label: 'Signal Feedback' },
                { id: 'organs', label: 'Organ Nodes' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setRoutingMode(m.id)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                  routingMode === m.id
                    ? 'bg-slate-800 text-teal-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAnimating((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isAnimating
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnimating ? 'animate-spin' : ''}`} />
            <span>{isAnimating ? 'Live Pulse' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Three.js Render Mount */}
      <div
        ref={mountRef}
        className="w-full h-[380px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center shadow-inner"
      >
        {/* Interactive Hover Tooltip */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute z-30 px-3.5 py-3 rounded-lg bg-slate-900/95 border border-teal-500/60 shadow-2xl backdrop-blur-sm text-xs space-y-1.5 transition-transform"
            style={{
              left: Math.min(
                mountRef.current ? mountRef.current.clientWidth - 260 : 360,
                Math.max(14, hoveredNode.x + 16)
              ),
              top: Math.max(14, hoveredNode.y - 75),
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-100">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                <span>{hoveredNode.name}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 uppercase">
                {hoveredNode.element}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase">Kinetic Energy (E_k)</div>
                <div className="text-amber-400 font-bold">{hoveredNode.kineticEnergy}</div>
              </div>

              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase">Binding Affinity / Coherence</div>
                <div className="text-teal-400 font-bold">{hoveredNode.affinity}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-0.5 border-t border-slate-800/60">
              <span className="text-slate-400">Carrier Wave:</span>
              <span className="text-slate-200 font-semibold">{hoveredNode.frequency}</span>
            </div>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-slate-300">Diagnostic Nexus (Center)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">5 Zang-Fu Organ Bio-Agent Endpoints</span>
          </div>
          <div className="text-[9px] text-slate-400 pt-0.5">
            Hover over 3D agent nodes to inspect kinetic energy and target binding affinity
          </div>
        </div>
      </div>
    </div>
  );
};
