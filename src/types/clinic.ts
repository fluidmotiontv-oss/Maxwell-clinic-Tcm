export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary' | 'Other';
  sex?: 'Female' | 'Male' | 'Non-binary';
  season: 'Spring (Wood)' | 'Summer (Fire)' | 'Late Summer (Earth)' | 'Autumn (Metal)' | 'Winter (Water)';
  occupation?: string;
}

export interface TonguePulsePresentation {
  tongue: string; // e.g. "Pale with thin white coating, scalloped edges"
  pulse: string; // e.g. "Wiry, thready, rapid at left Guan position"
  complexion: string;
  voice: string;
}

export interface BioMarkers {
  hrv: string; // e.g. "32 ms (RMSSD)"
  cortisol: string; // e.g. "Elevated morning 24 nmol/L"
  crp: string; // e.g. "2.8 mg/L"
  microbiome: string; // e.g. "Firmicutes/Bacteroidetes 3.1"
  sleep: string; // e.g. "68% Efficiency"
  alphaWave: string; // e.g. "8.2 Hz (Suppressed)"
  mitochondrial: string; // e.g. "72% Redox Rate"
  bloodPressure?: string;
}

export interface ElementBalance {
  wood: number; // 0 - 100
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface AcupuncturePoint {
  pointCode: string; // e.g. "LV3"
  name: string; // e.g. "Taichong"
  meridian: string; // e.g. "Liver Channel of Foot-Jueyin"
  clinicalAction: string;
  location?: string;
}

export interface HerbalFormulation {
  classicFormula: string;
  keyHerbs: string[];
  dosageInstruction: string;
}

export interface DietaryTherapy {
  thermalEnergetics: string;
  recommendedFoods: string[];
  foodsToAvoid: string[];
}

export interface DigitalTherapeuticsSpec {
  frequencyHz: number;
  frequencyName: string;
  binauralBeat: string;
  circadianRecommendation: string;
  breathworkPattern: string;
}

export interface ConstitutionalSummary {
  tcmPatternDiagnosis: string;
  yinYangBalance: string;
  fiveElementDynamic: string;
  bioMarkerCorrelation: string;
  rootCauseAnalysis: string;
}

export interface AgenticActionItem {
  id?: string;
  agentName: string;
  taskType: string;
  actionDescription: string;
  priority: 'High' | 'Medium' | 'Routine';
  status?: 'Pending' | 'Dispatched' | 'Completed';
  timestamp?: string;
}

export interface CarePlan {
  id: string;
  createdAt: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  constitutionalSummary: ConstitutionalSummary;
  integrativeProtocol: {
    herbalFormulation: HerbalFormulation;
    acupuncturePoints: AcupuncturePoint[];
    dietaryTherapy: DietaryTherapy;
    digitalTherapeutics: DigitalTherapeuticsSpec;
  };
  agenticActionItems: AgenticActionItem[];
  safetyDisclaimer: string;
}

export interface BioAgent {
  id: string;
  name: string;
  role: string;
  status: 'Idle' | 'Active Telemetry' | 'Processing Dispatch' | 'Syncing App';
  lastPing: string;
  assignedModality: string;
  activeTaskCount: number;
  avatarIcon: string;
}

export interface FrequencyPreset {
  id: string;
  name: string;
  frequency: number;
  binauralBeat: number;
  binauralType: string;
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water' | 'Universal';
  description: string;
  organTarget: string;
}
