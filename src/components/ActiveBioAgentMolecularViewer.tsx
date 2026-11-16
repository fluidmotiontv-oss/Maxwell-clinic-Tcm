import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Atom,
  RefreshCw,
  Play,
  Pause,
  Layers,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Leaf,
  Compass,
  Activity,
  ShieldCheck,
  ChevronRight,
  Target,
  Maximize2,
  RotateCcw,
  Eye,
  Sliders,
} from 'lucide-react';

export type BioAgentMoleculeId =
  | 'saikosaponin'
  | 'jujuboside'
  | 'ferulicAcid'
  | 'astragaloside'
  | 'berberine'
  | 'ginsenoside';

export interface BindingSite {
  id: string;
  name: string;
  code: string;
  position: [number, number, number];
  radius: number;
  targetReceptorCleft: string;
  targetResidues: { residue: string; role: string }[];
  bindingAffinity: string; // e.g. -9.8 kcal/mol
  kd: string;
  interactionChemistry: string;
  pharmacologicalRole: string;
  colorHex: string;
  themeColor: number;
}

export interface ActiveBioAgentCompound {
  id: BioAgentMoleculeId;
  name: string;
  sourceHerb: string;
  chineseHerb: string;
  chemicalClass: string;
  formula: string;
  molecularWeight: number; // g/mol
  targetReceptor: string;
  mechanismSummary: string;
  metabolicPathway: string;
  tpsa: number; // Å²
  logP: number;
  hbd: number;
  hba: number;
  dispatchedAgent: string;
  protocolStatus: 'Active in Current Protocol' | 'Standby Protocol';
  clinicalIndication: string;
  colorHex: string;
  themeColor: number;
  bindingSites: BindingSite[];
}

