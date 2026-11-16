import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Atom, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

interface MolecularStructureViewerProps {
  herbName: string;
  alkaloidName: string;
  formula: string;
}

interface AtomNode {
  x: number;
  y: number;
  z: number;
  element: 'C' | 'O' | 'N' | 'H';
}

interface BondConnection {
  from: number;
  to: number;
}

// Generate representative molecular geometry based on alkaloid formula complexity
const generateMolecularTopology = (formula: string): { atoms: AtomNode[]; bonds: BondConnection[] } => {
  const atoms: AtomNode[] = [];
  const bonds: BondConnection[] = [];

  // Ring 1 (Center)
  const ringSize = formula.includes('C58') || formula.includes('C42') ? 12 : 8;
  const radius = 1.6;

  for (let i = 0; i < ringSize; i++) {
    const theta = (i / ringSize) * Math.PI * 2;
    atoms.push({
      x: Math.cos(theta) * radius,
      y: Math.sin(theta) * radius,
      z: (Math.sin(theta * 2) * 0.4),
      element: i % 3 === 0 ? 'O' : 'C',
    });
  }

  // Ring 2 (Side cluster)
  const ring2Offset = 2.4;
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * Math.PI * 2;
    atoms.push({
      x: ring2Offset + Math.cos(theta) * 1.1,
      y: Math.sin(theta) * 1.1,
      z: Math.cos(theta) * 0.5,
      element: i === 2 ? 'N' : 'C',
    });
  }

  // Hydroxyl / Functional groups (Oxygen / Hydrogen terminals)
  atoms.push({ x: -1.2, y: 2.3, z: 0.8, element: 'O' });
  atoms.push({ x: 3.8, y: 1.2, z: -0.6, element: 'O' });
  atoms.push({ x: 0.0, y: -2.4, z: -0.9, element: 'O' });

  // Connect Ring 1 bonds
  for (let i = 0; i < ringSize; i++) {
    bonds.push({ from: i, to: (i + 1) % ringSize });
  }

  // Connect Ring 2 bonds
  const ring2Start = ringSize;
  for (let i = 0; i < 6; i++) {
    bonds.push({ from: ring2Start + i, to: ring2Start + ((i + 1) % 6) });
  }

  // Bridge ring 1 and ring 2
  bonds.push({ from: 2, to: ring2Start });
  bonds.push({ from: 5, to: ring2Start + 3 });

  // Functional group bonds
  bonds.push({ from: 1, to: ringSize + 6 }); // O attached to ring 1
  bonds.push({ from: ring2Start + 1, to: ringSize + 7 }); // O attached to ring 2
  bonds.push({ from: 8, to: ringSize + 8 });

  return { atoms, bonds };
};

const getElementColor = (element: AtomNode['element']): number => {
  switch (element) {
    case 'O': return 0xef4444; // Red
    case 'N': return 0x3b82f6; // Blue
    case 'H': return 0xf8fafc; // White
    default: return 0x64748b;  // Carbon (Dark Slate Gray)
  }
};

const getElementRadius = (element: AtomNode['element']): number => {
  switch (element) {
    case 'O': return 0.32;
    case 'N': return 0.32;
    case 'H': return 0.20;
    default: return 0.38;
  }
};

export const MolecularStructureViewer: React.FC<MolecularStructureViewerProps> = ({
  herbName,
  alkaloidName,
  formula,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [renderMode, setRenderMode] = useState<'balls' | 'wireframe'>('balls');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x2dd4bf, 2, 30);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    const { atoms, bonds } = generateMolecularTopology(formula);
    const atomMeshes: THREE.Mesh[] = [];

    // Create Atom Spheres
    atoms.forEach((atom) => {
      const radius = getElementRadius(atom.element);
      const color = getElementColor(atom.element);
      const geo = new THREE.SphereGeometry(radius, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.3,
        wireframe: renderMode === 'wireframe',
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.x, atom.y, atom.z);
      moleculeGroup.add(mesh);
      atomMeshes.push(mesh);
    });

    // Create Chemical Bond Cylinders
    bonds.forEach((bond) => {
      const p1 = new THREE.Vector3(atoms[bond.from].x, atoms[bond.from].y, atoms[bond.from].z);
      const p2 = new THREE.Vector3(atoms[bond.to].x, atoms[bond.to].y, atoms[bond.to].z);
      const distance = p1.distanceTo(p2);

      const bondGeo = new THREE.CylinderGeometry(0.09, 0.09, distance, 12);
      const bondMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.4,
        metalness: 0.5,
        wireframe: renderMode === 'wireframe',
      });
      const bondMesh = new THREE.Mesh(bondGeo, bondMat);

      // Position cylinder midpoint
      bondMesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
      bondMesh.lookAt(p2);
      bondMesh.rotateX(Math.PI / 2);
      moleculeGroup.add(bondMesh);
    });

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

      if (isRotating && moleculeGroup) {
        moleculeGroup.rotation.y += 0.006;
        moleculeGroup.rotation.x += 0.003;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [formula, isRotating, renderMode]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Atom className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Three.js 3D Molecular Structure — {alkaloidName}</span>
              <span className="text-[10px] font-mono text-teal-400">({fps} FPS)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Interactive 3D chemical bond inspector for {herbName} ({formula})</p>
          </div>
        </div>

        {/* View Mode & Rotation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            <button
              type="button"
              onClick={() => setRenderMode('balls')}
              className={`px-2.5 py-1 rounded transition-colors ${
                renderMode === 'balls' ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ball &amp; Stick
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('wireframe')}
              className={`px-2.5 py-1 rounded transition-colors ${
                renderMode === 'wireframe' ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wireframe
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRotating((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isRotating
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Rotating' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Three.js Render Mount */}
      <div
        ref={mountRef}
        className="w-full h-[340px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center shadow-inner"
      />
    </div>
  );
};
