import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { PRESET_PATIENTS, PresetPatient } from '../data/mockPatients';
import {
  Activity,
  Heart,
  Moon,
  Smile,
  Brain,
  Layers,
  GitCommit,
  CheckCircle2,
  Camera,
  X,
  Trash2,
  StickyNote,
  RotateCcw,
  Upload,
  Check,
  Plus,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  TrendingUp,
  Lock,
  Unlock,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  Target,
  Download,
  Edit3,
  Radio,
  Zap,
  Play,
  Pause,
  Sliders,
} from 'lucide-react';
import {
  EncryptedEnvelope,
  encryptClinicalText,
  decryptClinicalText,
  isWebCryptoAvailable,
} from '../utils/clinicalCrypto';
import { MeridianEnergyHeatmap } from './MeridianEnergyHeatmap';
import { AnatomyExplorer3D } from './AnatomyExplorer3D';
import jsPDF from 'jspdf';

interface PatientOverviewDashboardProps {
  selectedPatient?: PresetPatient;
  onSelectPatient?: (patient: PresetPatient) => void;
}

// Sample Longitudinal Health Telemetry
const ELENA_TRENDS = [
  { date: 'Oct 01', hrv: 18, sleep: 45, deepSleep: 0.8, mood: 4.2, hsCRP: 5.6, cortisolSlope: 42 },
  { date: 'Oct 08', hrv: 20, sleep: 48, deepSleep: 1.0, mood: 4.8, hsCRP: 5.2, cortisolSlope: 49 },
  { date: 'Oct 15', hrv: 22, sleep: 52, deepSleep: 1.2, mood: 5.5, hsCRP: 4.8, cortisolSlope: 58 },
  { date: 'Oct 22', hrv: 25, sleep: 58, deepSleep: 1.5, mood: 6.4, hsCRP: 4.1, cortisolSlope: 68 },
  { date: 'Oct 29', hrv: 28, sleep: 62, deepSleep: 1.8, mood: 7.2, hsCRP: 3.4, cortisolSlope: 76 },
  { date: 'Nov 05', hrv: 31, sleep: 68, deepSleep: 2.1, mood: 8.0, hsCRP: 2.8, cortisolSlope: 85 },
];

const MARCUS_TRENDS = [
  { date: 'Oct 01', hrv: 15, sleep: 40, deepSleep: 0.5, mood: 3.5, hsCRP: 6.2, cortisolSlope: 35 },
  { date: 'Oct 08', hrv: 17, sleep: 44, deepSleep: 0.7, mood: 4.0, hsCRP: 5.8, cortisolSlope: 42 },
  { date: 'Oct 15', hrv: 19, sleep: 51, deepSleep: 1.0, mood: 4.8, hsCRP: 5.1, cortisolSlope: 50 },
  { date: 'Oct 22', hrv: 22, sleep: 55, deepSleep: 1.3, mood: 5.6, hsCRP: 4.5, cortisolSlope: 60 },
  { date: 'Oct 29', hrv: 24, sleep: 60, deepSleep: 1.6, mood: 6.3, hsCRP: 3.9, cortisolSlope: 68 },
  { date: 'Nov 05', hrv: 27, sleep: 65, deepSleep: 1.9, mood: 7.1, hsCRP: 3.2, cortisolSlope: 75 },
];

const SOPHIA_TRENDS = [
  { date: 'Oct 01', hrv: 32, sleep: 65, deepSleep: 1.4, mood: 6.0, hsCRP: 3.1, cortisolSlope: 62 },
  { date: 'Oct 08', hrv: 35, sleep: 70, deepSleep: 1.6, mood: 6.8, hsCRP: 2.7, cortisolSlope: 70 },
  { date: 'Oct 15', hrv: 38, sleep: 74, deepSleep: 1.8, mood: 7.4, hsCRP: 2.3, cortisolSlope: 78 },
  { date: 'Oct 22', hrv: 41, sleep: 78, deepSleep: 2.0, mood: 8.1, hsCRP: 2.0, cortisolSlope: 84 },
  { date: 'Oct 29', hrv: 44, sleep: 82, deepSleep: 2.2, mood: 8.6, hsCRP: 1.7, cortisolSlope: 89 },
  { date: 'Nov 05', hrv: 48, sleep: 86, deepSleep: 2.5, mood: 9.2, hsCRP: 1.4, cortisolSlope: 94 },
];

// Historical Five Elements Radar & Pattern Evolution Data
const FIVE_ELEMENT_EVOLUTION = [
  { element: 'Wood (Liver)', baseline: 85, month1: 65, current: 50 },
  { element: 'Fire (Heart)', baseline: 45, month1: 50, current: 52 },
  { element: 'Earth (Spleen)', baseline: 30, month1: 45, current: 65 },
  { element: 'Metal (Lungs)', baseline: 40, month1: 48, current: 58 },
  { element: 'Water (Kidneys)', baseline: 35, month1: 45, current: 55 },
];

const PATTERN_EVOLUTION_TIMELINE = [
  {
    date: 'Sep 01, 2026',
    stage: 'Baseline Intake',
    pattern: 'Severe Gan Yu with Stagnant Heat & Spleen Dampness',
    formula: 'Bao He Wan + Chai Hu Shu Gan San',
    score: 42,
    keyMetrics: 'HRV: 18ms | hs-CRP: 5.6mg/L | Sleep: 45%',
    clinicalShift: 'Severe biliary & hepatic Qi constriction with intercostal fullness and midnight awakening.',
    status: 'Baseline Established',
  },
  {
    date: 'Oct 12, 2026',
    stage: 'Intermediate Review',
    pattern: 'Gan Yu Pi Xu (Liver Qi Stagnation transitioning into Spleen Qi Weakness)',
    formula: 'Chai Hu Shu Gan San + Suan Zao Ren Tang',
    score: 68,
    keyMetrics: 'HRV: 22ms | hs-CRP: 4.8mg/L | Sleep: 52%',
    clinicalShift: 'Stagnant Heat clearing. Digestion improving; initial vagal tone recovery under 174Hz sound therapy.',
    status: 'Significant Progress',
  },
  {
    date: 'Nov 04, 2026',
    stage: 'Current Protocol',
    pattern: 'Harmonized Zang-Fu Flow with Mild Residual Qi Deficiency',
    formula: 'Xiao Yao San (Free & Easy Wanderer) + 174Hz Audio',
    score: 88,
    keyMetrics: 'HRV: 31ms | hs-CRP: 2.8mg/L | Sleep: 68%',
    clinicalShift: 'Liver Qi moving smoothly. Spleen transformation restored; midnight awakenings completely resolved.',
    status: 'Optimal Trajectory',
  },
];

interface QuickNoteEntry {
  id: string;
  text: string;
  timestamp: string;
}

interface ClinicalAlert {
  id: string;
  metric: 'HRV' | 'Sleep' | 'Inflammation';
  severity: 'Critical' | 'Warning';
  title: string;
  currentValue: string;
  threshold: string;
  detail: string;
  recommendedAction: string;
  isRealTimeStreamAlert?: boolean;
  deviationPercent?: number;
}

const getTrendsForPatient = (patient: PresetPatient) => {
  if (patient.name.includes('Marcus')) return MARCUS_TRENDS;
  if (patient.name.includes('Sophia')) return SOPHIA_TRENDS;
  return ELENA_TRENDS;
};

interface ThirtyDayCorrelationPoint {
  dayIndex: number;
  date: string;
  patternIntensity: number; // 0-100 TCM pattern severity index
  hrv: number; // ms RMSSD
  couplingScore: number; // 0-100 daily alignment index
}

const get30DayCorrelationData = (patient: PresetPatient): ThirtyDayCorrelationPoint[] => {
  const isMarcus = patient.name.includes('Marcus');
  const isSophia = patient.name.includes('Sophia');

  const startIntensity = isMarcus ? 86 : isSophia ? 54 : 76;
  const endIntensity = isMarcus ? 64 : isSophia ? 26 : 46;
  const startHrv = isMarcus ? 18 : isSophia ? 36 : 21;
  const endHrv = isMarcus ? 27 : isSophia ? 48 : 31;

  // Deterministic clinical micro-fluctuations across 30 days (Oct 14 - Nov 12)
  const intensityWave = [
    0, 2, -1, 3, 1, -2, 0, -1, 2, 1,
    -2, -1, 1, 2, -1, -2, 0, 1, -1, -2,
    1, -1, -2, 0, 1, -1, -2, 0, -1, 0,
  ];
  const hrvWave = [
    0, -1, 1, -2, 0, 1, 0, 1, -1, -1,
    2, 1, -1, -1, 1, 2, 0, -1, 1, 2,
    -1, 1, 2, 0, -1, 1, 2, 0, 1, 0,
  ];

  const baseDate = new Date(2026, 9, 14); // Oct 14, 2026 -> 30 days to Nov 12, 2026

  return Array.from({ length: 30 }, (_, idx) => {
    const progress = idx / 29;
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + idx);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const patternIntensity = Math.round(
      Math.max(12, Math.min(96, startIntensity + (endIntensity - startIntensity) * progress + intensityWave[idx]))
    );
    const hrv = Math.round(
      Math.max(12, Math.min(65, startHrv + (endHrv - startHrv) * progress + hrvWave[idx]))
    );

    // Inverse alignment score: lower intensity paired with higher HRV recovery yields stronger clinical synchronization
    const expectedHrvFromPattern = 58 - patternIntensity * 0.44;
    const residual = Math.abs(hrv - expectedHrvFromPattern);
    const couplingScore = Math.round(Math.max(60, Math.min(99, 98 - residual * 2.1)));

    return {
      dayIndex: idx + 1,
      date: dateLabel,
      patternIntensity,
      hrv,
      couplingScore,
    };
  });
};