export const ACTIVE_BIOAGENT_COMPOUNDS: Record<BioAgentMoleculeId, ActiveBioAgentCompound> = {
  saikosaponin: {
    id: 'saikosaponin',
    name: 'Saikosaponin A',
    sourceHerb: 'Chai Hu (Radix Bupleuri)',
    chineseHerb: '柴胡',
    chemicalClass: 'Oleanane Pentacyclic Saponin',
    formula: 'C42H68O13',
    molecularWeight: 780.99,
    targetReceptor: 'GABAA Receptor / HPA Axis CRH Receptors',
    mechanismSummary:
      'Allosterically modulates GABAA chloride channels in amygdaloid neurons and downregulates hypothalamic Corticotropin-Releasing Hormone (CRH), mitigating liver Qi stagnation and autonomic tension.',
    metabolicPathway: 'Hepatic CYP3A4 glucuronidation & biliary excretion',
    tpsa: 191.2,
    logP: 3.12,
    hbd: 6,
    hba: 13,
    dispatchedAgent: 'Botanical Formulary Agent',
    protocolStatus: 'Active in Current Protocol',
    clinicalIndication: 'Gan Yu (Liver Qi Stagnation) & HPA Axis Hyper-Reactivity',
    colorHex: '#2dd4bf',
    themeColor: 0x2dd4bf,
    bindingSites: [
      {
        id: 'saiko-site-1',
        name: 'C3-β-Glucoside Vestibule Interface',
        code: 'SITE-α (GABAA)',
        position: [-3.8, 1.6, 0.4],
        radius: 0.95,
        targetReceptorCleft: 'GABAA Allosteric Pore & Glycine Transporter Cleft',
        targetResidues: [
          { residue: 'Arg-142', role: 'Guanidino salt bridge coordination' },
          { residue: 'Glu-210', role: 'Carboxylate dual H-bond acceptor' },
          { residue: 'Tyr-98', role: 'Phenolic π-stacking anchor' },
        ],
        bindingAffinity: '-9.8 kcal/mol',
        kd: '38.2 nM',
        interactionChemistry: 'Hydrophilic multi-dentate H-bond network & polar vestibule locking',
        pharmacologicalRole:
          'Promotes continuous chloride ion influx, hyperpolarizing hyper-excited amygdaloid neurons to arrest panic and sympathetic overdrive.',
        colorHex: '#2dd4bf',
        themeColor: 0x2dd4bf,
      },
      {
        id: 'saiko-site-2',
        name: '13β,28-Epoxy Ether Pocket Anchor',
        code: 'SITE-β (CRH-R1)',
        position: [0.2, 0.4, 0.2],
        radius: 0.85,
        targetReceptorCleft: 'CRH-R1 (Corticotropin-Releasing Hormone Type 1 Pocket)',
        targetResidues: [
          { residue: 'Trp-164', role: 'Indole hydrophobic enclosure' },
          { residue: 'Phe-224', role: 'Aromatic floor dispersion' },
          { residue: 'Lys-115', role: 'Ammonium cation-π bond' },
        ],
        bindingAffinity: '-9.2 kcal/mol',
        kd: '48.5 nM',
        interactionChemistry: 'Conformationally strained rigid ether bridge & lipophilic desolvation',
        pharmacologicalRole:
          'Blocks pituitary ACTH release and resets flattened diurnal cortisol curve, restoring morning vigor.',
        colorHex: '#38bdf8',
        themeColor: 0x38bdf8,
      },
      {
        id: 'saiko-site-3',
        name: 'Oleanane C28-Terminal Polar Domain',
        code: 'SITE-γ (BBB Ingress)',
        position: [3.8, -0.8, 0.5],
        radius: 0.8,
        targetReceptorCleft: 'Endothelial Tight Junction Ingress Transporter',
        targetResidues: [
          { residue: 'Leu-88', role: 'Aliphatic cleft insertion' },
          { residue: 'Val-176', role: 'Membrane partition pivot' },
        ],
        bindingAffinity: '-8.9 kcal/mol',
        kd: '62.0 nM',
        interactionChemistry: 'Lipophilic van der Waals permeation & carboxyl coordination',
        pharmacologicalRole:
          'Accelerates central nervous system penetration across the blood-brain barrier for rapid Shen soothing.',
        colorHex: '#f59e0b',
        themeColor: 0xf59e0b,
      },
    ],
  },
  jujuboside: {
    id: 'jujuboside',
    name: 'Jujuboside A',
    sourceHerb: 'Suan Zao Ren (Semen Ziziphi Spinosae)',
    chineseHerb: '酸枣仁',
    chemicalClass: 'Dammarane Tetracyclic Triterpene',
    formula: 'C58H94O26',
    molecularWeight: 1207.35,
    targetReceptor: 'Central 5-HT1A & Benzodiazepine Receptors',
    mechanismSummary:
      'Potentiates presynaptic serotonin 5-HT1A auto-receptors and facilitates suprachiasmatic GABAergic tone, terminating nocturnal awakenings between 1:00 AM - 3:00 AM.',
    metabolicPathway: 'Intestinal deglycosylation via Akkermansia muciniphila to Jujubogenin',
    tpsa: 382.4,
    logP: 1.84,
    hbd: 14,
    hba: 26,
    dispatchedAgent: 'Frequency Harmonic Audio Agent + Botanical Formulary Agent',
    protocolStatus: 'Active in Current Protocol',
    clinicalIndication: 'Shen Agitation, Nocturnal Awakening & Vagal Insufficiency',
    colorHex: '#c084fc',
    themeColor: 0xc084fc,
    bindingSites: [
      {
        id: 'juju-site-1',
        name: 'Dammarane Sterol Hydrophobic Cleft',
        code: 'SITE-α (5-HT1A)',
        position: [0.2, -0.3, 0.2],
        radius: 0.95,
        targetReceptorCleft: 'Presynaptic 5-HT1A Serotonin Auto-Receptor Pocket',
        targetResidues: [
          { residue: 'Asp-116', role: 'Primary ionic anchor' },
          { residue: 'Phe-361', role: 'Aromatic π-stacking' },
          { residue: 'Thr-199', role: 'Sidechain H-bond coordination' },
        ],
        bindingAffinity: '-10.8 kcal/mol',
        kd: '18.2 nM',
        interactionChemistry: 'Deep lipophilic cavity burial & π-electron coordination',
        pharmacologicalRole:
          'Inhibits excessive dorsal raphe serotonin firing, initiating restorative delta slow-wave sleep cycles.',
        colorHex: '#c084fc',
        themeColor: 0xc084fc,
      },
      {
        id: 'juju-site-2',
        name: 'C3-O-Diglycosyl Polysaccharide Cluster',
        code: 'SITE-β (GABAA-BZD)',
        position: [-3.8, 1.6, 0.4],
        radius: 1.0,
        targetReceptorCleft: 'Central Benzodiazepine Allosteric Binding Domain',
        targetResidues: [
          { residue: 'His-102', role: 'Imidazole proton shuttle' },
          { residue: 'Tyr-159', role: 'Phenolic sandwich donor' },
          { residue: 'Ser-205', role: 'Carbohydrate hydroxyl acceptor' },
        ],
        bindingAffinity: '-10.2 kcal/mol',
        kd: '24.5 nM',
        interactionChemistry: 'Broad multi-site hydrogen-bonding web across receptor vestibule',
        pharmacologicalRole:
          'Deepens sleep architecture without causing next-day grogginess, dependency, or motor ataxia.',
        colorHex: '#e879f9',
        themeColor: 0xe879f9,
      },
      {
        id: 'juju-site-3',
        name: 'C20-Glucoside Hydration Barrier',
        code: 'SITE-γ (Metabolic Cleavage)',
        position: [3.8, -0.8, 0.5],
        radius: 0.85,
        targetReceptorCleft: 'Bacterial β-Glucosidase Active Site (Gut Microbiome)',
        targetResidues: [
          { residue: 'Asp-54', role: 'Catalytic nucleophile' },
          { residue: 'Glu-182', role: 'Acid-base proton donor' },
        ],
        bindingAffinity: '-9.4 kcal/mol',
        kd: '42.0 nM',
        interactionChemistry: 'Glycosidic ether cleavage coordination',
        pharmacologicalRole:
          'Provides timed nocturnal release of active aglycone Jujubogenin throughout the 1:00 AM - 3:00 AM Liver clock window.',
        colorHex: '#2dd4bf',
        themeColor: 0x2dd4bf,
      },
    ],
  },
  ferulicAcid: {
    id: 'ferulicAcid',
    name: 'Ferulic Acid',
    sourceHerb: 'Dang Gui (Radix Angelicae Sinensis)',
    chineseHerb: '当归',
    chemicalClass: 'Hydroxycinnamic Phenolic Acid',
    formula: 'C10H10O4',
    molecularWeight: 194.18,
    targetReceptor: 'Endothelial Nitric Oxide Synthase (eNOS) & NF-κB',
    mechanismSummary:
      'Upregulates eNOS phosphorylation via PI3K/Akt pathway, producing microvascular vasodilation and suppressing vascular cell adhesion molecule-1 (VCAM-1) to clear pelvic Blood Stasis.',
    metabolicPathway: 'SULT1A1 sulfation and COMT O-methylation',
    tpsa: 66.8,
    logP: 1.51,
    hbd: 2,
    hba: 4,
    dispatchedAgent: 'Meridian Telemetry Dispatcher',
    protocolStatus: 'Active in Current Protocol',
    clinicalIndication: 'Blood Stasis, Microcirculatory Spasm & Cold in Channels',
    colorHex: '#38bdf8',
    themeColor: 0x38bdf8,
    bindingSites: [
      {
        id: 'ferulic-site-1',
        name: '4-Hydroxy Phenolic Radical Scavenging Cleft',
        code: 'SITE-α (eNOS Heme)',
        position: [-3.1, 0.0, 0.0],
        radius: 0.75,
        targetReceptorCleft: 'eNOS Catalytic Oxygenase Pocket',
        targetResidues: [
          { residue: 'Trp-447', role: 'Heme cofactor electron transfer' },
          { residue: 'Phe-573', role: 'Aromatic stabilization' },
          { residue: 'Glu-361', role: 'Proton relay node' },
        ],
        bindingAffinity: '-7.6 kcal/mol',
        kd: '112.0 nM',
        interactionChemistry: 'Direct phenolic hydrogen donation & peroxynitrite scavenging',
        pharmacologicalRole:
          'Protects endothelial nitric oxide synthase from oxidative uncoupling, accelerating blood microflow.',
        colorHex: '#38bdf8',
        themeColor: 0x38bdf8,
      },
      {
        id: 'ferulic-site-2',
        name: 'Propenoic Carboxylate Terminal Pin',
        code: 'SITE-β (Vasodilation)',
        position: [4.0, -0.5, 0.0],
        radius: 0.75,
        targetReceptorCleft: 'Endothelial Arginine Salt Bridge Axis',
        targetResidues: [
          { residue: 'Arg-252', role: 'Electrostatic guanidino bridge' },
          { residue: 'Lys-112', role: 'Cationic tether' },
        ],
        bindingAffinity: '-7.2 kcal/mol',
        kd: '145.0 nM',
        interactionChemistry: 'Coulombic ionic attraction & conjugated double bond anchor',
        pharmacologicalRole:
          'Triggers vascular smooth muscle relaxation and eases meridian arterial stiffness.',
        colorHex: '#2dd4bf',
        themeColor: 0x2dd4bf,
      },
      {
        id: 'ferulic-site-3',
        name: '3-Methoxy Lipophilic Shield',
        code: 'SITE-γ (NF-κB Inhibition)',
        position: [-2.6, 1.8, 0.4],
        radius: 0.7,
        targetReceptorCleft: 'NF-κB p65 Nuclear Translocation Pocket',
        targetResidues: [
          { residue: 'Tyr-36', role: 'Aromatic gatekeeper' },
          { residue: 'Cys-38', role: 'Covalent alkylation target' },
        ],
        bindingAffinity: '-6.8 kcal/mol',
        kd: '210.0 nM',
        interactionChemistry: 'Steric pocket occlusion preventing nuclear translocation',
        pharmacologicalRole:
          'Suppresses pro-inflammatory cytokines IL-1β and TNF-α to alleviate inflammatory stasis pain.',
        colorHex: '#f59e0b',
        themeColor: 0xf59e0b,
      },
    ],
  },
  astragaloside: {
    id: 'astragaloside',
    name: 'Astragaloside IV',
    sourceHerb: 'Huang Qi (Radix Astragali)',
    chineseHerb: '黄芪',
    chemicalClass: 'Cycloartane Triterpenoid Glycoside',
    formula: 'C41H68O14',
    molecularWeight: 784.97,
    targetReceptor: 'Mitochondrial Complex I & Telomerase Reverse Transcriptase',
    mechanismSummary:
      'Boosts mitochondrial respiratory chain complex I activity to enhance ATP synthesis, reduces ROS leakage, and reinforces defensive Wei Qi barrier integrity.',
    metabolicPathway: 'Hepatic cytochrome P450 monooxygenation',
    tpsa: 202.4,
    logP: 2.87,
    hbd: 7,
    hba: 14,
    dispatchedAgent: 'Diagnostic Bio-Synthesizer',
    protocolStatus: 'Active in Current Protocol',
    clinicalIndication: 'Spleen-Lung Qi Deficiency, Post-Viral Fatigue & Wei Qi Deficit',
    colorHex: '#f59e0b',
    themeColor: 0xf59e0b,
    bindingSites: [
      {
        id: 'astra-site-1',
        name: '9,19-Cyclopropane Strained Apex Ring',
        code: 'SITE-α (Mitochondria ATP)',
        position: [-0.2, 0.4, 0.3],
        radius: 0.85,
        targetReceptorCleft: 'Mitochondrial Complex I (NADH:Ubiquinone Oxidoreductase)',
        targetResidues: [
          { residue: 'ND1-Tyr-59', role: 'Electron hopping partner' },
          { residue: 'PSST-Arg-77', role: 'Iron-sulfur cluster stabilization' },
        ],
        bindingAffinity: '-9.5 kcal/mol',
        kd: '34.0 nM',
        interactionChemistry: 'Strained cyclopropane ring interaction within lipophilic membrane arm',
        pharmacologicalRole:
          'Prevents complex I disassembly, elevating ATP production and reducing systemic mitochondrial fatigue.',
        colorHex: '#f59e0b',
        themeColor: 0xf59e0b,
      },
      {
        id: 'astra-site-2',
        name: 'C3-β-D-Xylopyranosyl Interface',
        code: 'SITE-β (TERT Telomerase)',
        position: [-3.8, 1.6, 0.4],
        radius: 0.9,
        targetReceptorCleft: 'Telomerase Reverse Transcriptase (TERT) Catalytic Cleft',
        targetResidues: [
          { residue: 'Asp-712', role: 'Catalytic triad magnesium coordinator' },
          { residue: 'Lys-902', role: 'Phosphate backbone clamp' },
        ],
        bindingAffinity: '-8.9 kcal/mol',
        kd: '64.0 nM',
        interactionChemistry: 'Stereospecific pentose carbohydrate H-bond recognition',
        pharmacologicalRole:
          'Upregulates TERT expression in immune leukocytes, restoring cellular stamina and vitality.',
        colorHex: '#2dd4bf',
        themeColor: 0x2dd4bf,
      },
      {
        id: 'astra-site-3',
        name: 'C6-O-Glucosyl Defensive Barrier Site',
        code: 'SITE-γ (Wei Qi Claudin)',
        position: [3.8, -0.8, 0.5],
        radius: 0.85,
        targetReceptorCleft: 'Respiratory & Intestinal Claudin-1 Tight Junction Domain',
        targetResidues: [
          { residue: 'Tyr-148', role: 'Aromatic hydrophobic lock' },
          { residue: 'Arg-158', role: 'Polar bridge' },
        ],
        bindingAffinity: '-8.4 kcal/mol',
        kd: '88.0 nM',
        interactionChemistry: 'Extracellular tight junction sealing web',
        pharmacologicalRole:
          'Reinforces the bodily Wei Qi barrier against external wind-cold pathogens and environmental allergens.',
        colorHex: '#c084fc',
        themeColor: 0xc084fc,
      },
    ],
  },
  berberine: {
    id: 'berberine',
    name: 'Berberine',
    sourceHerb: 'Huang Lian (Rhizoma Coptidis)',
    chineseHerb: '黄连',
    chemicalClass: 'Quaternary Protoberberine Alkaloid',
    formula: 'C20H18NO4+',
    molecularWeight: 336.36,
    targetReceptor: 'AMP-activated Protein Kinase (AMPK) & TLR4',
    mechanismSummary:
      'Phosphorylates AMPK Thr-172, downregulating hepatic gluconeogenesis and suppressing intestinal mucosal TLR4/MyD88 inflammatory cascades to resolve Damp-Heat.',
    metabolicPathway: 'Hepatic demethylation via CYP2D6/CYP1A2 to Thalifendine',
    tpsa: 40.8,
    logP: -1.5,
    hbd: 0,
    hba: 4,
    dispatchedAgent: 'Botanical Formulary Agent',
    protocolStatus: 'Standby Protocol',
    clinicalIndication: 'Damp-Heat in Middle/Lower Jiao & Metabolic Endotoxemia',
    colorHex: '#fbbf24',
    themeColor: 0xfbbf24,
    bindingSites: [
      {
        id: 'berb-site-1',
        name: 'Quaternary Isoquinoline Cation (N+)',
        code: 'SITE-α (AMPK Thr-172)',
        position: [-0.8, 0.9, 0.15],
        radius: 0.75,
        targetReceptorCleft: 'AMPK Catalytic Activation Loop',
        targetResidues: [
          { residue: 'Asp-157', role: 'Direct ionic salt bridge' },
          { residue: 'Glu-143', role: 'Electrostatic coordination' },
        ],
        bindingAffinity: '-9.8 kcal/mol',
        kd: '45.0 nM',
        interactionChemistry: 'Unshielded positive quaternary charge docking into kinase catalytic triad',
        pharmacologicalRole:
          'Activates AMPK energy sensor, stimulating fatty acid oxidation and clearing Damp-Heat.',
        colorHex: '#fbbf24',
        themeColor: 0xfbbf24,
      },
      {
        id: 'berb-site-2',
        name: '1,3-Dioxolo Rigid Heterocycle Terminal',
        code: 'SITE-β (TLR4/MD-2)',
        position: [-4.3, 0.0, 0.0],
        radius: 0.75,
        targetReceptorCleft: 'TLR4/MD-2 Endotoxin Recognition Pocket',
        targetResidues: [
          { residue: 'Phe-126', role: 'Hydrophobic capping' },
          { residue: 'Val-135', role: 'Lipid A competitive block' },
        ],
        bindingAffinity: '-9.1 kcal/mol',
        kd: '68.0 nM',
        interactionChemistry: 'Steric blockade preventing LPS binding to macrophage TLR4',
        pharmacologicalRole:
          'Prevents circulating bacterial endotoxins from triggering systemic micro-inflammation.',
        colorHex: '#2dd4bf',
        themeColor: 0x2dd4bf,
      },
      {
        id: 'berb-site-3',
        name: '9,10-Dimethoxy Planar Intercalation Face',
        code: 'SITE-γ (Gut Barrier)',
        position: [3.5, 0.0, 0.0],
        radius: 0.7,
        targetReceptorCleft: 'Intestinal Epithelial Claudin-4 & P-gp Efflux Channel',
        targetResidues: [
          { residue: 'Phe-728', role: 'Planar aromatic stacking' },
          { residue: 'Tyr-401', role: 'Dual methoxy ether H-bonds' },
        ],
        bindingAffinity: '-8.6 kcal/mol',
        kd: '92.0 nM',
        interactionChemistry: 'Planar polycyclic aromatic intercalation',
        pharmacologicalRole:
          'Restores leaky gut epithelial tight junctions and balances intestinal microbiota ratios.',
        colorHex: '#f59e0b',
        themeColor: 0xf59e0b,
      },
    ],
  },
  ginsenoside: {
    id: 'ginsenoside',
    name: 'Ginsenoside Rg1',
    sourceHerb: 'Ren Shen (Radix Ginseng)',
    chineseHerb: '人参',
    chemicalClass: 'Protopanaxatriol Tetracyclic Saponin',
    formula: 'C42H72O14',
    molecularWeight: 801.01,
    targetReceptor: 'Glucocorticoid Receptor & Hippocampal TrkB',
    mechanismSummary:
      'Stimulates Brain-Derived Neurotrophic Factor (BDNF) expression via TrkB/ERK signaling, accelerating neuroplastic synaptic repair and restoring Yuan Qi reserve.',
    metabolicPathway: 'Bacterial β-glucosidase hydrolysis in colon to 20(S)-protopanaxatriol',
    tpsa: 225.8,
    logP: 2.34,
    hbd: 8,
    hba: 14,
    dispatchedAgent: 'Circadian & Progress Tracker',
    protocolStatus: 'Active in Current Protocol',
    clinicalIndication: 'Collapse of Yuan Qi, Severe Cognitive Fatigue & Shen Exhaustion',
    colorHex: '#ec4899',
    themeColor: 0xec4899,
    bindingSites: [
      {
        id: 'gins-site-1',
        name: 'C6-O-Glucosyl Neurotrophic Pocket',
        code: 'SITE-α (TrkB/BDNF)',
        position: [-3.8, 1.6, 0.4],
        radius: 0.95,
        targetReceptorCleft: 'TrkB Neurotrophin Kinase Extracellular Domain',
        targetResidues: [
          { residue: 'Leu-338', role: 'Hydrophobic cradle' },
          { residue: 'Arg-360', role: 'Sugar phosphate mimicry' },
        ],
        bindingAffinity: '-10.1 kcal/mol',
        kd: '28.0 nM',
        interactionChemistry: 'Carbohydrate epitope inducing receptor homodimerization',
        pharmacologicalRole:
          'Triggers hippocampal synaptic plasticity and rescues brain-derived neurotrophic factor (BDNF) levels.',
        colorHex: '#ec4899',
        themeColor: 0xec4899,
      },
      {
        id: 'gins-site-2',
        name: 'Protopanaxatriol Sterol Core Domain',
        code: 'SITE-β (Glucocorticoid Receptor)',
        position: [0.2, -0.3, 0.2],
        radius: 0.9,
        targetReceptorCleft: 'Intracellular Glucocorticoid Receptor Pocket',
        targetResidues: [
          { residue: 'Gln-570', role: 'Hydrogen-bond anchor' },
          { residue: 'Arg-611', role: 'Steroidal ring envelope' },
        ],
        bindingAffinity: '-9.6 kcal/mol',
        kd: '38.0 nM',
        interactionChemistry: 'Mimetic steroidal ring burial without catabolic adrenal suppression',
        pharmacologicalRole:
          'Restores Yuan Qi (primordial adrenal vitality) and stabilizes cellular stress resistance.',
        colorHex: '#2dd4bf',
        themeColor: 0x2dd4bf,
      },
      {
        id: 'gins-site-3',
        name: 'C20-O-Glucosyl Synaptic Terminal',
        code: 'SITE-γ (Synaptophysin)',
        position: [3.8, -0.8, 0.5],
        radius: 0.85,
        targetReceptorCleft: 'Presynaptic Vesicle Synaptophysin Complex',
        targetResidues: [
          { residue: 'Ser-44', role: 'Polar serine hydroxyl coordination' },
          { residue: 'Glu-119', role: 'Calcium-dependent bridge' },
        ],
        bindingAffinity: '-8.8 kcal/mol',
        kd: '72.0 nM',
        interactionChemistry: 'Calcium-dependent synaptic vesicle tether',
        pharmacologicalRole:
          'Facilitates neurotransmitter exocytosis, accelerating memory recall and mental clarity.',
        colorHex: '#38bdf8',
        themeColor: 0x38bdf8,
      },
    ],
  },
};

