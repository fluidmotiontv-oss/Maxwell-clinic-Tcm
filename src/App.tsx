import React, { useState } from 'react';
import { TopNavigation, ActiveTab } from './components/TopNavigation';
import { DiagnosticIntakeSection } from './components/DiagnosticIntakeSection';
import { CarePlanDisplay } from './components/CarePlanDisplay';
import { FiveElementsMatrix } from './components/FiveElementsMatrix';
import { MeridianViewer } from './components/MeridianViewer';
import { BioAgentOrchestrator } from './components/BioAgentOrchestrator';
import { DigitalTherapeuticsPlayer } from './components/DigitalTherapeuticsPlayer';
import { PatientOverviewDashboard } from './components/PatientOverviewDashboard';
import { PatientRecords } from './components/PatientRecords';
import { PlantCodexDashboard } from './components/PlantCodexDashboard';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { PRESET_PATIENTS, PresetPatient } from './data/mockPatients';
import { CarePlan, AgenticActionItem, AcupuncturePoint, PatientProfile } from './types/clinic';
import { Brain, Sparkles, MessageSquare, Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('intake');
  const [currentCarePlan, setCurrentCarePlan] = useState<CarePlan | null>(
    PRESET_PATIENTS[0].historicalCarePlan || null
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [customAudioFrequency, setCustomAudioFrequency] = useState<number | undefined>(undefined);
  const [customAudioTitle, setCustomAudioTitle] = useState<string | undefined>(undefined);
  const [dispatchedAgentTasks, setDispatchedAgentTasks] = useState<AgenticActionItem[]>([]);
  const [activePatientProfile, setActivePatientProfile] = useState<PatientProfile>({
    id: PRESET_PATIENTS[0].id,
    name: PRESET_PATIENTS[0].name,
    age: PRESET_PATIENTS[0].age,
    gender: PRESET_PATIENTS[0].gender,
    sex: PRESET_PATIENTS[0].sex,
    season: PRESET_PATIENTS[0].season,
    occupation: PRESET_PATIENTS[0].occupation,
  });
  const [activeIntakeSnapshot, setActiveIntakeSnapshot] = useState<{
    tongue: string;
    pulse: string;
    complexion: string;
    voice: string;
    bioMarkers: PresetPatient['bioMarkers'];
    chiefComplaints: string;
    elementBalance: PresetPatient['elementBalance'];
  } | null>(null);

  // Trigger Care Plan Synthesis via server-side Gemini API
  const handleSynthesizeCarePlan = async (intakeData: any) => {
    setIsSynthesizing(true);
    if (intakeData.patientProfile) {
      setActivePatientProfile(intakeData.patientProfile);
    }
    setActiveIntakeSnapshot({
      tongue: intakeData.tonguePulse?.tongue || '',
      pulse: intakeData.tonguePulse?.pulse || '',
      complexion: intakeData.tonguePulse?.complexion || '',
      voice: intakeData.tonguePulse?.voice || '',
      bioMarkers: intakeData.bioMarkers || PRESET_PATIENTS[0].bioMarkers,
      chiefComplaints: intakeData.chiefComplaints || '',
      elementBalance: intakeData.elementBalance || PRESET_PATIENTS[0].elementBalance,
    });
    try {
      const response = await fetch('/api/gemini/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeData),
      });

      const result = await response.json();
      if (result.success && result.data) {
        const generatedPlan: CarePlan = {
          id: `PLAN-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString().split('T')[0],
          patientName: intakeData.patientProfile?.name || 'Anonymous Patient',
          patientAge: intakeData.patientProfile?.age,
          patientGender: intakeData.patientProfile?.gender || intakeData.patientProfile?.sex,
          constitutionalSummary: result.data.constitutionalSummary,
          integrativeProtocol: result.data.integrativeProtocol,
          agenticActionItems: result.data.agenticActionItems || [],
          safetyDisclaimer:
            result.data.safetyDisclaimer ||
            'All recommendations frame supportive integrative clinical pathways that complement primary medical supervision.',
        };

        setCurrentCarePlan(generatedPlan);
        setActiveTab('careplan');
      } else {
        throw new Error(result.error || 'Synthesis returned no data');
      }
    } catch (err: any) {
      console.error('Care plan synthesis error:', err);
      // Fallback plan if API key is unconfigured or temporary network error occurs
      const fallbackPlan: CarePlan = {
        id: `PLAN-DEMO-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
        patientName: intakeData.patientProfile?.name || 'Elena Vance',
        patientAge: intakeData.patientProfile?.age,
        patientGender: intakeData.patientProfile?.gender || intakeData.patientProfile?.sex,
        constitutionalSummary: {
          tcmPatternDiagnosis: 'Gan Yu Pi Xu (Liver Qi Stagnation with Spleen Qi Deficiency)',
          yinYangBalance: 'Yin Deficiency with Qi Stagnation in Jiao',
          fiveElementDynamic: 'Wood Overacting on Earth (Wood-Earth Dynamic)',
          bioMarkerCorrelation: 'Low HRV (28ms) matches Liver Qi Stagnation; midnight cortisol aligns with Liver Organ Clock (1-3 AM).',
          rootCauseAnalysis: 'Autonomic nervous system imbalance driving chronic hepatic Qi constriction.',
        },
        integrativeProtocol: {
          herbalFormulation: {
            classicFormula: 'Xiao Yao San (Free and Easy Wanderer Powder)',
            keyHerbs: ['Chai Hu (Bupleurum)', 'Dang Gui (Angelica)', 'Bai Zhu (Atractylodes)', 'Suan Zao Ren (Ziziphus)'],
            dosageInstruction: '4g granular extract taken 30m before evening meal.',
          },
          acupuncturePoints: [
            { pointCode: 'LV3', name: 'Taichong', meridian: 'Liver Channel of Foot-Jueyin', clinicalAction: 'Spreads Liver Qi, regulates HRV.' },
            { pointCode: 'ST36', name: 'Zusanli', meridian: 'Stomach Channel of Foot-Yangming', clinicalAction: 'Fortifies Spleen Qi, reduces hs-CRP.' },
            { pointCode: 'SP6', name: 'Sanyinjiao', meridian: 'Spleen Channel of Foot-Taiyin', clinicalAction: 'Nourishes Blood & Yin.' },
          ],
          dietaryTherapy: {
            thermalEnergetics: 'Neutral to slightly warm cooked whole foods.',
            recommendedFoods: ['Steamed sweet potato', 'Lotus seed congee', 'Roasted squash', 'Peppermint tea'],
            foodsToAvoid: ['Iced drinks', 'Greasy fried food', 'Refined sugar'],
          },
          digitalTherapeutics: {
            frequencyHz: 174,
            frequencyName: '174Hz Wood Spreading & Vagal Release',
            binauralBeat: '6 Hz Theta Wave',
            circadianRecommendation: 'Blue light blockade after 8:30 PM.',
            breathworkPattern: '4-7-8 Relaxing Vagal Breath',
          },
        },
        agenticActionItems: [
          { agentName: 'Diagnostic Bio-Synthesizer', taskType: 'Telemetry Track', actionDescription: 'Monitor continuous RMSSD HRV recovery stream.', priority: 'High', status: 'Pending' },
          { agentName: 'Botanical Formulary Agent', taskType: 'Pharmacy Order', actionDescription: 'Route Xiao Yao San extract to clinic dispensary.', priority: 'High', status: 'Pending' },
        ],
        safetyDisclaimer: 'All recommendations complement medical care under clinical supervision.',
      };
      setCurrentCarePlan(fallbackPlan);
      setActiveTab('careplan');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePlayFrequency = (freqHz: number, title: string) => {
    setCustomAudioFrequency(freqHz);
    setCustomAudioTitle(title);
    setActiveTab('audio');
  };

  const handleDispatchAgentTask = (task: AgenticActionItem) => {
    setDispatchedAgentTasks((prev) => [...prev, { ...task, status: 'Dispatched' }]);
  };

  const handleAppendPointPrescription = (point: AcupuncturePoint) => {
    if (currentCarePlan) {
      const exists = currentCarePlan.integrativeProtocol.acupuncturePoints.some(
        (p) => p.pointCode === point.pointCode
      );
      if (!exists) {
        const updatedPoints = [...currentCarePlan.integrativeProtocol.acupuncturePoints, point];
        setCurrentCarePlan({
          ...currentCarePlan,
          integrativeProtocol: {
            ...currentCarePlan.integrativeProtocol,
            acupuncturePoints: updatedPoints,
          },
        });
      }
    } else {
      const newPlan: CarePlan = {
        id: `PLAN-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString().split('T')[0],
        patientName: 'Elena Vance',
        constitutionalSummary: {
          tcmPatternDiagnosis: 'Targeted Acupoint Prescription Protocol',
          yinYangBalance: 'Balanced via Meridian Neuromodulation',
          fiveElementDynamic: 'Jing-Luo Harmonization',
          bioMarkerCorrelation: 'Direct vagal and neural reflex activation.',
          rootCauseAnalysis: 'Acupoint stimulation for autonomic regulation.',
        },
        integrativeProtocol: {
          herbalFormulation: {
            classicFormula: 'Standard Integrative Decoction',
            keyHerbs: ['Chai Hu', 'Dang Gui', 'Huang Qi'],
            dosageInstruction: 'Take as directed.',
          },
          acupuncturePoints: [point],
          dietaryTherapy: {
            thermalEnergetics: 'Neutral',
            recommendedFoods: ['Warm broths', 'Root vegetables'],
            foodsToAvoid: ['Processed sugars'],
          },
          digitalTherapeutics: {
            frequencyHz: 528,
            frequencyName: '528Hz DNA Repair & Harmonization',
            binauralBeat: '6 Hz Theta',
            circadianRecommendation: 'Align with solar noon.',
            breathworkPattern: 'Box Breathing',
          },
        },
        agenticActionItems: [
          { agentName: 'Acupuncture Coordinator', taskType: 'Protocol Log', actionDescription: `Appended ${point.pointCode} (${point.name}) to active protocol.`, priority: 'High', status: 'Pending' }
        ],
        safetyDisclaimer: 'All recommendations complement medical supervision.',
      };
      setCurrentCarePlan(newPlan);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewIntakeClick={() => setActiveTab('intake')}
        isSynthesizing={isSynthesizing}
      />

      {/* Hero Visual Banner (Only shown on Intake or Care Plan main view) */}
      {(activeTab === 'intake' || activeTab === 'careplan') && (
        <div className="relative border-b border-slate-800 bg-slate-900 overflow-hidden h-44 sm:h-52">
          <img
            src="/src/assets/images/maxwell_hero_bg_1794461554990.jpg"
            alt="Maxwell Clinic Laboratory Telemetry"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
                <HeartPulse className="w-4 h-4 text-teal-400" />
                <span>INTEGRATIVE CLINICAL ENGINE v4.2</span>
                <span aria-hidden="true">·</span>
                <span>MAXWELL CLINIC OPERATIONS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 max-w-2xl">
                Traditional Chinese Medicine Diagnostics &amp; Autonomous Bio-Agent Workflows
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                Bridging Yin/Yang pattern differentiation, acupuncture energetics, organ clocks, and frequency therapeutics with server-side AI intelligence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'intake' && (
          <DiagnosticIntakeSection
            onSynthesize={handleSynthesizeCarePlan}
            isSynthesizing={isSynthesizing}
            onSelectPresetPatient={(preset) => {
              setActivePatientProfile({
                id: preset.id,
                name: preset.name,
                age: preset.age,
                gender: preset.gender,
                sex: preset.sex,
                season: preset.season,
                occupation: preset.occupation,
              });
              setActiveIntakeSnapshot(null);
              if (preset.historicalCarePlan) {
                setCurrentCarePlan(preset.historicalCarePlan);
              }
            }}
          />
        )}

        {activeTab === 'careplan' && currentCarePlan && (
          <CarePlanDisplay
            carePlan={currentCarePlan}
            existingMedications={
              PRESET_PATIENTS.find((p) => p.name === currentCarePlan.patientName)?.existingMedications ||
              ['Warfarin 5mg daily', 'Lisinopril 10mg daily']
            }
            previousCarePlans={
              PRESET_PATIENTS.find((p) => p.name === currentCarePlan.patientName)?.previousCarePlans ||
              (PRESET_PATIENTS[0].previousCarePlans || [])
            }
            onSelectCarePlanFromHistory={(plan) => {
              setCurrentCarePlan(plan);
            }}
            onDispatchAgentTask={handleDispatchAgentTask}
            onPlayFrequency={handlePlayFrequency}
          />
        )}

        {activeTab === 'careplan' && !currentCarePlan && (
          <div className="text-center py-16 space-y-4">
            <Brain className="w-12 h-12 text-teal-400 mx-auto" />
            <h2 className="text-lg font-bold">No Active Care Plan Selected</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please complete a clinical intake or load a preset patient to generate an integrative care plan.
            </p>
            <button
              onClick={() => setActiveTab('intake')}
              className="px-4 py-2 text-xs font-bold bg-teal-400 text-slate-950 rounded-lg"
            >
              Start Clinical Intake
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <PatientOverviewDashboard
            selectedPatient={(() => {
              const matchedPreset = PRESET_PATIENTS.find(
                (p) => p.id === activePatientProfile.id || p.name === activePatientProfile.name
              );
              const basePatient: PresetPatient = matchedPreset
                ? {
                    ...matchedPreset,
                    name: activePatientProfile.name || matchedPreset.name,
                    age: activePatientProfile.age ?? currentCarePlan?.patientAge ?? matchedPreset.age,
                    gender:
                      (activePatientProfile.gender as PresetPatient['gender']) ??
                      (currentCarePlan?.patientGender as PresetPatient['gender']) ??
                      matchedPreset.gender,
                    sex:
                      (activePatientProfile.sex as PresetPatient['sex']) ??
                      matchedPreset.sex,
                    occupation: activePatientProfile.occupation || matchedPreset.occupation,
                    season: activePatientProfile.season || matchedPreset.season,
                  }
                : {
                    ...PRESET_PATIENTS[0],
                    id: activePatientProfile.id || PRESET_PATIENTS[0].id,
                    name: activePatientProfile.name || currentCarePlan?.patientName || PRESET_PATIENTS[0].name,
                    age: activePatientProfile.age ?? currentCarePlan?.patientAge ?? PRESET_PATIENTS[0].age,
                    gender:
                      (activePatientProfile.gender as PresetPatient['gender']) ||
                      (currentCarePlan?.patientGender as PresetPatient['gender']) ||
                      PRESET_PATIENTS[0].gender,
                    sex: activePatientProfile.sex || 'Female',
                    season: activePatientProfile.season || PRESET_PATIENTS[0].season,
                    occupation: activePatientProfile.occupation || 'Integrative Care Patient',
                  };

              if (activeIntakeSnapshot && basePatient.name === activePatientProfile.name) {
                return {
                  ...basePatient,
                  ...activeIntakeSnapshot,
                };
              }
              return basePatient;
            })()}
            onSelectPatient={(patient) => {
              setActiveIntakeSnapshot(null);
              setActivePatientProfile({
                id: patient.id,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                sex: patient.sex,
                season: patient.season,
                occupation: patient.occupation,
              });
              if (patient.historicalCarePlan) {
                setCurrentCarePlan({
                  ...patient.historicalCarePlan,
                  patientName: patient.name,
                  patientAge: patient.age,
                  patientGender: patient.gender || patient.sex,
                });
              }
            }}
          />
        )}

        {activeTab === 'fiveelements' && (
          <FiveElementsMatrix onPlayFrequency={handlePlayFrequency} />
        )}

        {activeTab === 'meridians' && (
          <MeridianViewer
            elementBalance={
              PRESET_PATIENTS.find((p) => p.name === currentCarePlan?.patientName)?.elementBalance || {
                wood: 85,
                fire: 45,
                earth: 30,
                metal: 40,
                water: 35,
              }
            }
            onSelectPointForCarePlan={(pt: AcupuncturePoint) => {
              handleAppendPointPrescription(pt);
              setActiveTab('careplan');
            }}
            onAppendPointPrescription={handleAppendPointPrescription}
          />
        )}

        {activeTab === 'bioagents' && (
          <BioAgentOrchestrator customDispatchedTasks={dispatchedAgentTasks} />
        )}

        {activeTab === 'audio' && (
          <DigitalTherapeuticsPlayer
            initialFrequency={customAudioFrequency}
            initialTitle={customAudioTitle}
          />
        )}

        {activeTab === 'patients' && (
          <PatientRecords
            activeCarePlan={currentCarePlan}
            onLoadPatientIntake={(preset: PresetPatient) => {
              if (preset.historicalCarePlan) {
                setCurrentCarePlan(preset.historicalCarePlan);
              }
              setActiveTab('intake');
            }}
            onViewCarePlan={(plan: CarePlan) => {
              setCurrentCarePlan(plan);
              setActiveTab('careplan');
            }}
          />
        )}

        {activeTab === 'codex' && <PlantCodexDashboard />}
      </main>

      {/* Floating AI Clinical Copilot Drawer Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="px-4 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-full shadow-xl shadow-teal-500/25 flex items-center gap-2 border border-teal-200 transition-transform hover:scale-105"
        >
          <Brain className="w-4.5 h-4.5 text-slate-950" />
          <span>Consult AI Copilot</span>
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>

      {/* AI Clinical Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentPatientName={currentCarePlan?.patientName || 'Elena Vance'}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Maxwell Clinic Operations Engine</span>
            <span aria-hidden="true">·</span>
            <span>Integrative TCM &amp; Bio-Agent Therapeutics</span>
          </div>
          <div className="text-[11px]">
            Powered by Google GenAI (Server-Side @google/genai SDK)
          </div>
        </div>
      </footer>
    </div>
  );
}
