import React, { useState, useMemo } from 'react';
import { PRESET_PATIENTS, PresetPatient } from '../data/mockPatients';
import { CarePlan } from '../types/clinic';
import {
  User,
  Activity,
  FileText,
  Search,
  Plus,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Download,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  EncryptedEnvelope,
  encryptClinicalText,
  decryptClinicalText,
  isWebCryptoAvailable,
} from '../utils/clinicalCrypto';

interface PatientRecordsProps {
  onLoadPatientIntake: (patient: PresetPatient) => void;
  onViewCarePlan: (plan: CarePlan) => void;
  activeCarePlan?: CarePlan | null;
}

interface DiagnosticSnapshot {
  id: string;
  recordedAt: string;
  stageLabel: string;
  tcmImpression: string;
  tongue: string;
  pulse: string;
  complexion: string;
  voice: string;
  metrics: {
    hrv: string;
    crp: string;
    sleep: string;
    cortisol: string;
    alphaWave: string;
  };
  elementBalance: PresetPatient['elementBalance'];
  clinicalNotes: string;
}

const PROGRESS_NOTES_STORAGE_KEY = 'maxwell_clinician_progress_notes_v1';
const QUICK_NOTES_LOG_KEY = 'maxwell_patient_quick_notes_log_v1';
const PATIENT_GOALS_STORAGE_KEY = 'maxwell_patient_goals_v1';