interface AtomNode {
  id: string;
  x: number;
  y: number;
  z: number;
  element: 'C' | 'O' | 'N' | 'H';
  label: string;
  charge: string;
  role: string;
}

interface BondLink {
  from: number;
  to: number;
  order: 1 | 2;
}

// Generate realistic 3D molecular coordinates
const buildMolecularCoordinates = (moleculeId: BioAgentMoleculeId): { atoms: AtomNode[]; bonds: BondLink[] } => {
  const atoms: AtomNode[] = [];
  const bonds: BondLink[] = [];

  const addAtom = (
    x: number,
    y: number,
    z: number,
    element: 'C' | 'O' | 'N' | 'H',
    label: string,
    charge: string,
    role: string
  ) => {
    atoms.push({ id: `atom-${atoms.length}`, x, y, z, element, label, charge, role });
    return atoms.length - 1;
  };

  const addBond = (from: number, to: number, order: 1 | 2 = 1) => {
    bonds.push({ from, to, order });
  };

  if (moleculeId === 'ferulicAcid') {
    const r = 1.35;
    const ringIdx: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ringIdx.push(
        addAtom(
          Math.cos(a) * r - 1.2,
          Math.sin(a) * r,
          0,
          'C',
          `C${i + 1} (Aromatic Core)`,
          '-0.08 e',
          'Aromatic π-system stabilizing electronic resonance'
        )
      );
    }
    for (let i = 0; i < 6; i++) {
      addBond(ringIdx[i], ringIdx[(i + 1) % 6], i % 2 === 0 ? 2 : 1);
    }

    const o4 = addAtom(
      Math.cos((3 / 6) * Math.PI * 2) * r - 2.4,
      Math.sin((3 / 6) * Math.PI * 2) * r,
      0,
      'O',
      'O4 (Phenolic Hydroxyl)',
      '-0.48 e',
      'Primary antioxidant electron donor & hydrogen-bond donor'
    );
    addBond(ringIdx[3], o4, 1);
    const h4 = addAtom(
      Math.cos((3 / 6) * Math.PI * 2) * r - 3.1,
      Math.sin((3 / 6) * Math.PI * 2) * r + 0.4,
      0,
      'H',
      'H4 (Phenolic H)',
      '+0.32 e',
      'Free radical scavenging proton'
    );
    addBond(o4, h4, 1);

    const o3 = addAtom(
      Math.cos((2 / 6) * Math.PI * 2) * r - 1.8,
      Math.sin((2 / 6) * Math.PI * 2) * r + 1.2,
      0,
      'O',
      'O3 (Methoxy Ether)',
      '-0.36 e',
      'Steric shielding enhancing lipophilic cellular uptake'
    );
    addBond(ringIdx[2], o3, 1);
    const cMe = addAtom(
      Math.cos((2 / 6) * Math.PI * 2) * r - 2.6,
      Math.sin((2 / 6) * Math.PI * 2) * r + 1.8,
      0.4,
      'C',
      'C(Methyl)',
      '+0.12 e',
      'Lipophilic group'
    );
    addBond(o3, cMe, 1);

    const c7 = addAtom(0.7, 0.2, 0.1, 'C', 'C7 (trans-Alkenyl)', '+0.04 e', 'Conjugated double bond connector');
    addBond(ringIdx[0], c7, 1);
    const c8 = addAtom(1.8, -0.4, 0.1, 'C', 'C8 (trans-Alkenyl)', '-0.02 e', 'Conjugated olefinic link');
    addBond(c7, c8, 2);
    const c9 = addAtom(2.9, 0.3, 0.0, 'C', 'C9 (Carbonyl C)', '+0.62 e', 'Electrophilic carbonyl center');
    addBond(c8, c9, 1);
    const o9a = addAtom(2.9, 1.5, 0.0, 'O', 'O9 (Carbonyl =O)', '-0.55 e', 'Strong hydrogen-bond acceptor');
    addBond(c9, o9a, 2);
    const o9b = addAtom(4.0, -0.5, 0.0, 'O', 'O10 (Carboxylic -OH)', '-0.52 e', 'Ionizable carboxylate group');
    addBond(c9, o9b, 1);
    const h9b = addAtom(4.8, -0.2, 0.0, 'H', 'H10 (Carboxyl Proton)', '+0.38 e', 'Polar coordination terminus');
    addBond(o9b, h9b, 1);
  } else if (moleculeId === 'berberine') {
    const ringCenters = [
      { x: -2.4, y: 0 },
      { x: -0.8, y: 0.2 },
      { x: 0.8, y: -0.1 },
      { x: 2.4, y: 0.1 },
    ];

    const rings: number[][] = [];
    ringCenters.forEach((center, rIdx) => {
      const currentRing: number[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const elem = rIdx === 1 && i === 2 ? 'N' : 'C';
        const label =
          elem === 'N'
            ? 'N+ (Quaternary Nitrogen)'
            : `C${rIdx * 5 + i + 1} (Polycyclic Aromatic)`;
        const charge = elem === 'N' ? '+0.88 e' : '-0.06 e';
        const role =
          elem === 'N'
            ? 'Electrostatically interacts with negatively charged AMPK catalytic pockets'
            : 'Planar aromatic intercalation scaffold';
        currentRing.push(
          addAtom(
            center.x + Math.cos(a) * 0.9,
            center.y + Math.sin(a) * 0.9,
            i % 2 === 0 ? 0.15 : -0.15,
            elem,
            label,
            charge,
            role
          )
        );
      }
      rings.push(currentRing);
    });

    for (let r = 0; r < rings.length; r++) {
      for (let i = 0; i < 6; i++) {
        addBond(rings[r][i], rings[r][(i + 1) % 6], i % 2 === 0 ? 2 : 1);
      }
      if (r > 0) {
        addBond(rings[r - 1][0], rings[r][3], 1);
        addBond(rings[r - 1][1], rings[r][4], 2);
      }
    }

    const oA1 = addAtom(-3.6, 0.7, 0.3, 'O', 'O (Methylenedioxy)', '-0.42 e', 'Rigid oxygen bridge');
    const oA2 = addAtom(-3.6, -0.7, -0.3, 'O', 'O (Methylenedioxy)', '-0.42 e', 'Rigid oxygen bridge');
    addBond(rings[0][2], oA1, 1);
    addBond(rings[0][3], oA2, 1);
    const cDio = addAtom(-4.3, 0.0, 0.0, 'C', 'C (Dioxolo Methylene)', '+0.15 e', 'Tight heterocyclic closure');
    addBond(oA1, cDio, 1);
    addBond(oA2, cDio, 1);

    const oD1 = addAtom(3.5, 0.8, 0.2, 'O', 'O (9-Methoxy)', '-0.38 e', 'Hydrogen-bond acceptor');
    const oD2 = addAtom(3.5, -0.8, -0.2, 'O', 'O (10-Methoxy)', '-0.38 e', 'Hydrogen-bond acceptor');
    addBond(rings[3][0], oD1, 1);
    addBond(rings[3][5], oD2, 1);
  } else {
    // Saponins & Polycyclic Triterpenes
    const fusedRingCenters = [
      { x: -2.6, y: -0.2, z: 0.1 },
      { x: -1.2, y: 0.4, z: -0.2 },
      { x: 0.2, y: -0.3, z: 0.2 },
      { x: 1.6, y: 0.5, z: -0.1 },
      { x: 2.9, y: -0.1, z: 0.3 },
    ];

    const allRings: number[][] = [];
    fusedRingCenters.forEach((center, rIdx) => {
      const ringSize = rIdx === 3 ? 5 : 6;
      const currentRing: number[] = [];
      for (let i = 0; i < ringSize; i++) {
        const a = (i / ringSize) * Math.PI * 2;
        const rad = rIdx === 3 ? 0.8 : 0.95;
        const elem = rIdx === 1 && i === 3 && moleculeId === 'saikosaponin' ? 'O' : 'C';
        const label =
          elem === 'O'
            ? '13β,28-Epoxy Ether Oxygen'
            : `C${rIdx * 6 + i + 1} (Triterpenoid Core)`;
        const charge = elem === 'O' ? '-0.46 e' : '-0.04 e';
        const role =
          elem === 'O'
            ? 'Rigid ether bridge locking the 3D saponin pharmacophore conformation'
            : 'Hydrophobic triterpene core inserting into lipid bilayer & receptor cleft';

        currentRing.push(
          addAtom(
            center.x + Math.cos(a) * rad,
            center.y + Math.sin(a) * rad,
            center.z + (i % 2 === 0 ? 0.28 : -0.28),
            elem,
            label,
            charge,
            role
          )
        );
      }
      allRings.push(currentRing);
    });

    for (let r = 0; r < allRings.length; r++) {
      const len = allRings[r].length;
      for (let i = 0; i < len; i++) {
        addBond(allRings[r][i], allRings[r][(i + 1) % len], 1);
      }
      if (r > 0) {
        addBond(allRings[r - 1][1], allRings[r][4], 1);
        addBond(allRings[r - 1][2], allRings[r][5], 1);
      }
    }

    const sugarCenter = { x: -3.8, y: 1.6, z: 0.4 };
    const sugarAtoms: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const elem = i === 0 ? 'O' : 'C';
      const label =
        elem === 'O'
          ? "O5' (β-D-Glucopyranoside Ring Oxygen)"
          : `C${i}' (Sugar Ring Carbon)`;
      const charge = elem === 'O' ? '-0.44 e' : '+0.08 e';
      const role =
        elem === 'O'
          ? 'Endocyclic sugar ether maintaining chair conformation'
          : 'Carbohydrate backbone presenting multiple hydration bonds';
      sugarAtoms.push(
        addAtom(
          sugarCenter.x + Math.cos(a) * 0.9,
          sugarCenter.y + Math.sin(a) * 0.9,
          sugarCenter.z + (i % 2 === 0 ? 0.3 : -0.3),
          elem,
          label,
          charge,
          role
        )
      );
    }
    for (let i = 0; i < 6; i++) {
      addBond(sugarAtoms[i], sugarAtoms[(i + 1) % 6], 1);
    }

    const glycosidicO = addAtom(
      -3.2,
      0.6,
      0.2,
      'O',
      'O3-Glycosidic Linkage',
      '-0.48 e',
      'Flexible ether linkage tethering hydrophilic glycone head'
    );
    addBond(allRings[0][0], glycosidicO, 1);
    addBond(sugarAtoms[1], glycosidicO, 1);

    const oh1 = addAtom(-4.8, 2.2, 0.8, 'O', "C2'-OH Hydroxyl", '-0.52 e', 'Strong H-bond donor to solvent');
    addBond(sugarAtoms[2], oh1, 1);
    const oh2 = addAtom(-4.2, 0.8, -0.6, 'O', "C4'-OH Hydroxyl", '-0.52 e', 'Strong H-bond donor to receptor vestibule');
    addBond(sugarAtoms[4], oh2, 1);
    const oh3 = addAtom(-3.1, 2.8, 0.5, 'O', "C6'-CH2OH Hydroxyl", '-0.52 e', 'Primary terminal hydroxyl');
    addBond(sugarAtoms[5], oh3, 1);

    const o28 = addAtom(
      3.8,
      -0.8,
      0.5,
      'O',
      'C28-Carboxyl / Ester Oxygen',
      '-0.56 e',
      'Electrostatic pin interacting with cellular targets'
    );
    addBond(allRings[4][1], o28, 1);
    const oh28 = addAtom(
      4.6,
      -0.4,
      0.7,
      'O',
      'C28-OH Terminal Hydroxyl',
      '-0.50 e',
      'Direct contact site for bio-agent target docking'
    );
    addBond(o28, oh28, 1);
  }

  return { atoms, bonds };
};

