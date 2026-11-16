import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PresetPatient } from '../data/mockPatients';
import {
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Compass,
  Sliders,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AnatomyExplorer3DProps {
  patient: PresetPatient;
}

type OrganCategory = 'Zang (Yin)' | 'Fu (Yang)';
type OrganStatus = 'Balanced / Harmonious' | 'Hyperactive / Stagnant Heat' | 'Deficient / Depleted Qi';
type ViewLayerMode = 'composite' | 'heatmap' | 'meridian';
type ShellMode = 'translucent' | 'wireframe' | 'hidden';
type CameraPreset = 'anterior' | 'posterior' | 'lateral' | 'focus';

interface OrganSystemProfile {
  id: string;
  name: string;
  chineseName: string;
  category: OrganCategory;
  pairedOrgan: string;
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  position: [number, number, number];
  explodeOffset: [number, number, number];
  diagnosticIntensity: number; // 0 - 100 TCM diagnostic deviation/severity intensity
  elementScore: number; // 0 - 100 raw element balance score
  status: OrganStatus;
  hexColor: string;
  colorNum: number;
  tcmPattern: string;
  telemetryName: string;
  telemetryReading: string;
  clinicalNote: string;
  acupoints: string[];
}

// Reusable module-scoped math helpers (Zero GC inside animation loop)
const _targetCamPos = new THREE.Vector3();
const _targetControlsTarget = new THREE.Vector3();
const _tempVec = new THREE.Vector3();
const _tempColor = new THREE.Color();

const CAMERA_PRESETS: Record<Exclude<CameraPreset, 'focus'>, { pos: [number, number, number]; target: [number, number, number] }> = {
  anterior: { pos: [0, 0.35, 8.2], target: [0, 0.15, 0] },
  posterior: { pos: [0, 0.45, -8.2], target: [0, 0.15, 0] },
  lateral: { pos: [7.6, 0.4, 2.2], target: [0, 0.15, 0] },
};

function computeOrganProfiles(patient: PresetPatient): OrganSystemProfile[] {
  const eb = patient.elementBalance || { wood: 50, fire: 50, earth: 50, metal: 50, water: 50 };
  const hrvNum = parseFloat(patient.bioMarkers.hrv) || 30;
  const crpNum = parseFloat(patient.bioMarkers.crp) || 3.0;
  const sleepNum = parseFloat(patient.bioMarkers.sleep) || 65;
  const mitoNum = parseFloat(patient.bioMarkers.mitochondrial) || 70;

  const classify = (score: number, forceDeficient = false, forceExcess = false): { status: OrganStatus; intensity: number } => {
    if (forceExcess || score >= 70) {
      return {
        status: 'Hyperactive / Stagnant Heat',
        intensity: Math.min(98, Math.max(62, Math.round(score))),
      };
    }
    if (forceDeficient || score <= 38) {
      const deficitSeverity = Math.round(100 - score);
      return {
        status: 'Deficient / Depleted Qi',
        intensity: Math.min(96, Math.max(54, deficitSeverity)),
      };
    }
    return {
      status: 'Balanced / Harmonious',
      intensity: Math.min(44, Math.max(18, Math.round(Math.abs(score - 50) + 22))),
    };
  };

  const statusColors = (status: OrganStatus) => {
    if (status === 'Hyperactive / Stagnant Heat') return { hex: '#f43f5e', num: 0xf43f5e };
    if (status === 'Deficient / Depleted Qi') return { hex: '#38bdf8', num: 0x38bdf8 };
    return { hex: '#2dd4bf', num: 0x2dd4bf };
  };

  const liverEval = classify(eb.wood, false, eb.wood >= 70);
  const heartEval = classify(eb.fire, hrvNum < 32 && eb.fire < 60, eb.fire >= 75 || hrvNum < 22);
  const spleenEval = classify(eb.earth, eb.earth <= 38 || crpNum > 3.2, eb.earth >= 75);
  const stomachEval = classify(
    eb.earth >= 75 ? eb.earth : Math.max(30, 100 - sleepNum * 0.8),
    sleepNum < 60 && eb.earth < 45,
    crpNum > 3.8 || eb.earth >= 75
  );
  const lungEval = classify(eb.metal, eb.metal <= 40, eb.metal >= 70);
  const kidneyEval = classify(eb.water, eb.water <= 38 || mitoNum < 70, false);

  const liverCol = statusColors(liverEval.status);
  const heartCol = statusColors(heartEval.status);
  const spleenCol = statusColors(spleenEval.status);
  const stomachCol = statusColors(stomachEval.status);
  const lungCol = statusColors(lungEval.status);
  const kidneyCol = statusColors(kidneyEval.status);

  return [
    {
      id: 'heart',
      name: 'Heart (Xin)',
      chineseName: '心',
      category: 'Zang (Yin)',
      pairedOrgan: 'Small Intestine (Xiao Chang)',
      element: 'Fire',
      position: [0.22, 1.15, 0.35],
      explodeOffset: [0.35, 0.45, 1.1],
      diagnosticIntensity: heartEval.intensity,
      elementScore: eb.fire,
      status: heartEval.status,
      hexColor: heartCol.hex,
      colorNum: heartCol.num,
      tcmPattern:
        heartEval.status === 'Hyperactive / Stagnant Heat'
          ? 'Heart Fire Blazing / Shen Agitation'
          : heartEval.status === 'Deficient / Depleted Qi'
            ? 'Heart Blood & Qi Deficiency'
            : 'Harmonious Heart-Shen Rhythm',
      telemetryName: 'Vagal HRV & Autonomic Coherence',
      telemetryReading: patient.bioMarkers.hrv,
      clinicalNote: 'Governs Blood propulsion and houses Shen consciousness; directly coupled to RMSSD vagal oscillation.',
      acupoints: ['HT7 Shenmen', 'PC6 Neiguan', 'CV17 Shanzhong'],
    },
    {
      id: 'lungs',
      name: 'Lungs (Fei)',
      chineseName: '肺',
      category: 'Zang (Yin)',
      pairedOrgan: 'Large Intestine (Da Chang)',
      element: 'Metal',
      position: [0, 1.35, 0.02],
      explodeOffset: [0, 0.8, 0.2],
      diagnosticIntensity: lungEval.intensity,
      elementScore: eb.metal,
      status: lungEval.status,
      hexColor: lungCol.hex,
      colorNum: lungCol.num,
      tcmPattern:
        lungEval.status === 'Hyperactive / Stagnant Heat'
          ? 'Metal Qi Constriction / Upper Jiao Heat'
          : lungEval.status === 'Deficient / Depleted Qi'
            ? 'Lung Qi & Wei Qi Weakness'
            : 'Clear Respiratory Qi Dispersal',
      telemetryName: 'Alpha Wave Synchronization & Oxygenation',
      telemetryReading: patient.bioMarkers.alphaWave,
      clinicalNote: 'Master of Qi and Defensive Wei barrier; regulates rhythmic autonomic pacing and fluid descent.',
      acupoints: ['LU9 Taiyuan', 'LU7 Lieque', 'BL13 Feishu'],
    },
    {
      id: 'liver',
      name: 'Liver & Gallbladder (Gan / Dan)',
      chineseName: '肝胆',
      category: 'Zang (Yin)',
      pairedOrgan: 'Gallbladder (Dan)',
      element: 'Wood',
      position: [-0.62, 0.08, 0.28],
      explodeOffset: [-1.3, 0.05, 0.6],
      diagnosticIntensity: liverEval.intensity,
      elementScore: eb.wood,
      status: liverEval.status,
      hexColor: liverCol.hex,
      colorNum: liverCol.num,
      tcmPattern:
        liverEval.status === 'Hyperactive / Stagnant Heat'
          ? 'Gan Yu (Liver Qi Stagnation / Wood Overacting)'
          : liverEval.status === 'Deficient / Depleted Qi'
            ? 'Liver Blood Deficiency'
            : 'Smooth Hepatic Qi Flow',
      telemetryName: 'Diurnal Cortisol Slope & Organ Clock',
      telemetryReading: patient.bioMarkers.cortisol.split(',')[0],
      clinicalNote: 'Controls free-coursing Qi regulation, tendon elasticity, and 1–3 AM hepatic restoration window.',
      acupoints: ['LV3 Taichong', 'LV14 Qimen', 'GB34 Yanglingquan'],
    },
    {
      id: 'stomach',
      name: 'Stomach (Wei)',
      chineseName: '胃',
      category: 'Fu (Yang)',
      pairedOrgan: 'Spleen (Pi)',
      element: 'Earth',
      position: [0.35, -0.04, 0.36],
      explodeOffset: [0.7, -0.1, 1.0],
      diagnosticIntensity: stomachEval.intensity,
      elementScore: eb.earth,
      status: stomachEval.status,
      hexColor: stomachCol.hex,
      colorNum: stomachCol.num,
      tcmPattern:
        stomachEval.status === 'Hyperactive / Stagnant Heat'
          ? 'Stomach Damp-Heat / Rebellious Qi'
          : stomachEval.status === 'Deficient / Depleted Qi'
            ? 'Stomach Yin & Digestive Fire Weakness'
            : 'Harmonious Descending Stomach Qi',
      telemetryName: 'Sleep Architecture & Mucosal Recovery',
      telemetryReading: patient.bioMarkers.sleep.split('(')[0].trim(),
      clinicalNote: 'Sea of Water and Grain; transforms dietary nutrients while descending turbidity smoothly.',
      acupoints: ['ST36 Zusanli', 'CV12 Zhongwan', 'ST25 Tianshu'],
    },
    {
      id: 'spleen',
      name: 'Spleen (Pi)',
      chineseName: '脾',
      category: 'Zang (Yin)',
      pairedOrgan: 'Stomach (Wei)',
      element: 'Earth',
      position: [0.98, 0.08, -0.05],
      explodeOffset: [1.35, 0.1, 0.25],
      diagnosticIntensity: spleenEval.intensity,
      elementScore: eb.earth,
      status: spleenEval.status,
      hexColor: spleenCol.hex,
      colorNum: spleenCol.num,
      tcmPattern:
        spleenEval.status === 'Hyperactive / Stagnant Heat'
          ? 'Damp-Phlegm Earth Accumulation'
          : spleenEval.status === 'Deficient / Depleted Qi'
            ? 'Pi Xu (Spleen Qi Transformation Deficiency)'
            : 'Robust Earth Transformation & Spleen Qi',
      telemetryName: 'Systemic hs-CRP & Gut Microbiome Axis',
      telemetryReading: `hs-CRP ${patient.bioMarkers.crp}`,
      clinicalNote: 'Governs post-natal Qi extraction, mucosal immunity, and upward lifting of clear Yang.',
      acupoints: ['SP6 Sanyinjiao', 'SP3 Taibai', 'BL20 Pishu'],
    },
    {
      id: 'kidneys',
      name: 'Kidneys & Ming Men (Shen)',
      chineseName: '肾',
      category: 'Zang (Yin)',
      pairedOrgan: 'Urinary Bladder (Pang Guang)',
      element: 'Water',
      position: [0, -0.82, -0.38],
      explodeOffset: [0, -0.65, -0.9],
      diagnosticIntensity: kidneyEval.intensity,
      elementScore: eb.water,
      status: kidneyEval.status,
      hexColor: kidneyCol.hex,
      colorNum: kidneyCol.num,
      tcmPattern:
        kidneyEval.status === 'Hyperactive / Stagnant Heat'
          ? 'Water-Fire Disharmony'
          : kidneyEval.status === 'Deficient / Depleted Qi'
            ? 'Kidney Jing & Yin Depletion'
            : 'Anchored Kidney Essence & Ming Men Fire',
      telemetryName: 'Mitochondrial ATP Redox & BP Axis',
      telemetryReading: patient.bioMarkers.mitochondrial,
      clinicalNote: 'Root of pre-natal Jing essence, adrenal resilience, marrow generation, and deep restorative sleep.',
      acupoints: ['KI3 Taixi', 'KI1 Yongquan', 'GV4 Mingmen'],
    },
  ];
}

// Build composite anatomical 3D organ groups (3-8 sculpted sub-parts per organ)
function createCompositeOrganGroup(organ: OrganSystemProfile): {
  group: THREE.Group;
  primaryMaterials: THREE.MeshStandardMaterial[];
  haloRing: THREE.Mesh;
  hitProxy: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.position.set(...organ.position);
  group.userData = { organId: organ.id, basePos: new THREE.Vector3(...organ.position), explodeOffset: new THREE.Vector3(...organ.explodeOffset) };

  const intensityNorm = organ.diagnosticIntensity / 100;
  const baseEmissiveIntensity = 0.25 + intensityNorm * 0.65;

  const mainMat = new THREE.MeshStandardMaterial({
    color: organ.colorNum,
    emissive: organ.colorNum,
    emissiveIntensity: baseEmissiveIntensity,
    roughness: 0.34,
    metalness: 0.18,
    transparent: true,
    opacity: 0.9,
  });

  const vesselMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: organ.colorNum,
    emissiveIntensity: baseEmissiveIntensity * 0.45,
    roughness: 0.62,
    metalness: 0.08,
    transparent: true,
    opacity: 0.85,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: organ.colorNum,
    emissive: organ.colorNum,
    emissiveIntensity: baseEmissiveIntensity * 1.1,
    roughness: 0.18,
    metalness: 0.45,
  });

  const primaryMaterials: THREE.MeshStandardMaterial[] = [mainMat, vesselMat, accentMat];

  if (organ.id === 'heart') {
    // 1. Asymmetric myocardial chamber via LatheGeometry
    const pts = [
      new THREE.Vector2(0.01, -0.52),
      new THREE.Vector2(0.24, -0.35),
      new THREE.Vector2(0.38, -0.05),
      new THREE.Vector2(0.34, 0.24),
      new THREE.Vector2(0.18, 0.42),
      new THREE.Vector2(0.01, 0.46),
    ];
    const heartGeo = new THREE.LatheGeometry(pts, 24);
    const heartBody = new THREE.Mesh(heartGeo, mainMat);
    heartBody.rotation.z = 0.28;
    heartBody.castShadow = true;
    group.add(heartBody);

    // 2. Aortic Arch Tube
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.22, 0.02),
      new THREE.Vector3(-0.06, 0.62, 0.06),
      new THREE.Vector3(-0.22, 0.68, -0.08),
      new THREE.Vector3(-0.25, 0.18, -0.22),
    ]);
    const aortaMesh = new THREE.Mesh(new THREE.TubeGeometry(aortaCurve, 24, 0.085, 12, false), vesselMat);
    group.add(aortaMesh);

    // 3. Superior Vena Cava & Coronary Vessel Accent
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.26, 0.62, 0.05),
      new THREE.Vector3(-0.22, 0.24, 0.04),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 12, 0.06, 10, false), accentMat));

    const coroCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.25, 0.3),
      new THREE.Vector3(0.14, 0.02, 0.36),
      new THREE.Vector3(0.08, -0.28, 0.26),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(coroCurve, 16, 0.028, 8, false), accentMat));
  } else if (organ.id === 'lungs') {
    // Sculpted bilateral pulmonary lobes + trachea/bronchial tree
    const lobeProfile = [
      new THREE.Vector2(0.02, -0.82),
      new THREE.Vector2(0.56, -0.72),
      new THREE.Vector2(0.54, -0.2),
      new THREE.Vector2(0.45, 0.35),
      new THREE.Vector2(0.28, 0.72),
      new THREE.Vector2(0.01, 0.85),
    ];
    const lobeGeo = new THREE.LatheGeometry(lobeProfile, 22);

    const leftLung = new THREE.Mesh(lobeGeo, mainMat);
    leftLung.position.set(0.82, 0, 0);
    leftLung.scale.set(0.92, 1.0, 0.82);
    leftLung.rotation.z = -0.08;
    group.add(leftLung);

    const rightLung = new THREE.Mesh(lobeGeo, mainMat);
    rightLung.position.set(-0.82, 0.04, 0);
    rightLung.scale.set(1.0, 1.04, 0.84);
    rightLung.rotation.z = 0.08;
    group.add(rightLung);

    // Trachea & Bronchial bifurcation
    const trachea = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 1.05, 14),
      vesselMat
    );
    trachea.position.set(0, 0.72, -0.05);
    group.add(trachea);

    const bronchusL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.3, -0.05),
      new THREE.Vector3(0.42, 0.12, 0),
      new THREE.Vector3(0.76, -0.04, 0.02),
    ]);
    const bronchusR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.3, -0.05),
      new THREE.Vector3(-0.42, 0.14, 0),
      new THREE.Vector3(-0.76, -0.02, 0.02),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(bronchusL, 14, 0.05, 10, false), accentMat));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(bronchusR, 14, 0.05, 10, false), accentMat));
  } else if (organ.id === 'liver') {
    // 1. Primary Right Hepatic Lobe (sculpted wedge)
    const rightLobeShape = new THREE.Shape();
    rightLobeShape.moveTo(-0.55, -0.35);
    rightLobeShape.quadraticCurveTo(-0.68, 0.35, -0.1, 0.45);
    rightLobeShape.quadraticCurveTo(0.45, 0.35, 0.58, 0.12);
    rightLobeShape.quadraticCurveTo(0.25, -0.18, -0.55, -0.35);

    const liverGeo = new THREE.ExtrudeGeometry(rightLobeShape, {
      depth: 0.46,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.12,
      bevelSegments: 6,
    });
    liverGeo.center();
    const hepaticBody = new THREE.Mesh(liverGeo, mainMat);
    hepaticBody.rotation.y = 0.2;
    group.add(hepaticBody);

    // 2. Left Hepatic Lobe Extension
    const leftLobe = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 16), mainMat);
    leftLobe.position.set(0.55, 0.12, 0.08);
    leftLobe.scale.set(1.25, 0.65, 0.72);
    group.add(leftLobe);

    // 3. Gallbladder Sac (Dan) tucked beneath right hepatic margin
    const gbProfile = [
      new THREE.Vector2(0.01, -0.22),
      new THREE.Vector2(0.14, -0.14),
      new THREE.Vector2(0.11, 0.08),
      new THREE.Vector2(0.04, 0.22),
    ];
    const gallbladder = new THREE.Mesh(new THREE.LatheGeometry(gbProfile, 16), accentMat);
    gallbladder.position.set(-0.18, -0.32, 0.22);
    gallbladder.rotation.z = -0.65;
    group.add(gallbladder);

    // 4. Hepatic Portal Vein Branch
    const portalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.25, -0.45, -0.1),
      new THREE.Vector3(0.05, -0.08, -0.05),
      new THREE.Vector3(-0.25, 0.15, 0),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(portalCurve, 14, 0.045, 10, false), vesselMat));
  } else if (organ.id === 'stomach') {
    // Curved J-shaped Stomach (Esophagus -> Fundus -> Pylorus)
    const stomachCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 0.56, -0.08),
      new THREE.Vector3(0.12, 0.36, 0.04),
      new THREE.Vector3(0.34, 0.04, 0.14),
      new THREE.Vector3(0.18, -0.32, 0.12),
      new THREE.Vector3(-0.22, -0.36, 0.04),
    ]);
    const stomachTube = new THREE.Mesh(
      new THREE.TubeGeometry(stomachCurve, 28, 0.22, 14, false),
      mainMat
    );
    group.add(stomachTube);

    // Gastric Fundus Dome
    const fundus = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), mainMat);
    fundus.position.set(0.14, 0.34, 0.04);
    fundus.scale.set(1.15, 0.95, 0.9);
    group.add(fundus);

    // Pyloric Sphincter Ring
    const pylorus = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.045, 10, 20), accentMat);
    pylorus.position.set(-0.2, -0.36, 0.04);
    pylorus.rotation.y = Math.PI / 2;
    group.add(pylorus);
  } else if (organ.id === 'spleen') {
    // Bean-shaped Spleen Parenchyma + Splenic Hilum Artery
    const spleenProfile = [
      new THREE.Vector2(0.01, -0.38),
      new THREE.Vector2(0.26, -0.24),
      new THREE.Vector2(0.32, 0.02),
      new THREE.Vector2(0.24, 0.28),
      new THREE.Vector2(0.01, 0.38),
    ];
    const spleenBody = new THREE.Mesh(new THREE.LatheGeometry(spleenProfile, 20), mainMat);
    spleenBody.scale.set(0.85, 1.0, 0.65);
    spleenBody.rotation.z = 0.42;
    group.add(spleenBody);

    const hilumCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.42, -0.05, 0.05),
      new THREE.Vector3(-0.18, 0.02, 0.08),
      new THREE.Vector3(-0.04, 0.06, 0.04),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(hilumCurve, 12, 0.04, 8, false), vesselMat));

    const capsuleAccent = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 8, 22), accentMat);
    capsuleAccent.rotation.y = Math.PI / 3;
    group.add(capsuleAccent);
  } else if (organ.id === 'kidneys') {
    // Paired Bean-Shaped Kidneys + Suprarenal Adrenal Caps + Ureters
    [-1, 1].forEach((side) => {
      const kidneyCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.66, 0.32, 0),
        new THREE.Vector3(side * 0.82, 0.02, -0.04),
        new THREE.Vector3(side * 0.68, -0.3, 0),
      ]);
      const kidneyMesh = new THREE.Mesh(
        new THREE.TubeGeometry(kidneyCurve, 18, 0.22, 14, false),
        mainMat
      );
      group.add(kidneyMesh);

      // Adrenal Cap
      const adrenal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.16, 12), accentMat);
      adrenal.position.set(side * 0.68, 0.48, 0);
      group.add(adrenal);

      // Descending Ureter Conduit
      const ureterCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.56, -0.02, 0.06),
        new THREE.Vector3(side * 0.44, -0.45, 0.1),
        new THREE.Vector3(side * 0.3, -1.05, 0.18),
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(ureterCurve, 16, 0.032, 8, false), vesselMat));
    });
  }

  // Diagnostic Intensity Aura Ring beneath/around organ
  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(organ.id === 'lungs' ? 1.45 : organ.id === 'kidneys' ? 1.15 : 0.72, 0.022, 10, 40),
    new THREE.MeshBasicMaterial({
      color: organ.colorNum,
      transparent: true,
      opacity: 0.25 + intensityNorm * 0.45,
    })
  );
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.y = -0.45;
  group.add(haloRing);

  // Invisible simplified proxy box for crisp hover/click raycasting
  const hitSize = organ.id === 'lungs' ? [2.8, 1.8, 1.4] : organ.id === 'kidneys' ? [2.2, 1.3, 1.0] : [1.2, 1.2, 1.1];
  const hitProxy = new THREE.Mesh(
    new THREE.BoxGeometry(hitSize[0], hitSize[1], hitSize[2]),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitProxy.layers.set(1);
  hitProxy.userData = { organId: organ.id };
  group.add(hitProxy);

  return { group, primaryMaterials, haloRing, hitProxy };
}