const buildDiagnosticSnapshotsForPatient = (patient: PresetPatient): DiagnosticSnapshot[] => {
  if (patient.id === 'pt-101') {
    return [
      {
        id: `${patient.id}-snap-1`,
        recordedAt: '2026-09-01',
        stageLabel: 'Baseline Intake Snapshot',
        tcmImpression: 'Severe Gan Yu with Stagnant Heat & Spleen Qi Deficiency',
        tongue: 'Dusky red lateral edges, thicker yellow-white central coat, pronounced teeth marks.',
        pulse: 'Tight, rapid wiry pulse at left Guan; weak/soggy at right Guan.',
        complexion: 'Markedly sallow complexion with pronounced periorbital shadowing.',
        voice: 'Frequent sighing, pressed cadence.',
        metrics: {
          hrv: '18 ms (Severe suppression)',
          crp: '5.6 mg/L',
          sleep: '45% Sleep Efficiency (Awakens 1:15 AM - 3:30 AM)',
          cortisol: 'Inverted evening surge (26 nmol/L)',
          alphaWave: '6.9 Hz',
        },
        elementBalance: { wood: 94, fire: 58, earth: 24, metal: 34, water: 28 },
        clinicalNotes: 'Initial intake triggered by refractory 1-3 AM awakening and tension migraines.',
      },
      {
        id: `${patient.id}-snap-2`,
        recordedAt: '2026-10-12',
        stageLabel: 'Mid-Protocol Reassessment',
        tcmImpression: 'Gan Yu Pi Xu (Resolving Stagnant Heat; Residual Spleen Qi Deficiency)',
        tongue: 'Pale dusky body, thinning white coat, reduced lateral redness.',
        pulse: 'Wiry left Guan softening; right Cun remains slightly thin.',
        complexion: 'Improved mid-cheek tone; milder periorbital fatigue.',
        voice: 'Calmer respiratory pacing.',
        metrics: {
          hrv: '22 ms (Early vagal rebound)',
          crp: '4.8 mg/L',
          sleep: '52% Sleep Efficiency (1.2h deep sleep)',
          cortisol: 'Moderating night curve (21 nmol/L)',
          alphaWave: '7.4 Hz',
        },
        elementBalance: { wood: 89, fire: 51, earth: 27, metal: 38, water: 32 },
        clinicalNotes: 'Chai Hu Shu Gan San cleared acute heat irritability; transitioned toward Xiao Yao San.',
      },
      {
        id: `${patient.id}-snap-3`,
        recordedAt: '2026-11-04',
        stageLabel: 'Current Clinical Snapshot',
        tcmImpression: 'Liver Qi Stagnation with Spleen Qi Deficiency (Stabilizing)',
        tongue: patient.tongue,
        pulse: patient.pulse,
        complexion: patient.complexion,
        voice: patient.voice,
        metrics: {
          hrv: patient.bioMarkers.hrv,
          crp: patient.bioMarkers.crp,
          sleep: patient.bioMarkers.sleep,
          cortisol: patient.bioMarkers.cortisol,
          alphaWave: patient.bioMarkers.alphaWave,
        },
        elementBalance: patient.elementBalance,
        clinicalNotes: 'Significant reduction in intercostal tension and hs-CRP; continuing 174Hz vagal audio entrainment.',
      },
    ];
  }

  if (patient.id === 'pt-102') {
    return [
      {
        id: `${patient.id}-snap-1`,
        recordedAt: '2026-09-15',
        stageLabel: 'Baseline Intake Snapshot',
        tcmImpression: 'Severe Kidney Yin Exhaustion with Blazing Heart Fire (Xin Shen Bu Jiao)',
        tongue: 'Scarlet dry body with deep central fissures and blistered red tip.',
        pulse: 'Rapid surging superficial pulse; thready and absent on deep Kidney Chi.',
        complexion: 'Pronounced malar flush with dry orbital skin.',
        voice: 'Dry, hoarse rapid cadence.',
        metrics: {
          hrv: '15 ms (Critical vagal deficit)',
          crp: '6.2 mg/L',
          sleep: '40% Sleep Efficiency (Night sweats 2-4 AM)',
          cortisol: 'Elevated 24h burden (36 nmol/L evening)',
          alphaWave: '6.1 Hz',
        },
        elementBalance: { wood: 55, fire: 94, earth: 30, metal: 26, water: 16 },
        clinicalNotes: 'Chronic deadline overwork depleted Kidney Essence causing unanchored Heart Fire.',
      },
      {
        id: `${patient.id}-snap-2`,
        recordedAt: '2026-10-28',
        stageLabel: 'Current Clinical Snapshot',
        tcmImpression: 'Heart Fire Excess & Kidney Water Deficiency (Improving)',
        tongue: patient.tongue,
        pulse: patient.pulse,
        complexion: patient.complexion,
        voice: patient.voice,
        metrics: {
          hrv: patient.bioMarkers.hrv,
          crp: patient.bioMarkers.crp,
          sleep: patient.bioMarkers.sleep,
          cortisol: patient.bioMarkers.cortisol,
          alphaWave: patient.bioMarkers.alphaWave,
        },
        elementBalance: patient.elementBalance,
        clinicalNotes: 'Nocturnal sweating frequency down 35% after kidney yin nourishing regimen.',
      },
    ];
  }

  return [
    {
      id: `${patient.id}-snap-1`,
      recordedAt: '2026-09-20',
      stageLabel: 'Baseline Intake Snapshot',
      tcmImpression: 'Spleen Qi Weakness with Phlegm-Damp Accumulation',
      tongue: 'Swollen pale body with thick, sticky white-yellow coat.',
      pulse: 'Soft, slippery, slightly sluggish.',
      complexion: 'Puffy pale facial tone.',
      voice: 'Low volume, heavy vocal quality.',
      metrics: {
        hrv: '32 ms',
        crp: '3.1 mg/L',
        sleep: '65% Sleep Efficiency (Morning heaviness)',
        cortisol: 'Blunted morning awakening response',
        alphaWave: '8.3 Hz',
      },
      elementBalance: { wood: 42, fire: 38, earth: 91, metal: 42, water: 46 },
      clinicalNotes: 'Reported heavy limb fatigue and post-prandial lethargy.',
    },
    {
      id: `${patient.id}-snap-2`,
      recordedAt: '2026-11-02',
      stageLabel: 'Current Clinical Snapshot',
      tcmImpression: 'Resolving Earth Dampness & Restored Spleen Transformation',
      tongue: patient.tongue,
      pulse: patient.pulse,
      complexion: patient.complexion,
      voice: patient.voice,
      metrics: {
        hrv: patient.bioMarkers.hrv,
        crp: patient.bioMarkers.crp,
        sleep: patient.bioMarkers.sleep,
        cortisol: patient.bioMarkers.cortisol,
        alphaWave: patient.bioMarkers.alphaWave,
      },
      elementBalance: patient.elementBalance,
      clinicalNotes: 'Digestive bloating substantially improved; HRV stabilized above 40 ms threshold.',
    },
  ];
};