const computeClinicalCorrelationMetrics = (data: ThirtyDayCorrelationPoint[]) => {
  const n = data.length;
  if (n < 2) {
    return { correlationScore: 0, pearsonR: 0, strengthLabel: 'Insufficient Data', patternDelta: 0, hrvDelta: 0 };
  }

  const meanX = data.reduce((sum, pt) => sum + pt.patternIntensity, 0) / n;
  const meanY = data.reduce((sum, pt) => sum + pt.hrv, 0) / n;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (const pt of data) {
    const dx = pt.patternIntensity - meanX;
    const dy = pt.hrv - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  const denom = Math.sqrt(sumSqX * sumSqY);
  const pearsonR = denom === 0 ? 0 : numerator / denom;
  const correlationScore = Math.round(Math.abs(pearsonR) * 100);

  const strengthLabel =
    correlationScore >= 85
      ? 'Strong Inverse Coupling'
      : correlationScore >= 65
        ? 'Moderate Inverse Coupling'
        : 'Mild Correlation';

  const patternDelta = data[n - 1].patternIntensity - data[0].patternIntensity;
  const hrvDelta = data[n - 1].hrv - data[0].hrv;

  return {
    correlationScore,
    pearsonR: Number(pearsonR.toFixed(2)),
    strengthLabel,
    patternDelta,
    hrvDelta,
  };
};

const evaluatePatientClinicalAlerts = (patient: PresetPatient): ClinicalAlert[] => {
  const trends = getTrendsForPatient(patient);
  const latest = trends[trends.length - 1];
  const prev = trends[trends.length - 2] || latest;
  const alerts: ClinicalAlert[] = [];

  // HRV Threshold Checks (Target >= 35 ms; < 28 ms Critical, < 35 ms Warning)
  if (latest.hrv < 28) {
    alerts.push({
      id: `${patient.id}-hrv-crit`,
      metric: 'HRV',
      severity: 'Critical',
      title: 'Critically Suppressed Vagal Tone (HRV)',
      currentValue: `${latest.hrv} ms RMSSD`,
      threshold: 'Target ≥ 35 ms (Critical < 28 ms)',
      detail: `Autonomic HRV remains severely suppressed at ${latest.hrv} ms, indicating ongoing sympathetic dominance and Heart-Kidney disharmony.`,
      recommendedAction: 'Prioritize PC6 + HT7 auricular vagal protocol & evening 174Hz/6Hz Theta entrainment.',
    });
  } else if (latest.hrv < 35) {
    alerts.push({
      id: `${patient.id}-hrv-warn`,
      metric: 'HRV',
      severity: 'Warning',
      title: 'Sub-Target Vagal Recovery (HRV)',
      currentValue: `${latest.hrv} ms RMSSD`,
      threshold: 'Target ≥ 35 ms',
      detail: `HRV improved from ${prev.hrv} ms to ${latest.hrv} ms (+${latest.hrv - prev.hrv} ms), but remains below the 35 ms autonomic stability threshold.`,
      recommendedAction: 'Maintain LV3 + ST36 acupoint schedule and monitor morning HRV trend over 7 days.',
    });
  }

  // Sleep Efficiency Threshold Checks (Target >= 75%; < 66% Critical, < 75% Warning)
  if (latest.sleep < 66) {
    alerts.push({
      id: `${patient.id}-sleep-crit`,
      metric: 'Sleep',
      severity: 'Critical',
      title: 'Severe Sleep Architecture Fragmentation',
      currentValue: `${latest.sleep}% (${latest.deepSleep}h deep)`,
      threshold: 'Target ≥ 75% (Critical < 66%)',
      detail: `Sleep efficiency at ${latest.sleep}% with only ${latest.deepSleep}h restorative deep sleep signals active nocturnal Shen disturbance.`,
      recommendedAction: 'Schedule immediate sleep review; add Suan Zao Ren Tang & blue-light blockade at 8:00 PM.',
    });
  } else if (latest.sleep < 75) {
    alerts.push({
      id: `${patient.id}-sleep-warn`,
      metric: 'Sleep',
      severity: 'Warning',
      title: 'Below-Target Sleep Efficiency',
      currentValue: `${latest.sleep}% (${latest.deepSleep}h deep)`,
      threshold: 'Target ≥ 75%',
      detail: `Sleep efficiency of ${latest.sleep}% falls short of the 75% clinical recovery threshold with residual nocturnal awakenings.`,
      recommendedAction: 'Align circadian wind-down with 1-3 AM Liver Organ Clock calming breathwork.',
    });
  }

  return alerts;
};

interface LiveTelemetryEvaluationParams {
  liveHrv: number;
  liveSleep: number;
  hrvBaseline: number;
  sleepBaseline: number;
  hrvDeviationPercent: number;
  sleepDeviationPercent: number;
  packetCount: number;
}

const evaluateLiveStreamAlerts = (
  patient: PresetPatient,
  params: LiveTelemetryEvaluationParams
): ClinicalAlert[] => {
  const alerts: ClinicalAlert[] = [];
  const {
    liveHrv,
    liveSleep,
    hrvBaseline,
    sleepBaseline,
    hrvDeviationPercent,
    sleepDeviationPercent,
    packetCount,
  } = params;

  // Real-Time HRV Alert Evaluation:
  // Baseline thresholds: Critical if live HRV < 28 ms OR deviation <= -20% below baseline.
  // Warning if live HRV < 35 ms OR deviation <= -15% below baseline.
  if (liveHrv < 28 || hrvDeviationPercent <= -20) {
    alerts.push({
      id: `${patient.id}-stream-hrv-crit`,
      metric: 'HRV',
      severity: 'Critical',
      title: 'Critically Suppressed Vagal Tone (Live Stream)',
      currentValue: `${liveHrv.toFixed(1)} ms RMSSD (${hrvDeviationPercent > 0 ? '+' : ''}${hrvDeviationPercent}% vs baseline)`,
      threshold: `Baseline: ${hrvBaseline} ms | Critical < 28 ms | Target ≥ 35 ms`,
      detail: `Real-time sensor telemetry packet #${packetCount} records acute vagal suppression to ${liveHrv.toFixed(1)} ms (${hrvDeviationPercent}% drop vs baseline). Autonomic tone destabilization and sympathetic dominance detected.`,
      recommendedAction: 'Immediate vagal rescue: PC6 + HT7 acupressure, 174 Hz sound therapy, and parasympathetic paced breathing.',
      isRealTimeStreamAlert: true,
      deviationPercent: hrvDeviationPercent,
    });
  } else if (liveHrv < 35 || hrvDeviationPercent <= -15) {
    alerts.push({
      id: `${patient.id}-stream-hrv-warn`,
      metric: 'HRV',
      severity: 'Warning',
      title: 'Sub-Target Vagal Deviation (Live Stream)',
      currentValue: `${liveHrv.toFixed(1)} ms RMSSD (${hrvDeviationPercent > 0 ? '+' : ''}${hrvDeviationPercent}% vs baseline)`,
      threshold: `Baseline: ${hrvBaseline} ms | Target ≥ 35 ms`,
      detail: `Real-time telemetry records HRV at ${liveHrv.toFixed(1)} ms (${hrvDeviationPercent > 0 ? '+' : ''}${hrvDeviationPercent}% vs baseline ${hrvBaseline} ms). Autonomic reserve remains below the 35 ms clinical stability threshold.`,
      recommendedAction: 'Adjust bio-agent frequency protocol and initiate 5-minute heart-rate coherence cycle.',
      isRealTimeStreamAlert: true,
      deviationPercent: hrvDeviationPercent,
    });
  }

  // Real-Time Sleep Efficiency Alert Evaluation:
  // Baseline thresholds: Critical if live Sleep < 66% OR deviation <= -20% below baseline.
  // Warning if live Sleep < 75% OR deviation <= -15% below baseline.
  if (liveSleep < 66 || sleepDeviationPercent <= -20) {
    alerts.push({
      id: `${patient.id}-stream-sleep-crit`,
      metric: 'Sleep',
      severity: 'Critical',
      title: 'Severe Sleep Efficiency Drop (Live Stream)',
      currentValue: `${liveSleep.toFixed(1)}% (${sleepDeviationPercent > 0 ? '+' : ''}${sleepDeviationPercent}% vs baseline)`,
      threshold: `Baseline: ${sleepBaseline}% | Critical < 66% | Target ≥ 75%`,
      detail: `Real-time sleep telemetry packet #${packetCount} signals acute sleep efficiency drop to ${liveSleep.toFixed(1)}% (${sleepDeviationPercent}% drop vs baseline). Substantial nocturnal restlessness and Shen disruption detected.`,
      recommendedAction: 'Schedule immediate sleep review; initiate Suan Zao Ren Tang + 528 Hz pineal harmonic frequency.',
      isRealTimeStreamAlert: true,
      deviationPercent: sleepDeviationPercent,
    });
  } else if (liveSleep < 75 || sleepDeviationPercent <= -15) {
    alerts.push({
      id: `${patient.id}-stream-sleep-warn`,
      metric: 'Sleep',
      severity: 'Warning',
      title: 'Below-Target Sleep Efficiency (Live Stream)',
      currentValue: `${liveSleep.toFixed(1)}% (${sleepDeviationPercent > 0 ? '+' : ''}${sleepDeviationPercent}% vs baseline)`,
      threshold: `Baseline: ${sleepBaseline}% | Target ≥ 75%`,
      detail: `Real-time telemetry reflects sleep efficiency at ${liveSleep.toFixed(1)}% (${sleepDeviationPercent > 0 ? '+' : ''}${sleepDeviationPercent}% vs baseline ${sleepBaseline}%), falling short of the 75% restorative recovery threshold.`,
      recommendedAction: 'Align circadian wind-down with 1-3 AM Liver Organ Clock calming breathwork.',
      isRealTimeStreamAlert: true,
      deviationPercent: sleepDeviationPercent,
    });
  }

  return alerts;
};

const PHOTOS_STORAGE_KEY = 'maxwell_patient_photos_v1';
const PROFILE_OVERRIDES_KEY = 'maxwell_patient_profile_overrides_v1';
const QUICK_NOTES_DRAFT_KEY = 'maxwell_patient_quick_notes_draft_v1';
const QUICK_NOTES_LOG_KEY = 'maxwell_patient_quick_notes_log_v1';
const PROGRESS_NOTES_STORAGE_KEY = 'maxwell_clinician_progress_notes_v1';
const PATIENT_GOALS_STORAGE_KEY = 'maxwell_patient_goals_v1';

interface PatientProfileOverride {
  name?: string;
  age?: number;
  gender?: PresetPatient['gender'];
  sex?: PresetPatient['sex'];
  occupation?: string;
}

type EncounterType =
  | 'Initial Consultation'
  | 'Follow-Up Visit'
  | 'Acupuncture & Frequency Session'
  | 'Telehealth Check-In';

interface EncryptedProgressNoteRecord {
  id: string;
  patientId: string;
  sessionDate: string;
  encounterType: EncounterType;
  clinicianName: string;
  createdAt: string;
  encrypted: EncryptedEnvelope;
}

type GoalCategory =
  | 'Sleep'
  | 'Autonomic / HRV'
  | 'Pain & Mobility'
  | 'Digestion & Qi'
  | 'Emotional Shen';

interface PatientWellnessGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetDescription: string;
  targetDate: string;
  progress: number;
  updatedAt: string;
}

const getDefaultGoalsForPatient = (patient: PresetPatient): PatientWellnessGoal[] => {
  if (patient.name.includes('Marcus')) {
    return [
      {
        id: `${patient.id}-goal-1`,
        title: 'Lower back pain reduction & mobility',
        category: 'Pain & Mobility',
        targetDescription: 'Pain score < 3/10 during 8-hour workday',
        targetDate: '2026-12-10',
        progress: 45,
        updatedAt: 'Nov 12',
      },
      {
        id: `${patient.id}-goal-2`,
        title: 'Improved sleep quality & nocturnal recovery',
        category: 'Sleep',
        targetDescription: 'Reach 75%+ sleep efficiency & 2.4h deep sleep',
        targetDate: '2026-12-15',
        progress: 40,
        updatedAt: 'Nov 11',
      },
    ];
  }

  if (patient.name.includes('Sophia')) {
    return [
      {
        id: `${patient.id}-goal-1`,
        title: 'Sustain autonomic resilience on call shifts',
        category: 'Autonomic / HRV',
        targetDescription: 'Maintain HRV >= 45 ms & sleep efficiency >= 85%',
        targetDate: '2026-12-05',
        progress: 88,
        updatedAt: 'Nov 12',
      },
      {
        id: `${patient.id}-goal-2`,
        title: 'Evening Shen decompression routine',
        category: 'Emotional Shen',
        targetDescription: '15 min 528Hz harmonic audio + 4-7-8 breathwork 5x/wk',
        targetDate: '2026-11-30',
        progress: 80,
        updatedAt: 'Nov 10',
      },
    ];
  }

  return [
    {
      id: `${patient.id}-goal-1`,
      title: 'Improved sleep quality',
      category: 'Sleep',
      targetDescription: '75%+ sleep efficiency & zero 1–3 AM awakenings',
      targetDate: '2026-12-01',
      progress: 68,
      updatedAt: 'Nov 12',
    },
    {
      id: `${patient.id}-goal-2`,
      title: 'Restore vagal tone (HRV ≥ 35 ms)',
      category: 'Autonomic / HRV',
      targetDescription: 'Reach 35 ms RMSSD via breathwork & PC6 acupressure',
      targetDate: '2026-12-12',
      progress: 74,
      updatedAt: 'Nov 11',
    },
    {
      id: `${patient.id}-goal-3`,
      title: 'Ease post-meal bloating & Spleen Qi fatigue',
      category: 'Digestion & Qi',
      targetDescription: 'Warm cooked meals + Xiao Yao San adherence 6 days/wk',
      targetDate: '2026-12-08',
      progress: 60,
      updatedAt: 'Nov 09',
    },
  ];
};