export const AnatomyExplorer3D: React.FC<AnatomyExplorer3DProps> = ({ patient }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const organs = useMemo(() => computeOrganProfiles(patient), [patient]);
  const [selectedOrganId, setSelectedOrganId] = useState<string>('liver');
  const [viewMode, setViewMode] = useState<ViewLayerMode>('composite');
  const [shellMode, setShellMode] = useState<ShellMode>('translucent');
  const [explodeFactor, setExplodeFactor] = useState<number>(0); // 0 to 1
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('anterior');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [webglLost, setWebglLost] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [hoveredOrgan, setHoveredOrgan] = useState<{
    id: string;
    name: string;
    status: string;
    intensity: number;
    x: number;
    y: number;
  } | null>(null);

  // Refs synced to Three.js render loop without tearing down WebGL context
  const organsRef = useRef(organs);
  organsRef.current = organs;
  const selectedOrganIdRef = useRef(selectedOrganId);
  selectedOrganIdRef.current = selectedOrganId;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const shellModeRef = useRef(shellMode);
  shellModeRef.current = shellMode;
  const explodeTargetRef = useRef(explodeFactor);
  explodeTargetRef.current = explodeFactor;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;
  const activeTransitionRef = useRef<boolean>(false);

  const activeOrgan = organs.find((o) => o.id === selectedOrganId) || organs[0];

  // Overall TCM Pattern Severity Summary
  const avgIntensity = useMemo(
    () => Math.round(organs.reduce((acc, o) => acc + o.diagnosticIntensity, 0) / organs.length),
    [organs]
  );
  const avgIntensityRef = useRef<number>(avgIntensity);
  avgIntensityRef.current = avgIntensity;

  // Trigger camera preset transition smoothly
  const triggerCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (preset === 'focus') {
      const targetOrg = organs.find((o) => o.id === selectedOrganId) || organs[0];
      _targetControlsTarget.set(...targetOrg.position);
      _targetCamPos.set(
        targetOrg.position[0] * 1.4,
        targetOrg.position[1] + 0.4,
        targetOrg.position[2] + 3.8
      );
    } else {
      const cfg = CAMERA_PRESETS[preset];
      _targetCamPos.set(...cfg.pos);
      _targetControlsTarget.set(...cfg.target);
    }
    activeTransitionRef.current = true;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = 470;

    // Detect software WebGL (SwiftShader / llvmpipe / WARP)
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.032);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // WebGL Context Loss Safety
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const onContextRestored = () => {
      setWebglLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Three-point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.55);
    keyLight.position.set(4.5, 6.5, 6.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.25);
    rimLight.position.set(-5.0, 2.0, -5.5);
    scene.add(rimLight);

    // OrbitControls for full 360° clinician inspection
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.15, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.0;
    controls.maxDistance = 14.0;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    // Cancel scripted camera transition immediately when clinician takes manual control
    controls.addEventListener('start', () => {
      activeTransitionRef.current = false;
    });

    // Root Anatomy Assembly Group
    const anatomyGroup = new THREE.Group();
    scene.add(anatomyGroup);

    // Ground Contact Shadow Disc & Calibration Ring
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 12, 128, 128, 128);
      grad.addColorStop(0, 'rgba(45, 212, 191, 0.24)');
      grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.35)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.75 })
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -2.65;
    anatomyGroup.add(contactPlane);

    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.06, 64),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = -2.63;
    anatomyGroup.add(baseRing);

    // 1. Sculpted Anatomical Torso Shell (LatheGeometry silhouette)
    const torsoProfile = [
      new THREE.Vector2(0.05, -2.5),
      new THREE.Vector2(1.48, -2.35),
      new THREE.Vector2(1.62, -1.6),
      new THREE.Vector2(1.38, -0.65),
      new THREE.Vector2(1.75, 0.55),
      new THREE.Vector2(1.98, 1.55),
      new THREE.Vector2(1.88, 2.2),
      new THREE.Vector2(0.75, 2.52),
      new THREE.Vector2(0.56, 2.85),
    ];
    const torsoShellGeo = new THREE.LatheGeometry(torsoProfile, 36);
    torsoShellGeo.scale(1.12, 1.0, 0.68);

    const torsoTranslucentMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.05,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const torsoWireMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });
    const torsoShellMesh: THREE.Mesh<THREE.LatheGeometry, THREE.Material> = new THREE.Mesh(
      torsoShellGeo,
      torsoTranslucentMat
    );
    anatomyGroup.add(torsoShellMesh);

    // 2. Skeletal Frame (Spinal Column + Thoracic Ribcage + Clavicles)
    const skeletonGroup = new THREE.Group();
    anatomyGroup.add(skeletonGroup);

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.55,
      metalness: 0.15,
      transparent: true,
      opacity: 0.45,
    });

    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.75, -0.58),
      new THREE.Vector3(0, 1.35, -0.78),
      new THREE.Vector3(0, 0.1, -0.72),
      new THREE.Vector3(0, -1.2, -0.64),
      new THREE.Vector3(0, -2.25, -0.56),
    ]);
    skeletonGroup.add(new THREE.Mesh(new THREE.TubeGeometry(spineCurve, 32, 0.11, 10, false), boneMat));

    // Paired Ribs (6 pairs wrapping around thoracic organs)
    for (let r = 0; r < 6; r++) {
      const yBase = 1.95 - r * 0.32;
      const spreadX = 1.45 + Math.sin((r / 5) * Math.PI) * 0.32;
      const spreadZ = 0.85 + Math.sin((r / 5) * Math.PI) * 0.16;
      [-1, 1].forEach((side) => {
        const ribCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.1, yBase + 0.08, -0.74),
          new THREE.Vector3(side * spreadX, yBase - 0.04, 0.0),
          new THREE.Vector3(side * 0.35, yBase - 0.16, spreadZ),
        ]);
        skeletonGroup.add(new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 16, 0.035, 8, false), boneMat));
      });
    }

    // 3. Build Composite Organ Groups
    const organEntries: Record<
      string,
      ReturnType<typeof createCompositeOrganGroup>
    > = {};
    const clickableProxies: THREE.Mesh[] = [];

    organsRef.current.forEach((organ) => {
      const created = createCompositeOrganGroup(organ);
      anatomyGroup.add(created.group);
      organEntries[organ.id] = created;
      clickableProxies.push(created.hitProxy);
    });

    // 4. Five-Element Meridian Energy Conduits & Flowing Qi Spheres
    const meridianCurves: THREE.CatmullRomCurve3[] = [
      // Liver -> Heart (Wood feeds Fire)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.62, 0.08, 0.28),
        new THREE.Vector3(-0.22, 0.65, 0.42),
        new THREE.Vector3(0.22, 1.15, 0.35),
      ]),
      // Heart -> Spleen (Fire generates Earth)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.22, 1.15, 0.35),
        new THREE.Vector3(0.75, 0.58, 0.25),
        new THREE.Vector3(0.98, 0.08, -0.05),
      ]),
      // Spleen -> Lungs (Earth generates Metal)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.98, 0.08, -0.05),
        new THREE.Vector3(0.78, 0.78, 0.02),
        new THREE.Vector3(0.0, 1.35, 0.02),
      ]),
      // Lungs -> Kidneys (Metal descends to Water)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.35, 0.02),
        new THREE.Vector3(-0.15, 0.25, -0.42),
        new THREE.Vector3(0.0, -0.82, -0.38),
      ]),
      // Kidneys -> Liver (Water nourishes Wood)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, -0.82, -0.38),
        new THREE.Vector3(-0.55, -0.45, -0.1),
        new THREE.Vector3(-0.62, 0.08, 0.28),
      ]),
    ];

    const meridianMaterials: THREE.MeshBasicMaterial[] = [];
    const qiParticles: { mesh: THREE.Mesh; curveIdx: number; offset: number }[] = [];

    meridianCurves.forEach((curve, idx) => {
      const mMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.45,
      });
      meridianMaterials.push(mMat);
      anatomyGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.02, 8, false), mMat));

      for (let p = 0; p < 3; p++) {
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.048, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0x5eead4 })
        );
        anatomyGroup.add(pMesh);
        qiParticles.push({ mesh: pMesh, curveIdx: idx, offset: p / 3 });
      }
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting setup restricted to Layer 1 proxy meshes (throttled on pointermove)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let lastHoverCheck = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 45) return;
      lastHoverCheck = now;

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableProxies, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.organId as string;
        const orgData = organsRef.current.find((o) => o.id === hitId);
        if (orgData) {
          renderer.domElement.style.cursor = 'pointer';
          setHoveredOrgan({
            id: orgData.id,
            name: orgData.name,
            status: orgData.status,
            intensity: orgData.diagnosticIntensity,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          return;
        }
      }
      renderer.domElement.style.cursor = 'grab';
      setHoveredOrgan(null);
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableProxies, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.organId as string;
        setSelectedOrganId(hitId);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handlePointerClick);

    // Smoothly interpolated animation loop with Software-WebGL fence pacing
    let frameId = 0;
    let currentExplode = 0;
    const clock = new THREE.Clock();
    let fpsFrames = 0;
    let fpsLast = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      fpsFrames++;
      const now = performance.now();
      if (now - fpsLast >= 1000) {
        setFps(Math.round((fpsFrames * 1000) / (now - fpsLast)));
        fpsFrames = 0;
        fpsLast = now;
      }

      // Sync OrbitControls auto-rotate state
      controls.autoRotate = autoRotateRef.current && !isSoftwareGl;
      if (autoRotateRef.current && isSoftwareGl) {
        anatomyGroup.rotation.y += delta * 0.25;
      }

      // Smooth damped camera preset transitions
      if (activeTransitionRef.current) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetControlsTarget.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetControlsTarget.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetControlsTarget.z, 5.5, delta);

        if (camera.position.distanceTo(_targetCamPos) < 0.04) {
          activeTransitionRef.current = false;
        }
      }

      controls.update();

      // Update Shell visibility cleanly
      const sMode = shellModeRef.current;
      torsoShellMesh.visible = sMode !== 'hidden';
      torsoShellMesh.material = sMode === 'wireframe' ? torsoWireMat : torsoTranslucentMat;
      skeletonGroup.visible = viewModeRef.current !== 'meridian';

      // Smooth exploded anatomical view separation
      currentExplode = THREE.MathUtils.damp(currentExplode, explodeTargetRef.current, 6.0, delta);

      const activeId = selectedOrganIdRef.current;
      const mode = viewModeRef.current;

      // Update organ colors, intensities, breathing/cardiac rhythms & positions dynamically
      organsRef.current.forEach((organ) => {
        const entry = organEntries[organ.id];
        if (!entry) return;

        const basePos = entry.group.userData.basePos as THREE.Vector3;
        const offset = entry.group.userData.explodeOffset as THREE.Vector3;

        entry.group.position.set(
          basePos.x + offset.x * currentExplode,
          basePos.y + offset.y * currentExplode,
          basePos.z + offset.z * currentExplode
        );

        const isSel = organ.id === activeId;
        const intensityNorm = organ.diagnosticIntensity / 100;

        // Physiological animation rhythms
        let dynamicScale = 1.0;
        if (organ.id === 'heart') {
          dynamicScale = 1 + Math.sin(elapsed * (5.2 + intensityNorm * 2.5)) * 0.055;
        } else if (organ.id === 'lungs') {
          dynamicScale = 1 + Math.sin(elapsed * 1.9) * 0.04;
        } else if (isSel) {
          dynamicScale = 1.06 + Math.sin(elapsed * 3.0) * 0.025;
        }
        entry.group.scale.setScalar(dynamicScale);

        // Diagnostic heatmap vs composite color mapping
        if (mode === 'heatmap') {
          // Thermal spectrum: Teal (low intensity) -> Amber -> Crimson (high diagnostic severity)
          _tempColor.setHSL(THREE.MathUtils.lerp(0.46, 0.98, intensityNorm), 0.88, 0.54);
        } else {
          _tempColor.setHex(organ.colorNum);
        }

        const organOpacity = mode === 'meridian' ? 0.24 : isSel ? 0.96 : 0.78;
        const emissiveMult = mode === 'heatmap' ? 0.35 + intensityNorm * 1.15 : isSel ? 0.85 : 0.25 + intensityNorm * 0.5;

        entry.primaryMaterials.forEach((mat) => {
          mat.color.copy(_tempColor);
          mat.emissive.copy(_tempColor);
          mat.emissiveIntensity = emissiveMult;
          mat.opacity = organOpacity;
        });

        const ringMat = entry.haloRing.material as THREE.MeshBasicMaterial;
        ringMat.color.copy(_tempColor);
        ringMat.opacity = isSel ? 0.75 : 0.16 + intensityNorm * 0.35;
        entry.haloRing.rotation.z = elapsed * (isSel ? 0.9 : 0.3);
      });

      // Meridian conduits & Qi particle flow
      const meridianVisible = mode === 'meridian' || mode === 'composite';
      meridianMaterials.forEach((m) => {
        m.opacity = mode === 'meridian' ? 0.85 : 0.35;
      });
      qiParticles.forEach((p) => {
        p.mesh.visible = meridianVisible;
        if (meridianVisible) {
          const curve = meridianCurves[p.curveIdx];
          const t = (elapsed * (0.22 + (avgIntensityRef.current / 100) * 0.22) + p.offset) % 1;
          curve.getPointAt(t, _tempVec);
          p.mesh.position.copy(_tempVec);
        }
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => {
          frameId = requestAnimationFrame(tick);
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handlePointerClick);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      envTexture.dispose();
      shadowTex.dispose();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>3D Anatomy Explorer &amp; Zang-Fu Diagnostic Model</span>
              <span className="text-xs font-mono text-teal-400 tabular-nums">({fps} FPS)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 360° rotatable anatomical model mapping {patient.name}&rsquo;s Zang-Fu organ status and TCM diagnostic intensity
            </p>
          </div>
        </div>

        {/* Organ Quick Selector Strip */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {organs.map((org) => {
            const isSelected = selectedOrganId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedOrganId(org.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 border-teal-500/70 text-slate-100 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: org.hexColor }}
                />
                <span>{org.chineseName} {org.name.split(' ')[0]}</span>
                <span className="text-[11px] text-slate-400 tabular-nums">{org.diagnosticIntensity}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Unobstructed 3D Viewport with Collapsible Bottom Control Dock */}
      <div className="relative w-full h-[470px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        {/* Isolated WebGL Mount Container */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Graceful Fallback if WebGL context is lost */}
        {webglLost && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-2 z-30">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <div className="text-sm font-bold text-slate-100">3D WebGL Context Interrupted</div>
            <p className="text-xs text-slate-400 max-w-md">
              Hardware acceleration was suspended. Select an organ above to inspect diagnostic intensities and biomarker telemetry below.
            </p>
          </div>
        )}

        {/* Top-Left Minimal Spec Label (No heavy flank cards covering model) */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2.5">
          <span>{patient.name}</span>
          <span className="text-slate-600">·</span>
          <span className="text-teal-300 tabular-nums">Mean Intensity: {avgIntensity}%</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Drag to Rotate · Scroll to Zoom</span>
        </div>

        {/* Dynamic Raycast Hover Tooltip */}
        {hoveredOrgan && (
          <div
            className="pointer-events-none absolute z-20 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-0.5"
            style={{
              left: Math.min(480, Math.max(12, hoveredOrgan.x + 14)),
              top: Math.max(12, hoveredOrgan.y - 54),
            }}
          >
            <div className="font-bold text-slate-100">{hoveredOrgan.name}</div>
            <div className="text-[11px] font-mono text-teal-300 tabular-nums">
              {hoveredOrgan.status} · Intensity {hoveredOrgan.intensity}%
            </div>
          </div>
        )}

        {/* Unified Collapsible Bottom Control Dock (Zero Center Occlusion, No backdrop-filter) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[min(900px,95%)] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsDockCollapsed((c) => !c)}
            className="px-3 py-1 rounded-t-lg bg-slate-900 border border-b-0 border-slate-700 text-[11px] font-mono text-slate-300 hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'Show Explorer Controls' : 'Hide Controls'}</span>
          </button>

          {!isDockCollapsed && (
            <div className="w-full bg-slate-900/95 border border-slate-700/90 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-2xl">
              {/* Layer Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
                {(
                  [
                    { id: 'composite', label: 'Zang-Fu Status' },
                    { id: 'heatmap', label: 'TCM Intensity' },
                    { id: 'meridian', label: 'Meridian Qi' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setViewMode(m.id)}
                    className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                      viewMode === m.id ? 'bg-slate-800 text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Exploded Anatomical Separation Slider */}
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="text-slate-400 whitespace-nowrap">Explode:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explodeFactor * 100)}
                  onChange={(e) => setExplodeFactor(Number(e.target.value) / 100)}
                  aria-label="Anatomical exploded view separation"
                  className="w-20 accent-teal-400 cursor-pointer"
                />
                <span className="text-slate-200 tabular-nums w-8">{Math.round(explodeFactor * 100)}%</span>
              </div>

              {/* Shell Mode Switch */}
              <button
                type="button"
                onClick={() =>
                  setShellMode((prev) =>
                    prev === 'translucent' ? 'wireframe' : prev === 'wireframe' ? 'hidden' : 'translucent'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1 whitespace-nowrap"
              >
                <Eye className="w-3 h-3 text-teal-400" />
                <span>Shell: {shellMode}</span>
              </button>

              {/* Camera Presets */}
              <div className="flex items-center gap-1">
                {(['anterior', 'posterior', 'lateral', 'focus'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => triggerCameraPreset(preset)}
                    className={`px-2 py-1 rounded border transition-colors capitalize whitespace-nowrap ${
                      cameraPreset === preset
                        ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset === 'focus' ? 'Focus Organ' : preset}
                  </button>
                ))}
              </div>

              {/* Auto-Rotate Toggle */}
              <button
                type="button"
                onClick={() => setAutoRotate((r) => !r)}
                className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 whitespace-nowrap ${
                  autoRotate
                    ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{autoRotate ? 'Orbit On' : 'Orbit Off'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Organ Zang-Fu Status & TCM Diagnostic Intensity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Selected Organ Clinical Inspector */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-bold text-slate-100">{activeOrgan.name}</span>
              <span className="text-lg font-serif text-teal-400">{activeOrgan.chineseName}</span>
              <span className="text-xs font-mono text-slate-400">
                · {activeOrgan.category} · {activeOrgan.element} Element
              </span>
            </div>
            <div
              className="text-xs font-mono font-bold flex items-center gap-1.5"
              style={{ color: activeOrgan.hexColor }}
            >
              {activeOrgan.status === 'Balanced / Harmonious' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{activeOrgan.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono tabular-nums">
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Diagnostic Intensity</div>
              <div className="text-lg font-bold" style={{ color: activeOrgan.hexColor }}>
                {activeOrgan.diagnosticIntensity}%
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${activeOrgan.diagnosticIntensity}%`,
                    backgroundColor: activeOrgan.hexColor,
                  }}
                />
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Biomarker Coupling</div>
              <div className="text-slate-200 font-semibold font-sans text-xs">{activeOrgan.telemetryName}</div>
              <div className="text-teal-300 font-bold text-xs">{activeOrgan.telemetryReading}</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Paired Fu / Acupoints</div>
              <div className="text-slate-200 font-sans text-xs">{activeOrgan.pairedOrgan}</div>
              <div className="text-amber-300 text-[11px]">{activeOrgan.acupoints.join(' · ')}</div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-semibold text-teal-300 font-mono">{activeOrgan.tcmPattern}</div>
            <p className="text-slate-300 leading-relaxed">{activeOrgan.clinicalNote}</p>
          </div>
        </div>

        {/* All 6 Zang-Fu Systems Diagnostic Intensity Matrix */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Zang-Fu Intensity Matrix
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Click to Focus 3D</span>
          </div>

          <div className="space-y-2 text-xs">
            {organs.map((org) => {
              const isSelected = org.id === selectedOrganId;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedOrganId(org.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-colors space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500/60'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-slate-100">
                      {org.chineseName} {org.name}
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: org.hexColor }}>
                      {org.diagnosticIntensity}% · {org.status.split(' ')[0]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${org.diagnosticIntensity}%`,
                        backgroundColor: org.hexColor,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
