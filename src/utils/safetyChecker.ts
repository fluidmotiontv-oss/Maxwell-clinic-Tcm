import { HerbalFormulation } from '../types/clinic';

export interface ContraindicationAlert {
  id: string;
  severity: 'High' | 'Moderate' | 'Low';
  herb: string;
  medication: string;
  interactionType: string;
  description: string;
  clinicalRecommendation: string;
}

// Known Herb-Drug Interaction Knowledge Base for Maxwell Clinic Dispensary
const DRUG_HERB_INTERACTION_RULES: Array<{
  herbKeyword: string;
  medicationKeyword: string;
  severity: 'High' | 'Moderate' | 'Low';
  interactionType: string;
  description: string;
  clinicalRecommendation: string;
}> = [
  {
    herbKeyword: 'dang gui',
    medicationKeyword: 'warfarin',
    severity: 'High',
    interactionType: 'Additive Anticoagulant Effect (Bleeding Risk)',
    description: 'Angelica sinensis (Dang Gui) contains coumarin derivatives that may potentiate the anticoagulant effects of Warfarin/Coumadin.',
    clinicalRecommendation: 'Monitor INR weekly if co-prescribed. Consider substituting with blood-nourishing non-coumarin botanicals (e.g., Shu Di Huang or Bai Shao) or staggering administration by 3 hours.',
  },
  {
    herbKeyword: 'dang gui',
    medicationKeyword: 'aspirin',
    severity: 'Moderate',
    interactionType: 'Platelet Aggregation Inhibition',
    description: 'Combined antiplatelet activity of Dang Gui and Aspirin/NSAIDs may increase bruising or minor bleeding tendencies.',
    clinicalRecommendation: 'Counsel patient on signs of petechiae or excessive bruising. Supervise clinical co-administration.',
  },
  {
    herbKeyword: 'chuan xiong',
    medicationKeyword: 'warfarin',
    severity: 'High',
    interactionType: 'Synergistic Thrombolytic / Anticoagulant',
    description: 'Ligusticum wallichii (Chuan Xiong) strongly invigorates blood circulation and inhibits platelet aggregation, compounding anticoagulant medication.',
    clinicalRecommendation: 'Exercise caution. Reduce Chuan Xiong dosage by 50% or monitor PT/INR closely.',
  },
  {
    herbKeyword: 'suan zao ren',
    medicationKeyword: 'ssri',
    severity: 'Moderate',
    interactionType: 'CNS Sedative Potentiation',
    description: 'Ziziphus spinosa (Suan Zao Ren) calms Shen via GABAergic pathways, potentially augmenting sedation when combined with SSRIs or benzodiazepines.',
    clinicalRecommendation: 'Monitor for excessive daytime somnolence. Advise patient to take herbal formula 2 hours prior to sleep.',
  },
  {
    herbKeyword: 'suan zao ren',
    medicationKeyword: 'benzodiazepine',
    severity: 'Moderate',
    interactionType: 'Additive CNS Depression',
    description: 'Additive sedative action on central nervous system receptors.',
    clinicalRecommendation: 'Start with half-dose of Suan Zao Ren decoction and monitor patient responsiveness.',
  },
  {
    herbKeyword: 'ginseng',
    medicationKeyword: 'insulin',
    severity: 'High',
    interactionType: 'Hypoglycemic Synergism',
    description: 'Ren Shen (Panax Ginseng) may lower blood glucose levels, potentially leading to hypoglycemic episodes when combined with Insulin or oral hypoglycemics.',
    clinicalRecommendation: 'Monitor fasting blood glucose and continuous glucose monitor (CGM) trends daily upon initiating ginseng formulation.',
  },
  {
    herbKeyword: 'ginseng',
    medicationKeyword: 'metformin',
    severity: 'Moderate',
    interactionType: 'Additive Blood Glucose Reduction',
    description: 'Enhances insulin sensitivity, requiring potential adjustment of oral hypoglycemic dosage.',
    clinicalRecommendation: 'Track postprandial glucose levels during the first 14 days of herbal therapy.',
  },
  {
    herbKeyword: 'huang qi',
    medicationKeyword: 'immunosuppressant',
    severity: 'High',
    interactionType: 'Immune Stimulation vs Immunosuppression',
    description: 'Astragalus membranaceus (Huang Qi) stimulates T-cell and macrophage activity, which may antagonize the therapeutic action of calcineurin inhibitors or organ transplant immunosuppressants.',
    clinicalRecommendation: 'Contraindicated in transplant patients or active autoimmune immunosuppressive protocols. Substitute with Yin Yin nourishing herbs.',
  },
  {
    herbKeyword: 'chai hu',
    medicationKeyword: 'hepatotoxic',
    severity: 'Moderate',
    interactionType: 'CYP450 Enzyme Modulation',
    description: 'Bupleurum (Chai Hu) undergoes hepatic metabolism via CYP3A4 and CYP2C9, requiring caution with concurrent hepatically cleared medications.',
    clinicalRecommendation: 'Check baseline ALT/AST liver function panels prior to initiating Chai Hu formulas.',
  },
];

/**
 * Automatically checks a suggested herbal formulation against a patient's medication list
 */
export function performSafetyCheck(
  herbalFormulation: HerbalFormulation | undefined,
  medications: string[] | undefined
): ContraindicationAlert[] {
  if (!herbalFormulation || !medications || medications.length === 0) {
    return [];
  }

  const alerts: ContraindicationAlert[] = [];
  const herbs = [
    herbalFormulation.classicFormula.toLowerCase(),
    ...(herbalFormulation.keyHerbs || []).map((h) => h.toLowerCase()),
  ];

  let alertCounter = 1;

  for (const med of medications) {
    const medLower = med.toLowerCase();
    for (const rule of DRUG_HERB_INTERACTION_RULES) {
      const herbMatch = herbs.some((h) => h.includes(rule.herbKeyword));
      const medMatch = medLower.includes(rule.medicationKeyword);

      if (herbMatch && medMatch) {
        // Prevent duplicate alerts for the same rule
        const exists = alerts.some(
          (a) => a.herb === rule.herbKeyword && a.medication === med
        );
        if (!exists) {
          alerts.push({
            id: `ALERT-${alertCounter++}`,
            severity: rule.severity,
            herb: rule.herbKeyword.toUpperCase(),
            medication: med,
            interactionType: rule.interactionType,
            description: rule.description,
            clinicalRecommendation: rule.clinicalRecommendation,
          });
        }
      }
    }
  }

  // If no specific keyword rule matched but medications are present, add a general clinical advisory check
  if (alerts.length === 0 && medications.length > 0) {
    alerts.push({
      id: `ALERT-GEN-01`,
      severity: 'Low',
      herb: 'General Botanical Formula',
      medication: medications.join(', '),
      interactionType: 'Standard Pharmacokinetic Review',
      description: `Patient is currently taking concurrent medications (${medications.join(', ')}). No major high-severity contraindications detected with ${herbalFormulation.classicFormula}.`,
      clinicalRecommendation: 'Maintain standard 2-hour separation between prescription medications and concentrated herbal extracts.',
    });
  }

  return alerts;
}
