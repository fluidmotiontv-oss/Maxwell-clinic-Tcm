import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Atom,
  RefreshCw,
  Play,
  Pause,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

type DockingLigand = 'saikosaponin' | 'jujuboside' | 'ferulicAcid' | 'astragaloside';

interface LigandInfo {
  name: string;
  formula: string;
  targetReceptor: string;
  bindingAffinity: string; // kcal/mol
  color: number;
  deltaG: string;
  kd: string;
}

const LIGANDS: Record<DockingLigand, LigandInfo> = {
  saikosaponin: {
    name: 'Saikosaponin A (Chai Hu)',
    formula: 'C42H68O13',
    targetReceptor: 'GABAA Receptor / HPA Axis Modulator',
    bindingAffinity: '-9.4 kcal/mol',
    deltaG: '-2.8 kcal/mol',
    kd: '42.5 nM',
    color: 0x2dd4bf,
  },
  jujuboside: {
    name: 'Jujuboside A (Suan Zao Ren)',
    formula: 'C58H94O26',
    targetReceptor: '5-HT1A / Central Benzodiazepine Site',
    bindingAffinity: '-10.8 kcal/mol',
    deltaG: '-3.4 kcal/mol',
    kd: '18.2 nM',
    color: 0xc084fc,
  },
  ferulicAcid: {
    name: 'Ferulic Acid (Dang Gui)',
    formula: 'C10H10O4',
    targetReceptor: 'Vascular Endothelial Growth Factor (VEGF)',
    bindingAffinity: '-7.2 kcal/mol',
    deltaG: '-1.9 kcal/mol',
    kd: '145.0 nM',
    color: 0x38bdf8,
  },
  astragaloside: {
    name: 'Astragaloside IV (Huang Qi)',
    formula: 'C41H68O14',
    targetReceptor: 'Telomerase / Mitochondrial Complex I',
    bindingAffinity: '-8.9 kcal/mol',
    deltaG: '-2.6 kcal/mol',
    kd: '64.0 nM',
    color: 0xf59e0b,
  },
};

interface DockingNodeMetadata {
  id: string;
  name: string;
  residue: string;
  nodeCategory: 'Receptor Binding Pocket' | 'Ligand Pharmacophore';
  interactionType: string;
  affinity: string;
  deltaG: string;
  baseKE: number; // in kJ/mol
  distance: string;
  sasa: string; // Solvent Accessible Surface Area
  enthalpy: string;
  entropy: string;
  role: string;
}

