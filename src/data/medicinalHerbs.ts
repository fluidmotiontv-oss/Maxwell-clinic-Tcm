export interface AlkaloidCompound {
  id: string;
  name: string;
  chemicalClass: string;
  scaffoldType: 'triterpenoid-saponin' | 'cyclopeptide-alkaloid' | 'phenylpropanoid' | 'phthalide' | 'isoflavone';
  formula: string;
  molecularWeight: string;
  solubility: string;
  metabolicPathway: string;
  pharmacodynamics: string;
}

export interface MedicinalHerb {
  id: string;
  chineseName: string;
  pinyin: string;
  englishName: string;
  botanicalName: string;
  meridianTropism: string[];
  thermalEnergetics: string;
  primaryIndications: string;
  activeAlkaloids: AlkaloidCompound[];
  clinicalNotes: string;
}

export const MEDICINAL_HERB_CODEX: MedicinalHerb[] = [
  {
    id: 'herb-chaihu',
    chineseName: '柴胡',
    pinyin: 'Chai Hu',
    englishName: 'Bupleurum Root',
    botanicalName: 'Bupleurum chinense / falcatum',
    meridianTropism: ['Liver', 'Gallbladder', 'San Jiao'],
    thermalEnergetics: 'Slightly Cold, Bitter, Acrid',
    primaryIndications: 'Spreads Liver Qi, resolves Shao Yang syndromes, lifts clear Yang Qi.',
    activeAlkaloids: [
      {
        id: 'saikosaponin-a',
        name: 'Saikosaponin A (Triterpenoid Saponin)',
        chemicalClass: 'Oleanane-type Triterpenoid Saponin',
        scaffoldType: 'triterpenoid-saponin',
        formula: 'C42H68O13',
        molecularWeight: '780.98 g/mol',
        solubility: 'Soluble in hot water, methanol, and aqueous ethanol; sparing in ether.',
        metabolicPathway: 'Hepatic CYP450 metabolism (CYP3A4/CYP2D6 inhibition modulation); excreted primarily via biliary route.',
        pharmacodynamics: 'Anti-inflammatory corticosteroid-like modulation, suppression of inflammatory cytokine cascade (IL-6, TNF-alpha), autonomic vagal nerve stabilization.',
      },
      {
        id: 'saikosaponin-d',
        name: 'Saikosaponin D',
        chemicalClass: 'Epimeric Triterpenoid Saponin',
        scaffoldType: 'triterpenoid-saponin',
        formula: 'C42H68O13',
        molecularWeight: '780.98 g/mol',
        solubility: 'Moderate lipid and aqueous solubility in warm polar solvents.',
        metabolicPathway: 'Conjugation via glucuronidation in liver microsomes; biliary elimination.',
        pharmacodynamics: 'Modulates hypothalamic-pituitary-adrenal (HPA) axis, downregulates nitric oxide synthase expression in hepatic macrophages.',
      },
    ],
    clinicalNotes: 'Cornerstone herb for Gan Yu (Liver Qi Stagnation). Directly modulates RMSSD HRV and reduces biliary constriction.',
  },
  {
    id: 'herb-suanzaoren',
    chineseName: '酸枣仁',
    pinyin: 'Suan Zao Ren',
    englishName: 'Ziziphus Seed / Spiny Jujube',
    botanicalName: 'Ziziphus jujuba var. spinosa',
    meridianTropism: ['Heart', 'Liver', 'Gallbladder', 'Spleen'],
    thermalEnergetics: 'Neutral, Sweet, Sour',
    primaryIndications: 'Nourishes Heart Yin, calms Shen spirit, generates fluids, arrests spontaneous sweating.',
    activeAlkaloids: [
      {
        id: 'jujuboside-a',
        name: 'Jujuboside A (Saponin / Glycoside)',
        chemicalClass: 'Dammarane Triterpenoid Glycoside',
        scaffoldType: 'triterpenoid-saponin',
        formula: 'C58H94O26',
        molecularWeight: '1207.35 g/mol',
        solubility: 'Highly water-soluble glycoside; poorly permeable across blood-brain barrier independently without lipid carrier.',
        metabolicPathway: 'Hydrolysis by intestinal microflora into active aglycones before systemic absorption; hepatic clearance.',
        pharmacodynamics: 'Enhances GABAergic neurotransmission, increases hippocampal slow-wave delta power, prolongs barbiturate-induced sleep time.',
      },
      {
        id: 'sanjoinine-a',
        name: 'Sanjoinine A (Cyclopeptide Alkaloid)',
        chemicalClass: '14-Membered Cyclopeptide Alkaloid',
        scaffoldType: 'cyclopeptide-alkaloid',
        formula: 'C32H40N4O4',
        molecularWeight: '544.69 g/mol',
        solubility: 'Lipophilic alkaloid; soluble in chloroform, ethanol, and warm organic solvents.',
        metabolicPathway: 'Rapid hepatic first-pass metabolism via CYP3A4 N-demethylation.',
        pharmacodynamics: 'Sedative-hypnotic action, inhibits central nervous system excitation, lowers spontaneous motor activity.',
      },
    ],
    clinicalNotes: 'Essential for treating midnight awakenings (1-3 AM) and nourishing Heart Blood during Shen disturbance.',
  },
  {
    id: 'herb-danggui',
    chineseName: '当归',
    pinyin: 'Dang Gui',
    englishName: 'Chinese Angelica Root',
    botanicalName: 'Angelica sinensis',
    meridianTropism: ['Liver', 'Heart', 'Spleen'],
    thermalEnergetics: 'Warm, Sweet, Pungent, Bitter',
    primaryIndications: 'Tonifies Blood, harmonizes menstrual cycle, moistens intestines to unblock bowels.',
    activeAlkaloids: [
      {
        id: 'ferulic-acid',
        name: 'Ferulic Acid (Hydroxycinnamic Acid / Phenylpropanoid)',
        chemicalClass: 'Phenolic Phenylpropanoid Acid',
        scaffoldType: 'phenylpropanoid',
        formula: 'C10H10O4',
        molecularWeight: '194.18 g/mol',
        solubility: 'Freely soluble in hot water, ethanol, and ethyl acetate.',
        metabolicPathway: 'Sulfation and glucuronidation in intestinal wall and liver; renal excretion of conjugated metabolites.',
        pharmacodynamics: 'Potent antioxidant, inhibits platelet aggregation, scavenges free radicals, protects vascular endothelial lining.',
      },
      {
        id: 'ligustilide',
        name: 'Z-Ligustilide (Phthalide Derivative)',
        chemicalClass: 'Volatile Lactone Phthalide',
        scaffoldType: 'phthalide',
        formula: 'C12H14O2',
        molecularWeight: '190.24 g/mol',
        solubility: 'Lipophilic volatile oil component; soluble in ethanol and essential oil fractions.',
        metabolicPathway: 'Rapidly metabolized by hepatic epoxide hydrolase pathways.',
        pharmacodynamics: 'Spasmolytic action on uterine and vascular smooth muscle, improves cerebral microcirculation.',
      },
    ],
    clinicalNotes: 'Primary blood-nourishing botanical pairing with Chai Hu in Xiao Yao San to soften Liver tension.',
  },
  {
    id: 'herb-huangqi',
    chineseName: '黄芪',
    pinyin: 'Huang Qi',
    englishName: 'Astragalus Root',
    botanicalName: 'Astragalus membranaceus',
    meridianTropism: ['Spleen', 'Lung'],
    thermalEnergetics: 'Slightly Warm, Sweet',
    primaryIndications: 'Tonifies Qi, raises Yang Qi, strengthens defensive Wei Qi, promotes diuresis and tissue regeneration.',
    activeAlkaloids: [
      {
        id: 'astragaloside-iv',
        name: 'Astragaloside IV (Cycloartane Triterpene Glycoside)',
        chemicalClass: 'Cycloartane-type Triterpene Glycoside',
        scaffoldType: 'triterpenoid-saponin',
        formula: 'C41H68O14',
        molecularWeight: '784.97 g/mol',
        solubility: 'Soluble in methanol, ethanol, and warm aqueous mixtures.',
        metabolicPathway: 'Absorbed via active transport in intestine; hepatic glucuronide conjugation with biliary excretion.',
        pharmacodynamics: 'Activates telomerase activity, enhances mitochondrial ATP synthesis, reduces hs-CRP inflammatory cytokines.',
      },
      {
        id: 'calycosin-7-glucoside',
        name: 'Calycosin-7-O-beta-D-glucoside (Isoflavone)',
        chemicalClass: 'Chromone-Ring Isoflavone Glycoside',
        scaffoldType: 'isoflavone',
        formula: 'C22H22O10',
        molecularWeight: '446.40 g/mol',
        solubility: 'Moderate aqueous and polar organic solubility.',
        metabolicPathway: 'Deglycosylation by intestinal bacteria into active calycosin aglycone before systemic distribution.',
        pharmacodynamics: 'Cardioprotective, promotes angiogenesis via VEGF upregulation, protects endothelial barrier function.',
      },
    ],
    clinicalNotes: 'Vital Spleen Qi booster paired in protocols targeting low metabolic redox and fatigue.',
  },
];