export const PatientOverviewDashboard: React.FC<PatientOverviewDashboardProps> = ({
  selectedPatient = PRESET_PATIENTS[0],
  onSelectPatient,
}) => {
  const [profileOverrides, setProfileOverrides] = useState<
    Record<string, PatientProfileOverride>
  >(() => {
    try {
      const saved = localStorage.getItem(PROFILE_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const applyProfileOverride = (pt: PresetPatient, overridesMap = profileOverrides): PresetPatient => {
    const ov = overridesMap[pt.id];
    if (!ov) return pt;
    return {
      ...pt,
      name: ov.name || pt.name,
      age: typeof ov.age === 'number' && ov.age > 0 ? ov.age : pt.age,
      gender: ov.gender || pt.gender,
      sex: ov.sex || pt.sex,
      occupation: ov.occupation || pt.occupation,
    };
  };

  const [activePatient, setActivePatient] = useState<PresetPatient>(() =>
    applyProfileOverride(selectedPatient)
  );
  const [timeframe, setTimeframe] = useState<'6W' | '12W' | '24W'>('6W');
  const [correlationChartView, setCorrelationChartView] = useState<'trajectory' | 'scatter'>('trajectory');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});
  const [profileSavedAt, setProfileSavedAt] = useState<string | null>(null);

  // Edit Profile modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(activePatient.name);
  const [editAge, setEditAge] = useState<number>(activePatient.age);
  const [editGender, setEditGender] = useState<string>(activePatient.gender || activePatient.sex);
  const [editOccupation, setEditOccupation] = useState<string>(activePatient.occupation);

  useEffect(() => {
    setEditName(activePatient.name);
    setEditAge(activePatient.age);
    setEditGender(activePatient.gender || activePatient.sex);
    setEditOccupation(activePatient.occupation);
  }, [activePatient]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(profileOverrides));
    } catch {
      // Ignore storage quota errors
    }
  }, [profileOverrides]);

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAge = Math.max(1, Math.min(120, Number(editAge) || activePatient.age));
    const chosenGender = (editGender as PresetPatient['gender']) || activePatient.gender;
    const chosenSex: PresetPatient['sex'] =
      chosenGender === 'Male' || chosenGender === 'Female' || chosenGender === 'Non-binary'
        ? chosenGender
        : activePatient.sex;

    const updated: PresetPatient = {
      ...activePatient,
      name: editName.trim() || activePatient.name,
      age: parsedAge,
      gender: chosenGender,
      sex: chosenSex,
      occupation: editOccupation.trim() || activePatient.occupation,
    };

    setProfileOverrides((prev) => ({
      ...prev,
      [activePatient.id]: {
        name: updated.name,
        age: updated.age,
        gender: updated.gender,
        sex: updated.sex,
        occupation: updated.occupation,
      },
    }));
    setActivePatient(updated);
    if (onSelectPatient) {
      onSelectPatient(updated);
    }
    setProfileSavedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setIsEditProfileOpen(false);
  };

  useEffect(() => {
    setActivePatient(applyProfileOverride(selectedPatient));
  }, [selectedPatient]);

  // Patient profile photos persisted locally per patient ID
  const [patientPhotos, setPatientPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(PHOTOS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick Notes unstructured scratchpad & observation log persisted locally per patient ID
  const [quickNoteDrafts, setQuickNoteDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(QUICK_NOTES_DRAFT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [quickNoteLogs, setQuickNoteLogs] = useState<Record<string, QuickNoteEntry[]>>(() => {
    try {
      const saved = localStorage.getItem(QUICK_NOTES_LOG_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [lastNoteSavedAt, setLastNoteSavedAt] = useState<string | null>(null);

  // Persist photos
  useEffect(() => {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(patientPhotos));
    } catch {
      // Ignore storage quota errors
    }
  }, [patientPhotos]);

  // Persist drafts
  useEffect(() => {
    try {
      localStorage.setItem(QUICK_NOTES_DRAFT_KEY, JSON.stringify(quickNoteDrafts));
    } catch {
      // Ignore storage errors
    }
  }, [quickNoteDrafts]);

  // Persist pinned quick note logs
  useEffect(() => {
    try {
      localStorage.setItem(QUICK_NOTES_LOG_KEY, JSON.stringify(quickNoteLogs));
    } catch {
      // Ignore storage errors
    }
  }, [quickNoteLogs]);

  // Stop active webcam tracks cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  // Start camera stream when modal opens
  const startCamera = async () => {
    setCameraError(null);
    setCapturedPreview(null);
    setIsCameraReady(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser context. You can upload an image file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please grant camera access in your browser or upload a photo.'
          : err?.name === 'NotFoundError'
            ? 'No camera device detected on this system. You can upload a photo file below.'
            : 'Unable to access camera stream. Try uploading a photo file instead.';
      setCameraError(msg);
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isCameraOpen]);

  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;

    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPreview(dataUrl);
      stopCameraStream();
    }
  };

  const handleConfirmPhoto = () => {
    if (!capturedPreview) return;
    setPatientPhotos((prev) => ({
      ...prev,
      [activePatient.id]: capturedPreview,
    }));
    setIsCameraOpen(false);
    setCapturedPreview(null);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCameraStream();
        setCapturedPreview(reader.result);
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPatientPhotos((prev) => {
      const next = { ...prev };
      delete next[activePatient.id];
      return next;
    });
  };

  const handleDraftChange = (value: string) => {
    setQuickNoteDrafts((prev) => ({
      ...prev,
      [activePatient.id]: value,
    }));
    setLastNoteSavedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  const handleAddQuickObservation = () => {
    const draft = (quickNoteDrafts[activePatient.id] || '').trim();
    if (!draft) return;

    const entry: QuickNoteEntry = {
      id: `note-${Date.now()}`,
      text: draft,
      timestamp: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setQuickNoteLogs((prev) => ({
      ...prev,
      [activePatient.id]: [entry, ...(prev[activePatient.id] || [])],
    }));

    setQuickNoteDrafts((prev) => ({
      ...prev,
      [activePatient.id]: '',
    }));

    setLastNoteSavedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  const handleDeleteObservation = (noteId: string) => {
    setQuickNoteLogs((prev) => ({
      ...prev,
      [activePatient.id]: (prev[activePatient.id] || []).filter((item) => item.id !== noteId),
    }));
  };

  const trendData = getTrendsForPatient(activePatient);
  const latestData = trendData[trendData.length - 1];
  const baselineData = trendData[0];

  const correlationSeries30d = get30DayCorrelationData(activePatient);
  const correlationStats = computeClinicalCorrelationMetrics(correlationSeries30d);
  const first30d = correlationSeries30d[0];
  const latest30d = correlationSeries30d[correlationSeries30d.length - 1];

  // Real-time Biometric Stream Telemetry State
  const patientStreamBaseline = (() => {
    const parsedHrv = parseFloat(activePatient.bioMarkers.hrv);
    const parsedSleep = parseFloat(activePatient.bioMarkers.sleep);
    return {
      hrv: Number.isFinite(parsedHrv) ? parsedHrv : latestData.hrv,
      sleep: Number.isFinite(parsedSleep) ? parsedSleep : latestData.sleep,
    };
  })();

  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [streamPacketCount, setStreamPacketCount] = useState<number>(1);
  const [lastPacketTime, setLastPacketTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [simulatedScenario, setSimulatedScenario] = useState<
    'nominal' | 'hrv_drop' | 'sleep_drop' | 'recovery'
  >('nominal');
  const [liveHrv, setLiveHrv] = useState<number>(patientStreamBaseline.hrv);
  const [liveSleep, setLiveSleep] = useState<number>(patientStreamBaseline.sleep);

  // Sync stream starting point when patient changes
  useEffect(() => {
    const parsedHrv = parseFloat(activePatient.bioMarkers.hrv);
    const parsedSleep = parseFloat(activePatient.bioMarkers.sleep);
    const baseHrv = Number.isFinite(parsedHrv) ? parsedHrv : latestData.hrv;
    const baseSleep = Number.isFinite(parsedSleep) ? parsedSleep : latestData.sleep;
    setSimulatedScenario('nominal');
    setLiveHrv(baseHrv);
    setLiveSleep(baseSleep);
    setStreamPacketCount(1);
    setLastPacketTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  }, [activePatient.id]);

  // Real-time 2.8s biometric stream packet emitter
  useEffect(() => {
    if (!isLiveStreaming) return;

    const timer = window.setInterval(() => {
      const jitterHrv = (Math.random() - 0.5) * 1.4;
      const jitterSleep = (Math.random() - 0.5) * 1.8;

      setLiveHrv((prev) => {
        let target = patientStreamBaseline.hrv;
        if (simulatedScenario === 'hrv_drop') {
          target = Math.max(12, Math.round(patientStreamBaseline.hrv * 0.72 * 10) / 10);
        } else if (simulatedScenario === 'recovery') {
          target = Math.max(39, Math.round(patientStreamBaseline.hrv * 1.18 * 10) / 10);
        }
        const nextVal = prev + (target - prev) * 0.55 + jitterHrv;
        return Math.max(10, Math.min(75, Math.round(nextVal * 10) / 10));
      });

      setLiveSleep((prev) => {
        let target = patientStreamBaseline.sleep;
        if (simulatedScenario === 'sleep_drop') {
          target = Math.max(38, Math.round(patientStreamBaseline.sleep * 0.74 * 10) / 10);
        } else if (simulatedScenario === 'recovery') {
          target = Math.max(82, Math.round(patientStreamBaseline.sleep * 1.12 * 10) / 10);
        }
        const nextVal = prev + (target - prev) * 0.55 + jitterSleep;
        return Math.max(30, Math.min(98, Math.round(nextVal * 10) / 10));
      });

      setStreamPacketCount((c) => c + 1);
      setLastPacketTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 2800);

    return () => window.clearInterval(timer);
  }, [isLiveStreaming, simulatedScenario, patientStreamBaseline.hrv, patientStreamBaseline.sleep]);

  const handleTriggerStreamScenario = (scenario: 'hrv_drop' | 'sleep_drop' | 'recovery') => {
    setSimulatedScenario(scenario);
    setStreamPacketCount((c) => c + 1);
    setLastPacketTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    if (scenario === 'hrv_drop') {
      setLiveHrv(Math.max(13, Math.round(patientStreamBaseline.hrv * 0.72 * 10) / 10));
      setLiveSleep(patientStreamBaseline.sleep);
    } else if (scenario === 'sleep_drop') {
      setLiveSleep(Math.max(40, Math.round(patientStreamBaseline.sleep * 0.74 * 10) / 10));
      setLiveHrv(patientStreamBaseline.hrv);
    } else {
      setLiveHrv(Math.max(40, Math.round(patientStreamBaseline.hrv * 1.18 * 10) / 10));
      setLiveSleep(Math.max(83, Math.round(patientStreamBaseline.sleep * 1.12 * 10) / 10));
    }
  };

  const hrvDeviationPercent =
    patientStreamBaseline.hrv > 0
      ? Math.round(((liveHrv - patientStreamBaseline.hrv) / patientStreamBaseline.hrv) * 100)
      : 0;
  const sleepDeviationPercent =
    patientStreamBaseline.sleep > 0
      ? Math.round(((liveSleep - patientStreamBaseline.sleep) / patientStreamBaseline.sleep) * 100)
      : 0;

  const liveStreamAlerts = evaluateLiveStreamAlerts(activePatient, {
    liveHrv,
    liveSleep,
    hrvBaseline: patientStreamBaseline.hrv,
    sleepBaseline: patientStreamBaseline.sleep,
    hrvDeviationPercent,
    sleepDeviationPercent,
    packetCount: streamPacketCount,
  });

  const staticAlerts = evaluatePatientClinicalAlerts(activePatient);
  // Prefer real-time stream alert for HRV / Sleep when triggered; fall back to static baseline alerts otherwise
  const mergedAlertsMap = new Map<string, ClinicalAlert>();
  for (const sa of staticAlerts) {
    mergedAlertsMap.set(sa.metric, sa);
  }
  for (const la of liveStreamAlerts) {
    mergedAlertsMap.set(la.metric, la);
  }
  // If recovery scenario brings values into nominal target zone, clear threshold alerts
  if (liveHrv >= 35 && hrvDeviationPercent > -15) {
    mergedAlertsMap.delete('HRV');
  }
  if (liveSleep >= 75 && sleepDeviationPercent > -15) {
    mergedAlertsMap.delete('Sleep');
  }
  const activeAlerts = Array.from(mergedAlertsMap.values());

  const hrvAlert = activeAlerts.find((a) => a.metric === 'HRV');
  const sleepAlert = activeAlerts.find((a) => a.metric === 'Sleep');
  const unacknowledgedCount = activeAlerts.filter((a) => !acknowledgedAlerts[a.id]).length;
  const hasRealTimeDeviationWarning =
    hrvDeviationPercent <= -15 || sleepDeviationPercent <= -15 || liveStreamAlerts.length > 0;

  const toggleAcknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlerts((prev) => ({ ...prev, [alertId]: !prev[alertId] }));
  };

  const handlePatientChange = (patient: PresetPatient) => {
    const hydrated = applyProfileOverride(patient);
    setActivePatient(hydrated);
    setProfileSavedAt(null);
    if (onSelectPatient) {
      onSelectPatient(hydrated);
    }
  };

  const activePhotoUrl = patientPhotos[activePatient.id];
  const activeDraft = quickNoteDrafts[activePatient.id] || '';
  const activeLogs = quickNoteLogs[activePatient.id] || [];

  // Encrypted Clinician Progress Notes state
  const [progressNotesByPatient, setProgressNotesByPatient] = useState<
    Record<string, EncryptedProgressNoteRecord[]>
  >(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_NOTES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [vaultPassphrase, setVaultPassphrase] = useState<string>('');
  const [passphraseInput, setPassphraseInput] = useState<string>('');
  const [showPassphrase, setShowPassphrase] = useState<boolean>(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [decryptedProgressNotes, setDecryptedProgressNotes] = useState<Record<string, string>>({});
  const [decryptionMismatches, setDecryptionMismatches] = useState<Record<string, boolean>>({});
  const [vaultNotice, setVaultNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [encounterDate, setEncounterDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [encounterType, setEncounterType] = useState<EncounterType>('Follow-Up Visit');
  const [clinicianName, setClinicianName] = useState<string>('Dr. Maxwell, MD / LAc');
  const [encounterNarrative, setEncounterNarrative] = useState<string>('');
  const [isEncryptingNote, setIsEncryptingNote] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_NOTES_STORAGE_KEY, JSON.stringify(progressNotesByPatient));
    } catch {
      // Ignore storage quota errors
    }
  }, [progressNotesByPatient]);

  const activeEncryptedProgressNotes = progressNotesByPatient[activePatient.id] || [];

  const decryptRecordsForPatient = async (
    records: EncryptedProgressNoteRecord[],
    passphrase: string
  ) => {
    const nextDecrypted: Record<string, string> = {};
    const nextMismatches: Record<string, boolean> = {};
    let successCount = 0;

    for (const record of records) {
      try {
        const plain = await decryptClinicalText(record.encrypted, passphrase);
        nextDecrypted[record.id] = plain;
        successCount += 1;
      } catch {
        nextMismatches[record.id] = true;
      }
    }

    return { nextDecrypted, nextMismatches, successCount };
  };

  useEffect(() => {
    if (!isVaultUnlocked || !vaultPassphrase) return;
    let cancelled = false;
    (async () => {
      const { nextDecrypted, nextMismatches } = await decryptRecordsForPatient(
        activeEncryptedProgressNotes,
        vaultPassphrase
      );
      if (!cancelled) {
        setDecryptedProgressNotes(nextDecrypted);
        setDecryptionMismatches(nextMismatches);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activePatient.id, progressNotesByPatient, isVaultUnlocked, vaultPassphrase]);

  const handleUnlockProgressVault = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVaultNotice(null);

    if (!isWebCryptoAvailable()) {
      setVaultNotice({
        type: 'error',
        text: 'Web Crypto AES-GCM encryption requires a secure browser context (HTTPS or localhost).',
      });
      return;
    }

    const candidate = passphraseInput.trim();
    if (!candidate) {
      setVaultNotice({
        type: 'error',
        text: 'Enter a clinician passphrase to unlock encrypted session logs.',
      });
      return;
    }

    if (activeEncryptedProgressNotes.length === 0) {
      setVaultPassphrase(candidate);
      setIsVaultUnlocked(true);
      setPassphraseInput('');
      setDecryptedProgressNotes({});
      setDecryptionMismatches({});
      setVaultNotice({
        type: 'success',
        text: 'Session vault unlocked. New encounter logs will be encrypted with AES-256-GCM.',
      });
      return;
    }

    const { nextDecrypted, nextMismatches, successCount } = await decryptRecordsForPatient(
      activeEncryptedProgressNotes,
      candidate
    );

    if (successCount === 0) {
      setVaultNotice({
        type: 'error',
        text: 'Passphrase mismatch — unable to decrypt stored encounter logs for this patient.',
      });
      return;
    }

    setVaultPassphrase(candidate);
    setIsVaultUnlocked(true);
    setPassphraseInput('');
    setDecryptedProgressNotes(nextDecrypted);
    setDecryptionMismatches(nextMismatches);
    setVaultNotice({
      type: 'success',
      text: `Decrypted ${successCount} of ${activeEncryptedProgressNotes.length} encounter log${
        activeEncryptedProgressNotes.length === 1 ? '' : 's'
      }.`,
    });
  };

  const handleLockProgressVault = () => {
    setIsVaultUnlocked(false);
    setVaultPassphrase('');
    setDecryptedProgressNotes({});
    setDecryptionMismatches({});
    setVaultNotice(null);
  };

  const handleStoreEncryptedProgressNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultNotice(null);

    const narrative = encounterNarrative.trim();
    if (!narrative) return;

    const effectivePassphrase = (isVaultUnlocked ? vaultPassphrase : passphraseInput).trim();
    if (!effectivePassphrase) {
      setVaultNotice({
        type: 'error',
        text: 'Provide an encryption passphrase before storing a clinical encounter log.',
      });
      return;
    }

    if (!isWebCryptoAvailable()) {
      setVaultNotice({
        type: 'error',
        text: 'Web Crypto API is unavailable in this browser context.',
      });
      return;
    }

    setIsEncryptingNote(true);
    try {
      const encryptedEnvelope = await encryptClinicalText(narrative, effectivePassphrase);
      const newRecord: EncryptedProgressNoteRecord = {
        id: `enc-${Date.now()}`,
        patientId: activePatient.id,
        sessionDate: encounterDate || new Date().toISOString().slice(0, 10),
        encounterType,
        clinicianName: clinicianName.trim() || 'Dr. Maxwell, MD / LAc',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        encrypted: encryptedEnvelope,
      };

      setProgressNotesByPatient((prev) => ({
        ...prev,
        [activePatient.id]: [newRecord, ...(prev[activePatient.id] || [])],
      }));

      setVaultPassphrase(effectivePassphrase);
      setIsVaultUnlocked(true);
      setPassphraseInput('');
      setDecryptedProgressNotes((prev) => ({
        ...prev,
        [newRecord.id]: narrative,
      }));
      setEncounterNarrative('');
      setVaultNotice({
        type: 'success',
        text: 'Encounter log encrypted (AES-256-GCM) and stored locally.',
      });
    } catch (err: any) {
      setVaultNotice({
        type: 'error',
        text: err?.message || 'Failed to encrypt clinical encounter log.',
      });
    } finally {
      setIsEncryptingNote(false);
    }
  };

  const handleDeleteProgressNote = (noteId: string) => {
    setProgressNotesByPatient((prev) => ({
      ...prev,
      [activePatient.id]: (prev[activePatient.id] || []).filter((n) => n.id !== noteId),
    }));
    setDecryptedProgressNotes((prev) => {
      const next = { ...prev };
      delete next[noteId];
      return next;
    });
    setDecryptionMismatches((prev) => {
      const next = { ...prev };
      delete next[noteId];
      return next;
    });
  };

  // Patient Goals state persisted locally per patient ID
  const [patientGoalsByPatient, setPatientGoalsByPatient] = useState<
    Record<string, PatientWellnessGoal[]>
  >(() => {
    try {
      const saved = localStorage.getItem(PATIENT_GOALS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<GoalCategory>('Sleep');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('');
  const [newGoalDate, setNewGoalDate] = useState<string>('2026-12-15');
  const [newGoalProgress, setNewGoalProgress] = useState<number>(20);

  useEffect(() => {
    try {
      localStorage.setItem(PATIENT_GOALS_STORAGE_KEY, JSON.stringify(patientGoalsByPatient));
    } catch {
      // Ignore storage quota errors
    }
  }, [patientGoalsByPatient]);

  const activePatientGoals =
    patientGoalsByPatient[activePatient.id] ?? getDefaultGoalsForPatient(activePatient);

  const avgGoalCompletion =
    activePatientGoals.length === 0
      ? 0
      : Math.round(
          activePatientGoals.reduce((sum, g) => sum + g.progress, 0) / activePatientGoals.length
        );
  const completedGoalsCount = activePatientGoals.filter((g) => g.progress >= 100).length;

  const handleUpdateGoalProgress = (goalId: string, nextProgress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextProgress)));
    const stamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setPatientGoalsByPatient((prev) => {
      const currentList = prev[activePatient.id] ?? getDefaultGoalsForPatient(activePatient);
      return {
        ...prev,
        [activePatient.id]: currentList.map((goal) =>
          goal.id === goalId ? { ...goal, progress: clamped, updatedAt: stamp } : goal
        ),
      };
    });
  };

  const handleAddPatientGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newGoalTitle.trim();
    if (!title) return;

    const stamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const created: PatientWellnessGoal = {
      id: `goal-${Date.now()}`,
      title,
      category: newGoalCategory,
      targetDescription:
        newGoalTarget.trim() || 'Consistent adherence to integrative care plan milestones',
      targetDate: newGoalDate || '2026-12-15',
      progress: Math.max(0, Math.min(100, Math.round(newGoalProgress))),
      updatedAt: stamp,
    };

    setPatientGoalsByPatient((prev) => {
      const currentList = prev[activePatient.id] ?? getDefaultGoalsForPatient(activePatient);
      return {
        ...prev,
        [activePatient.id]: [created, ...currentList],
      };
    });

    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalProgress(20);
    setIsAddingGoal(false);
  };

  const handleDeletePatientGoal = (goalId: string) => {
    setPatientGoalsByPatient((prev) => {
      const currentList = prev[activePatient.id] ?? getDefaultGoalsForPatient(activePatient);
      return {
        ...prev,
        [activePatient.id]: currentList.filter((g) => g.id !== goalId),
      };
    });
  };

  const [backupExportedAt, setBackupExportedAt] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [lastPdfExportedAt, setLastPdfExportedAt] = useState<string | null>(null);

  const handleExportLongitudinalHistoryPDF = () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 14;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 22) {
          doc.addPage();
          y = 16;
          // Running page header on subsequent pages
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(
            `MAXWELL CLINIC | PATIENT LONGITUDINAL HISTORY: ${activePatient.name.toUpperCase()} (ID: ${activePatient.id.toUpperCase()})`,
            14,
            10
          );
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(14, 12, pageWidth - 14, 12);
        }
      };

      const addSectionHeader = (title: string, subtitle?: string) => {
        checkPageBreak(14);
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(45, 212, 191); // teal-400
        doc.text(title.toUpperCase(), 17, y + 1.5);
        if (subtitle) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(subtitle, pageWidth - 17, y + 1.5, { align: 'right' });
        }
        y += 8.5;
      };

      const addSubHeader = (title: string) => {
        checkPageBreak(9);
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 3, pageWidth - 28, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(title, 16, y + 1.2);
        y += 7;
      };

      const addKeyValue = (label: string, value: string, indent: number = 16) => {
        checkPageBreak(7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`${label}:`, indent, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const splitText = doc.splitTextToSize(value, pageWidth - indent - 42);
        doc.text(splitText, indent + 38, y);
        y += Math.max(4.5, splitText.length * 3.6);
      };

      const addParagraph = (text: string, indent: number = 16) => {
        checkPageBreak(7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(text, pageWidth - indent - 14);
        doc.text(splitText, indent, y);
        y += splitText.length * 3.6 + 2;
      };

      // 1. MASTER HEADER BANNER
      doc.setFillColor(15, 23, 42);
      doc.rect(14, y, pageWidth - 28, 26, 'F');
      doc.setDrawColor(45, 212, 191);
      doc.setLineWidth(0.8);
      doc.line(14, y + 26, pageWidth - 14, y + 26);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('MAXWELL CLINIC — LONGITUDINAL PATIENT HISTORY REPORT', 18, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Aggregated Care Plans, Clinical Encounter Notes, Biomarker Telemetry & Pattern Evolution',
        18,
        y + 14
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(45, 212, 191);
      doc.text(
        `PATIENT: ${activePatient.name.toUpperCase()}  |  AGE: ${activePatient.age} YRS  |  GENDER: ${(activePatient.gender || activePatient.sex).toUpperCase()}  |  ID: ${activePatient.id.toUpperCase()}`,
        18,
        y + 20
      );
      y += 34;

      // Report Meta Strip
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const generatedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const generatedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      doc.text(
        `Report Generated: ${generatedDate} at ${generatedTime} | Clinic: Maxwell Integrative Medicine Operations`,
        16,
        y
      );
      doc.text(`Active Constitution: ${activePatient.season}`, pageWidth - 16, y, { align: 'right' });
      y += 6;

      // 2. PATIENT DEMOGRAPHICS & CONSTITUTIONAL BASELINE
      addSectionHeader('1. Patient Profile & Baseline Telemetry', 'Demographics & Vitals');
      addKeyValue('Full Name', activePatient.name);
      addKeyValue('Age & Gender', `${activePatient.age} years  |  ${activePatient.gender || activePatient.sex}`);
      addKeyValue('Occupation', activePatient.occupation);
      addKeyValue('Chief Complaints', activePatient.chiefComplaints);
      addKeyValue('Existing Meds', (activePatient.existingMedications || []).join(', ') || 'None recorded');
      addKeyValue('Tongue Diagnosis', activePatient.tongue);
      addKeyValue('Pulse Examination', activePatient.pulse);
      addKeyValue('Complexion', activePatient.complexion);
      addKeyValue(
        'Five Elements Balance',
        `Wood: ${activePatient.elementBalance.wood} | Fire: ${activePatient.elementBalance.fire} | Earth: ${activePatient.elementBalance.earth} | Metal: ${activePatient.elementBalance.metal} | Water: ${activePatient.elementBalance.water}`
      );
      addKeyValue('Autonomic HRV', activePatient.bioMarkers.hrv);
      addKeyValue('Cortisol Rhythm', activePatient.bioMarkers.cortisol);
      addKeyValue('Inflammation hs-CRP', activePatient.bioMarkers.crp);
      addKeyValue('Sleep Architecture', activePatient.bioMarkers.sleep);
      addKeyValue('Mitochondrial ATP', activePatient.bioMarkers.mitochondrial);
      addKeyValue('Blood Pressure', activePatient.bioMarkers.bloodPressure);
      y += 3;

      // 3. AGGREGATED LONGITUDINAL CARE PLANS
      addSectionHeader(
        '2. Consolidated Care Plans & Integrative Protocols',
        'Chronological Protocol Evolution'
      );

      const allPlans: Array<{
        id: string;
        date: string;
        pattern: string;
        formula: string;
        dosage: string;
        keyHerbs: string[];
        acupuncture: Array<{ pointCode: string; name?: string; clinicalAction?: string }>;
        digitalTherapeutics: string;
        dietary: string;
        dispatchedTasks: string[];
      }> = [];

      if (activePatient.historicalCarePlan) {
        const hp = activePatient.historicalCarePlan;
        allPlans.push({
          id: hp.id,
          date: hp.createdAt || 'Current Active Plan',
          pattern: hp.constitutionalSummary?.tcmPatternDiagnosis || 'N/A',
          formula: hp.integrativeProtocol?.herbalFormulation?.classicFormula || 'Custom Botanical Formula',
          dosage: hp.integrativeProtocol?.herbalFormulation?.dosageInstruction || 'N/A',
          keyHerbs: hp.integrativeProtocol?.herbalFormulation?.keyHerbs || [],
          acupuncture: hp.integrativeProtocol?.acupuncturePoints || [],
          digitalTherapeutics: `${hp.integrativeProtocol?.digitalTherapeutics?.frequencyHz || 174}Hz (${hp.integrativeProtocol?.digitalTherapeutics?.frequencyName || 'Solfeggio Sound'}) - ${hp.integrativeProtocol?.digitalTherapeutics?.breathworkPattern || 'Vagal Breath'}`,
          dietary: `${hp.integrativeProtocol?.dietaryTherapy?.thermalEnergetics || 'Cooked meals'} | Foods: ${(hp.integrativeProtocol?.dietaryTherapy?.recommendedFoods || []).slice(0, 3).join(', ')}`,
          dispatchedTasks: (hp.agenticActionItems || []).map(
            (t) => `[${t.agentName}] ${t.actionDescription} (${t.status})`
          ),
        });
      }

      if (activePatient.previousCarePlans && activePatient.previousCarePlans.length > 0) {
        activePatient.previousCarePlans.forEach((pp) => {
          allPlans.push({
            id: pp.id,
            date: pp.createdAt || 'Past Session',
            pattern: pp.constitutionalSummary?.tcmPatternDiagnosis || 'N/A',
            formula: pp.integrativeProtocol?.herbalFormulation?.classicFormula || 'Herbal Blend',
            dosage: pp.integrativeProtocol?.herbalFormulation?.dosageInstruction || 'N/A',
            keyHerbs: pp.integrativeProtocol?.herbalFormulation?.keyHerbs || [],
            acupuncture: pp.integrativeProtocol?.acupuncturePoints || [],
            digitalTherapeutics: `${pp.integrativeProtocol?.digitalTherapeutics?.frequencyHz || 528}Hz (${pp.integrativeProtocol?.digitalTherapeutics?.frequencyName || 'Frequency Sound'})`,
            dietary: `${pp.integrativeProtocol?.dietaryTherapy?.thermalEnergetics || 'Whole foods'}`,
            dispatchedTasks: (pp.agenticActionItems || []).map(
              (t) => `[${t.agentName}] ${t.actionDescription} (${t.status})`
            ),
          });
        });
      }

      // If no historical plans exist in object, generate based on patient's timeline
      if (allPlans.length === 0) {
        PATTERN_EVOLUTION_TIMELINE.forEach((item, idx) => {
          allPlans.push({
            id: `plan-gen-0${idx + 1}`,
            date: item.date,
            pattern: item.pattern,
            formula: item.formula,
            dosage: '4g concentrated granular extract taken twice daily with warm water.',
            keyHerbs: [
              'Chai Hu (Bupleurum)',
              'Dang Gui (Angelica)',
              'Bai Zhu (Atractylodes)',
              'Suan Zao Ren (Ziziphus)',
            ],
            acupuncture: [
              { pointCode: 'LV3', name: 'Taichong', clinicalAction: 'Spreads Liver Qi, regulates sympathetic tone' },
              { pointCode: 'PC6', name: 'Neiguan', clinicalAction: 'Unbinds chest, calms Shen, restores HRV' },
              { pointCode: 'ST36', name: 'Zusanli', clinicalAction: 'Fortifies Spleen Qi, reduces systemic hs-CRP' },
            ],
            digitalTherapeutics: '174Hz Wood Spreading & Vagal Release + 6Hz Theta Entrainment',
            dietary: 'Neutral to warm cooked whole foods, avoiding iced beverages and processed sugars.',
            dispatchedTasks: [
              '[Diagnostic Bio-Synthesizer] Continuous HRV stream (Active)',
              '[Botanical Formulary Agent] Dispensary order (Completed)',
            ],
          });
        });
      }

      allPlans.forEach((plan, pIdx) => {
        addSubHeader(`PROTOCOL #${pIdx + 1}: ${plan.date} (Plan ID: ${plan.id})`);
        addKeyValue('Pattern Diagnosis', plan.pattern);
        addKeyValue('Herbal Prescription', `${plan.formula}  (Dosage: ${plan.dosage})`);
        if (plan.keyHerbs.length > 0) {
          addKeyValue('Key Botanical Herbs', plan.keyHerbs.join(', '));
        }
        if (plan.acupuncture.length > 0) {
          const acupText = plan.acupuncture
            .map((pt) => `${pt.pointCode}${pt.name ? ` (${pt.name})` : ''}: ${pt.clinicalAction || 'Tonifies Qi'}`)
            .join('; ');
          addKeyValue('Acupoint Protocol', acupText);
        }
        addKeyValue('Digital Therapeutics', plan.digitalTherapeutics);
        addKeyValue('Dietary & Lifestyle', plan.dietary);
        if (plan.dispatchedTasks.length > 0) {
          addKeyValue('Dispatched Tasks', plan.dispatchedTasks.slice(0, 3).join(' | '));
        }
        y += 3;
      });

      // 4. TCM PATTERN EVOLUTION TIMELINE
      addSectionHeader('3. Longitudinal Pattern Evolution & Milestones', 'Clinical Trajectory');
      PATTERN_EVOLUTION_TIMELINE.forEach((milestone) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`${milestone.stage} (${milestone.date}):`, 16, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(13, 148, 136);
        doc.text(`[${milestone.status}]`, pageWidth - 16, y, { align: 'right' });
        y += 4;

        addKeyValue('Pattern & Formula', `${milestone.pattern}  |  Rx: ${milestone.formula}`, 18);
        addKeyValue('Objective Metrics', milestone.keyMetrics, 18);
        addKeyValue('Clinical Shift', milestone.clinicalShift, 18);
        y += 2;
      });
      y += 2;

      // 5. CONSOLIDATED CLINICAL ENCOUNTER LOGS & QUICK NOTES
      addSectionHeader(
        '4. Consolidated Clinical Encounter Notes & Observations',
        'Practitioner Documentation'
      );

      // A. Quick observation scratchpad notes
      if (activeLogs.length > 0) {
        addSubHeader('Practitioner Pinned Observations & Real-Time Notes');
        activeLogs.forEach((note) => {
          checkPageBreak(8);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`[${note.timestamp}]`, 16, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          const splitText = doc.splitTextToSize(note.text, pageWidth - 48);
          doc.text(splitText, 42, y);
          y += Math.max(4.5, splitText.length * 3.6);
        });
        y += 2;
      }

      // B. Encrypted/Decrypted Progress Notes
      if (activeEncryptedProgressNotes.length > 0) {
        addSubHeader('Clinical Session Encounters');
        activeEncryptedProgressNotes.forEach((rec) => {
          checkPageBreak(12);
          const decryptedText = decryptedProgressNotes[rec.id];
          const isDecrypted = isVaultUnlocked && typeof decryptedText === 'string';

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          doc.text(`${rec.encounterType} (${rec.sessionDate}) — Attending: ${rec.clinicianName}`, 16, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(`Recorded ${rec.createdAt}`, pageWidth - 16, y, { align: 'right' });
          y += 4.5;

          if (isDecrypted) {
            addParagraph(`Clinical Narrative: "${decryptedText}"`, 18);
          } else {
            addParagraph(
              `[Encrypted AES-256-GCM Session Narrative: Passphrase verification required in active session to unlock plaintext encounter details.]`,
              18
            );
          }
          y += 1.5;
        });
      } else {
        addParagraph(
          'No prior session notes recorded in current local vault. Current observation log verified and active.',
          16
        );
      }
      y += 2;

      // 6. PATIENT WELLNESS GOALS & ACTIVE CLINICAL ALERTS
      addSectionHeader('5. Patient Wellness Goals & Clinical Safety Triage', 'Outcomes & Monitoring');

      if (activePatientGoals.length > 0) {
        addSubHeader('Integrative Wellness Goals');
        activePatientGoals.forEach((goal) => {
          checkPageBreak(7);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text(`• ${goal.title} [${goal.category}]`, 16, y);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(
            goal.progress >= 100 ? 16 : 13,
            goal.progress >= 100 ? 185 : 148,
            goal.progress >= 100 ? 129 : 136
          );
          doc.text(`Progress: ${goal.progress}%`, pageWidth - 16, y, { align: 'right' });
          y += 4;

          addKeyValue(
            'Target & Timeline',
            `${goal.targetDescription} (Target: ${goal.targetDate}, Updated: ${goal.updatedAt})`,
            20
          );
        });
        y += 2;
      }

      if (activeAlerts.length > 0) {
        addSubHeader('Active Clinical Telemetry Alerts');
        activeAlerts.forEach((alert) => {
          checkPageBreak(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(
            alert.severity === 'Critical' ? 225 : 217,
            alert.severity === 'Critical' ? 29 : 119,
            alert.severity === 'Critical' ? 72 : 6
          );
          doc.text(`⚠️ [${alert.severity.toUpperCase()}] ${alert.title}`, 16, y);
          y += 4;

          addKeyValue('Threshold', `${alert.currentValue} (Criteria: ${alert.threshold})`, 20);
          addKeyValue('Recommended Action', alert.recommendedAction, 20);
          y += 1.5;
        });
      }
      y += 6;

      // Clinician Attestation & Signature
      checkPageBreak(25);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 20, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(14, y, pageWidth - 28, 20, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text('CLINICIAN CERTIFICATION & VERIFICATION:', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(
        'This longitudinal history report was consolidated from clinical care plans, biophysical telemetry feeds,',
        18,
        y + 9.5
      );
      doc.text(
        'and practitioner encounter notes. All therapies comply with Maxwell Clinic integrative medicine safety protocols.',
        18,
        y + 13.5
      );

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Dr. Maxwell, MD / LAc  —  Chief of Integrative Medicine', pageWidth - 18, y + 16, {
        align: 'right',
      });
      y += 24;

      // Running Footers & Page Numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'Confidential Medical Record — Maxwell Clinic Integrative Clinical AI Operations Engine',
          14,
          pageHeight - 8
        );
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
      }

      const safePatientSlug = activePatient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const dateStamp = new Date().toISOString().slice(0, 10);
      doc.save(`maxwell-clinic-longitudinal-history-${safePatientSlug}-${dateStamp}.pdf`);

      setLastPdfExportedAt(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.error('Failed to export longitudinal history PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportBackupJSON = () => {
    const payload = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      clinic: 'Maxwell Clinic - Integrative Clinical AI Operations Engine',
      timeframe,
      patientProfile: {
        id: activePatient.id,
        name: activePatient.name,
        age: activePatient.age,
        gender: activePatient.gender || activePatient.sex,
        occupation: activePatient.occupation,
        season: activePatient.season,
        chiefComplaints: activePatient.chiefComplaints,
        elementBalance: activePatient.elementBalance,
      },
      aggregateHealthTrends: {
        latestSnapshot: latestData,
        baselineSnapshot: baselineData,
        longitudinalSeries: trendData,
        fiveElementEvolution: FIVE_ELEMENT_EVOLUTION,
        patternEvolutionMilestones: PATTERN_EVOLUTION_TIMELINE,
        thirtyDayCorrelation: {
          metrics: correlationStats,
          dailySeries: correlationSeries30d,
        },
        activeClinicalAlerts: activeAlerts.map((alert) => ({
          ...alert,
          acknowledged: Boolean(acknowledgedAlerts[alert.id]),
        })),
      },
      patientGoals: activePatientGoals,
      quickNotes: {
        draft: activeDraft,
        pinnedObservations: activeLogs,
      },
      clinicalEncounterLogs: activeEncryptedProgressNotes.map((record) => ({
        id: record.id,
        patientId: record.patientId,
        sessionDate: record.sessionDate,
        encounterType: record.encounterType,
        clinicianName: record.clinicianName,
        createdAt: record.createdAt,
        encryptionStatus:
          isVaultUnlocked && typeof decryptedProgressNotes[record.id] === 'string'
            ? 'decrypted_in_session'
            : 'encrypted_ciphertext_only',
        decryptedNarrative:
          isVaultUnlocked && typeof decryptedProgressNotes[record.id] === 'string'
            ? decryptedProgressNotes[record.id]
            : null,
        encryptedEnvelope: record.encrypted,
      })),
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const safePatientSlug = activePatient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dateStamp = new Date().toISOString().slice(0, 10);

    const link = document.createElement('a');
    link.href = url;
    link.download = `maxwell-clinic-backup-${safePatientSlug}-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupExportedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 flex-wrap font-mono tabular-nums">
            <span className="font-sans">Patient Overview</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-200 font-semibold">{activePatient.name}</span>
            <span aria-hidden="true">·</span>
            <span>
              Age: <strong className="text-teal-300 font-semibold">{activePatient.age} yrs</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Gender: <strong className="text-teal-300 font-semibold">{activePatient.gender || activePatient.sex}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-2 py-0.5 text-[11px] font-sans font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Edit active patient age and gender"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            {profileSavedAt && (
              <span className="text-[11px] text-emerald-400">
                Updated {profileSavedAt}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Patient Health Trends &amp; Constitutional Pattern Dashboard</span>
            <Activity className="w-5 h-5 text-teal-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Aggregated longitudinal metrics tracking Vagal Tone (HRV), Sleep Architecture, Emotional Shen Balance, and TCM Constitutional Pattern Evolution.
          </p>
        </div>

        {/* Header Controls: Longitudinal History PDF Export, JSON Backup Export & Timeframe Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportLongitudinalHistoryPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-2 text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/50 hover:border-teal-400 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm disabled:opacity-50"
            title="Download comprehensive longitudinal history PDF report consolidating all care plans and clinical notes for this patient"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {isExportingPDF
                ? 'Generating PDF Report...'
                : lastPdfExportedAt
                  ? `History Exported (${lastPdfExportedAt})`
                  : 'Export Longitudinal History'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportBackupJSON}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-teal-500/50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Export aggregate health trends and clinical encounter logs as a structured JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{backupExportedAt ? `Exported (${backupExportedAt})` : 'Export Backup JSON'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg font-mono text-xs shrink-0">
            {(['6W', '12W', '24W'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === tf ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clinician Personalized Patient Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/40 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-teal-500/20 text-teal-300 px-3.5 py-1 text-[10px] font-mono rounded-bl border-l border-b border-teal-500/40 font-bold uppercase tracking-wider">
          Clinician Patient Record
        </div>

        <div className="flex items-center gap-5">
          {/* Patient Profile Photo Slot with Live Camera Capture */}
          <div className="relative group shrink-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-teal-500/20 via-slate-800 to-teal-900/30 border-2 border-teal-500/50 flex items-center justify-center shadow-lg shadow-teal-500/10">
              {activePhotoUrl ? (
                <img
                  src={activePhotoUrl}
                  alt={`${activePatient.name} clinical profile`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-teal-300 font-mono text-xl sm:text-2xl font-extrabold tracking-wider">
                  {activePatient.name.split(' ').map((n) => n[0]).join('')}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                title={activePhotoUrl ? 'Retake live patient photo' : 'Capture live patient photo'}
              >
                <Camera className="w-3 h-3" />
                <span>{activePhotoUrl ? 'Retake' : 'Photo'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                title="Edit patient profile demographics"
              >
                <Edit3 className="w-3 h-3 text-teal-400" />
                <span>Edit Profile</span>
              </button>
              {activePhotoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 transition-colors"
                  title="Remove saved patient photo"
                  aria-label="Remove saved patient photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {activePatient.name}
              </h2>
              <span className="text-xs font-mono text-teal-400 tabular-nums">
                ID: {activePatient.id.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-300 font-mono tabular-nums">
              <span>
                <span className="text-slate-400">Age:</span>{' '}
                <strong className="text-teal-300 font-semibold">{activePatient.age} yrs</strong>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>
                <span className="text-slate-400">Gender:</span>{' '}
                <strong className="text-teal-300 font-semibold">{activePatient.gender || activePatient.sex}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{activePatient.occupation}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-teal-400">Season: {activePatient.season}</span>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-2.5 py-0.5 text-xs font-sans font-medium bg-slate-800 hover:bg-slate-700 hover:border-teal-500/50 text-slate-200 rounded border border-slate-700 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                title="Edit patient age, gender, and clinical profile"
              >
                <Edit3 className="w-3 h-3 text-teal-400" />
                <span>Edit</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
              <strong className="text-slate-300 font-medium">Chief Complaint:</strong> {activePatient.chiefComplaints}
            </p>
          </div>
        </div>

        {/* Patient Switcher & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs font-mono text-slate-400 uppercase mr-1">Switch Patient:</div>
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-1.5 rounded-lg">
            {PRESET_PATIENTS.map((pt) => (
              <button
                key={pt.id}
                onClick={() => handlePatientChange(pt)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                  activePatient.id === pt.id
                    ? 'bg-teal-400 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pt.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Alerts System & Attention Triage */}
      <section
        className={`bg-slate-900/90 border rounded-xl p-5 space-y-4 transition-colors ${
          activeAlerts.some((a) => a.severity === 'Critical')
            ? 'border-rose-500/50'
            : hasRealTimeDeviationWarning
              ? 'border-amber-500/50'
              : 'border-slate-800'
        }`}
      >
        {/* High-Visibility Real-Time Threshold Deviation Banner */}
        {(hrvDeviationPercent <= -15 || sleepDeviationPercent <= -15 || liveHrv < 28 || liveSleep < 66) && (
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong className="text-rose-300 uppercase tracking-wide font-mono">
                  Stream Threshold Deviation Detected:
                </strong>{' '}
                {liveHrv < 28 || hrvDeviationPercent <= -15
                  ? `HRV at ${liveHrv.toFixed(1)} ms (${hrvDeviationPercent > 0 ? '+' : ''}${hrvDeviationPercent}% vs ${patientStreamBaseline.hrv} ms baseline). `
                  : ''}
                {liveSleep < 66 || sleepDeviationPercent <= -15
                  ? `Sleep Efficiency at ${liveSleep.toFixed(1)}% (${sleepDeviationPercent > 0 ? '+' : ''}${sleepDeviationPercent}% vs ${patientStreamBaseline.sleep}% baseline).`
                  : ''}
              </span>
            </div>
            <span className="font-mono text-[11px] text-rose-300 shrink-0 tabular-nums">
              Packet #{streamPacketCount} · {lastPacketTime}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border shrink-0 ${
                activeAlerts.some((a) => a.severity === 'Critical')
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  : activeAlerts.length > 0
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                <span>Clinical Alerts &amp; Real-Time Stream Triage</span>
                <span
                  className={`text-xs font-mono font-semibold tabular-nums ${
                    unacknowledgedCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  · {unacknowledgedCount > 0 ? `${unacknowledgedCount} Active Attention Flag${unacknowledgedCount > 1 ? 's' : ''}` : 'All Flags Reviewed'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous stream monitoring against personal baseline &amp; target thresholds (HRV ≥ 35 ms, Sleep ≥ 75%)
              </p>
            </div>
          </div>

          {/* Cross-Patient Attention Triage Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Clinic Triage:</span>
            {PRESET_PATIENTS.map((pt) => {
              const ptAlerts = evaluatePatientClinicalAlerts(pt);
              const hasCrit = ptAlerts.some((a) => a.severity === 'Critical');
              const isSelected = activePatient.id === pt.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => handlePatientChange(pt)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 border-teal-500/70 text-slate-100 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {hasCrit ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : ptAlerts.length > 0 ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>{pt.name.split(' ')[0]}</span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    ({isSelected ? activeAlerts.length : ptAlerts.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-Time Data Stream Telemetry Monitor */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono">
                <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-teal-400' : 'text-slate-500'}`} />
                <span className={isLiveStreaming ? 'text-teal-300 font-semibold' : 'text-slate-400'}>
                  {isLiveStreaming ? 'LIVE WEARABLE STREAM' : 'STREAM PAUSED'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                Packet #{streamPacketCount} · Updated {lastPacketTime}
              </span>
              {simulatedScenario !== 'nominal' && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-slate-900 border border-slate-700 text-amber-300">
                  Mode: {simulatedScenario.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsLiveStreaming((s) => !s)}
                className="px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1"
              >
                {isLiveStreaming ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-teal-400" />}
                <span>{isLiveStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerStreamScenario('hrv_drop')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors flex items-center gap-1 ${
                  simulatedScenario === 'hrv_drop'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-200 font-semibold'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-rose-300'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Simulate Vagal Drop</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerStreamScenario('sleep_drop')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors flex items-center gap-1 ${
                  simulatedScenario === 'sleep_drop'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-semibold'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Simulate Sleep Drop</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerStreamScenario('recovery')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors flex items-center gap-1 ${
                  simulatedScenario === 'recovery'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-300'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Restore Baseline</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Live HRV Stream Meter */}
            <div
              className={`p-3 rounded-lg border space-y-2 ${
                liveHrv < 28 || hrvDeviationPercent <= -20
                  ? 'bg-rose-950/20 border-rose-500/50'
                  : liveHrv < 35 || hrvDeviationPercent <= -15
                    ? 'bg-amber-950/15 border-amber-500/40'
                    : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                  <Heart className="w-3.5 h-3.5 text-teal-400" />
                  Live HRV Stream (RMSSD)
                </span>
                <span
                  className={`font-mono font-bold tabular-nums text-[11px] px-2 py-0.5 rounded border ${
                    hrvDeviationPercent <= -20 || liveHrv < 28
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : hrvDeviationPercent <= -15 || liveHrv < 35
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {hrvDeviationPercent >= 0 ? '▲ +' : '▼ '}
                  {hrvDeviationPercent}% vs Baseline
                </span>
              </div>

              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <div>
                  <span className="text-xl font-bold text-slate-100">{liveHrv.toFixed(1)} ms</span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    Baseline: {patientStreamBaseline.hrv} ms
                  </span>
                </div>
                <span className="text-[11px] text-teal-400">Target ≥ 35 ms</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    liveHrv < 28 ? 'bg-rose-500' : liveHrv < 35 ? 'bg-amber-400' : 'bg-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, (liveHrv / 60) * 100))}%` }}
                />
              </div>
            </div>

            {/* Live Sleep Efficiency Stream Meter */}
            <div
              className={`p-3 rounded-lg border space-y-2 ${
                liveSleep < 66 || sleepDeviationPercent <= -20
                  ? 'bg-rose-950/20 border-rose-500/50'
                  : liveSleep < 75 || sleepDeviationPercent <= -15
                    ? 'bg-amber-950/15 border-amber-500/40'
                    : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  Live Sleep Efficiency Stream
                </span>
                <span
                  className={`font-mono font-bold tabular-nums text-[11px] px-2 py-0.5 rounded border ${
                    sleepDeviationPercent <= -20 || liveSleep < 66
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : sleepDeviationPercent <= -15 || liveSleep < 75
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {sleepDeviationPercent >= 0 ? '▲ +' : '▼ '}
                  {sleepDeviationPercent}% vs Baseline
                </span>
              </div>

              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <div>
                  <span className="text-xl font-bold text-slate-100">{liveSleep.toFixed(1)}%</span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    Baseline: {patientStreamBaseline.sleep}%
                  </span>
                </div>
                <span className="text-[11px] text-amber-400">Target ≥ 75%</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    liveSleep < 66 ? 'bg-rose-500' : liveSleep < 75 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, liveSleep))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-lg px-4 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Nominal Telemetry:</strong> {activePatient.name}’s streaming HRV ({liveHrv.toFixed(1)} ms) and Sleep Efficiency ({liveSleep.toFixed(1)}%) meet baseline and recovery thresholds.
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => {
              const isCrit = alert.severity === 'Critical';
              const isAck = !!acknowledgedAlerts[alert.id];
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border text-xs space-y-2.5 transition-opacity ${
                    isAck
                      ? 'bg-slate-950/50 border-slate-800 opacity-70'
                      : isCrit
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : 'bg-amber-950/20 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isCrit ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                          <span>{alert.title}</span>
                          {alert.isRealTimeStreamAlert && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-slate-900 border border-teal-500/40 text-teal-300">
                              Live Stream
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                          {alert.severity} · {alert.metric} · {alert.threshold}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAcknowledgeAlert(alert.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                        isAck
                          ? 'bg-slate-900 border-slate-700 text-teal-400'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {isAck ? 'Reviewed' : 'Acknowledge'}
                    </button>
                  </div>

                  <div className="font-mono text-xs text-slate-200 tabular-nums">
                    Current Reading: <strong className={isCrit ? 'text-rose-300' : 'text-amber-300'}>{alert.currentValue}</strong>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{alert.detail}</p>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-teal-300">
                    <strong className="text-slate-400 font-normal">Clinical Action:</strong> {alert.recommendedAction}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: HRV */}
        <div
          className={`bg-slate-900/90 border rounded-xl p-4 space-y-2 ${
            hrvAlert?.severity === 'Critical'
              ? 'border-rose-500/60'
              : hrvAlert
                ? 'border-amber-500/50'
                : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-teal-400" /> HRV (RMSSD)
            </span>
            {hrvAlert ? (
              <span
                className={`font-bold flex items-center gap-1 ${
                  hrvAlert.severity === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> {hrvAlert.severity} Alert
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">Target Met</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">{liveHrv.toFixed(1)} ms</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">baseline: {patientStreamBaseline.hrv} ms</span>
          </div>
          <div className="text-[11px] text-slate-400">Vagal autonomic nerve recovery under sound therapy.</div>
        </div>

        {/* KPI 2: Sleep Efficiency */}
        <div
          className={`bg-slate-900/90 border rounded-xl p-4 space-y-2 ${
            sleepAlert?.severity === 'Critical'
              ? 'border-rose-500/60'
              : sleepAlert
                ? 'border-amber-500/50'
                : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-400" /> Sleep Efficiency
            </span>
            {sleepAlert ? (
              <span
                className={`font-bold flex items-center gap-1 ${
                  sleepAlert.severity === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> {sleepAlert.severity} Alert
              </span>
            ) : (
              <span className="text-emerald-400 font-bold tabular-nums">+{Math.max(0, Math.round(liveSleep - patientStreamBaseline.sleep))}% Optimal</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">{liveSleep.toFixed(1)}%</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">{latestData.deepSleep}h deep sleep</span>
          </div>
          <div className="text-[11px] text-slate-400">Nighttime awakenings during 1-3 AM reduced.</div>
        </div>

        {/* KPI 3: Mood & Shen Balance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-purple-400" /> Shen Harmony Score
            </span>
            <span className="text-purple-400 font-bold tabular-nums">+{(latestData.mood - baselineData.mood).toFixed(1)} Pts</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">{latestData.mood} / 10</span>
            <span className="text-xs text-slate-400 font-mono">Emotional Ease</span>
          </div>
          <div className="text-[11px] text-slate-400">Reduced irritability; smooth Liver Qi movement.</div>
        </div>

        {/* KPI 4: hs-CRP Inflammation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" /> hs-CRP Inflammation
            </span>
            <span className="text-emerald-400 font-bold tabular-nums">{(baselineData.hsCRP - latestData.hsCRP).toFixed(1)} mg/L Drop</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">{latestData.hsCRP} mg/L</span>
            <span className="text-xs text-slate-400 font-mono">Subclinical Level</span>
          </div>
          <div className="text-[11px] text-slate-400">Gastrointestinal mucosal barrier repair.</div>
        </div>
      </div>

      {/* Practitioner Quick Notes Widget */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Quick Notes — {activePatient.name}
              </h2>
              <p className="text-xs text-slate-400">
                Rapid, unstructured bedside observations saved automatically to this browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
            <span>{activeLogs.length} pinned {activeLogs.length === 1 ? 'note' : 'notes'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-400">
              {lastNoteSavedAt ? `Saved locally ${lastNoteSavedAt}` : 'Auto-persisted locally'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Free-form Auto-Persisting Scratchpad */}
          <div className="lg:col-span-7 space-y-3">
            <label htmlFor={`quick-note-${activePatient.id}`} className="sr-only">
              Quick observations for {activePatient.name}
            </label>
            <textarea
              id={`quick-note-${activePatient.id}`}
              value={activeDraft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleAddQuickObservation();
                }
              }}
              rows={4}
              placeholder={`Jot down rapid observations for ${activePatient.name} (e.g., tongue moisture, pulse tension, sleep feedback, mood shift)...`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 leading-relaxed resize-y"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Scratchpad persists automatically per patient. Press Ctrl+Enter to pin to log.
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {activeDraft.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDraftChange('')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Clear Draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddQuickObservation}
                  disabled={!activeDraft.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pin Observation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Timestamped Observation Feed */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300">
              Recent Pinned Observations
            </div>
            {activeLogs.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 text-xs text-slate-400 leading-relaxed">
                No pinned observations yet for {activePatient.name}. Use the scratchpad on the left to jot down rapid notes or pin timestamped entries here.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-[11px] font-mono text-teal-400 tabular-nums">
                        {entry.timestamp}
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                        {entry.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteObservation(entry.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors shrink-0"
                      title="Delete observation"
                      aria-label="Delete observation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clinician Progress Notes (Encrypted Encounter Logs) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border shrink-0 ${
                isVaultUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
              }`}
            >
              {isVaultUnlocked ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                <span>Clinician Progress Notes — {activePatient.name}</span>
                <span
                  className={`text-xs font-mono font-normal tabular-nums ${
                    isVaultUnlocked ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  · {isVaultUnlocked ? 'Unlocked (AES-256-GCM)' : 'Vault Locked (AES-256-GCM)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Client-side PBKDF2 + AES-256-GCM encrypted clinical encounter logs stored per patient session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 tabular-nums mr-1">
              {activeEncryptedProgressNotes.length} encrypted{' '}
              {activeEncryptedProgressNotes.length === 1 ? 'log' : 'logs'}
            </span>
            {isVaultUnlocked ? (
              <button
                type="button"
                onClick={handleLockProgressVault}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault</span>
              </button>
            ) : (
              <form onSubmit={handleUnlockProgressVault} className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphraseInput}
                    onChange={(e) => setPassphraseInput(e.target.value)}
                    placeholder="Clinician passphrase..."
                    aria-label="Clinician encryption passphrase"
                    className="bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 w-44 sm:w-52"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                  >
                    {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Vault</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {vaultNotice && (
          <div
            className={`px-4 py-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              vaultNotice.type === 'error'
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {vaultNotice.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            )}
            <span>{vaultNotice.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* New Encrypted Clinical Encounter Composer */}
          <form onSubmit={handleStoreEncryptedProgressNote} className="lg:col-span-6 space-y-3.5">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Record Encrypted Session Encounter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label htmlFor="encounter-date" className="block text-[11px] font-mono text-slate-400">
                  Session Date
                </label>
                <input
                  id="encounter-date"
                  type="date"
                  value={encounterDate}
                  onChange={(e) => setEncounterDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="encounter-type" className="block text-[11px] font-mono text-slate-400">
                  Encounter Type
                </label>
                <select
                  id="encounter-type"
                  value={encounterType}
                  onChange={(e) => setEncounterType(e.target.value as EncounterType)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="Initial Consultation">Initial Consultation</option>
                  <option value="Follow-Up Visit">Follow-Up Visit</option>
                  <option value="Acupuncture & Frequency Session">Acupuncture &amp; Frequency Session</option>
                  <option value="Telehealth Check-In">Telehealth Check-In</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="encounter-clinician" className="block text-[11px] font-mono text-slate-400">
                  Attending Clinician
                </label>
                <input
                  id="encounter-clinician"
                  type="text"
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  placeholder="Dr. Maxwell, MD"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>

            {!isVaultUnlocked && (
              <div className="space-y-1">
                <label htmlFor="composer-passphrase" className="block text-[11px] font-mono text-slate-400">
                  Encryption Passphrase (used to encrypt this encounter via AES-256-GCM)
                </label>
                <input
                  id="composer-passphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  value={passphraseInput}
                  onChange={(e) => setPassphraseInput(e.target.value)}
                  placeholder="Set or enter clinician passphrase..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor={`progress-note-${activePatient.id}`} className="block text-[11px] font-mono text-slate-400">
                Clinical Progress Note (Subjective · Objective · Assessment · Plan)
              </label>
              <textarea
                id={`progress-note-${activePatient.id}`}
                rows={4}
                value={encounterNarrative}
                onChange={(e) => setEncounterNarrative(e.target.value)}
                placeholder={`Document formal clinical encounter for ${activePatient.name} (pulse/tongue shifts, needle retention response, herbal titration, follow-up directives)...`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                Plaintext is encrypted before saving; only ciphertext is persisted.
              </span>
              <button
                type="submit"
                disabled={isEncryptingNote || !encounterNarrative.trim()}
                className="px-4 py-2 text-xs font-semibold bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isEncryptingNote ? 'Encrypting...' : 'Encrypt & Store Log'}</span>
              </button>
            </div>
          </form>

          {/* Encrypted Encounter History */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Stored Encounter Logs</span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                {activePatient.name}
              </span>
            </div>

            {activeEncryptedProgressNotes.length === 0 ? (
              <div className="p-5 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 text-xs text-slate-400 leading-relaxed">
                No encrypted progress notes stored for {activePatient.name} yet. Record a clinical encounter on the left to encrypt and archive the session log locally.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {activeEncryptedProgressNotes.map((record) => {
                  const plaintext = decryptedProgressNotes[record.id];
                  const isMismatch = decryptionMismatches[record.id];
                  const canViewPlaintext = isVaultUnlocked && typeof plaintext === 'string';

                  return (
                    <div
                      key={record.id}
                      className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400 tabular-nums">
                          <span className="text-teal-400 font-semibold">{record.sessionDate}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-200 font-sans font-medium">{record.encounterType}</span>
                          <span aria-hidden="true">·</span>
                          <span>{record.clinicianName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{record.createdAt}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteProgressNote(record.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors shrink-0"
                          title="Delete encrypted session log"
                          aria-label="Delete encrypted session log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {canViewPlaintext ? (
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                          {plaintext}
                        </p>
                      ) : (
                        <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800/90 space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
                            <Lock className="w-3 h-3 shrink-0" />
                            <span>
                              {isMismatch
                                ? 'Encrypted with a different passphrase'
                                : 'Encrypted Payload — Unlock vault to view clinical encounter'}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {record.encrypted.algorithm}: {record.encrypted.ciphertextB64.slice(0, 64)}...
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Patient Goals Module (Wellness Targets & Interactive Progress Tracking) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                <span>Patient Goals — {activePatient.name}</span>
                <span className="text-xs font-mono font-normal text-teal-400 tabular-nums">
                  · {avgGoalCompletion}% Avg Completion
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Collaborative wellness milestones tracked alongside bio-markers to encourage active participation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
              <span>{activePatientGoals.length} active</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">{completedGoalsCount} achieved</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingGoal((v) => !v)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {isAddingGoal ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAddingGoal ? 'Close Form' : 'Define Goal'}</span>
            </button>
          </div>
        </div>

        {activePatientGoals.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
              <span>Overall Care Plan Goal Participation</span>
              <span className="text-teal-400 font-semibold">{avgGoalCompletion}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${avgGoalCompletion}%` }}
                role="progressbar"
                aria-valuenow={avgGoalCompletion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Overall patient goal completion"
              />
            </div>
          </div>
        )}

        {/* Define New Wellness Goal Form */}
        {isAddingGoal && (
          <form
            onSubmit={handleAddPatientGoal}
            className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="goal-title-input" className="block text-[11px] font-mono text-slate-400">
                  Wellness Goal Title
                </label>
                <input
                  id="goal-title-input"
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g., Improved sleep quality"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="goal-category-select" className="block text-[11px] font-mono text-slate-400">
                  Clinical Domain
                </label>
                <select
                  id="goal-category-select"
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value as GoalCategory)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="Sleep">Sleep</option>
                  <option value="Autonomic / HRV">Autonomic / HRV</option>
                  <option value="Pain & Mobility">Pain &amp; Mobility</option>
                  <option value="Digestion & Qi">Digestion &amp; Qi</option>
                  <option value="Emotional Shen">Emotional Shen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="goal-date-input" className="block text-[11px] font-mono text-slate-400">
                  Target Review Date
                </label>
                <input
                  id="goal-date-input"
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-7 space-y-1">
                <label htmlFor="goal-target-input" className="block text-[11px] font-mono text-slate-400">
                  Measurable Target Criteria
                </label>
                <input
                  id="goal-target-input"
                  type="text"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="e.g., 75%+ sleep efficiency & zero 1–3 AM awakenings for 2 weeks"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="lg:col-span-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <label htmlFor="goal-initial-progress">Initial Progress</label>
                  <span className="text-teal-400 font-semibold tabular-nums">{newGoalProgress}%</span>
                </div>
                <input
                  id="goal-initial-progress"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={newGoalProgress}
                  onChange={(e) => setNewGoalProgress(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>

              <div className="lg:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newGoalTitle.trim()}
                  className="w-full lg:w-auto px-4 py-1.5 text-xs font-semibold bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Active Patient Goals List with Progress Bars */}
        {activePatientGoals.length === 0 ? (
          <div className="p-5 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              No wellness goals defined yet for {activePatient.name}. Define a measurable goal to track progress together across visits.
            </span>
            <button
              type="button"
              onClick={() => setIsAddingGoal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Add First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activePatientGoals.map((goal) => {
              const isAchieved = goal.progress >= 100;
              const statusLabel = isAchieved
                ? 'Achieved'
                : goal.progress >= 65
                  ? 'On Track'
                  : goal.progress >= 35
                    ? 'In Progress'
                    : 'Early Stage';
              const barColorClass = isAchieved
                ? 'bg-emerald-400'
                : goal.progress >= 65
                  ? 'bg-teal-400'
                  : goal.progress >= 35
                    ? 'bg-amber-400'
                    : 'bg-rose-400';
              const statusTextClass = isAchieved
                ? 'text-emerald-400'
                : goal.progress >= 65
                  ? 'text-teal-400'
                  : goal.progress >= 35
                    ? 'text-amber-400'
                    : 'text-rose-400';

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-100">{goal.title}</h3>
                        <span className={`text-xs font-mono font-semibold flex items-center gap-1 ${statusTextClass}`}>
                          {isAchieved && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          <span>· {statusLabel}</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300">{goal.targetDescription}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">{goal.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px] tabular-nums">Target: {goal.targetDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px] tabular-nums">Updated {goal.updatedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-lg font-bold font-mono tabular-nums ${statusTextClass}`}>
                        {goal.progress}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePatientGoal(goal.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors shrink-0"
                        title="Remove wellness goal"
                        aria-label={`Remove goal ${goal.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${barColorClass}`}
                      style={{ width: `${goal.progress}%` }}
                      role="progressbar"
                      aria-valuenow={goal.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${goal.title} progress`}
                    />
                  </div>

                  {/* Interactive Progress Adjustment Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <label htmlFor={`slider-${goal.id}`} className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        Adjust Progress:
                      </label>
                      <input
                        id={`slider-${goal.id}`}
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={goal.progress}
                        onChange={(e) => handleUpdateGoalProgress(goal.id, Number(e.target.value))}
                        className="w-full accent-teal-400 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateGoalProgress(goal.id, goal.progress - 10)}
                        disabled={goal.progress <= 0}
                        className="px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        -10%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateGoalProgress(goal.id, goal.progress + 10)}
                        disabled={goal.progress >= 100}
                        className="px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-teal-300 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        +10%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateGoalProgress(goal.id, isAchieved ? 80 : 100)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                          isAchieved
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {isAchieved ? 'Reopen (80%)' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODULE: TCM PATTERN DIAGNOSIS EVOLUTION & CONSTITUTIONAL HEALTH TRENDS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                TCM Pattern Diagnoses &amp; Five Element Constitutional Evolution
              </h2>
              <p className="text-xs text-slate-400">Longitudinal tracking of Zang-Fu pattern shifts and elemental balance over time</p>
            </div>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded">
            Constitutional Trajectory
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Five Elements Radar Evolution Chart (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Five Element Shift (Baseline vs Current)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Wu Xing Polygon</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={FIVE_ELEMENT_EVOLUTION}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="element" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Radar name="Baseline (Sep)" dataKey="baseline" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                  <Radar name="Current (Nov)" dataKey="current" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.4} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-400 text-center font-mono pt-1">
              Notice the shift from Wood excess (85% ➔ 50%) and Spleen Earth deficiency (30% ➔ 65%).
            </div>
          </div>

          {/* Pattern Diagnosis Milestone Progression Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-teal-400" /> Historical Diagnosis Milestones &amp; Prescription Progression
              </div>
              <button
                type="button"
                onClick={handleExportLongitudinalHistoryPDF}
                disabled={isExportingPDF}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap shadow-sm disabled:opacity-50"
                title="Download comprehensive longitudinal history PDF report"
              >
                <FileText className="w-3 h-3 text-teal-400" />
                <span>Export History PDF</span>
              </button>
            </div>

            <div className="space-y-3">
              {PATTERN_EVOLUTION_TIMELINE.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border text-xs space-y-2 transition-all ${
                    idx === PATTERN_EVOLUTION_TIMELINE.length - 1
                      ? 'bg-slate-800/80 border-teal-500/60 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold rounded border border-teal-500/30">
                        {item.stage}
                      </span>
                      <span className="text-slate-400 font-mono">{item.date}</span>
                    </div>

                    <span className="text-teal-400 font-mono font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Score: {item.score} / 100
                    </span>
                  </div>

                  <div className="font-bold text-slate-100 text-sm">{item.pattern}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-400 font-mono">Herbal Formula: </span>
                      <span className="text-emerald-400 font-semibold">{item.formula}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Telemetry Snapshot: </span>
                      <span className="text-amber-300 font-mono">{item.keyMetrics}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/60 p-2 rounded border border-slate-800/50">
                    "{item.clinicalShift}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Three.js 3D Anatomy Explorer (Zang-Fu Organ Status & TCM Diagnostic Intensity) */}
      <AnatomyExplorer3D patient={activePatient} />

      {/* Interactive D3.js Meridian Energy Heatmap (12 Primary Channels) */}
      <MeridianEnergyHeatmap patient={activePatient} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: HRV Vagal Recovery Curve */}
        <div
          className={`bg-slate-900/90 border rounded-xl p-5 space-y-4 ${
            hrvAlert?.severity === 'Critical'
              ? 'border-rose-500/50'
              : hrvAlert
                ? 'border-amber-500/40'
                : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-teal-400" /> Heart Rate Variability (HRV - RMSSD in ms)
              </h3>
              <p className="text-[11px] text-slate-400">Vagal autonomic nerve recovery over 6 weeks</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
              {hrvAlert && (
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-semibold flex items-center gap-1 ${
                    hrvAlert.severity === 'Critical'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Live: {liveHrv.toFixed(1)} ms ({hrvDeviationPercent > 0 ? '+' : ''}{hrvDeviationPercent}%)
                </span>
              )}
              <span className="text-teal-400 font-semibold">Target: 35 ms</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[10, 40]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <ReferenceLine y={35} stroke="#0d9488" strokeDasharray="4 4" label={{ value: 'Ideal Vagal Target', fill: '#0d9488', fontSize: 10, position: 'insideTopRight' }} />
                <Line type="monotone" dataKey="hrv" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 4, fill: '#2dd4bf' }} activeDot={{ r: 6 }} name="HRV (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sleep Efficiency & Deep Sleep Hours */}
        <div
          className={`bg-slate-900/90 border rounded-xl p-5 space-y-4 ${
            sleepAlert?.severity === 'Critical'
              ? 'border-rose-500/50'
              : sleepAlert
                ? 'border-amber-500/40'
                : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" /> Sleep Efficiency (%) &amp; Deep Sleep Hours
              </h3>
              <p className="text-[11px] text-slate-400">Circadian organ clock nocturnal recovery</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
              {sleepAlert && (
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-semibold flex items-center gap-1 ${
                    sleepAlert.severity === 'Critical'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Live: {liveSleep.toFixed(1)}% ({sleepDeviationPercent > 0 ? '+' : ''}{sleepDeviationPercent}%)
                </span>
              )}
              <span className="text-amber-400 font-semibold">Target: 80%</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[30, 90]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sleep" stroke="#f59e0b" fillOpacity={1} fill="url(#sleepGrad)" strokeWidth={2.5} name="Sleep Efficiency (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Mood & Shen Harmony Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Smile className="w-4 h-4 text-purple-400" /> Emotional Shen Harmony Score (1-10 Scale)
              </h3>
              <p className="text-[11px] text-slate-400">Liver Qi flow &amp; emotional tranquility</p>
            </div>
            <span className="text-xs font-mono text-purple-400 font-semibold">Scale 1-10</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="mood" fill="#c084fc" radius={[4, 4, 0, 0]} name="Shen Harmony Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Systemic Inflammation & Cortisol Slope Balance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" /> Inflammation (hs-CRP) &amp; Cortisol Balance
              </h3>
              <p className="text-[11px] text-slate-400">hs-CRP mg/L vs Cortisol diurnal index</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Dual Axis</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#f43f5e" tick={{ fontSize: 11 }} domain={[0, 8]} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="hsCRP" fill="#f43f5e" radius={[4, 4, 0, 0]} name="hs-CRP (mg/L)" />
                <Line yAxisId="right" type="monotone" dataKey="cortisolSlope" stroke="#38bdf8" strokeWidth={2.5} name="Cortisol Slope Index" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Clinical Correlation Score Visualization (30-Day TCM Pattern Intensity vs HRV) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Clinical Correlation Score — 30-Day TCM Pattern Intensity vs. HRV
              </h2>
              <p className="text-xs text-slate-400">
                30-day inverse coupling analysis tracking pattern severity resolution alongside autonomic vagal recovery
              </p>
            </div>
          </div>

          {/* Chart Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setCorrelationChartView('trajectory')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                correlationChartView === 'trajectory'
                  ? 'bg-slate-800 text-teal-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30-Day Trajectory
            </button>
            <button
              type="button"
              onClick={() => setCorrelationChartView('scatter')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                correlationChartView === 'scatter'
                  ? 'bg-slate-800 text-teal-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Correlation Scatter
            </button>
          </div>
        </div>

        {/* Quantitative Correlation Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">Clinical Correlation Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
                {correlationStats.correlationScore} / 100
              </span>
              <span className="text-xs text-slate-300 font-medium">{correlationStats.strengthLabel}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">Pearson Coefficient (r)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                {correlationStats.pearsonR}
              </span>
              <span className="text-xs text-slate-400">n = 30 daily readings</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">30-Day Pattern Intensity</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
                {latest30d.patternIntensity}
              </span>
              <span className="text-xs font-mono text-emerald-400 tabular-nums">
                from {first30d.patternIntensity} ({correlationStats.patternDelta} pts)
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono">30-Day Recorded HRV</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                {latest30d.hrv} ms
              </span>
              <span className="text-xs font-mono text-teal-400 tabular-nums">
                from {first30d.hrv} ms (+{correlationStats.hrvDelta} ms)
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Visualization */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {correlationChartView === 'trajectory' ? (
              <ComposedChart data={correlationSeries30d} margin={{ top: 12, right: 16, left: -12, bottom: 4 }}>
                <defs>
                  <linearGradient id="patternIntensityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  interval={4}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#fb7185"
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                  label={{
                    value: 'TCM Pattern Intensity',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 20,
                    fill: '#fb7185',
                    fontSize: 10,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#2dd4bf"
                  tick={{ fontSize: 11 }}
                  domain={[10, 60]}
                  label={{
                    value: 'HRV (ms)',
                    angle: 90,
                    position: 'insideRight',
                    offset: 10,
                    fill: '#2dd4bf',
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Recorded HRV (ms)') return [`${value} ms`, name];
                    if (name === 'TCM Pattern Intensity') return [`${value} / 100`, name];
                    return [`${value}%`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <ReferenceLine
                  yAxisId="right"
                  y={35}
                  stroke="#0d9488"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Target HRV (35 ms)',
                    fill: '#2dd4bf',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="patternIntensity"
                  stroke="#fb7185"
                  strokeWidth={2}
                  fill="url(#patternIntensityGrad)"
                  name="TCM Pattern Intensity"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hrv"
                  stroke="#2dd4bf"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#2dd4bf' }}
                  activeDot={{ r: 5 }}
                  name="Recorded HRV (ms)"
                />
              </ComposedChart>
            ) : (
              <ScatterChart margin={{ top: 12, right: 20, left: -12, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="patternIntensity"
                  name="TCM Pattern Intensity"
                  domain={[15, 95]}
                  stroke="#fb7185"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'TCM Pattern Intensity (0–100)',
                    position: 'insideBottom',
                    offset: -6,
                    fill: '#94a3b8',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="hrv"
                  name="Recorded HRV"
                  unit=" ms"
                  domain={[10, 60]}
                  stroke="#2dd4bf"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'Recorded HRV (ms)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 20,
                    fill: '#2dd4bf',
                    fontSize: 11,
                  }}
                />
                <ZAxis type="number" dataKey="couplingScore" range={[50, 180]} name="Coupling Score" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Recorded HRV') return [`${value} ms`, name];
                    if (name === 'TCM Pattern Intensity') return [`${value} / 100`, name];
                    return [`${value}%`, name];
                  }}
                  labelFormatter={(_, payload) => {
                    const pt = payload?.[0]?.payload as ThirtyDayCorrelationPoint | undefined;
                    return pt ? `${pt.date} (Day ${pt.dayIndex})` : '';
                  }}
                />
                <ReferenceLine y={35} stroke="#0d9488" strokeDasharray="4 4" />
                <Scatter
                  name="Daily Clinical Reading (30 Days)"
                  data={correlationSeries30d}
                  fill="#2dd4bf"
                />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Clinical Diagnostic Correlation Summary Banner */}
        <div className="pt-3 border-t border-slate-800/80 flex items-start gap-3 text-xs">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2 flex-wrap">
              <span>Diagnostic Trend Correlation — {activePatient.name}</span>
              <span className="text-xs font-mono text-teal-400 font-normal">
                · Score {correlationStats.correlationScore}/100 (r = {correlationStats.pearsonR})
              </span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Over the past 30 days, {activePatient.name}&rsquo;s TCM pattern intensity decreased by {Math.abs(correlationStats.patternDelta)} points ({first30d.patternIntensity} to {latest30d.patternIntensity}) while recorded HRV rose by {correlationStats.hrvDelta} ms ({first30d.hrv} ms to {latest30d.hrv} ms), confirming a {correlationStats.strengthLabel.toLowerCase()} trajectory under integrative herbal and frequency therapy.
            </p>
          </div>
        </div>
      </section>

      {/* Live Camera Capture Modal for Patient Profile Photo */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Capture Patient Photo
                </h3>
                <p className="text-xs text-slate-400">
                  {activePatient.name} · Clinical Profile Portrait
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close camera modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {capturedPreview ? (
                <img
                  src={capturedPreview}
                  alt="Captured patient preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-xs text-rose-300 leading-relaxed">{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex flex-col gap-3 pt-1">
              {capturedPreview ? (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPhoto}
                    className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile Photo</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(false)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCaptureFrame}
                      disabled={!isCameraReady}
                      className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Edit Patient Demographics &amp; Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Manual corrections for clinical context
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close edit profile modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="edit-name" className="block font-mono text-slate-400">
                  Patient Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="edit-age" className="block font-mono text-slate-400">
                    Age (Years)
                  </label>
                  <input
                    id="edit-age"
                    type="number"
                    min={1}
                    max={120}
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-slate-100 font-mono tabular-nums"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-gender" className="block font-mono text-slate-400">
                    Gender / Sex
                  </label>
                  <select
                    id="edit-gender"
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-2.5 py-2 text-slate-100"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-occupation" className="block font-mono text-slate-400">
                  Occupation / Lifestyle Context
                </label>
                <input
                  id="edit-occupation"
                  type="text"
                  value={editOccupation}
                  onChange={(e) => setEditOccupation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
