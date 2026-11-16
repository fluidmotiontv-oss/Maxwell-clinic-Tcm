import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { PresetPatient } from '../data/mockPatients';
import { Activity, RefreshCw, Heart, Eye, ShieldAlert, Sparkles, Compass, CheckCircle2 } from 'lucide-react';

interface AnatomicalZangFuViewerProps {
  patient: PresetPatient;
}

interface OrganData {
  id: string;
  name: string;
  chineseName: string;
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  position: [number, number, number];
  scale: [number, number, number];
  geometryType: 'heart' | 'lung-left' | 'lung-right' | 'liver' | 'spleen' | 'kidney-left' | 'kidney-right' | 'stomach';
  telemetryName: string;
  telemetryReading: string;
  status: 'Nominal' | 'Hyperactive / Stagnant' | 'Deficient / Depleted';
  statusColor: number;
  hexColor: string;
  clinicalNote: string;
}

export const AnatomicalZangFuViewer: React.FC<AnatomicalZangFuViewerProps> = ({ patient }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedOrganId, setSelectedOrganId] = useState<string>('liver');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [hoveredOrgan, setHoveredOrgan] = useState<{ name: string; status: string; x: number; y: number } | null>(null);

  // Map patient biomarkers and TCM elements dynamically to Zang-Fu status
  const organs = useMemo<OrganData[]>(() => {
    const eb = patient.elementBalance || { wood: 50, fire: 50, earth: 50, metal: 50, water: 50 };
    const hrvNum = parseInt(patient.bioMarkers.hrv) || 30;
    const crpNum = parseFloat(patient.bioMarkers.crp) || 3.0;
    const sleepNum = parseInt(patient.bioMarkers.sleep) || 60;
    const mitoNum = parseInt(patient.bioMarkers.mitochondrial) || 68;

    const liverStatus = eb.wood >= 75 ? 'Hyperactive / Stagnant' : eb.wood < 35 ? 'Deficient / Depleted' : 'Nominal';
    const heartStatus = hrvNum < 25 ? 'Hyperactive / Stagnant' : hrvNum >= 35 ? 'Nominal' : 'Deficient / Depleted';
    const spleenStatus = crpNum > 3.0 || eb.earth < 35 ? 'Deficient / Depleted' : 'Nominal';
    const lungStatus = eb.metal >= 70 ? 'Hyperactive / Stagnant' : eb.metal < 35 ? 'Deficient / Depleted' : 'Nominal';
    const kidneyStatus = mitoNum < 70 || eb.water < 35 ? 'Deficient / Depleted' : 'Nominal';
    const stomachStatus = crpNum > 3.5 ? 'Hyperactive / Stagnant' : 'Nominal';

    const getColor = (status: string, baseHex: number) => {
      if (status === 'Hyperactive / Stagnant') return { num: 0xf43f5e, hex: '#f43f5e' }; // rose
      if (status === 'Deficient / Depleted') return { num: 0x38bdf8, hex: '#38bdf8' }; // sky blue
      return { num: baseHex, hex: '#2dd4bf' }; // teal/nominal
    };

    const heartColor = getColor(heartStatus, 0xef4444);
    const liverColor = getColor(liverStatus, 0x10b981);
    const spleenColor = getColor(spleenStatus, 0xf59e0b);
    const lungColor = getColor(lungStatus, 0xa855f7);
    const kidneyColor = getColor(kidneyStatus, 0x0284c7);
    const stomachColor = getColor(stomachStatus, 0xeab308);

    return [
      {
        id: 'heart',
        name: 'Heart (Xin)',
        chineseName: '心',
        element: 'Fire',
        position: [0.35, 1.35, 0.4],
        scale: [0.75, 0.9, 0.65],
        geometryType: 'heart',
        telemetryName: 'Vagal HRV & Shen Coherence',
        telemetryReading: patient.bioMarkers.hrv,
        status: heartStatus,
        statusColor: heartColor.num,
        hexColor: heartColor.hex,
        clinicalNote: 'Houses Shen consciousness. Vagal tone regulation through Pericardium-Heart channel axis.',
      },
      {
        id: 'liver',
        name: 'Liver (Gan)',
        chineseName: '肝',
        element: 'Wood',
        position: [-1.0, 0.0, 0.35],
        scale: [1.25, 0.95, 0.9],
        geometryType: 'liver',
        telemetryName: 'Cortisol Slope & Bile Metabolism',
        telemetryReading: patient.bioMarkers.cortisol.split(',')[0],
        status: liverStatus,
        statusColor: liverColor.num,
        hexColor: liverColor.hex,
        clinicalNote: 'Governs smooth Qi movement and nocturnal blood storage. 1-3 AM organ clock vulnerability.',
      },
      {
        id: 'spleen',
        name: 'Spleen (Pi)',
        chineseName: '脾',
        element: 'Earth',
        position: [1.25, 0.1, 0.25],
        scale: [0.8, 0.75, 0.65],
        geometryType: 'spleen',
        telemetryName: 'Microbiome Diversity & hs-CRP',
        telemetryReading: `CRP ${patient.bioMarkers.crp}`,
        status: spleenStatus,
        statusColor: spleenColor.num,
        hexColor: spleenColor.hex,
        clinicalNote: 'Governs transformation & transportation of nutrients. Manifests in muscle tone and clear saliva.',
      },
      {
        id: 'lung-left',
        name: 'Lung Left (Fei)',
        chineseName: '肺',
        element: 'Metal',
        position: [0.95, 1.7, 0.1],
        scale: [0.75, 1.4, 0.75],
        geometryType: 'lung-left',
        telemetryName: 'Defensive Wei Qi & Oxygenation',
        telemetryReading: 'SpO2 98% / Alpha 7.8Hz',
        status: lungStatus,
        statusColor: lungColor.num,
        hexColor: lungColor.hex,
        clinicalNote: 'Governs skin, pores, and defensive Wei Qi barrier against external pathogenic factors.',
      },
      {
        id: 'lung-right',
        name: 'Lung Right (Fei)',
        chineseName: '肺',
        element: 'Metal',
        position: [-0.95, 1.7, 0.1],
        scale: [0.8, 1.4, 0.75],
        geometryType: 'lung-right',
        telemetryName: 'Upper Jiao Qi Dispersal',
        telemetryReading: 'Respiratory Pacing 14/min',
        status: lungStatus,
        statusColor: lungColor.num,
        hexColor: lungColor.hex,
        clinicalNote: 'Regulates water passages and downward conduction of fluids to the Kidneys.',
      },
      {
        id: 'kidney-left',
        name: 'Kidney Left (Shen)',
        chineseName: '肾',
        element: 'Water',
        position: [0.85, -0.9, -0.45],
        scale: [0.65, 0.85, 0.65],
        geometryType: 'kidney-left',
        telemetryName: 'Mitochondrial ATP & Adrenal Jing',
        telemetryReading: patient.bioMarkers.mitochondrial,
        status: kidneyStatus,
        statusColor: kidneyColor.num,
        hexColor: kidneyColor.hex,
        clinicalNote: 'Root of primordial Yin and Yang. Controls marrow, bone density, and autonomic stamina.',
      },
      {
        id: 'kidney-right',
        name: 'Kidney Right (Shen)',
        chineseName: '肾',
        element: 'Water',
        position: [-0.85, -0.9, -0.45],
        scale: [0.65, 0.85, 0.65],
        geometryType: 'kidney-right',
        telemetryName: 'Adrenal Glucocorticoid Axis',
        telemetryReading: patient.bioMarkers.bloodPressure,
        status: kidneyStatus,
        statusColor: kidneyColor.num,
        hexColor: kidneyColor.hex,
        clinicalNote: 'Right Kidney Gate of Vitality (Ming Men). Drives thermogenic digestive fire.',
      },
      {
        id: 'stomach',
        name: 'Stomach (Wei)',
        chineseName: '胃',
        element: 'Earth',
        position: [0.15, -0.15, 0.55],
        scale: [0.85, 0.8, 0.7],
        geometryType: 'stomach',
        telemetryName: 'Gastric Mucosal Barrier & Sleep',
        telemetryReading: `Sleep ${patient.bioMarkers.sleep.split(' ')[0]}`,
        status: stomachStatus,
        statusColor: stomachColor.num,
        hexColor: stomachColor.hex,
        clinicalNote: 'Sea of Water & Grain. Receives intake and ferments food into post-natal essence.',
      },
    ];
  }, [patient]);

  const activeOrgan = organs.find((o) => o.id === selectedOrganId) || organs[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = 400;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.6, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.4);
    frontLight.position.set(2, 6, 8);
    scene.add(frontLight);

    const backRimLight = new THREE.PointLight(0x2dd4bf, 2.5, 40);
    backRimLight.position.set(-4, -2, -5);
    scene.add(backRimLight);

    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Anatomical Torso Wireframe Hologram
    const torsoPoints: THREE.Vector3[] = [];
    const segments = 24;
    for (let y = -2.8; y <= 3.2; y += 0.28) {
      const radiusX = Math.cos((y / 3.2) * 1.2) * 2.1 + 0.2;
      const radiusZ = Math.cos((y / 3.2) * 1.1) * 1.2 + 0.1;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        torsoPoints.push(new THREE.Vector3(Math.cos(theta) * radiusX, y, Math.sin(theta) * radiusZ));
      }
    }

    const torsoGeo = new THREE.BufferGeometry().setFromPoints(torsoPoints);
    const torsoMat = new THREE.PointsMaterial({
      color: 0x334155,
      size: 0.045,
      transparent: true,
      opacity: 0.35,
    });
    const torsoMesh = new THREE.Points(torsoGeo, torsoMat);
    bodyGroup.add(torsoMesh);

    // Spine Column Axis
    const spinePoints = [
      new THREE.Vector3(0, 3.2, -0.6),
      new THREE.Vector3(0, 1.5, -0.5),
      new THREE.Vector3(0, -0.5, -0.6),
      new THREE.Vector3(0, -2.6, -0.5),
    ];
    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const spineGeo = new THREE.TubeGeometry(spineCurve, 30, 0.12, 8, false);
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      wireframe: true,
    });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    bodyGroup.add(spineMesh);

    // Create 3D Organ Meshes
    const organMeshes: THREE.Mesh[] = [];

    organs.forEach((organ) => {
      let geo: THREE.BufferGeometry;

      if (organ.geometryType === 'heart') {
        geo = new THREE.SphereGeometry(0.8, 24, 24);
      } else if (organ.geometryType.includes('lung')) {
        geo = new THREE.CylinderGeometry(0.55, 0.85, 1.8, 18);
      } else if (organ.geometryType === 'liver') {
        geo = new THREE.ConeGeometry(1.2, 1.5, 18);
      } else if (organ.geometryType.includes('kidney')) {
        geo = new THREE.CapsuleGeometry(0.5, 0.7, 8, 16);
      } else {
        geo = new THREE.DodecahedronGeometry(0.85, 1);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: organ.statusColor,
        emissive: organ.statusColor,
        emissiveIntensity: organ.id === selectedOrganId ? 0.75 : 0.35,
        roughness: 0.3,
        metalness: 0.25,
        transparent: true,
        opacity: organ.id === selectedOrganId ? 0.95 : 0.75,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...organ.position);
      mesh.scale.set(...organ.scale);
      mesh.userData = { organId: organ.id, organName: organ.name, status: organ.status };

      bodyGroup.add(mesh);
      organMeshes.push(mesh);
    });

    // Raycasting for interactive hover and click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(organMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData;
        renderer.domElement.style.cursor = 'pointer';
        setHoveredOrgan({
          name: data.organName,
          status: data.status,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        renderer.domElement.style.cursor = 'default';
        setHoveredOrgan(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(organMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        setSelectedOrganId(hit.userData.organId);
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    const clock = new THREE.Clock();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      frameCount++;
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      const elapsedTime = clock.getElapsedTime();

      if (isRotating) {
        bodyGroup.rotation.y += 0.005;
      }

      // Organ Rhythmic Pulsing (Heart rhythm and Liver respiratory shifts)
      organMeshes.forEach((mesh) => {
        const organId = mesh.userData.organId;
        if (organId === 'heart') {
          const pulse = 1 + Math.sin(elapsedTime * 6.5) * 0.08;
          mesh.scale.set(0.75 * pulse, 0.9 * pulse, 0.65 * pulse);
        } else if (organId.includes('lung')) {
          const breath = 1 + Math.sin(elapsedTime * 1.8) * 0.05;
          mesh.scale.set(0.75 * breath, 1.4 * breath, 0.75 * breath);
        }
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = 400;
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
  }, [organs, isRotating, selectedOrganId]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Heart className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Three.js Anatomical Zang-Fu Organ Status Viewer</span>
              <span className="text-[10px] font-mono text-teal-400">({fps} FPS)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 3D torso mapping of {patient.name}&rsquo;s internal Zang-Fu systems to live biomarker telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Organ Quick Selector Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {['heart', 'liver', 'spleen', 'lung-left', 'kidney-left', 'stomach'].map((id) => {
              const org = organs.find((o) => o.id === id);
              if (!org) return null;
              const isSelected = selectedOrganId.startsWith(id.split('-')[0]);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedOrganId(id)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                    isSelected ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {org.chineseName} {org.name.split(' ')[0]}
                </button>
              );
            })}
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

      {/* Three.js Render Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[400px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center shadow-inner"
      >
        {/* Floating Hover Tooltip */}
        {hoveredOrgan && (
          <div
            className="pointer-events-none absolute z-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-0.5 transition-transform"
            style={{
              left: Math.min(window.innerWidth > 768 ? 420 : 200, Math.max(12, hoveredOrgan.x + 14)),
              top: Math.max(12, hoveredOrgan.y - 48),
            }}
          >
            <div className="font-bold text-slate-100">{hoveredOrgan.name}</div>
            <div className="text-[11px] font-mono text-teal-400">{hoveredOrgan.status}</div>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Nominal / Harmonious</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Hyperactive / Stagnant Heat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">Deficient / Depleted Qi</span>
          </div>
        </div>
      </div>

      {/* Selected Organ Clinical Status & Biomarker Integration Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-slate-100">{activeOrgan.name}</span>
            <span className="text-lg text-teal-400 font-serif">{activeOrgan.chineseName}</span>
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded border"
              style={{
                color: activeOrgan.hexColor,
                borderColor: `${activeOrgan.hexColor}40`,
                backgroundColor: `${activeOrgan.hexColor}15`,
              }}
            >
              {activeOrgan.status}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Element: <strong className="text-slate-200">{activeOrgan.element}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono tabular-nums">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Live Telemetry Metric</div>
            <div className="text-slate-200 font-bold text-sm">{activeOrgan.telemetryName}</div>
            <div className="text-teal-400 font-semibold">{activeOrgan.telemetryReading}</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">TCM Physiological Role &amp; Clinical Context</div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">{activeOrgan.clinicalNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