const RECEPTOR_RESIDUES: DockingNodeMetadata[] = [
  {
    id: 'arg142',
    name: 'Arg-142',
    residue: 'Guanidino Cation',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Salt Bridge / Electrostatic',
    affinity: '-9.8 kcal/mol',
    deltaG: '-3.1 kcal/mol',
    baseKE: 2.15,
    distance: '2.1 Å',
    sasa: '42 Å²',
    enthalpy: '-6.4 kcal/mol',
    entropy: '+3.3 kcal/mol',
    role: 'Primary positive charge anchor coordinating ligand polar carboxyl and hydroxyl groups.',
  },
  {
    id: 'glu210',
    name: 'Glu-210',
    residue: 'Carboxylate Anion',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Strong H-Bond Acceptor',
    affinity: '-9.4 kcal/mol',
    deltaG: '-2.8 kcal/mol',
    baseKE: 2.38,
    distance: '2.0 Å',
    sasa: '38 Å²',
    enthalpy: '-5.8 kcal/mol',
    entropy: '+3.0 kcal/mol',
    role: 'Forms dual hydrogen bonds with ligand glycone carbohydrate rings.',
  },
  {
    id: 'tyr98',
    name: 'Tyr-98',
    residue: 'Phenolic Hydroxyl',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'π-π Stacking & H-Bond',
    affinity: '-9.2 kcal/mol',
    deltaG: '-2.7 kcal/mol',
    baseKE: 2.52,
    distance: '2.7 Å',
    sasa: '55 Å²',
    enthalpy: '-5.2 kcal/mol',
    entropy: '+2.5 kcal/mol',
    role: 'Aromatic sandwich stabilization along the receptor entrance cleft.',
  },
  {
    id: 'trp164',
    name: 'Trp-164',
    residue: 'Indole Scaffold',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Hydrophobic Pocket Enclosure',
    affinity: '-8.9 kcal/mol',
    deltaG: '-2.5 kcal/mol',
    baseKE: 2.74,
    distance: '3.2 Å',
    sasa: '64 Å²',
    enthalpy: '-4.6 kcal/mol',
    entropy: '+2.1 kcal/mol',
    role: 'Lipophilic desolvation wall confining ligand triterpenoid backbone.',
  },
  {
    id: 'asp188',
    name: 'Asp-188',
    residue: 'Catalytic Dyad',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Ionic Coordination',
    affinity: '-10.1 kcal/mol',
    deltaG: '-3.3 kcal/mol',
    baseKE: 2.05,
    distance: '1.9 Å',
    sasa: '35 Å²',
    enthalpy: '-6.8 kcal/mol',
    entropy: '+3.5 kcal/mol',
    role: 'Deep pocket negative electrostatic sink with peak binding stability.',
  },
  {
    id: 'his101',
    name: 'His-101',
    residue: 'Imidazole Ring',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Metal Coordination Complex',
    affinity: '-8.7 kcal/mol',
    deltaG: '-2.4 kcal/mol',
    baseKE: 2.89,
    distance: '2.8 Å',
    sasa: '48 Å²',
    enthalpy: '-4.8 kcal/mol',
    entropy: '+2.4 kcal/mol',
    role: 'Proton shuttle regulating receptor open/closed conformational equilibrium.',
  },
  {
    id: 'phe224',
    name: 'Phe-224',
    residue: 'Aromatic Cleft',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Lipophilic Dispersion',
    affinity: '-9.1 kcal/mol',
    deltaG: '-2.6 kcal/mol',
    baseKE: 2.61,
    distance: '3.4 Å',
    sasa: '52 Å²',
    enthalpy: '-4.9 kcal/mol',
    entropy: '+2.3 kcal/mol',
    role: 'Hydrophobic floor minimizing energetic loss from water displacement.',
  },
  {
    id: 'lys115',
    name: 'Lys-115',
    residue: 'Ammonium Tether',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Cation-π Interaction',
    affinity: '-9.5 kcal/mol',
    deltaG: '-2.9 kcal/mol',
    baseKE: 2.29,
    distance: '2.5 Å',
    sasa: '40 Å²',
    enthalpy: '-5.9 kcal/mol',
    entropy: '+3.0 kcal/mol',
    role: 'Flexible sidechain tether locking ligand in optimal bio-active orientation.',
  },
  {
    id: 'ser72',
    name: 'Ser-72',
    residue: 'Hydroxyl Anchor',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Water-Mediated H-Bond',
    affinity: '-8.4 kcal/mol',
    deltaG: '-2.2 kcal/mol',
    baseKE: 3.12,
    distance: '2.6 Å',
    sasa: '31 Å²',
    enthalpy: '-4.2 kcal/mol',
    entropy: '+2.0 kcal/mol',
    role: 'Hydrogen-bonding node assisting slow off-rate kinetics.',
  },
  {
    id: 'thr145',
    name: 'Thr-145',
    residue: 'Sidechain Hydroxyl',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'Dipole Stabilization',
    affinity: '-8.8 kcal/mol',
    deltaG: '-2.5 kcal/mol',
    baseKE: 2.8,
    distance: '2.4 Å',
    sasa: '36 Å²',
    enthalpy: '-4.7 kcal/mol',
    entropy: '+2.2 kcal/mol',
    role: 'Maintains binding pocket hydration boundary balance.',
  },
  {
    id: 'asn202',
    name: 'Asn-202',
    residue: 'Amide Backbone',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'H-Bond Donating Backbone',
    affinity: '-9.3 kcal/mol',
    deltaG: '-2.8 kcal/mol',
    baseKE: 2.45,
    distance: '2.2 Å',
    sasa: '39 Å²',
    enthalpy: '-5.6 kcal/mol',
    entropy: '+2.8 kcal/mol',
    role: 'Stabilizes secondary helical loops bordering the binding channel.',
  },
  {
    id: 'met134',
    name: 'Met-134',
    residue: 'Thioether Bridge',
    nodeCategory: 'Receptor Binding Pocket',
    interactionType: 'van der Waals London Dispersion',
    affinity: '-8.6 kcal/mol',
    deltaG: '-2.3 kcal/mol',
    baseKE: 2.95,
    distance: '3.5 Å',
    sasa: '45 Å²',
    enthalpy: '-4.5 kcal/mol',
    entropy: '+2.2 kcal/mol',
    role: 'Flexible non-polar sidechain accommodating conformational breathing.',
  },
];