const getConsolidatedCarePlansForPatient = (
  patient: PresetPatient,
  activeCarePlan?: CarePlan | null
): CarePlan[] => {
  const byId = new Map<string, CarePlan>();

  if (
    activeCarePlan &&
    activeCarePlan.patientName.toLowerCase() === patient.name.toLowerCase()
  ) {
    byId.set(activeCarePlan.id, activeCarePlan);
  }
  if (patient.historicalCarePlan) {
    if (!byId.has(patient.historicalCarePlan.id)) {
      byId.set(patient.historicalCarePlan.id, patient.historicalCarePlan);
    }
  }
  for (const plan of patient.previousCarePlans || []) {
    if (!byId.has(plan.id)) {
      byId.set(plan.id, plan);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
};

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  onLoadPatientIntake,
  onViewCarePlan,
  activeCarePlan,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<PresetPatient>(PRESET_PATIENTS[0]);

  // Export State
  const [isExportPdfBusy, setIsExportPdfBusy] = useState<boolean>(false);
  const [isEncryptedExportOpen, setIsEncryptedExportOpen] = useState<boolean>(false);
  const [exportPassphrase, setExportPassphrase] = useState<string>('');
  const [confirmPassphrase, setConfirmPassphrase] = useState<string>('');
  const [showPassphrase, setShowPassphrase] = useState<boolean>(false);
  const [includeLocalEncryptedNotes, setIncludeLocalEncryptedNotes] = useState<boolean>(true);
  const [exportStatusBanner, setExportStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isEncryptingJson, setIsEncryptingJson] = useState<boolean>(false);
  const [lastVerifiedEnvelope, setLastVerifiedEnvelope] = useState<{
    filename: string;
    envelope: EncryptedEnvelope;
    snapshotCount: number;
    carePlanCount: number;
  } | null>(null);
  const [verifyPassphraseInput, setVerifyPassphraseInput] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const filteredPatients = PRESET_PATIENTS.filter(
    (pt) =>
      pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.chiefComplaints.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.occupation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const diagnosticSnapshots = useMemo(
    () => buildDiagnosticSnapshotsForPatient(selectedPatient),
    [selectedPatient]
  );

  const consolidatedCarePlans = useMemo(
    () => getConsolidatedCarePlansForPatient(selectedPatient, activeCarePlan),
    [selectedPatient, activeCarePlan]
  );

  const getLocalPatientRecordsSummary = (patientId: string) => {
    let progressNotes: any[] = [];
    let quickNotes: any[] = [];
    let goals: any[] = [];
    try {
      const savedNotes = localStorage.getItem(PROGRESS_NOTES_STORAGE_KEY);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        progressNotes = Array.isArray(parsed[patientId]) ? parsed[patientId] : [];
      }
    } catch {
      progressNotes = [];
    }
    try {
      const savedQuick = localStorage.getItem(QUICK_NOTES_LOG_KEY);
      if (savedQuick) {
        const parsed = JSON.parse(savedQuick);
        quickNotes = Array.isArray(parsed[patientId]) ? parsed[patientId] : [];
      }
    } catch {
      quickNotes = [];
    }
    try {
      const savedGoals = localStorage.getItem(PATIENT_GOALS_STORAGE_KEY);
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        goals = Array.isArray(parsed[patientId]) ? parsed[patientId] : [];
      }
    } catch {
      goals = [];
    }
    return { progressNotes, quickNotes, goals };
  };

  const buildFullLongitudinalPayload = () => {
    const localExtras = getLocalPatientRecordsSummary(selectedPatient.id);
    return {
      schemaVersion: '2.0',
      exportType: 'MAXWELL_CLINIC_LONGITUDINAL_CLINICAL_HISTORY',
      exportedAt: new Date().toISOString(),
      clinic: 'Maxwell Clinic — Integrative Clinical AI Operations Engine',
      patientProfile: {
        id: selectedPatient.id,
        name: selectedPatient.name,
        age: selectedPatient.age,
        gender: selectedPatient.gender || selectedPatient.sex,
        sex: selectedPatient.sex,
        season: selectedPatient.season,
        occupation: selectedPatient.occupation,
        chiefComplaints: selectedPatient.chiefComplaints,
        existingMedications: selectedPatient.existingMedications,
        currentElementBalance: selectedPatient.elementBalance,
      },
      diagnosticSnapshots,
      carePlans: consolidatedCarePlans,
      clinicianRecords: includeLocalEncryptedNotes
        ? {
            encryptedProgressNotesCount: localExtras.progressNotes.length,
            encryptedProgressNotes: localExtras.progressNotes,
            quickObservationLogs: localExtras.quickNotes,
            patientGoals: localExtras.goals,
          }
        : undefined,
    };
  };

  const handleExportLongitudinalPDF = () => {
    setIsExportPdfBusy(true);
    setExportStatusBanner(null);

    try {
      const payload = buildFullLongitudinalPayload();
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = 18;

      const ensureSpace = (neededMm: number) => {
        if (y + neededMm > pageHeight - 18) {
          doc.addPage();
          y = 18;
        }
      };

      const writeWrapped = (text: string, fontSize = 9, color: [number, number, number] = [51, 65, 85], indent = 0) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        for (const line of lines) {
          ensureSpace(5);
          doc.text(line, margin + indent, y);
          y += 4.3;
        }
      };

      const writeSectionTitle = (title: string) => {
        ensureSpace(14);
        y += 3;
        doc.setFillColor(240, 253, 250);
        doc.setDrawColor(20, 184, 166);
        doc.rect(margin, y, contentWidth, 7.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 118, 110);
        doc.text(title.toUpperCase(), margin + 3, y + 5.2);
        y += 11;
      };

      // Title Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(45, 212, 191);
      doc.text('MAXWELL CLINIC — FULL LONGITUDINAL CLINICAL RECORD', margin, 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `Patient: ${selectedPatient.name} (${selectedPatient.id.toUpperCase()}) · Generated: ${new Date().toLocaleString()}`,
        margin,
        20
      );
      doc.text(
        `Includes ${diagnosticSnapshots.length} Diagnostic Snapshots & ${consolidatedCarePlans.length} Care Plans`,
        margin,
        25.5
      );
      y = 38;

      // Section 1: Patient Profile & Demographics
      writeSectionTitle('1. Patient Clinical Profile & Medications');
      writeWrapped(
        `Name: ${selectedPatient.name}   |   Age: ${selectedPatient.age} yrs   |   Gender: ${selectedPatient.gender || selectedPatient.sex}   |   Occupation: ${selectedPatient.occupation}`,
        9.5,
        [15, 23, 42]
      );
      writeWrapped(`Constitutional Season: ${selectedPatient.season}`, 9);
      writeWrapped(`Chief Complaints: ${selectedPatient.chiefComplaints}`, 9);
      writeWrapped(
        `Existing Medications: ${selectedPatient.existingMedications.length > 0 ? selectedPatient.existingMedications.join(', ') : 'None documented'}`,
        9
      );
      writeWrapped(
        `Current Five Elements Balance — Wood: ${selectedPatient.elementBalance.wood} · Fire: ${selectedPatient.elementBalance.fire} · Earth: ${selectedPatient.elementBalance.earth} · Metal: ${selectedPatient.elementBalance.metal} · Water: ${selectedPatient.elementBalance.water}`,
        8.5,
        [15, 118, 110]
      );

      // Section 2: Longitudinal Diagnostic Snapshots
      writeSectionTitle(`2. Longitudinal Diagnostic Snapshots (${diagnosticSnapshots.length})`);
      diagnosticSnapshots.forEach((snap, idx) => {
        ensureSpace(34);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Snapshot #${idx + 1}: ${snap.stageLabel} (${snap.recordedAt})`, margin, y);
        y += 4.8;
        writeWrapped(`TCM Pattern Impression: ${snap.tcmImpression}`, 9, [15, 118, 110], 3);
        writeWrapped(`Tongue: ${snap.tongue}`, 8.5, [51, 65, 85], 3);
        writeWrapped(`Pulse: ${snap.pulse}`, 8.5, [51, 65, 85], 3);
        writeWrapped(
          `Bio-Markers — HRV: ${snap.metrics.hrv} | hs-CRP: ${snap.metrics.crp} | Sleep: ${snap.metrics.sleep} | Alpha Wave: ${snap.metrics.alphaWave}`,
          8.5,
          [30, 41, 59],
          3
        );
        writeWrapped(`Cortisol Rhythm: ${snap.metrics.cortisol}`, 8.5, [71, 85, 105], 3);
        writeWrapped(`Clinical Note: ${snap.clinicalNotes}`, 8.5, [71, 85, 105], 3);
        y += 2;
      });

      // Section 3: Care Plans History
      writeSectionTitle(`3. Care Plans Archive (${consolidatedCarePlans.length})`);
      if (consolidatedCarePlans.length === 0) {
        writeWrapped('No structured care plans archived for this patient yet.', 9);
      } else {
        consolidatedCarePlans.forEach((plan, idx) => {
          ensureSpace(44);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`Care Plan #${idx + 1}: ${plan.id.toUpperCase()} — Created ${plan.createdAt}`, margin, y);
          y += 4.8;
          writeWrapped(`Pattern Diagnosis: ${plan.constitutionalSummary.tcmPatternDiagnosis}`, 9, [15, 118, 110], 3);
          writeWrapped(`Yin-Yang & Five Element Dynamic: ${plan.constitutionalSummary.yinYangBalance} | ${plan.constitutionalSummary.fiveElementDynamic}`, 8.5, [51, 65, 85], 3);
          writeWrapped(`Bio-Marker Correlation: ${plan.constitutionalSummary.bioMarkerCorrelation}`, 8.5, [51, 65, 85], 3);
          writeWrapped(`Herbal Formula: ${plan.integrativeProtocol.herbalFormulation.classicFormula}`, 8.5, [15, 23, 42], 3);
          writeWrapped(`Key Herbs: ${plan.integrativeProtocol.herbalFormulation.keyHerbs.join('; ')}`, 8.5, [51, 65, 85], 3);
          writeWrapped(`Dosage: ${plan.integrativeProtocol.herbalFormulation.dosageInstruction}`, 8.5, [51, 65, 85], 3);
          writeWrapped(
            `Acupoints: ${plan.integrativeProtocol.acupuncturePoints.map((pt) => `${pt.pointCode} ${pt.name} (${pt.clinicalAction})`).join(' | ')}`,
            8.5,
            [51, 65, 85],
            3
          );
          writeWrapped(
            `Digital Therapeutics: ${plan.integrativeProtocol.digitalTherapeutics.frequencyHz}Hz (${plan.integrativeProtocol.digitalTherapeutics.frequencyName}) · ${plan.integrativeProtocol.digitalTherapeutics.binauralBeat} · ${plan.integrativeProtocol.digitalTherapeutics.breathworkPattern}`,
            8.5,
            [51, 65, 85],
            3
          );
          y += 2.5;
        });
      }

      // Section 4: Clinician Observations & Goals
      if (payload.clinicianRecords) {
        const { encryptedProgressNotesCount, quickObservationLogs, patientGoals } = payload.clinicianRecords;
        if (encryptedProgressNotesCount > 0 || quickObservationLogs.length > 0 || patientGoals.length > 0) {
          writeSectionTitle('4. Clinician Progress Notes & Patient Goals');
          writeWrapped(
            `Encrypted Progress Vault Entries On File: ${encryptedProgressNotesCount} (AES-256-GCM ciphertext retained safely in vault)`,
            8.5
          );
          quickObservationLogs.forEach((obs: any) => {
            writeWrapped(`[${obs.timestamp}] ${obs.text}`, 8.5, [51, 65, 85], 3);
          });
          patientGoals.forEach((g: any) => {
            writeWrapped(`Goal (${g.category} — ${g.progress}%): ${g.title} — ${g.targetDescription}`, 8.5, [51, 65, 85], 3);
          });
        }
      }

      // Page footers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'Confidential Medical Record — Maxwell Clinic Master Patient Directory Export',
          margin,
          pageHeight - 8
        );
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }

      const slug = selectedPatient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `maxwell-clinic-longitudinal-record-${slug}-${dateStr}.pdf`;
      doc.save(filename);

      setExportStatusBanner({
        type: 'success',
        message: `Exported PDF report "${filename}" with ${diagnosticSnapshots.length} diagnostic snapshots and ${consolidatedCarePlans.length} care plans.`,
      });
    } catch (err: any) {
      setExportStatusBanner({
        type: 'error',
        message: err?.message || 'Unable to generate PDF report.',
      });
    } finally {
      setIsExportPdfBusy(false);
    }
  };

  const handleOpenEncryptedJsonModal = () => {
    setExportStatusBanner(null);
    setVerifyResult(null);
    setLastVerifiedEnvelope(null);
    setExportPassphrase('');
    setConfirmPassphrase('');
    setVerifyPassphraseInput('');
    setIsEncryptedExportOpen(true);
  };

  const handleExportEncryptedJSON = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyResult(null);

    if (!isWebCryptoAvailable()) {
      setExportStatusBanner({
        type: 'error',
        message: 'Browser Web Crypto API is unavailable. Secure AES-256-GCM encryption requires a secure context.',
      });
      return;
    }

    if (exportPassphrase.trim().length < 6) {
      setExportStatusBanner({
        type: 'error',
        message: 'Passphrase must be at least 6 characters to protect clinical PHI.',
      });
      return;
    }

    if (exportPassphrase !== confirmPassphrase) {
      setExportStatusBanner({
        type: 'error',
        message: 'Passphrase confirmation does not match.',
      });
      return;
    }

    setIsEncryptingJson(true);
    try {
      const payload = buildFullLongitudinalPayload();
      const plaintext = JSON.stringify(payload, null, 2);
      const envelope = await encryptClinicalText(plaintext, exportPassphrase);

      const wrappedExport = {
        schemaVersion: '2.0',
        exportFormat: 'MAXWELL_ENCRYPTED_CLINICAL_ARCHIVE',
        encryptionStandard: 'AES-256-GCM (PBKDF2-SHA256 · 100,000 iterations)',
        exportedAt: payload.exportedAt,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        includedCounts: {
          diagnosticSnapshots: diagnosticSnapshots.length,
          carePlans: consolidatedCarePlans.length,
          progressNotes: payload.clinicianRecords?.encryptedProgressNotesCount ?? 0,
        },
        encryptedPayload: envelope,
      };

      const jsonOut = JSON.stringify(wrappedExport, null, 2);
      const blob = new Blob([jsonOut], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const slug = selectedPatient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `maxwell-clinic-longitudinal-${slug}-${dateStr}.encrypted.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastVerifiedEnvelope({
        filename,
        envelope,
        snapshotCount: diagnosticSnapshots.length,
        carePlanCount: consolidatedCarePlans.length,
      });
      setExportStatusBanner({
        type: 'success',
        message: `Encrypted JSON archive "${filename}" downloaded cleanly (${diagnosticSnapshots.length} snapshots, ${consolidatedCarePlans.length} care plans sealed with AES-256-GCM).`,
      });
    } catch (err: any) {
      setExportStatusBanner({
        type: 'error',
        message: err?.message || 'Encryption failed.',
      });
    } finally {
      setIsEncryptingJson(false);
    }
  };

  const handleVerifyDecryptArchive = async () => {
    if (!lastVerifiedEnvelope) return;
    try {
      const decrypted = await decryptClinicalText(lastVerifiedEnvelope.envelope, verifyPassphraseInput);
      const parsed = JSON.parse(decrypted);
      setVerifyResult({
        ok: true,
        message: `Verified integrity: decrypted ${parsed.diagnosticSnapshots?.length ?? 0} diagnostic snapshots & ${parsed.carePlans?.length ?? 0} care plans for ${parsed.patientProfile?.name}.`,
      });
    } catch {
      setVerifyResult({
        ok: false,
        message: 'Verification failed: incorrect passphrase or corrupted ciphertext.',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Patient Records</span>
            <span aria-hidden="true">·</span>
            <span>Bio-Marker Telemetry History</span>
            <span aria-hidden="true">·</span>
            <span>TCM Pattern Progress</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Maxwell Clinic Master Patient Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Review historical intake profiles, diagnostic snapshots, longitudinal telemetry trends, and export complete care plan histories.
          </p>
        </div>
      </div>

      {/* Export Status Notification */}
      {exportStatusBanner && (
        <div
          className={`rounded-xl px-4 py-3 border text-xs flex items-center justify-between gap-3 ${
            exportStatusBanner.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {exportStatusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{exportStatusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportStatusBanner(null)}
            className="p-1 text-slate-400 hover:text-slate-200"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Directory Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" /> Directory ({filteredPatients.length})
            </h2>
            <span className="text-[11px] font-mono text-teal-400">Master Registry</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-2 text-xs">
            {filteredPatients.map((pt) => {
              const isSelected = selectedPatient.id === pt.id;
              return (
                <div
                  key={pt.id}
                  onClick={() => {
                    setSelectedPatient(pt);
                    setExportStatusBanner(null);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-1 ${
                    isSelected
                      ? 'bg-slate-800 border-teal-500/60 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{pt.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {pt.age}y / {pt.gender || pt.sex}
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-400 font-mono">{pt.season}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{pt.chiefComplaints}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-teal-400">
                  PATIENT RECORD #{selectedPatient.id.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-0.5">{selectedPatient.name}</h2>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  {selectedPatient.age} years old · {selectedPatient.gender || selectedPatient.sex} · {selectedPatient.occupation}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenEncryptedJsonModal}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 hover:border-teal-400 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  title="Encrypt and download full longitudinal clinical history (all diagnostic snapshots & care plans) as AES-256-GCM JSON"
                >
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Export Encrypted JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportLongitudinalPDF}
                  disabled={isExportPdfBusy}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-teal-500/50 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                  title="Download full longitudinal history (all diagnostic snapshots & care plans) as a multi-page clinical PDF report"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isExportPdfBusy ? 'Generating PDF...' : 'Export History PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLoadPatientIntake(selectedPatient)}
                  className="px-3.5 py-2 text-xs font-semibold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Load Intake &amp; Re-Synthesize</span>
                </button>
              </div>
            </div>

            {/* Tongue & Pulse Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                <div className="text-[11px] font-mono text-teal-400 uppercase">Tongue Presentation:</div>
                <p className="text-slate-200 leading-relaxed font-mono">{selectedPatient.tongue}</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                <div className="text-[11px] font-mono text-amber-400 uppercase">Pulse Presentation:</div>
                <p className="text-slate-200 leading-relaxed font-mono">{selectedPatient.pulse}</p>
              </div>
            </div>

            {/* Telemetry Bio-Markers Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" /> Telemetry Bio-Markers Snapshot
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Tabular Telemetry</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">HRV (RMSSD)</div>
                  <div className="text-sm font-bold font-mono text-teal-300 mt-1 tabular-nums">{selectedPatient.bioMarkers.hrv}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">hs-CRP</div>
                  <div className="text-sm font-bold font-mono text-rose-300 mt-1 tabular-nums">{selectedPatient.bioMarkers.crp}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Sleep Efficiency</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-1 tabular-nums">{selectedPatient.bioMarkers.sleep}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Alpha Wave Power</div>
                  <div className="text-sm font-bold font-mono text-purple-300 mt-1 tabular-nums">{selectedPatient.bioMarkers.alphaWave}</div>
                </div>
              </div>
            </div>

            {/* Longitudinal Diagnostic Snapshots Archive */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" /> Past Diagnostic Snapshots ({diagnosticSnapshots.length})
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Included in Full History Exports</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {diagnosticSnapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span className="font-mono font-bold text-slate-200 tabular-nums">{snap.recordedAt}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-700 text-teal-300">
                          {snap.stageLabel}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        HRV: {snap.metrics.hrv.split(' ')[0]} ms · hs-CRP: {snap.metrics.crp}
                      </span>
                    </div>
                    <div className="text-slate-200 font-medium">{snap.tcmImpression}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{snap.clinicalNotes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Consolidated Care Plans History */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> Archived &amp; Active Care Plans ({consolidatedCarePlans.length})
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Chronological Protocol History</span>
              </div>

              {consolidatedCarePlans.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-400">
                  No historical care plans archived yet. Click &ldquo;Load Intake &amp; Re-Synthesize&rdquo; to generate a structured protocol.
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {consolidatedCarePlans.map((plan, index) => (
                    <div
                      key={plan.id}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="font-mono font-bold text-slate-100">{plan.id.toUpperCase()}</span>
                          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                            ({plan.createdAt})
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-teal-500/15 border border-teal-500/40 text-teal-300">
                              Latest Protocol
                            </span>
                          )}
                        </div>
                        <div className="text-slate-200 font-medium">
                          {plan.constitutionalSummary.tcmPatternDiagnosis}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Formula: {plan.integrativeProtocol.herbalFormulation.classicFormula} ·{' '}
                          {plan.integrativeProtocol.digitalTherapeutics.frequencyHz}Hz
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onViewCarePlan(plan)}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 transition-colors flex items-center gap-1 font-medium whitespace-nowrap shrink-0"
                      >
                        <span>View Plan</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AES-256-GCM Encrypted JSON Export Modal */}
      {isEncryptedExportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/15 border border-teal-500/40 text-teal-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Export AES-256-GCM Encrypted Archive
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedPatient.name} · {diagnosticSnapshots.length} Diagnostic Snapshots &amp; {consolidatedCarePlans.length} Care Plans
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEncryptedExportOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close encrypted export modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExportEncryptedJSON} className="space-y-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-300">
                <div className="font-mono text-teal-300 font-semibold">
                  Cryptographic Specification:
                </div>
                <p>
                  Web Crypto <span className="font-mono text-slate-100">AES-256-GCM</span> authenticated encryption with <span className="font-mono text-slate-100">PBKDF2-SHA256</span> key derivation (100,000 iterations, random 128-bit salt &amp; 96-bit IV). Plaintext clinical records never leave the browser unencrypted.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="export-passphrase" className="block font-mono text-slate-300">
                  Encryption Passphrase (min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    id="export-passphrase"
                    type={showPassphrase ? 'text' : 'password'}
                    value={exportPassphrase}
                    onChange={(e) => setExportPassphrase(e.target.value)}
                    placeholder="Enter strong clinician passphrase..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg pl-3 pr-9 py-2 text-slate-100 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase((v) => !v)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                    aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-passphrase" className="block font-mono text-slate-300">
                  Confirm Passphrase
                </label>
                <input
                  id="confirm-passphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-enter passphrase..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3 py-2 text-slate-100 font-mono"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeLocalEncryptedNotes}
                  onChange={(e) => setIncludeLocalEncryptedNotes(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-400 focus:ring-teal-500"
                />
                <span>Include locally stored observation logs, goals &amp; encrypted progress vault entries</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEncryptedExportOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isEncryptingJson}
                  className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEncryptingJson ? 'Encrypting Archive...' : 'Encrypt & Download JSON'}</span>
                </button>
              </div>
            </form>

            {/* Optional Post-Export Decryption Verification Panel */}
            {lastVerifiedEnvelope && (
              <div className="pt-3 border-t border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Archive Sealed: {lastVerifiedEnvelope.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={verifyPassphraseInput}
                    onChange={(e) => setVerifyPassphraseInput(e.target.value)}
                    placeholder="Optional: verify passphrase decrypt..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded px-2.5 py-1.5 text-slate-100 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDecryptArchive}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded text-[11px] font-medium whitespace-nowrap"
                  >
                    Verify Decrypt
                  </button>
                </div>
                {verifyResult && (
                  <div
                    className={`text-[11px] px-2.5 py-1.5 rounded border ${
                      verifyResult.ok
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {verifyResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
