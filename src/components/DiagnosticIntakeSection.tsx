import React, { useState } from 'react';
import { PatientProfile, TonguePulsePresentation, BioMarkers, ElementBalance } from '../types/clinic';
import { PRESET_PATIENTS, PresetPatient } from '../data/mockPatients';
import { Brain, Sparkles, Activity, Layers, User, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

interface DiagnosticIntakeSectionProps {
  onSynthesize: (intake: {
    patientProfile: PatientProfile;
    tonguePulse: TonguePulsePresentation;
    bioMarkers: BioMarkers;
    chiefComplaints: string;
    elementBalance: ElementBalance;
  }) => void;
  isSynthesizing: boolean;
  onSelectPresetPatient: (patient: PresetPatient) => void;
}

export const DiagnosticIntakeSection: React.FC<DiagnosticIntakeSectionProps> = ({
  onSynthesize,
  isSynthesizing,
  onSelectPresetPatient,
}) => {
  // Local state initialized with Elena Vance defaults
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    id: 'pt-101',
    name: 'Elena Vance',
    age: 44,
    gender: 'Female',
    sex: 'Female',
    season: 'Autumn (Metal)',
    occupation: 'Software Engineering Director',
  });

  const [tonguePulse, setTonguePulse] = useState<TonguePulsePresentation>({
    tongue: 'Pale dusky tongue body, thin white coating, scalloped teeth marks on borders',
    pulse: 'Wiry and thready on left Guan (Liver) position, weak at right Cun',
    complexion: 'Sallow, slightly dull skin tone',
    voice: 'Low tone, soft speech with frequent sighing',
  });

  const [bioMarkers, setBioMarkers] = useState<BioMarkers>({
    hrv: '28 ms (RMSSD)',
    cortisol: 'Elevated night (18 nmol/L), flattened diurnal slope',
    crp: '3.4 mg/L',
    microbiome: 'Firmicutes/Bacteroidetes 3.4',
    sleep: '62% Efficiency (Awakens 1:30 AM - 3:00 AM)',
    alphaWave: '7.8 Hz (Suppressed)',
    mitochondrial: '68% Redox Capacity',
    bloodPressure: '128/84 mmHg',
  });

  const [chiefComplaints, setChiefComplaints] = useState<string>(
    'Chronic afternoon brain fog, intercostal fullness, persistent midnight awakening during Liver organ clock hours (1-3 AM), emotional irritability followed by physical exhaustion, muscle tension in neck and upper back.'
  );

  const [elementBalance, setElementBalance] = useState<ElementBalance>({
    wood: 85,
    fire: 45,
    earth: 30,
    metal: 40,
    water: 35,
  });

  const loadPreset = (preset: PresetPatient) => {
    setPatientProfile({
      id: preset.id,
      name: preset.name,
      age: preset.age,
      gender: preset.gender,
      sex: preset.sex,
      season: preset.season,
      occupation: preset.occupation,
    });
    setTonguePulse({
      tongue: preset.tongue,
      pulse: preset.pulse,
      complexion: preset.complexion,
      voice: preset.voice,
    });
    setBioMarkers(preset.bioMarkers);
    setChiefComplaints(preset.chiefComplaints);
    setElementBalance(preset.elementBalance);
    onSelectPresetPatient(preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSynthesize({
      patientProfile,
      tonguePulse,
      bioMarkers,
      chiefComplaints,
      elementBalance,
    });
  };

  return (
    <div className="space-y-8">
      {/* Section Kicker Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Clinical Intake</span>
            <span aria-hidden="true">·</span>
            <span>TCM Pattern Differentiation</span>
            <span aria-hidden="true">·</span>
            <span>Bio-Marker Synthesis</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Integrative Clinical Intake &amp; Bio-Agent Dispatch
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Input traditional tongue/pulse manifestations alongside telemetry bio-markers to generate Maxwell Clinic’s unified 3-part care plan.
          </p>
        </div>

        {/* Quick Load Case Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400 mr-1">Load Preset Case:</span>
          {PRESET_PATIENTS.map((pt) => (
            <button
              key={pt.id}
              type="button"
              onClick={() => loadPreset(pt)}
              className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                patientProfile.name === pt.name
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {pt.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel 1: Patient Profile & Tongue/Pulse */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                1. Patient Profile &amp; Traditional Signs
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientProfile.name}
                  onChange={(e) => setPatientProfile({ ...patientProfile, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={patientProfile.age}
                    onChange={(e) => setPatientProfile({ ...patientProfile, age: parseInt(e.target.value, 10) || 30 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-teal-500 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={patientProfile.gender}
                    onChange={(e) => {
                      const val = e.target.value as PatientProfile['gender'];
                      setPatientProfile({
                        ...patientProfile,
                        gender: val,
                        sex: val === 'Other' ? 'Non-binary' : val,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Season</label>
                  <select
                    value={patientProfile.season}
                    onChange={(e) => setPatientProfile({ ...patientProfile, season: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option>Spring (Wood)</option>
                    <option>Summer (Fire)</option>
                    <option>Late Summer (Earth)</option>
                    <option>Autumn (Metal)</option>
                    <option>Winter (Water)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tongue Presentation (Color, Coating, Sublingual)</label>
                <textarea
                  rows={2}
                  value={tonguePulse.tongue}
                  onChange={(e) => setTonguePulse({ ...tonguePulse, tongue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pulse Qualities (Cun, Guan, Chi Positions)</label>
                <textarea
                  rows={2}
                  value={tonguePulse.pulse}
                  onChange={(e) => setTonguePulse({ ...tonguePulse, pulse: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Complexion &amp; Voice Tone</label>
                <input
                  type="text"
                  value={tonguePulse.complexion}
                  onChange={(e) => setTonguePulse({ ...tonguePulse, complexion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Panel 2: Modern Bio-Markers Telemetry */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                2. Modern Bio-Markers Telemetry
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">HRV (RMSSD)</label>
                <input
                  type="text"
                  value={bioMarkers.hrv}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, hrv: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Salivary Cortisol</label>
                <input
                  type="text"
                  value={bioMarkers.cortisol}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, cortisol: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">hs-CRP (Inflammation)</label>
                <input
                  type="text"
                  value={bioMarkers.crp}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, crp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gut Microbiome</label>
                <input
                  type="text"
                  value={bioMarkers.microbiome}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, microbiome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Sleep Efficiency</label>
                <input
                  type="text"
                  value={bioMarkers.sleep}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, sleep: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">EEG Alpha Power</label>
                <input
                  type="text"
                  value={bioMarkers.alphaWave}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, alphaWave: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mitochondrial Index</label>
                <input
                  type="text"
                  value={bioMarkers.mitochondrial}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, mitochondrial: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={bioMarkers.bloodPressure || '120/80 mmHg'}
                  onChange={(e) => setBioMarkers({ ...bioMarkers, bloodPressure: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-slate-400 mb-1">Chief Complaints &amp; Symptom Presentation</label>
              <textarea
                rows={3}
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Panel 3: Five Elements Balance Scrubbers & Execution Trigger */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  3. Five Elements Dynamic Scrubber
                </h2>
              </div>

              <div className="space-y-3.5 mt-4 text-xs">
                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Wood (Liver / Gallbladder)</span>
                    <span className="text-teal-400 font-bold">{elementBalance.wood}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={elementBalance.wood}
                    onChange={(e) => setElementBalance({ ...elementBalance, wood: parseInt(e.target.value) })}
                    className="w-full accent-teal-500 bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Fire (Heart / Small Intestine)</span>
                    <span className="text-rose-400 font-bold">{elementBalance.fire}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={elementBalance.fire}
                    onChange={(e) => setElementBalance({ ...elementBalance, fire: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Earth (Spleen / Stomach)</span>
                    <span className="text-amber-400 font-bold">{elementBalance.earth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={elementBalance.earth}
                    onChange={(e) => setElementBalance({ ...elementBalance, earth: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Metal (Lungs / Large Intestine)</span>
                    <span className="text-slate-400 font-bold">{elementBalance.metal}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={elementBalance.metal}
                    onChange={(e) => setElementBalance({ ...elementBalance, metal: parseInt(e.target.value) })}
                    className="w-full accent-slate-400 bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-slate-300 mb-1">
                    <span>Water (Kidneys / Bladder)</span>
                    <span className="text-blue-400 font-bold">{elementBalance.water}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={elementBalance.water}
                    onChange={(e) => setElementBalance({ ...elementBalance, water: parseInt(e.target.value) })}
                    className="w-full accent-blue-500 bg-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  Triggers Maxwell Clinic AI engine (Gemini 3.8 Flash) to synthesize Zang-Fu diagnosis, acupuncture energetic focus, botanical formula, and bio-agent dispatch queue.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSynthesizing}
                className="w-full py-3 px-4 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Synthesizing TCM &amp; Bio-Markers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Generate Integrative Care Plan &amp; Dispatch</span>
                    <ChevronRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