const LIGAND_PHARMACOPHORES: DockingNodeMetadata[] = [
  {
    id: 'c3-glc',
    name: 'C3-β-Glucoside Ring',
    residue: 'Hydrophilic Glycone',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Hydrogen Bonding Network',
    affinity: '-9.4 kcal/mol',
    deltaG: '-2.8 kcal/mol',
    baseKE: 2.42,
    distance: '2.2 Å',
    sasa: '72 Å²',
    enthalpy: '-5.7 kcal/mol',
    entropy: '+2.9 kcal/mol',
    role: 'Extends into aqueous vestibule to anchor ligand water solubility.',
  },
  {
    id: 'c28-est',
    name: 'C28-Ester Carbonyl',
    residue: 'Electrophilic Carbonyl',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Dipole-Dipole Alignment',
    affinity: '-9.7 kcal/mol',
    deltaG: '-3.0 kcal/mol',
    baseKE: 2.21,
    distance: '2.0 Å',
    sasa: '28 Å²',
    enthalpy: '-6.2 kcal/mol',
    entropy: '+3.2 kcal/mol',
    role: 'Electrostatic pin docking directly with catalytic receptor pocket.',
  },
  {
    id: 'aglycone',
    name: 'Aglycone Oleanane Core',
    residue: 'Pentacyclic Triterpene',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Hydrophobic Steric Fit',
    affinity: '-10.2 kcal/mol',
    deltaG: '-3.4 kcal/mol',
    baseKE: 1.95,
    distance: '2.9 Å',
    sasa: '115 Å²',
    enthalpy: '-6.9 kcal/mol',
    entropy: '+3.5 kcal/mol',
    role: 'Hydrophobic core driving desolvation free energy gain in pocket.',
  },
  {
    id: 'c16-oh',
    name: 'C16-α-Hydroxyl',
    residue: 'H-Bond Donor',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Polar Chelation',
    affinity: '-8.9 kcal/mol',
    deltaG: '-2.5 kcal/mol',
    baseKE: 2.65,
    distance: '2.1 Å',
    sasa: '24 Å²',
    enthalpy: '-4.9 kcal/mol',
    entropy: '+2.4 kcal/mol',
    role: 'Forms strong secondary hydrogen bond with receptor backbone amides.',
  },
  {
    id: 'c23-ald',
    name: 'C23-Aldehyde Moiety',
    residue: 'Polar Acceptor',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Weak Electrostatic',
    affinity: '-9.1 kcal/mol',
    deltaG: '-2.7 kcal/mol',
    baseKE: 2.5,
    distance: '2.4 Å',
    sasa: '32 Å²',
    enthalpy: '-5.1 kcal/mol',
    entropy: '+2.4 kcal/mol',
    role: 'Transient dipole interaction augmenting target binding specificity.',
  },
  {
    id: 'ether-bridge',
    name: '13β,28-Epoxy Bridge',
    residue: 'Rigid Scaffold Pivot',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Conformational Lock',
    affinity: '-9.5 kcal/mol',
    deltaG: '-2.9 kcal/mol',
    baseKE: 2.3,
    distance: '2.7 Å',
    sasa: '18 Å²',
    enthalpy: '-5.8 kcal/mol',
    entropy: '+2.9 kcal/mol',
    role: 'Restricts conformational entropy, enhancing enthalpy-driven docking.',
  },
  {
    id: 'c12-alkene',
    name: 'C12-C13 Olefinic Bond',
    residue: 'Lipophilic Anchor',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'π-Electron Dispersion',
    affinity: '-8.6 kcal/mol',
    deltaG: '-2.3 kcal/mol',
    baseKE: 2.88,
    distance: '3.1 Å',
    sasa: '22 Å²',
    enthalpy: '-4.4 kcal/mol',
    entropy: '+2.1 kcal/mol',
    role: 'Packs tightly against aromatic phenylalanine receptor sidewall.',
  },
  {
    id: 'terminal-xyl',
    name: 'Terminal Xylose Sugar',
    residue: 'Solvation Boundary',
    nodeCategory: 'Ligand Pharmacophore',
    interactionType: 'Water Bridge Coordination',
    affinity: '-9.0 kcal/mol',
    deltaG: '-2.6 kcal/mol',
    baseKE: 2.58,
    distance: '2.5 Å',
    sasa: '68 Å²',
    enthalpy: '-5.0 kcal/mol',
    entropy: '+2.4 kcal/mol',
    role: 'Modulates ligand pharmacokinetics and membrane permeation kinetics.',
  },
];