const getElementColor = (elem: AtomNode['element']): number => {
  switch (elem) {
    case 'O':
      return 0xef4444; // Red
    case 'N':
      return 0x3b82f6; // Blue
    case 'H':
      return 0xf8fafc; // White
    default:
      return 0x64748b; // Carbon (Slate-500)
  }
};

const getElementRadius = (elem: AtomNode['element'], mode: 'balls' | 'wireframe' | 'vdw'): number => {
  if (mode === 'vdw') {
    switch (elem) {
      case 'O':
        return 0.72;
      case 'N':
        return 0.76;
      case 'H':
        return 0.45;
      default:
        return 0.82;
    }
  }
  switch (elem) {
    case 'O':
      return 0.32;
    case 'N':
      return 0.34;
    case 'H':
      return 0.18;
    default:
      return 0.36;
  }
};

export const ActiveBioAgentMolecularViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<BioAgentMoleculeId>('saikosaponin');
  const [renderMode, setRenderMode] = useState<'balls' | 'wireframe' | 'vdw'>('balls');
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);
  const [showBindingSites, setShowBindingSites] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [selectedBindingSiteId, setSelectedBindingSiteId] = useState<string>('saiko-site-1');
  const [hoveredEntity, setHoveredEntity] = useState<{
    title: string;
    subtitle: string;
    detail: string;
    affinity?: string;
    x: number;
    y: number;
  } | null>(null);

  const activeCompound = ACTIVE_BIOAGENT_COMPOUNDS[selectedMoleculeId];

  // Keep selected binding site synced when compound changes
  useEffect(() => {
    if (activeCompound.bindingSites.length > 0) {
      setSelectedBindingSiteId(activeCompound.bindingSites[0].id);
    }
  }, [selectedMoleculeId]);

  const activeBindingSite = useMemo(() => {
    return (
      activeCompound.bindingSites.find((s) => s.id === selectedBindingSiteId) ||
      activeCompound.bindingSites[0]
    );
  }, [activeCompound, selectedBindingSiteId]);

  // Three.js interactive scene refs
  const sceneRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraZRef = useRef<number>(10.5);
  const targetCameraZRef = useRef<number>(10.5);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const desiredTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Focus camera directly onto a binding site
  const handleFocusBindingSite = (site: BindingSite) => {
    setSelectedBindingSiteId(site.id);
    desiredTargetRef.current.set(site.position[0] * 0.4, site.position[1] * 0.4, site.position[2] * 0.4);
    targetRotationRef.current.x = -site.position[1] * 0.12;
    targetRotationRef.current.y = site.position[0] * 0.22;
    targetCameraZRef.current = 8.0; // Zoom in for close inspection
  };

  const handleResetOrbit = () => {
    targetRotationRef.current = { x: 0, y: 0 };
    targetCameraZRef.current = 10.5;
    desiredTargetRef.current.set(0, 0, 0);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = 430;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, cameraZRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio lighting rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(activeCompound.themeColor, 0.9);
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.0, 40);
    rimLight.position.set(0, -6, -6);
    scene.add(rimLight);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    const { atoms, bonds } = buildMolecularCoordinates(selectedMoleculeId);
    const atomMeshes: THREE.Mesh[] = [];
    const bindingSiteMeshes: THREE.Mesh[] = [];

    // Render Atoms
    atoms.forEach((atom) => {
      const radius = getElementRadius(atom.element, renderMode);
      const color = getElementColor(atom.element);
      const geo = new THREE.SphereGeometry(radius, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25,
        roughness: 0.25,
        metalness: 0.2,
        wireframe: renderMode === 'wireframe',
        transparent: renderMode === 'vdw',
        opacity: renderMode === 'vdw' ? 0.72 : 1.0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.x, atom.y, atom.z);
      mesh.userData = { type: 'atom', atomData: atom };
      moleculeGroup.add(mesh);
      atomMeshes.push(mesh);
    });

    // Render Chemical Bonds
    if (renderMode !== 'vdw') {
      bonds.forEach((bond) => {
        const atomA = atoms[bond.from];
        const atomB = atoms[bond.to];
        if (!atomA || !atomB) return;

        const pA = new THREE.Vector3(atomA.x, atomA.y, atomA.z);
        const pB = new THREE.Vector3(atomB.x, atomB.y, atomB.z);
        const distance = pA.distanceTo(pB);
        const bondRadius = bond.order === 2 ? 0.1 : 0.085;

        const bondGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 12);
        const bondMat = new THREE.MeshStandardMaterial({
          color: bond.order === 2 ? 0x94a3b8 : 0x64748b,
          metalness: 0.35,
          roughness: 0.35,
        });

        const bondMesh = new THREE.Mesh(bondGeo, bondMat);
        const midpoint = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
        bondMesh.position.copy(midpoint);

        const direction = new THREE.Vector3().subVectors(pB, pA).normalize();
        const axis = new THREE.Vector3(0, 1, 0);
        bondMesh.quaternion.setFromUnitVectors(axis, direction);

        moleculeGroup.add(bondMesh);
      });
    }

    // Render High-Fidelity 3D Binding Site Holographic Halos
    if (showBindingSites) {
      activeCompound.bindingSites.forEach((site) => {
        const isSelected = site.id === selectedBindingSiteId;
        const siteGroup = new THREE.Group();
        siteGroup.position.set(...site.position);

        // Core translucent interaction sphere
        const sphereGeo = new THREE.SphereGeometry(site.radius, 24, 24);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: site.themeColor,
          emissive: site.themeColor,
          emissiveIntensity: isSelected ? 0.8 : 0.4,
          transparent: true,
          opacity: isSelected ? 0.42 : 0.22,
          roughness: 0.3,
          wireframe: false,
        });
        const siteSphere = new THREE.Mesh(sphereGeo, sphereMat);
        siteSphere.userData = { type: 'bindingSite', siteData: site };
        siteGroup.add(siteSphere);
        bindingSiteMeshes.push(siteSphere);

        // Outer wireframe orbit ring indicating binding field
        const ringGeo = new THREE.TorusGeometry(site.radius * 1.15, 0.035, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: site.themeColor,
          transparent: true,
          opacity: isSelected ? 0.9 : 0.45,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        siteGroup.add(ringMesh);

        moleculeGroup.add(siteGroup);
      });
    }

    // Raycaster for interactive hover and click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHoverMesh: THREE.Mesh | null = null;

    // Interactive Drag to Rotate & Zoom Listeners
    const onPointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();

      // Handle Manual Rotation when dragging
      if (isDraggingRef.current) {
        const dx = e.clientX - prevMouseRef.current.x;
        const dy = e.clientY - prevMouseRef.current.y;
        targetRotationRef.current.y += dx * 0.007;
        targetRotationRef.current.x += dy * 0.007;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      }

      // Raycast inspection
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allClickables = [...bindingSiteMeshes, ...atomMeshes];
      const intersects = raycaster.intersectObjects(allClickables, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData;

        if (currentHoverMesh && currentHoverMesh !== hit) {
          currentHoverMesh.scale.set(1, 1, 1);
        }
        currentHoverMesh = hit;
        hit.scale.set(1.18, 1.18, 1.18);
        renderer.domElement.style.cursor = 'pointer';

        if (data.type === 'bindingSite') {
          const site = data.siteData as BindingSite;
          setHoveredEntity({
            title: site.name,
            subtitle: `${site.code} · ${site.targetReceptorCleft}`,
            detail: site.pharmacologicalRole,
            affinity: `${site.bindingAffinity} (Kd: ${site.kd})`,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        } else {
          const atom = data.atomData as AtomNode;
          setHoveredEntity({
            title: atom.label,
            subtitle: `Element ${atom.element} · Partial Charge: ${atom.charge}`,
            detail: atom.role,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      } else {
        if (currentHoverMesh) {
          currentHoverMesh.scale.set(1, 1, 1);
          currentHoverMesh = null;
        }
        if (!isDraggingRef.current) {
          renderer.domElement.style.cursor = 'grab';
        }
        setHoveredEntity(null);
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      if (renderer.domElement) {
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraZRef.current = Math.max(4.5, Math.min(18, targetCameraZRef.current + e.deltaY * 0.008));
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allClickables = [...bindingSiteMeshes, ...atomMeshes];
      const intersects = raycaster.intersectObjects(allClickables, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData.type === 'bindingSite') {
          handleFocusBindingSite(hit.userData.siteData as BindingSite);
        }
      }
    };

    const dom = renderer.domElement;
    dom.style.cursor = 'grab';
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    dom.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('mouseleave', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

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

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous Auto-Orbit when not dragging
      if (isAutoOrbit && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.0035;
      }

      // Smooth exponential damping on rotation and camera zoom
      sceneRotationRef.current.x = THREE.MathUtils.damp(
        sceneRotationRef.current.x,
        targetRotationRef.current.x,
        8,
        delta
      );
      sceneRotationRef.current.y = THREE.MathUtils.damp(
        sceneRotationRef.current.y,
        targetRotationRef.current.y,
        8,
        delta
      );
      cameraZRef.current = THREE.MathUtils.damp(cameraZRef.current, targetCameraZRef.current, 6, delta);

      moleculeGroup.rotation.x = sceneRotationRef.current.x;
      moleculeGroup.rotation.y = sceneRotationRef.current.y;
      camera.position.z = cameraZRef.current;

      // Smooth camera pan toward desired focus target
      cameraTargetRef.current.lerp(desiredTargetRef.current, 0.08);
      camera.lookAt(cameraTargetRef.current);

      // Binding Site Pulsing Animation (gentle breathing halo)
      bindingSiteMeshes.forEach((mesh, idx) => {
        const pulse = 1 + Math.sin(elapsedTime * 3.5 + idx * 1.5) * 0.08;
        mesh.scale.set(pulse, pulse, pulse);
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = 430;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      dom.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('mouseleave', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedMoleculeId, renderMode, isAutoOrbit, showBindingSites, selectedBindingSiteId]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Atom className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Three.js 3D Molecular Structure &amp; Binding Site Inspector</span>
              <span className="text-[10px] font-mono text-teal-400">({fps} FPS)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 3D chemical structures: drag to rotate, scroll to zoom, and inspect active receptor binding sites
            </p>
          </div>
        </div>

        {/* Viewport Control Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBindingSites((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              showBindingSites
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 3D Binding Site Holographic Halos"
          >
            <Target className="w-3.5 h-3.5 text-teal-400" />
            <span>Binding Sites ({showBindingSites ? 'Visible' : 'Hidden'})</span>
          </button>

          {/* Render Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {(
              [
                { id: 'balls', label: 'Ball & Stick' },
                { id: 'vdw', label: 'Space-Filling' },
                { id: 'wireframe', label: 'Orbitals' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setRenderMode(m.id)}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                  renderMode === m.id
                    ? 'bg-slate-800 text-teal-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAutoOrbit((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isAutoOrbit
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoOrbit ? 'animate-spin' : ''}`} />
            <span>{isAutoOrbit ? 'Auto-Orbit' : 'Manual'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetOrbit}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Camera Orientation & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compound Selector Carousel Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {(Object.keys(ACTIVE_BIOAGENT_COMPOUNDS) as BioAgentMoleculeId[]).map((cid) => {
          const comp = ACTIVE_BIOAGENT_COMPOUNDS[cid];
          const isSelected = selectedMoleculeId === cid;
          return (
            <button
              key={cid}
              type="button"
              onClick={() => setSelectedMoleculeId(cid)}
              className={`p-2.5 rounded-lg border text-left transition-all min-w-[190px] shrink-0 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-teal-500/60 shadow-lg shadow-teal-500/5'
                  : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <span
                  className="text-xs font-bold truncate"
                  style={{ color: isSelected ? comp.colorHex : '#e2e8f0' }}
                >
                  {comp.name}
                </span>
                <span className="text-[10px] font-serif text-teal-400 shrink-0">{comp.chineseHerb}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">{comp.sourceHerb.split(' ')[0]}</div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400 font-bold">{comp.formula}</span>
                <span className="text-teal-400 font-semibold">{comp.bindingSites.length} Binding Sites</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Three.js 3D Viewport with Drag Rotation & Hover Tooltips */}
      <div
        ref={mountRef}
        className="w-full h-[430px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center shadow-inner select-none"
      >
        {/* Floating Raycaster Tooltip */}
        {hoveredEntity && (
          <div
            className="pointer-events-none absolute z-30 px-3.5 py-2.5 rounded-lg bg-slate-900/95 border border-teal-500/60 shadow-2xl backdrop-blur-sm text-xs space-y-1 transition-transform max-w-xs"
            style={{
              left: Math.min(
                mountRef.current ? mountRef.current.clientWidth - 280 : 360,
                Math.max(14, hoveredEntity.x + 16)
              ),
              top: Math.max(14, hoveredEntity.y - 75),
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{hoveredEntity.title}</span>
              </div>
              {hoveredEntity.affinity && (
                <span className="text-[9px] font-mono text-teal-300 px-1 rounded bg-teal-500/10 border border-teal-500/30 shrink-0">
                  {hoveredEntity.affinity}
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-teal-400">{hoveredEntity.subtitle}</div>
            <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{hoveredEntity.detail}</p>
          </div>
        )}

        {/* Top-Left Molecule Header Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCompound.colorHex }} />
          <span className="text-xs font-bold text-slate-100">{activeCompound.name}</span>
          <span className="text-xs font-mono text-slate-400">({activeCompound.formula})</span>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            {activeCompound.protocolStatus}
          </span>
        </div>

        {/* Top-Right Mouse Interaction Guide Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span>🖱 Drag to Rotate</span>
          <span className="text-slate-600">·</span>
          <span>Scroll to Zoom</span>
        </div>

        {/* Bottom CPK Legend & Binding Sites Status */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-sm border border-slate-800 p-2 rounded-lg text-[10px] font-mono flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-300">Carbon (C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Oxygen (O)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Nitrogen (N)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-teal-400 bg-teal-500/30" />
            <span className="text-teal-300 font-semibold">Active Binding Site Halo</span>
          </div>
        </div>
      </div>

      {/* Interactive Binding Sites Inspection & Navigation Deck */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Active Receptor Binding Sites ({activeCompound.bindingSites.length} Identified Clefts)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Select a site to focus 3D camera and inspect pharmacodynamic kinetics
          </span>
        </div>

        {/* Binding Site Quick Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {activeCompound.bindingSites.map((site) => {
            const isSelected = site.id === selectedBindingSiteId;
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => handleFocusBindingSite(site)}
                className={`p-3 rounded-lg border text-left transition-all space-y-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500/80 shadow-md shadow-teal-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-bold text-teal-400">{site.code}</span>
                  <span className="text-[10px] font-mono text-slate-300 font-semibold tabular-nums">
                    {site.bindingAffinity}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100 line-clamp-1">{site.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{site.targetReceptorCleft}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Binding Site Deep Telemetry & Kinetics Card */}
        {activeBindingSite && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-teal-400">{activeBindingSite.code}</span>
                <span className="text-sm font-bold text-slate-100">{activeBindingSite.name}</span>
                <span className="text-[10px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                  Affinity: {activeBindingSite.bindingAffinity} (Kd: {activeBindingSite.kd})
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleFocusBindingSite(activeBindingSite)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap self-start sm:self-auto"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Focus Camera on Site</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Target Receptor Cleft:</div>
                <div className="text-slate-200 font-semibold font-mono">{activeBindingSite.targetReceptorCleft}</div>

                <div className="text-[10px] font-mono text-slate-400 uppercase pt-1">Key Interacting Residues:</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeBindingSite.targetResidues.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300"
                      title={r.role}
                    >
                      <strong className="text-teal-400">{r.residue}</strong> ({r.role})
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Chemical Interaction Mechanism:</div>
                <p className="text-slate-300 font-sans leading-relaxed">{activeBindingSite.interactionChemistry}</p>

                <div className="text-[10px] font-mono text-slate-400 uppercase pt-1">Therapeutic Impact:</div>
                <p className="text-slate-300 font-sans leading-relaxed">{activeBindingSite.pharmacologicalRole}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Therapy Mechanism & Pharmacodynamics Breakdown Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-100">{activeCompound.name}</span>
              <span className="text-xs font-mono text-teal-400">{activeCompound.chemicalClass}</span>
              <span className="text-xs text-slate-400">· {activeCompound.sourceHerb}</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Target: <strong>{activeCompound.targetReceptor}</strong></span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dispatched By: <strong className="text-slate-200">{activeCompound.dispatchedAgent}</strong></span>
          </div>
        </div>

        {/* Mechanism of Action */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
          <div className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            <span>Therapeutic Cellular Mechanism &amp; Pathway</span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {activeCompound.mechanismSummary}
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
            <strong>Metabolic Clearance: </strong>{activeCompound.metabolicPathway}
          </div>
        </div>

        {/* Pharmacokinetic Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono tabular-nums">
          <div className="bg-slate-900/80 border border-slate-800 rounded p-2 space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase">Molecular Wt</div>
            <div className="text-slate-200 font-bold">{activeCompound.molecularWeight} g/mol</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded p-2 space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase">LogP (Lipophilicity)</div>
            <div className="text-teal-400 font-bold">{activeCompound.logP}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded p-2 space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase">Polar Surface (TPSA)</div>
            <div className="text-amber-400 font-bold">{activeCompound.tpsa} Å²</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded p-2 space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase">H-Bond Donors</div>
            <div className="text-slate-200 font-bold">{activeCompound.hbd}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded p-2 space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase">H-Bond Acceptors</div>
            <div className="text-slate-200 font-bold">{activeCompound.hba}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded p-2 space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase">TCM Clinical Pattern</div>
            <div className="text-emerald-400 font-bold truncate">{activeCompound.clinicalIndication.split(' ')[0]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
