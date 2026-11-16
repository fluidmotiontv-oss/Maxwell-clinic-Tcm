import { BioAgent, FrequencyPreset } from '../types/clinic';

export const BIO_AGENTS: BioAgent[] = [
  {
    id: 'agent-1',
    name: 'Diagnostic Bio-Synthesizer',
    role: 'TCM Zang-Fu & Bio-Marker Correlation Engine',
    status: 'Active Telemetry',
    lastPing: '12s ago',
    assignedModality: 'Pattern Differentiation & Root Cause Analysis',
    activeTaskCount: 3,
    avatarIcon: 'Brain',
  },
  {
    id: 'agent-2',
    name: 'Meridian Telemetry Dispatcher',
    role: 'Acupuncture Energetics & Vagal Nerve Tracker',
    status: 'Active Telemetry',
    lastPing: '4s ago',
    assignedModality: 'Channel Point Mapping & HRV Telemetry',
    activeTaskCount: 2,
    avatarIcon: 'Activity',
  },
  {
    id: 'agent-3',
    name: 'Botanical Formulary Agent',
    role: 'TCM Herbal Pharmacy & Energetic Route Dispatch',
    status: 'Processing Dispatch',
    lastPing: '1m ago',
    assignedModality: 'Herbal Thermology & Drug-Herb Safety',
    activeTaskCount: 5,
    avatarIcon: 'Leaf',
  },
  {
    id: 'agent-4',
    name: 'Frequency Harmonic Audio Agent',
    role: 'Digital Therapeutics & Solfeggio Sound Dispatcher',
    status: 'Syncing App',
    lastPing: 'Just now',
    assignedModality: 'Solfeggio Frequencies & Binaural Beat Entrainment',
    activeTaskCount: 1,
    avatarIcon: 'Headphones',
  },
  {
    id: 'agent-5',
    name: 'Circadian & Progress Tracker',
    role: 'Patient Telemetry & Organ Clock Scheduler',
    status: 'Idle',
    lastPing: '2m ago',
    assignedModality: 'Cortisol Rhythm & Chronobiology Protocol',
    activeTaskCount: 0,
    avatarIcon: 'Clock',
  },
];

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  {
    id: 'freq-1',
    name: '528 Hz - Heart Qi & Cellular Coherence',
    frequency: 528,
    binauralBeat: 6, // Theta
    binauralType: 'Theta 6Hz Vagal Entrainment',
    element: 'Fire',
    description: 'Transformation frequency that promotes cardiac autonomic harmony, alpha-wave synchronization, and reduces stress-induced cortisol.',
    organTarget: 'Heart & Pericardium Channel (11 AM - 1 PM)',
  },
  {
    id: 'freq-2',
    name: '174 Hz - Wood Growth & Tendon Release',
    frequency: 174,
    binauralBeat: 10, // Alpha
    binauralType: 'Alpha 10Hz Muscle Relaxation',
    element: 'Wood',
    description: 'Deep grounding frequency targeting Liver Qi stagnation, tension headaches, and muscular spasms along the Gallbladder channel.',
    organTarget: 'Liver & Gallbladder Channel (1 AM - 3 AM)',
  },
  {
    id: 'freq-3',
    name: '432 Hz - Earth Grounding & Spleen Harmonization',
    frequency: 432,
    binauralBeat: 7.83, // Schumann Resonance
    binauralType: '7.83Hz Schumann Earth Harmonic',
    element: 'Earth',
    description: 'Natural tuning resonance that calms mental worry (Yi), improves digestive blood flow, and fortifies Spleen Qi postprandial balance.',
    organTarget: 'Spleen & Stomach Channel (7 AM - 11 AM)',
  },
  {
    id: 'freq-4',
    name: '639 Hz - Metal Respiration & Immune Clearance',
    frequency: 639,
    binauralBeat: 12, // Low Beta
    binauralType: 'Alpha-Beta 12Hz Mental Clarity',
    element: 'Metal',
    description: 'Harmonizes chest energy, boosts Wei Qi defensive immunity, and aids emotional release of stored grief or pulmonary congestion.',
    organTarget: 'Lung & Large Intestine Channel (3 AM - 7 AM)',
  },
  {
    id: 'freq-5',
    name: '741 Hz - Water Essence & Adrenal Regeneration',
    frequency: 741,
    binauralBeat: 3, // Delta
    binauralType: 'Delta 3Hz Deep Adrenal Repair',
    element: 'Water',
    description: 'Cellular detox and Kidney Essence preservation frequency, restoring depleted adrenal energy and regulating evening cortisol.',
    organTarget: 'Kidney & Bladder Channel (3 PM - 7 PM)',
  },
];