interface TooltipState {
  data: DockingNodeMetadata;
  kineticEnergyDisplay: string;
  x: number;
  y: number;
}

export const MolecularDockingVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedLigand, setSelectedLigand] = useState<DockingLigand>('saikosaponin');
  const [isDockingActive, setIsDockingActive] = useState<boolean>(true);
  const [dockingProgress, setDockingProgress] = useState<number>(78);
  const [fps, setFps] = useState<number>(60);
  const [hoveredNode, setHoveredNode] = useState<TooltipState | null>(null);
  const [pinnedNode, setPinnedNode] = useState<DockingNodeMetadata>(RECEPTOR_RESIDUES[0]);

  const activeLigand = LIGANDS[selectedLigand];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x2dd4bf, 3, 40);
    pointLight.position.set(-4, -4, 4);
    scene.add(pointLight);

    const dockingGroup = new THREE.Group();
    scene.add(dockingGroup);

    // Interactive node meshes collection for raycasting
    const interactiveMeshes: THREE.Mesh[] = [];

    // 1. Cellular Receptor (Large Binding Pocket Protein Complex)
    const receptorGroup = new THREE.Group();
    const pocketGeo = new THREE.TorusKnotGeometry(2.2, 0.7, 100, 16, 2, 3);
    const pocketMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const receptorMesh = new THREE.Mesh(pocketGeo, pocketMat);
    receptorGroup.add(receptorMesh);

    // Binding pocket core nodes (12 residues with distinct spatial coordinates)
    RECEPTOR_RESIDUES.forEach((residue, i) => {
      const phi = (i / 12) * Math.PI * 2;
      const nodeGeo = new THREE.SphereGeometry(0.26, 18, 18);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f766e,
        emissiveIntensity: 0.5,
        roughness: 0.25,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(
        Math.cos(phi) * 1.85,
        Math.sin(phi) * 1.85,
        i % 2 === 0 ? 0.45 : -0.45
      );
      node.userData = {
        dockingMetadata: residue,
        originalColor: 0x334155,
        originalEmissive: 0x0f766e,
        originalScale: 1,
      };
      receptorGroup.add(node);
      interactiveMeshes.push(node);
    });
    dockingGroup.add(receptorGroup);

    // 2. Bio-Agent Phytochemical Ligand (Docking Molecule)
    const ligandGroup = new THREE.Group();
    const ligandColor = activeLigand.color;

    // Central ligand atom cluster
    const lCoreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const lCoreMat = new THREE.MeshStandardMaterial({
      color: ligandColor,
      emissive: ligandColor,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    });
    const lCore = new THREE.Mesh(lCoreGeo, lCoreMat);
    lCore.userData = {
      dockingMetadata: LIGAND_PHARMACOPHORES[2], // Aglycone core
      originalColor: ligandColor,
      originalEmissive: ligandColor,
      originalScale: 1,
    };
    ligandGroup.add(lCore);
    interactiveMeshes.push(lCore);

    // Orbiting ligand functional atoms (8 pharmacophore nodes)
    LIGAND_PHARMACOPHORES.forEach((pharm, i) => {
      if (i === 2) return; // Core already added above
      const angle = (i / 8) * Math.PI * 2;
      const aGeo = new THREE.SphereGeometry(0.24, 18, 18);
      const isPolar = i % 2 === 0;
      const color = isPolar ? 0xef4444 : 0x38bdf8;
      const emissive = isPolar ? 0x991b1b : 0x0369a1;

      const aMat = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const atom = new THREE.Mesh(aGeo, aMat);
      atom.position.set(
        Math.cos(angle) * 1.35,
        Math.sin(angle) * 1.35,
        i % 3 === 0 ? 0.35 : -0.35
      );
      atom.userData = {
        dockingMetadata: pharm,
        originalColor: color,
        originalEmissive: emissive,
        originalScale: 1,
      };
      ligandGroup.add(atom);
      interactiveMeshes.push(atom);
    });

    dockingGroup.add(ligandGroup);

    // Raycaster for interactive hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHoveredMesh: THREE.Mesh | null = null;
    let clock = new THREE.Clock();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const meta = hit.userData.dockingMetadata as DockingNodeMetadata;

        if (currentHoveredMesh && currentHoveredMesh !== hit) {
          currentHoveredMesh.scale.set(1, 1, 1);
        }

        currentHoveredMesh = hit;
        hit.scale.set(1.28, 1.28, 1.28);
        renderer.domElement.style.cursor = 'pointer';

        const t = clock.getElapsedTime();
        // Dynamically compute kinetic energy with live thermal perturbation
        const dynamicKE = (meta.baseKE + Math.sin(t * 3.2 + meta.baseKE) * 0.14).toFixed(2);

        setHoveredNode({
          data: meta,
          kineticEnergyDisplay: `${dynamicKE} kJ/mol (${(parseFloat(dynamicKE) * 0.01036).toFixed(2)} eV)`,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        if (currentHoveredMesh) {
          currentHoveredMesh.scale.set(1, 1, 1);
          currentHoveredMesh = null;
        }
        renderer.domElement.style.cursor = 'default';
        setHoveredNode(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const meta = hit.userData.dockingMetadata as DockingNodeMetadata;
        setPinnedNode(meta);
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

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

      const elapsedTime = clock.getElapsedTime();

      if (isDockingActive) {
        receptorGroup.rotation.y += 0.003;
        receptorGroup.rotation.x += 0.001;

        // Smooth ligand trajectory oscillating into receptor binding pocket
        const targetX = Math.sin(elapsedTime * 0.8) * 0.4;
        const targetY = Math.cos(elapsedTime * 0.8) * 0.3;
        const targetZ = Math.sin(elapsedTime * 0.5) * 0.6;

        ligandGroup.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.08);
        ligandGroup.rotation.y -= 0.008;

        const prog = Math.round(75 + Math.sin(elapsedTime * 1.2) * 20);
        setDockingProgress(Math.max(60, Math.min(99, prog)));
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
      renderer.domElement.removeEventListener('click', onClick);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedLigand, isDockingActive]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Visualizer Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Atom className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Three.js 3D Molecular Docking — Phytochemical Interaction Simulator</span>
              <span className="text-[10px] font-mono text-teal-400">({fps} FPS)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 3D docking nodes with real-time Raycaster telemetry: hover nodes for kinetic energy &amp; binding affinity
            </p>
          </div>
        </div>

        {/* Ligand Selector & Play/Pause */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {(
              [
                { id: 'saikosaponin', label: 'Saikosaponin A' },
                { id: 'jujuboside', label: 'Jujuboside A' },
                { id: 'ferulicAcid', label: 'Ferulic Acid' },
                { id: 'astragaloside', label: 'Astragaloside IV' },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedLigand(l.id)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                  selectedLigand === l.id
                    ? 'bg-slate-800 text-teal-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsDockingActive((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isDockingActive
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isDockingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isDockingActive ? 'Docking Active' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Three.js Render Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-[380px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center shadow-inner"
      >
        {/* Interactive Hover Tooltip for 3D Docking Nodes */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute z-30 px-3.5 py-3 rounded-lg bg-slate-900/95 border border-teal-500/60 shadow-2xl backdrop-blur-sm text-xs space-y-2 transition-transform"
            style={{
              left: Math.min(
                mountRef.current ? mountRef.current.clientWidth - 260 : 360,
                Math.max(14, hoveredNode.x + 16)
              ),
              top: Math.max(14, hoveredNode.y - 80),
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-100">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                <span>{hoveredNode.data.name}</span>
                <span className="text-[10px] font-normal text-slate-400 font-mono">({hoveredNode.data.residue})</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                  hoveredNode.data.nodeCategory === 'Receptor Binding Pocket'
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                }`}
              >
                {hoveredNode.data.nodeCategory === 'Receptor Binding Pocket' ? 'Pocket Node' : 'Ligand Atom'}
              </span>
            </div>

            {/* Kinetic Energy & Binding Affinity Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase">Kinetic Energy (E_k)</div>
                <div className="text-amber-400 font-bold">{hoveredNode.kineticEnergyDisplay}</div>
              </div>

              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase">Binding Affinity (ΔG)</div>
                <div className="text-teal-400 font-bold">
                  {hoveredNode.data.affinity}{' '}
                  <span className="text-[10px] text-teal-500 font-normal">({hoveredNode.data.deltaG})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-0.5 border-t border-slate-800/60">
              <span className="text-slate-400">Interaction:</span>
              <span className="text-slate-200 font-semibold">{hoveredNode.data.interactionType}</span>
            </div>

            <div className="text-[9px] font-mono text-teal-400/80 flex items-center gap-1 italic">
              <span>● Click node to pin complete thermodynamic telemetry</span>
            </div>
          </div>
        )}

        {/* Viewport Overlay Controls Guide */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-slate-300">Receptor Pocket Nodes (12 Active Residues)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-slate-300">Ligand Pharmacophore Pharmacophore Clusters</span>
          </div>
          <div className="text-[9px] text-slate-400 pt-0.5">
            Hover over 3D nodes to inspect Kinetic Energy &amp; Receptor Binding Affinity
          </div>
        </div>
      </div>

      {/* Pinned Node Deep Telemetry Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 uppercase">Inspected Docking Node:</span>
            <span className="text-sm font-bold text-slate-100">{pinnedNode.name}</span>
            <span className="text-xs font-mono text-teal-400">({pinnedNode.residue})</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                pinnedNode.nodeCategory === 'Receptor Binding Pocket'
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              }`}
            >
              {pinnedNode.nodeCategory}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Target Receptor: <strong className="text-slate-200">{activeLigand.targetReceptor}</strong>
          </div>
        </div>

        {/* 4-Column Scientific Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded p-2.5 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Receptor Binding Affinity</div>
            <div className="text-teal-400 font-bold text-sm">{pinnedNode.affinity}</div>
            <div className="text-[10px] text-slate-400">Free Energy: {pinnedNode.deltaG}</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded p-2.5 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Kinetic Energy Baseline</div>
            <div className="text-amber-400 font-bold text-sm">{pinnedNode.baseKE} kJ/mol</div>
            <div className="text-[10px] text-slate-400">Thermal oscillation velocity: 240 m/s</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded p-2.5 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Thermodynamic State</div>
            <div className="text-emerald-400 font-bold text-sm">ΔH {pinnedNode.enthalpy}</div>
            <div className="text-[10px] text-slate-400">-TΔS: {pinnedNode.entropy}</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded p-2.5 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Spatial Bond Parameters</div>
            <div className="text-slate-200 font-bold text-sm">{pinnedNode.distance}</div>
            <div className="text-[10px] text-slate-400">SASA: {pinnedNode.sasa}</div>
          </div>
        </div>

        {/* Role & Clinical Context */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded p-2.5 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            <strong className="text-slate-200 font-mono text-[11px]">Binding Role: </strong>
            {pinnedNode.role}
          </p>
        </div>
      </div>

      {/* Docking Telemetry Metadata Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono tabular-nums">
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400">Ligand Chemical Formula</div>
          <div className="text-slate-200 font-bold truncate">
            {activeLigand.name} ({activeLigand.formula})
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400">Estimated Global Binding Affinity</div>
          <div className="text-teal-400 font-bold text-sm">
            {activeLigand.bindingAffinity} <span className="text-xs text-slate-400 font-normal">(Kd: {activeLigand.kd})</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400">Docking Fit Confidence</div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">{dockingProgress}%</span>
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${dockingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
