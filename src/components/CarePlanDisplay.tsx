import React, { useState, useEffect } from 'react';
import { CarePlan, AgenticActionItem } from '../types/clinic';
import { performSafetyCheck, ContraindicationAlert } from '../utils/safetyChecker';
import { Brain, Activity, Leaf, Headphones, ShieldAlert, CheckCircle2, Send, Printer, Download, Sparkles, Clock, History, TrendingUp, Calendar, ChevronRight, FileText, FileSpreadsheet, Save, Check, AlertTriangle, Pill, GitBranch, Edit3, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

interface PractitionerVersion {
  versionId: string;
  label: string;
  updatedAt: string;
  modifiedBy: string;
  changeSummary: string;
  plan: CarePlan;
}

const VERSIONS_STORAGE_KEY = 'maxwell_careplan_practitioner_versions_v1';

interface CarePlanDisplayProps {
  carePlan: CarePlan;
  existingMedications?: string[];
  previousCarePlans?: CarePlan[];
  onSelectCarePlanFromHistory?: (plan: CarePlan) => void;
  onDispatchAgentTask?: (task: AgenticActionItem) => void;
  onPlayFrequency?: (freqHz: number, freqName: string) => void;
}

export const CarePlanDisplay: React.FC<CarePlanDisplayProps> = ({
  carePlan,
  existingMedications = ['Warfarin 5mg daily', 'Lisinopril 10mg daily'],
  previousCarePlans = [],
  onSelectCarePlanFromHistory,
  onDispatchAgentTask,
  onPlayFrequency,
}) => {
  const [dispatchedTasks, setDispatchedTasks] = useState<Record<string, boolean>>({});
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingLongitudinalPDF, setIsExportingLongitudinalPDF] = useState<boolean>(false);

  // Practitioner Rich-Text Clinical Notes State
  const [notesState, setNotesState] = useState<Record<string, string>>({
    'plan-101': 'Patient reports 45% reduction in morning tension headaches after 5 days on Xiao Yao San & 174Hz Wood sound protocol.\n[PULSE UPDATE] Left Guan wiry quality softening. Tongue coat thinning at posterior root.\n[FOLLOW-UP] Continue 174Hz sound therapy during 1-3 AM Organ Clock window.',
  });
  const [currentNote, setCurrentNote] = useState<string>(
    notesState[carePlan.id] || 'Patient reports steady progress under current integrative protocol. Enter observational clinical annotations here...'
  );
  const [isSavedNote, setIsSavedNote] = useState<boolean>(false);

  // Version History State: 'ai' (Original AI Synthesis) vs 'practitioner' (Modified Practitioner Versions)
  const [originalSnapshots, setOriginalSnapshots] = useState<Record<string, CarePlan>>(() => ({
    [carePlan.id]: carePlan,
  }));

  const [practitionerVersionsMap, setPractitionerVersionsMap] = useState<Record<string, PractitionerVersion[]>>(() => {
    try {
      const saved = localStorage.getItem(VERSIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage read error
    }
    return {
      'plan-101': [
        {
          versionId: 'v2-practitioner-101',
          label: 'v2 · Clinical Review',
          updatedAt: '2026-11-05 09:40',
          modifiedBy: 'Dr. Maxwell, L.Ac.',
          changeSummary: 'Substituted Dang Gui with Shu Di Huang + Bai Shao due to Warfarin 5mg interaction; reduced evening dosage window.',
          plan: {
            ...carePlan,
            constitutionalSummary: {
              ...carePlan.constitutionalSummary,
              tcmPatternDiagnosis:
                'Liver Qi Stagnation with Spleen Qi Deficiency & Blood Nourishment Focus (Practitioner Adjusted)',
            },
            integrativeProtocol: {
              ...carePlan.integrativeProtocol,
              herbalFormulation: {
                classicFormula: 'Xiao Yao San (Modified — Coumarin-Free) + Suan Zao Ren Tang',
                keyHerbs: [
                  'Chai Hu (Bupleurum) - Cool/Spreading',
                  'Bai Shao (White Peony Root) - Cool/Nourish Liver Blood',
                  'Shu Di Huang (Prepared Rehmannia) - Warm/Blood & Yin',
                  'Bai Zhu (Atractylodes) - Warm/Spleen Tonifying',
                  'Suan Zao Ren (Ziziphus Seed) - Neutral/Calm Shen',
                ],
                dosageInstruction:
                  'Take 3.5g coumarin-free granular extract 2.5 hours apart from Warfarin, before evening meal.',
              },
            },
          },
        },
      ],
    };
  });

  const [versionMode, setVersionMode] = useState<'ai' | 'practitioner'>('ai');
  const [selectedPractitionerIdx, setSelectedPractitionerIdx] = useState<number>(0);
  const [isEditingVersion, setIsEditingVersion] = useState<boolean>(false);

  // Revision editor draft fields
  const [editDiagnosis, setEditDiagnosis] = useState<string>(carePlan.constitutionalSummary?.tcmPatternDiagnosis || '');
  const [editFormula, setEditFormula] = useState<string>(carePlan.integrativeProtocol?.herbalFormulation?.classicFormula || '');
  const [editDosage, setEditDosage] = useState<string>(carePlan.integrativeProtocol?.herbalFormulation?.dosageInstruction || '');
  const [editChangeNote, setEditChangeNote] = useState<string>('');

  // Persist practitioner versions
  useEffect(() => {
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(practitionerVersionsMap));
    } catch {
      // Ignore storage write errors
    }
  }, [practitionerVersionsMap]);

  // Capture immutable original AI snapshot when a new carePlan.id is encountered
  useEffect(() => {
    setOriginalSnapshots((prev) => {
      if (prev[carePlan.id]) return prev;
      return { ...prev, [carePlan.id]: carePlan };
    });
    setCurrentNote(
      notesState[carePlan.id] ||
        'Patient reports steady progress under current integrative protocol. Enter observational clinical annotations here...'
    );
    setIsSavedNote(false);
    setSelectedPractitionerIdx(0);
    setIsEditingVersion(false);
  }, [carePlan.id]);

  // If carePlan prop receives external modifications (e.g. appended acupoints from MeridianViewer),
  // keep original snapshot immutable and auto-record a practitioner version if points changed
  useEffect(() => {
    const orig = originalSnapshots[carePlan.id];
    if (!orig) return;
    const origCount = orig.integrativeProtocol?.acupuncturePoints?.length || 0;
    const currCount = carePlan.integrativeProtocol?.acupuncturePoints?.length || 0;
    if (currCount > origCount) {
      const existing = practitionerVersionsMap[carePlan.id] || [];
      const latestCurrCodes = carePlan.integrativeProtocol.acupuncturePoints.map((p) => p.pointCode).join(',');
      const alreadyRecorded = existing.some(
        (v) => v.plan.integrativeProtocol.acupuncturePoints.map((p) => p.pointCode).join(',') === latestCurrCodes
      );
      if (!alreadyRecorded) {
        const nextNum = existing.length + 2;
        const newVer: PractitionerVersion = {
          versionId: `v${nextNum}-${Date.now()}`,
          label: `v${nextNum} · Acupoint Update`,
          updatedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          modifiedBy: 'Dr. Maxwell, L.Ac.',
          changeSummary: `Updated acupuncture point prescription (${currCount} points active).`,
          plan: carePlan,
        };
        setPractitionerVersionsMap((prev) => ({
          ...prev,
          [carePlan.id]: [newVer, ...(prev[carePlan.id] || [])],
        }));
        setVersionMode('practitioner');
        setSelectedPractitionerIdx(0);
      }
    }
  }, [carePlan]);

  const originalPlan = originalSnapshots[carePlan.id] || carePlan;
  const practitionerVersions = practitionerVersionsMap[carePlan.id] || [];
  const activePractitionerVersion = practitionerVersions[selectedPractitionerIdx] || practitionerVersions[0];

  const displayedPlan: CarePlan =
    versionMode === 'practitioner' && activePractitionerVersion
      ? activePractitionerVersion.plan
      : originalPlan;

  const handleOpenRevisionEditor = () => {
    setEditDiagnosis(displayedPlan.constitutionalSummary?.tcmPatternDiagnosis || '');
    setEditFormula(displayedPlan.integrativeProtocol?.herbalFormulation?.classicFormula || '');
    setEditDosage(displayedPlan.integrativeProtocol?.herbalFormulation?.dosageInstruction || '');
    setEditChangeNote('');
    setIsEditingVersion(true);
  };

  const handleSavePractitionerRevision = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = practitionerVersions.length + 2;
    const revisedPlan: CarePlan = {
      ...displayedPlan,
      constitutionalSummary: {
        ...displayedPlan.constitutionalSummary,
        tcmPatternDiagnosis: editDiagnosis.trim() || displayedPlan.constitutionalSummary.tcmPatternDiagnosis,
      },
      integrativeProtocol: {
        ...displayedPlan.integrativeProtocol,
        herbalFormulation: {
          ...displayedPlan.integrativeProtocol.herbalFormulation,
          classicFormula: editFormula.trim() || displayedPlan.integrativeProtocol.herbalFormulation.classicFormula,
          dosageInstruction: editDosage.trim() || displayedPlan.integrativeProtocol.herbalFormulation.dosageInstruction,
        },
      },
    };

    const newVersion: PractitionerVersion = {
      versionId: `v${nextNum}-${Date.now()}`,
      label: `v${nextNum} · Practitioner Edit`,
      updatedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      modifiedBy: 'Dr. Maxwell, L.Ac.',
      changeSummary:
        editChangeNote.trim() ||
        'Modified TCM pattern synthesis, herbal formulation, and dosage instructions after clinical evaluation.',
      plan: revisedPlan,
    };

    setPractitionerVersionsMap((prev) => ({
      ...prev,
      [carePlan.id]: [newVersion, ...(prev[carePlan.id] || [])],
    }));
    setVersionMode('practitioner');
    setSelectedPractitionerIdx(0);
    setIsEditingVersion(false);
  };

  // Run automated safety check against currently displayed version
  const safetyAlerts: ContraindicationAlert[] = performSafetyCheck(
    displayedPlan.integrativeProtocol?.herbalFormulation,
    existingMedications
  );

  const handleDispatch = (task: AgenticActionItem, index: number) => {
    setDispatchedTasks((prev) => ({ ...prev, [index]: true }));
    if (onDispatchAgentTask) {
      onDispatchAgentTask(task);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveNote = () => {
    setNotesState((prev) => ({ ...prev, [carePlan.id]: currentNote }));
    setIsSavedNote(true);
    setTimeout(() => setIsSavedNote(false), 2000);
  };

  const insertTag = (tagText: string) => {
    setCurrentNote((prev) => `${prev}\n${tagText} `);
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 15;

      const darkBg = [15, 23, 42];

      // Header Banner Box
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(10, 10, pageWidth - 20, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('MAXWELL CLINIC — INTEGRATIVE CARE PLAN', 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136);
      doc.text(`PATIENT: ${displayedPlan.patientName.toUpperCase()}  |  ID: ${displayedPlan.id}  |  DATE: ${displayedPlan.createdAt}`, 15, 26);

      y = 42;

      // Helper function for adding section titles
      const addSectionTitle = (title: string, subtitle: string) => {
        if (y > pageHeight - 35) {
          doc.addPage();
          y = 20;
        }
        doc.setFillColor(241, 245, 249);
        doc.rect(10, y - 5, pageWidth - 20, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 13, y + 1.5);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, pageWidth - 15, y + 1.5, { align: 'right' });
        y += 12;
      };

      // Helper for multi-line text blocks
      const addTextBlock = (label: string, text: string) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(label, 13, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(text, pageWidth - 26);
        doc.text(splitText, 13, y);
        y += splitText.length * 4.2 + 4;
      };

      // SECTION 1: Constitutional & Pattern Summary
      addSectionTitle('1. CONSTITUTIONAL & PATTERN SUMMARY', 'TCM Diagnostics & Bio-Markers');

      const cs = displayedPlan.constitutionalSummary;
      addTextBlock('TCM Pattern Diagnosis:', cs?.tcmPatternDiagnosis || 'N/A');
      addTextBlock('Yin/Yang & Five Element Dynamic:', `Yin/Yang: ${cs?.yinYangBalance} | Dynamic: ${cs?.fiveElementDynamic}`);
      addTextBlock('Bio-Marker & Telemetry Correlation:', cs?.bioMarkerCorrelation || 'N/A');
      addTextBlock('Root Cause Analysis:', cs?.rootCauseAnalysis || 'N/A');

      // SECTION 2: Integrative Therapeutics Protocol
      addSectionTitle('2. INTEGRATIVE THERAPEUTICS PROTOCOL', 'Herbs, Acupoints & Digital Sound');

      const ip = displayedPlan.integrativeProtocol;
      addTextBlock('Herbal Medicine Formulation:', `${ip?.herbalFormulation?.classicFormula}\nKey Herbs: ${ip?.herbalFormulation?.keyHerbs?.join(', ')}\nDosage: ${ip?.herbalFormulation?.dosageInstruction}`);

      if (y > pageHeight - 40) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Precision Acupuncture Channels & Points:', 13, y);
      y += 5;

      ip?.acupuncturePoints?.forEach((pt) => {
        if (y > pageHeight - 20) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136);
        doc.text(`• [${pt.pointCode}] ${pt.name} (${pt.meridian}):`, 15, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const ptLines = doc.splitTextToSize(pt.clinicalAction, pageWidth - 32);
        doc.text(ptLines, 18, y);
        y += ptLines.length * 3.8 + 2;
      });

      y += 2;
      addTextBlock('Dietary Energetics:', `Energetic Focus: ${ip?.dietaryTherapy?.thermalEnergetics}\nRecommended: ${ip?.dietaryTherapy?.recommendedFoods?.join(', ')}\nContraindicated: ${ip?.dietaryTherapy?.foodsToAvoid?.join(', ')}`);

      addTextBlock('Digital Therapeutics & Sound Healing:', `Frequency: ${ip?.digitalTherapeutics?.frequencyHz}Hz (${ip?.digitalTherapeutics?.frequencyName})\nBinaural Beat: ${ip?.digitalTherapeutics?.binauralBeat}\nOrgan Clock Alignment: ${ip?.digitalTherapeutics?.circadianRecommendation}\nBreathwork: ${ip?.digitalTherapeutics?.breathworkPattern}`);

      // SECTION 3: Bio-Agent Action Items
      addSectionTitle('3. AUTOMATED BIO-AGENT ACTION ITEMS', 'Clinic Agentic Routing');

      carePlan.agenticActionItems?.forEach((item, i) => {
        if (y > pageHeight - 20) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Task ${i + 1}: ${item.agentName} (${item.priority} Priority) — ${item.taskType}`, 13, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const taskLines = doc.splitTextToSize(item.actionDescription, pageWidth - 26);
        doc.text(taskLines, 15, y);
        y += taskLines.length * 3.8 + 3;
      });

      // SECTION 4: Automated Safety & Contraindication Check
      if (safetyAlerts.length > 0) {
        addSectionTitle('4. AUTOMATED SAFETY & DRUG-HERB CONTRAINDICATION CHECK', 'Pharmacological Cross-Reference');
        safetyAlerts.forEach((alert) => {
          addTextBlock(`[${alert.severity.toUpperCase()} SEVERITY] Herb: ${alert.herb} vs Med: ${alert.medication}`, `${alert.interactionType}\nDescription: ${alert.description}\nRecommendation: ${alert.clinicalRecommendation}`);
        });
      }

      // SECTION 5: Practitioner Clinical Notes
      if (currentNote) {
        addSectionTitle('5. PRACTITIONER OBSERVATIONAL NOTES', 'Dr. Maxwell Clinical Sign-Off');
        addTextBlock('Clinical Annotations:', currentNote);
      }

      // Disclaimer Footer
      if (y > pageHeight - 25) { doc.addPage(); y = 20; }
      doc.setDrawColor(203, 213, 225);
      doc.line(10, y, pageWidth - 10, y);
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const disclaimerLines = doc.splitTextToSize(
        carePlan.safetyDisclaimer || 'Maxwell Clinic Governance: All recommendations frame supportive integrative clinical pathways that complement primary medical supervision.',
        pageWidth - 26
      );
      doc.text(disclaimerLines, 13, y);

      const fileName = `Maxwell_Clinic_Care_Plan_${carePlan.patientName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportLongitudinalHistoryPDF = () => {
    setIsExportingLongitudinalPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 15;

      const darkBg = [15, 23, 42];

      // Header Banner Box
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(10, 10, pageWidth - 20, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('MAXWELL CLINIC — LONGITUDINAL CARE PLAN HISTORY', 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136);
      doc.text(`PATIENT: ${carePlan.patientName.toUpperCase()}  |  TOTAL PROTOCOLS CONSOLIDATED: ${1 + previousCarePlans.length}`, 15, 26);

      y = 42;

      const addSectionTitle = (title: string, subtitle: string) => {
        if (y > pageHeight - 35) {
          doc.addPage();
          y = 20;
        }
        doc.setFillColor(241, 245, 249);
        doc.rect(10, y - 5, pageWidth - 20, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 13, y + 1.5);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, pageWidth - 15, y + 1.5, { align: 'right' });
        y += 12;
      };

      const addTextBlock = (label: string, text: string) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(label, 13, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(text, pageWidth - 26);
        doc.text(splitText, 13, y);
        y += splitText.length * 3.8 + 3;
      };

      const allPlans = [carePlan, ...previousCarePlans];

      allPlans.forEach((plan, index) => {
        addSectionTitle(`PROTOCOL #${allPlans.length - index}: ${plan.createdAt} (${plan.id})`, `Patient: ${plan.patientName}`);

        addTextBlock('TCM Pattern Diagnosis:', plan.constitutionalSummary?.tcmPatternDiagnosis || 'N/A');
        addTextBlock('Yin/Yang & Five Element Dynamic:', `Yin/Yang: ${plan.constitutionalSummary?.yinYangBalance} | Dynamic: ${plan.constitutionalSummary?.fiveElementDynamic}`);
        addTextBlock('Herbal Formulation:', `${plan.integrativeProtocol?.herbalFormulation?.classicFormula} — Herbs: ${plan.integrativeProtocol?.herbalFormulation?.keyHerbs?.join(', ')}`);
        
        const points = plan.integrativeProtocol?.acupuncturePoints?.map(p => `${p.pointCode} (${p.name})`).join(', ') || 'N/A';
        addTextBlock('Prescribed Acupuncture Points:', points);
        
        addTextBlock('Root Cause & Telemetry:', plan.constitutionalSummary?.rootCauseAnalysis || 'N/A');
        y += 4;
      });

      doc.save(`${carePlan.patientName.replace(/\s+/g, '_')}_Longitudinal_CarePlan_History.pdf`);
    } catch (err) {
      console.error('Longitudinal PDF export error:', err);
    } finally {
      setIsExportingLongitudinalPDF(false);
    }
  };

  const handleExportCSV = () => {
    const escapeCsv = (value: string | number | undefined | null): string => {
      const str = value === undefined || value === null ? '' : String(value);
      const clean = str.replace(/\r?\n|\r/g, ' ').trim();
      return `"${clean.replace(/"/g, '""')}"`;
    };

    const rows: Array<[string, string, string, string, string]> = [
      ['Care Plan Metadata', 'Overview', 'Care Plan ID', displayedPlan.id, `Created ${displayedPlan.createdAt} (${versionMode === 'practitioner' && activePractitionerVersion ? activePractitionerVersion.label : 'Original AI Synthesis'})`],
      ['Care Plan Metadata', 'Overview', 'Patient Name', displayedPlan.patientName, 'Active Clinical Protocol'],
      ['Care Plan Metadata', 'Overview', 'Existing Medications', existingMedications.join('; ') || 'None reported', 'Profile Cross-Reference'],
    ];

    const cs = displayedPlan.constitutionalSummary;
    if (cs) {
      rows.push(['1. Constitutional Summary', 'Diagnosis', 'TCM Pattern Diagnosis', cs.tcmPatternDiagnosis, 'Zang-Fu & Eight Principles']);
      rows.push(['1. Constitutional Summary', 'Balance', 'Yin/Yang & Qi/Blood', cs.yinYangBalance, 'Energetic Balance']);
      rows.push(['1. Constitutional Summary', 'Five Elements', 'Wu Xing Dynamic', cs.fiveElementDynamic, 'Elemental Interaction']);
      rows.push(['1. Constitutional Summary', 'Bio-Markers', 'Physiological Correlation', cs.bioMarkerCorrelation, 'Lab & Wearable Mapping']);
      rows.push(['1. Constitutional Summary', 'Etiology', 'Root Cause Analysis', cs.rootCauseAnalysis, 'Systemic Synthesis']);
    }

    const ip = displayedPlan.integrativeProtocol;
    if (ip?.herbalFormulation) {
      rows.push(['2. Integrative Protocol', 'Herbal Formulation', 'Classic Formula', ip.herbalFormulation.classicFormula, ip.herbalFormulation.dosageInstruction]);
      (ip.herbalFormulation.keyHerbs || []).forEach((herb, idx) => {
        rows.push(['2. Integrative Protocol', 'Key Herb', `Herb #${idx + 1}`, herb, ip.herbalFormulation.classicFormula]);
      });
    }

    if (ip?.acupuncturePoints) {
      ip.acupuncturePoints.forEach((pt) => {
        rows.push(['2. Integrative Protocol', 'Acupoint Prescription', pt.pointCode, `${pt.name} (${pt.meridian})`, pt.clinicalAction]);
      });
    }

    if (ip?.dietaryTherapy) {
      rows.push(['2. Integrative Protocol', 'Dietary Energetics', 'Thermal Nature', ip.dietaryTherapy.thermalEnergetics, 'Recommended Diet Framework']);
      rows.push(['2. Integrative Protocol', 'Dietary Energetics', 'Recommended Foods', (ip.dietaryTherapy.recommendedFoods || []).join('; '), 'Include in Daily Nutrition']);
      rows.push(['2. Integrative Protocol', 'Dietary Energetics', 'Foods to Avoid', (ip.dietaryTherapy.foodsToAvoid || []).join('; '), 'Restrict or Minimize']);
    }

    if (ip?.digitalTherapeutics) {
      const dt = ip.digitalTherapeutics;
      rows.push(['2. Integrative Protocol', 'Digital Sound Therapy', `${dt.frequencyHz} Hz`, dt.frequencyName, `Binaural: ${dt.binauralBeat}`]);
      rows.push(['2. Integrative Protocol', 'Circadian & Breathwork', 'Circadian Protocol', dt.circadianRecommendation, `Breathwork: ${dt.breathworkPattern}`]);
    }

    (displayedPlan.agenticActionItems || []).forEach((item, idx) => {
      rows.push([
        '3. Agentic Action Items',
        item.taskType,
        item.agentName,
        `Priority: ${item.priority} | Status: ${dispatchedTasks[idx] ? 'Dispatched' : item.status || 'Pending'}`,
        item.actionDescription,
      ]);
    });

    safetyAlerts.forEach((alert) => {
      rows.push([
        '4. Safety & Contraindications',
        `${alert.severity} Severity`,
        `${alert.herb} vs ${alert.medication}`,
        alert.interactionType,
        `${alert.description} Recommendation: ${alert.clinicalRecommendation}`,
      ]);
    });

    if (currentNote.trim()) {
      rows.push(['5. Practitioner Notes', 'Clinical Annotations', displayedPlan.id, 'Practitioner Observation', currentNote]);
    }

    rows.push(['Governance', 'Safety Disclaimer', 'Clinical Supervision', displayedPlan.safetyDisclaimer, 'Maxwell Clinic Protocol']);

    const headers = ['Section', 'Category', 'Field / Code', 'Primary Value', 'Clinical Details / Notes'];
    const csvLines = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ];

    // Prepend UTF-8 BOM so spreadsheets (Excel, Google Sheets) open special characters cleanly
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Maxwell_Clinic_Care_Plan_${displayedPlan.patientName.replace(/\s+/g, '_')}_${displayedPlan.id}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { constitutionalSummary, integrativeProtocol, agenticActionItems, safetyDisclaimer } = displayedPlan;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-teal-950/40 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono mb-1">
            <span>CARE PLAN ID: {displayedPlan.id}</span>
            <span aria-hidden="true">·</span>
            <span>GENERATED: {displayedPlan.createdAt}</span>
            <span aria-hidden="true">·</span>
            <span>
              {versionMode === 'practitioner' && activePractitionerVersion
                ? `VERSION: ${activePractitionerVersion.label.toUpperCase()}`
                : 'VERSION: ORIGINAL AI SYNTHESIS'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Integrative Clinical Care Plan — {displayedPlan.patientName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maxwell Clinic Master Diagnostics: Synthesizing Zang-Fu TCM Pattern Differentiation, Physiological Telemetry &amp; Bio-Agent Workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 rounded-lg transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Generating...' : 'Export Current PDF'}</span>
          </button>

          <button
            onClick={handleExportLongitudinalHistoryPDF}
            disabled={isExportingLongitudinalPDF}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-lg transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingLongitudinalPDF ? 'Consolidating...' : 'Export Longitudinal History PDF'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Version History Toggle & Practitioner Revision Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <GitBranch className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Version History</span>
            </div>

            {/* Segmented Toggle Switch */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setVersionMode('ai')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  versionMode === 'ai'
                    ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Original AI Synthesis</span>
              </button>

              <button
                type="button"
                onClick={() => setVersionMode('practitioner')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  versionMode === 'practitioner'
                    ? 'bg-indigo-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modified Practitioner Versions ({practitionerVersions.length})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {versionMode === 'practitioner' && practitionerVersions.length > 1 && (
              <select
                aria-label="Select Practitioner Version"
                value={selectedPractitionerIdx}
                onChange={(e) => setSelectedPractitionerIdx(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-teal-500"
              >
                {practitionerVersions.map((ver, idx) => (
                  <option key={ver.versionId} value={idx}>
                    {ver.label} — {ver.updatedAt}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleOpenRevisionEditor}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify &amp; Save Revision</span>
            </button>
          </div>
        </div>

        {/* Active Version Metadata Strip */}
        {versionMode === 'practitioner' ? (
          activePractitionerVersion ? (
            <div className="bg-slate-950 border border-indigo-500/30 rounded-lg px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-mono text-indigo-300">
                  <span className="font-bold">{activePractitionerVersion.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePractitionerVersion.modifiedBy}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{activePractitionerVersion.updatedAt}</span>
                </div>
                <p className="text-slate-300">{activePractitionerVersion.changeSummary}</p>
              </div>
              <button
                type="button"
                onClick={() => setVersionMode('ai')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Compare AI Original</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                No practitioner modifications saved yet for this care plan. Click <strong className="text-slate-200">Modify &amp; Save Revision</strong> to customize formulas, dosage, or diagnosis while preserving the original AI synthesis.
              </span>
              <button
                type="button"
                onClick={handleOpenRevisionEditor}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Create Practitioner Revision
              </button>
            </div>
          )
        ) : (
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg px-4 py-2 flex items-center justify-between text-xs text-slate-400">
            <span>
              Viewing <strong className="text-teal-300">Original AI Synthesis</strong> baseline · Synthesized on {originalPlan.createdAt}
            </span>
            {practitionerVersions.length > 0 && (
              <button
                type="button"
                onClick={() => setVersionMode('practitioner')}
                className="text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap shrink-0"
              >
                Switch to Latest Practitioner Edit ({practitionerVersions[0].label})
              </button>
            )}
          </div>
        )}

        {/* Inline Practitioner Revision Editor */}
        {isEditingVersion && (
          <form onSubmit={handleSavePractitionerRevision} className="bg-slate-950 border border-teal-500/40 rounded-lg p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-slate-100 text-sm">
                Create Modified Practitioner Version
              </span>
              <button
                type="button"
                onClick={() => setIsEditingVersion(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono">TCM Pattern Diagnosis</label>
                <input
                  type="text"
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono">Classic Herbal Formulation</label>
                <input
                  type="text"
                  value={editFormula}
                  onChange={(e) => setEditFormula(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono">Dosage &amp; Timing Instruction</label>
                <input
                  type="text"
                  value={editDosage}
                  onChange={(e) => setEditDosage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono">Revision Summary Note</label>
                <input
                  type="text"
                  value={editChangeNote}
                  onChange={(e) => setEditChangeNote(e.target.value)}
                  placeholder="e.g., Adjusted herbal dosage due to anticoagulant medication"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingVersion(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Practitioner Version</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Care Plan Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION 1: Constitutional & Pattern Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    1. Constitutional &amp; Pattern Summary
                  </h2>
                  <p className="text-xs text-slate-400">TCM Pattern Differentiation &amp; Bio-Marker Correlation</p>
                </div>
              </div>
              <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded">
                Zang-Fu Diagnostics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* TCM Diagnosis Card */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>●</span> TCM Pattern Diagnosis &amp; Yin-Yang Dynamics
                </h3>
                <p className="text-slate-200 text-sm font-semibold leading-snug">
                  {constitutionalSummary?.tcmPatternDiagnosis}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-slate-300">
                  <p><strong className="text-slate-400 font-normal">Yin/Yang &amp; Qi Balance:</strong> {constitutionalSummary?.yinYangBalance}</p>
                  <p><strong className="text-slate-400 font-normal">Five Element Dynamic:</strong> {constitutionalSummary?.fiveElementDynamic}</p>
                </div>
              </div>

              {/* Bio-Marker Correlation Card */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>●</span> Modern Bio-Marker &amp; Telemetry Correlation
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {constitutionalSummary?.bioMarkerCorrelation}
                </p>
                <div className="pt-2 border-t border-slate-800/80">
                  <h4 className="text-[11px] font-mono text-slate-400 uppercase">Root Cause Synthesis:</h4>
                  <p className="text-slate-200 font-medium mt-1">
                    {constitutionalSummary?.rootCauseAnalysis}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Integrative Protocol */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    2. Integrative Therapeutics Protocol
                  </h2>
                  <p className="text-xs text-slate-400">Botanical Formulations, Acupuncture Energetics &amp; Digital Therapeutics</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                Multimodal Healing
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* Module 2.1: Herbal Formulation */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5" /> Herbal Medicine &amp; Thermology
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Dispensary Standard</span>
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-100">
                    {integrativeProtocol?.herbalFormulation?.classicFormula}
                  </div>
                  <p className="text-slate-400 mt-1">
                    Dosage &amp; Timing: <span className="text-slate-200 font-mono">{integrativeProtocol?.herbalFormulation?.dosageInstruction}</span>
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase mb-2">Key Botanical Ingredients &amp; Thermal Energetics:</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {integrativeProtocol?.herbalFormulation?.keyHerbs?.map((herb, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-slate-300 font-mono flex items-center justify-between">
                        <span>{herb}</span>
                        <span className="text-[10px] text-emerald-400">Active Compound</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module 2.2: Acupuncture Channel & Point Focus */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Acupuncture Channel Energetics
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Precision Acupoints</span>
                </div>

                <div className="space-y-2.5">
                  {integrativeProtocol?.acupuncturePoints?.map((pt, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 font-mono font-bold rounded text-xs border border-teal-500/30">
                            {pt.pointCode}
                          </span>
                          <span className="font-bold text-slate-200">{pt.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{pt.meridian}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pt-1 border-t border-slate-800/50">
                        {pt.clinicalAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module 2.3: Dietary Energetics */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>●</span> Dietary Energetics &amp; Seasonal Thermology
                </h3>
                <p className="text-slate-300">
                  <strong>Energetic Focus:</strong> {integrativeProtocol?.dietaryTherapy?.thermalEnergetics}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="text-[11px] font-mono text-emerald-400 uppercase mb-1.5">Recommended Foods:</div>
                    <ul className="space-y-1 text-slate-300">
                      {integrativeProtocol?.dietaryTherapy?.recommendedFoods?.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-emerald-400">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-rose-400 uppercase mb-1.5">Foods to Contraindicate:</div>
                    <ul className="space-y-1 text-slate-300">
                      {integrativeProtocol?.dietaryTherapy?.foodsToAvoid?.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-rose-400">✕</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Module 2.4: Digital Therapeutics & Frequency Audio */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" /> Digital Healing App Integration
                  </h3>
                  {onPlayFrequency && integrativeProtocol?.digitalTherapeutics?.frequencyHz && (
                    <button
                      onClick={() =>
                        onPlayFrequency(
                          integrativeProtocol.digitalTherapeutics.frequencyHz,
                          integrativeProtocol.digitalTherapeutics.frequencyName
                        )
                      }
                      className="px-2.5 py-1 text-[11px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded border border-purple-500/30 font-medium transition-colors flex items-center gap-1"
                    >
                      <Headphones className="w-3 h-3" /> Play Sound Healing
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded border border-slate-800">
                    <span className="text-slate-400 font-mono">Target Solfeggio / Organ Hz:</span>
                    <span className="text-purple-300 font-mono font-bold">
                      {integrativeProtocol?.digitalTherapeutics?.frequencyHz} Hz ({integrativeProtocol?.digitalTherapeutics?.frequencyName})
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded border border-slate-800">
                    <span className="text-slate-400 font-mono">Binaural Beat Target:</span>
                    <span className="text-teal-300 font-mono">{integrativeProtocol?.digitalTherapeutics?.binauralBeat}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Circadian Organ Clock Alignment:</div>
                    <p className="text-slate-200">{integrativeProtocol?.digitalTherapeutics?.circadianRecommendation}</p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Breathwork Pacing Pattern:</div>
                    <p className="text-slate-200 font-mono">{integrativeProtocol?.digitalTherapeutics?.breathworkPattern}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Automated Bio-Agent Action Items & Automated Dispatch */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    3. Automated Bio-Agent Action Items &amp; Routing
                  </h2>
                  <p className="text-xs text-slate-400">Automated Dispatch Queue for Maxwell Clinic Bio-Agents</p>
                </div>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                Agentic Orchestration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agenticActionItems?.map((task, idx) => {
                const isDispatched = dispatchedTasks[idx] || task.status === 'Dispatched' || task.status === 'Completed';
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4 space-y-3 flex flex-col justify-between transition-all ${
                      isDispatched
                        ? 'bg-teal-950/20 border-teal-500/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          {task.agentName}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                            task.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                      </div>

                      <div className="text-xs font-mono text-teal-400 font-semibold">
                        Task: {task.taskType}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {task.actionDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        Status: {isDispatched ? 'Dispatched' : 'Pending Direct Action'}
                      </span>
                      <button
                        onClick={() => handleDispatch(task, idx)}
                        disabled={isDispatched}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                          isDispatched
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        {isDispatched ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch Agent</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Automated Safety & Drug-Herb Contraindication Check */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    4. Automated Safety &amp; Drug-Herb Contraindication Check
                  </h2>
                  <p className="text-xs text-slate-400">Cross-referencing active herbal formula against patient medications</p>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                Safety Governance
              </span>
            </div>

            {/* Patient Medications Banner */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-400 font-mono">Patient Medications on File:</span>
                <span className="text-slate-200 font-semibold">{existingMedications.join(', ')}</span>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                {existingMedications.length} Active Meds
              </span>
            </div>

            {/* Safety Alerts Feed */}
            <div className="space-y-3">
              {safetyAlerts.map((alert) => {
                const isHigh = alert.severity === 'High';
                const isMod = alert.severity === 'Moderate';
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border text-xs space-y-2 ${
                      isHigh
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : isMod
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-teal-950/20 border-teal-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${isHigh ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-teal-400'}`} />
                        <span className="font-bold text-slate-100 uppercase tracking-wider">{alert.interactionType}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isMod
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        }`}
                      >
                        {alert.severity} Severity
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-200 font-mono">
                      <span className="text-teal-400 font-semibold">Clinical Recommendation: </span>
                      {alert.clinicalRecommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: Practitioner Rich-Text Clinical Notes & Annotations */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    5. Practitioner Observational Notes &amp; Clinical Annotations
                  </h2>
                  <p className="text-xs text-slate-400">Rich-Text Observational Sign-off &amp; Dispensary Notes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSavedNote && (
                  <span className="text-xs font-mono text-teal-400 flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded">
                    <Check className="w-3.5 h-3.5" /> Notes Saved
                  </span>
                )}

                <button
                  onClick={handleSaveNote}
                  className="px-3.5 py-1.5 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Clinical Notes</span>
                </button>
              </div>
            </div>

            {/* Rich Text Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-2 rounded-t-lg border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-slate-400 mr-1.5 uppercase">Quick Tags:</span>

              <button
                type="button"
                onClick={() => insertTag('[PULSE UPDATE]')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-teal-300 rounded border border-slate-800 font-mono text-[10px] transition-colors"
              >
                + [PULSE UPDATE]
              </button>

              <button
                type="button"
                onClick={() => insertTag('[HERB NOTE]')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded border border-slate-800 font-mono text-[10px] transition-colors"
              >
                + [HERB NOTE]
              </button>

              <button
                type="button"
                onClick={() => insertTag('[CRITICAL OBS]')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-rose-300 rounded border border-slate-800 font-mono text-[10px] transition-colors"
              >
                + [CRITICAL OBS]
              </button>

              <button
                type="button"
                onClick={() => insertTag('[FOLLOW-UP]')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded border border-slate-800 font-mono text-[10px] transition-colors"
              >
                + [FOLLOW-UP]
              </button>
            </div>

            {/* Rich Text Content Field */}
            <textarea
              rows={5}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-b-lg p-3.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
              placeholder="Enter practitioner observational notes, pulse modifications, or follow-up instructions..."
            />
          </div>
        </div>

        {/* SIDEBAR: Longitudinal Patient Progress & Previous Care Plans (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" /> Longitudinal Progress &amp; History
            </h2>
            <span className="text-[11px] font-mono text-teal-400 font-bold">
              {previousCarePlans.length} Historical Intake{previousCarePlans.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Longitudinal Trajectory Summary */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Longitudinal Recovery Metrics
              </span>
              <span className="text-teal-400">+55% Vagal Gain</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">HRV (RMSSD):</span>
                <span className="font-mono font-bold text-teal-300">18ms ➔ 22ms ➔ 28ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">hs-CRP (Inflammation):</span>
                <span className="font-mono font-bold text-rose-400">5.6 ➔ 4.8 ➔ 3.4 mg/L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Sleep Efficiency:</span>
                <span className="font-mono font-bold text-amber-300">45% ➔ 52% ➔ 62%</span>
              </div>
            </div>
          </div>

          {/* Previous Care Plans List */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              Select Care Plan to Inspect &amp; Compare:
            </div>

            <div className="space-y-2.5">
              {previousCarePlans.length > 0 ? (
                previousCarePlans.map((prevPlan) => {
                  const isCurrent = prevPlan.id === carePlan.id;
                  return (
                    <div
                      key={prevPlan.id}
                      onClick={() => {
                        if (onSelectCarePlanFromHistory) {
                          onSelectCarePlanFromHistory(prevPlan);
                        }
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-2 ${
                        isCurrent
                          ? 'bg-slate-800 border-teal-500/70 shadow-md shadow-teal-500/10'
                          : 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          {prevPlan.createdAt}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isCurrent
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCurrent ? 'Viewing Active' : prevPlan.id}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-100 line-clamp-1">
                        {prevPlan.constitutionalSummary?.tcmPatternDiagnosis}
                      </div>

                      <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <span>Formula: {prevPlan.integrativeProtocol?.herbalFormulation?.classicFormula?.split('+')[0]}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 text-center">
                  No historical care plans recorded yet for {carePlan.patientName}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Clinical Governance Disclaimer */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-300">Maxwell Clinic Integrative Safety Protocol:</span>
          <p className="leading-relaxed">
            {safetyDisclaimer ||
              'All TCM diagnostic patterns, herbal formulations, acupuncture point selections, and bio-agent automated dispatches are designed as supportive integrative pathways that complement primary licensed medical supervision.'}
          </p>
        </div>
      </div>
    </div>
  );
};
