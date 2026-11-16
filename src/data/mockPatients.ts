import { CarePlan } from '../types/clinic';

export interface PresetPatient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-binary' | 'Other';
  sex: 'Female' | 'Male' | 'Non-binary';
  season: 'Spring (Wood)' | 'Summer (Fire)' | 'Late Summer (Earth)' | 'Autumn (Metal)' | 'Winter (Water)';
  occupation: string;
  tongue: string;
  pulse: string;
  complexion: string;
  voice: string;
  bioMarkers: {
    hrv: string;
    cortisol: string;
    crp: string;
    microbiome: string;
    sleep: string;
    alphaWave: string;
    mitochondrial: string;
    bloodPressure: string;
  };
  chiefComplaints: string;
  elementBalance: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  historicalCarePlan?: CarePlan;
  previousCarePlans?: CarePlan[];
  existingMedications: string[];
}

export const PRESET_PATIENTS: PresetPatient[] = [
  {
    id: 'pt-101',
    name: 'Elena Vance',
    age: 44,
    gender: 'Female',
    sex: 'Female',
    season: 'Autumn (Metal)',
    occupation: 'Software Engineering Director',
    tongue: 'Pale dusky tongue body, thin white coating, noticeable scalloped teeth marks on lateral borders.',
    pulse: 'Wiry and thready on the left Guan (Liver) position, weak at the right Cun (Lung).',
    complexion: 'Sallow, slightly dull skin tone with periorbital dark circles.',
    voice: 'Low tone, slight sighing speech pattern.',
    bioMarkers: {
      hrv: '28 ms (RMSSD - Low vagal tone)',
      cortisol: 'Flattened diurnal slope, low morning cortisol (10 nmol/L), elevated night (18 nmol/L)',
      crp: '3.4 mg/L (Subclinical systemic inflammation)',
      microbiome: 'Firmicutes/Bacteroidetes ratio 3.4, suppressed Akkermansia muciniphila',
      sleep: '62% Sleep Efficiency (Awakens 1:30 AM - 3:00 AM)',
      alphaWave: '7.8 Hz (Suppressed parietal alpha power)',
      mitochondrial: '68% ATP Redox Efficiency',
      bloodPressure: '128/84 mmHg',
    },
    chiefComplaints: 'Chronic afternoon brain fog, intercostal fullness, persistent midnight awakening during Liver organ clock hours (1-3 AM), emotional irritability followed by exhaustion, tension headaches.',
    elementBalance: {
      wood: 85, // Excess Wood Qi Stagnation
      fire: 45,
      earth: 30, // Deficient Earth Spleen Qi
      metal: 40,
      water: 35, // Deficient Water Kidney Yin
    },
    existingMedications: ['Warfarin 5mg daily', 'Lisinopril 10mg daily', 'Multivitamin'],
    historicalCarePlan: {
      id: 'plan-101',
      createdAt: '2026-11-04',
      patientName: 'Elena Vance',
      patientAge: 44,
      patientGender: 'Female',
      constitutionalSummary: {
        tcmPatternDiagnosis: 'Liver Qi Stagnation with Spleen Qi Deficiency & Secondary Kidney Yin Deficiency (Gan Yu Pi Xu).',
        yinYangBalance: 'Relative Yin Deficiency with Qi Stagnation in upper/middle jiao. Blood failing to nourish Shen during midnight.',
        fiveElementDynamic: 'Wood overacting on Earth (Wood-Earth imbalance). Liver Qi failing to flow smoothly, obstructing Spleen transformation.',
        bioMarkerCorrelation: 'Low HRV (28ms) directly reflects sympathetic dominance of Liver Qi Stagnation. Midnight cortisol spikes align with Liver Organ Clock (1-3 AM). Elevated hs-CRP mirrors intestinal permeability from Spleen Qi weakness.',
        rootCauseAnalysis: 'Unresolved autonomic stress drives chronic biliary & hepatic Qi constriction, suppressing vagal tone and impairing gut mucosal sIgA.',
      },
      integrativeProtocol: {
        herbalFormulation: {
          classicFormula: 'Xiao Yao San (Free and Easy Wanderer Powder) + Suan Zao Ren Tang',
          keyHerbs: ['Chai Hu (Bupleurum) - Cool/Spreading', 'Dang Gui (Angelica Sinensis) - Warm/Blood Nourishing', 'Bai Zhu (Atractylodes) - Warm/Spleen Tonifying', 'Suan Zao Ren (Ziziphus Seed) - Neutral/Calm Shen'],
          dosageInstruction: 'Take 4g concentrated granular extract 30 minutes before evening meal and 30 minutes before sleep.',
        },
        acupuncturePoints: [
          { pointCode: 'LV3', name: 'Taichong', meridian: 'Liver Channel of Foot-Jueyin', clinicalAction: 'Spreads Liver Qi, regulates sympathetic discharge, improves HRV.' },
          { pointCode: 'SP6', name: 'Sanyinjiao', meridian: 'Spleen Channel of Foot-Taiyin', clinicalAction: 'Intersection of Liver, Spleen & Kidney channels. Nourishes Blood & Yin.' },
          { pointCode: 'ST36', name: 'Zusanli', meridian: 'Stomach Channel of Foot-Yangming', clinicalAction: 'Fortifies Spleen Qi, reduces hs-CRP, enhances gut barrier.' },
          { pointCode: 'PC6', name: 'Neiguan', meridian: 'Pericardium Channel of Hand-Jueyin', clinicalAction: 'Unbinds chest, calms Shen, restores nighttime vagal power.' },
        ],
        dietaryTherapy: {
          thermalEnergetics: 'Neutral to slightly warm cooked foods, avoiding raw cold produce.',
          recommendedFoods: ['Steamed sweet potatoes', 'Congee with goji berries & lotus seeds', 'Roasted squash', 'Peppermint tea'],
          foodsToAvoid: ['Iced drinks', 'Greasy fried foods', 'Excess refined sugar', 'Late night alcohol'],
        },
        digitalTherapeutics: {
          frequencyHz: 174,
          frequencyName: '174Hz Wood Spreading & Vagal Release',
          binauralBeat: '6 Hz Theta Wave (1:00 AM Sync)',
          circadianRecommendation: 'Blue light blockade after 8:30 PM. Morning sunlight exposure at 7:15 AM for 15 minutes.',
          breathworkPattern: '4-7-8 Relaxing Vagal Breath (4s In, 7s Hold, 8s Exhale)',
        },
      },
      agenticActionItems: [
        { agentName: 'Diagnostic Bio-Synthesizer', taskType: 'Telemetry Track', actionDescription: 'Monitor night RMSSD HRV recovery trends via continuous wearable stream.', priority: 'High', status: 'Dispatched' },
        { agentName: 'Botanical Formulary Agent', taskType: 'Pharmacy Order', actionDescription: 'Route Xiao Yao San granular formula to Maxwell Clinic botanical dispensary.', priority: 'High', status: 'Completed' },
        { agentName: 'Frequency Harmonic Audio Agent', taskType: 'Audio Sync', actionDescription: 'Dispatch 174Hz + 6Hz Theta audio protocol to patient healing app profile.', priority: 'Medium', status: 'Dispatched' },
      ],
      safetyDisclaimer: 'All recommendations complement medical care. Monitor liver enzymes and adjust herbs under clinical supervision.',
    },
    previousCarePlans: [
      {
        id: 'plan-101',
        createdAt: '2026-11-04',
        patientName: 'Elena Vance',
        constitutionalSummary: {
          tcmPatternDiagnosis: 'Liver Qi Stagnation with Spleen Qi Deficiency (Gan Yu Pi Xu)',
          yinYangBalance: 'Relative Yin Deficiency with Upper Jiao Qi Stagnation',
          fiveElementDynamic: 'Wood Overacting on Earth (Improving from Previous Intake)',
          bioMarkerCorrelation: 'HRV 28 ms (Up from 22ms). hs-CRP reduced to 3.4 mg/L. Midnight cortisol spikes shifting earlier.',
          rootCauseAnalysis: 'Autonomic nervous system tone stabilizing under Xiao Yao San + 174Hz sound therapy.',
        },
        integrativeProtocol: {
          herbalFormulation: {
            classicFormula: 'Xiao Yao San + Suan Zao Ren Tang',
            keyHerbs: ['Chai Hu (Bupleurum)', 'Dang Gui (Angelica)', 'Bai Zhu (Atractylodes)', 'Suan Zao Ren (Ziziphus)'],
            dosageInstruction: '4g granular extract taken 30m before evening meal.',
          },
          acupuncturePoints: [
            { pointCode: 'LV3', name: 'Taichong', meridian: 'Liver Channel', clinicalAction: 'Spreads Liver Qi, regulates HRV.' },
            { pointCode: 'SP6', name: 'Sanyinjiao', meridian: 'Spleen Channel', clinicalAction: 'Nourishes Blood & Yin.' },
            { pointCode: 'ST36', name: 'Zusanli', meridian: 'Stomach Channel', clinicalAction: 'Fortifies Spleen Qi, reduces hs-CRP.' },
          ],
          dietaryTherapy: {
            thermalEnergetics: 'Neutral to warm cooked whole foods.',
            recommendedFoods: ['Steamed sweet potatoes', 'Lotus seed congee', 'Roasted squash'],
            foodsToAvoid: ['Iced drinks', 'Greasy fried foods', 'Refined sugar'],
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
          { agentName: 'Diagnostic Bio-Synthesizer', taskType: 'Telemetry Track', actionDescription: 'Monitor continuous RMSSD HRV recovery stream.', priority: 'High', status: 'Dispatched' },
        ],
        safetyDisclaimer: 'All recommendations complement medical care.',
      },
      {
        id: 'plan-098',
        createdAt: '2026-10-12',
        patientName: 'Elena Vance',
        constitutionalSummary: {
          tcmPatternDiagnosis: 'Severe Gan Yu (Severe Hepatic Qi Stagnation with Stagnant Heat)',
          yinYangBalance: 'Yin & Blood Deficiency with Heat Disturbance',
          fiveElementDynamic: 'Wood Flaring Fire Overacting on Earth',
          bioMarkerCorrelation: 'HRV 22 ms (Severe suppression). hs-CRP 4.8 mg/L. Sleep efficiency 52%.',
          rootCauseAnalysis: 'Acute executive deadline pressure driving adrenergic overload and gut dysbiosis.',
        },
        integrativeProtocol: {
          herbalFormulation: {
            classicFormula: 'Chai Hu Shu Gan San + Dan Zhi Xiao Yao San',
            keyHerbs: ['Chai Hu (Bupleurum)', 'Zhi Zhi (Gardenia)', 'Mu Dan Pi (Moutan)', 'Chuan Xiong (Ligusticum)'],
            dosageInstruction: '5g granular extract twice daily.',
          },
          acupuncturePoints: [
            { pointCode: 'LV3', name: 'Taichong', meridian: 'Liver Channel', clinicalAction: 'Subdues Liver Yang, clears stagnant Heat.' },
            { pointCode: 'LI4', name: 'Hegu', meridian: 'Large Intestine Channel', clinicalAction: 'Four Gates combination with LV3.' },
            { pointCode: 'PC6', name: 'Neiguan', meridian: 'Pericardium Channel', clinicalAction: 'Calms Heart Shen and unbinds chest.' },
          ],
          dietaryTherapy: {
            thermalEnergetics: 'Cooling, hydrating produce and soothing teas.',
            recommendedFoods: ['Mung bean soup', 'Steamed dandelion greens', 'Chrysanthemum tea'],
            foodsToAvoid: ['Spicy chilies', 'Alcohol', 'Coffee', 'Red meat'],
          },
          digitalTherapeutics: {
            frequencyHz: 528,
            frequencyName: '528Hz Cardiac Transformation',
            binauralBeat: '4 Hz Delta Wave',
            circadianRecommendation: 'Strict 10:00 PM sleep curtain.',
            breathworkPattern: 'Box Breathing 4-4-4-4',
          },
        },
        agenticActionItems: [
          { agentName: 'Botanical Formulary Agent', taskType: 'Pharmacy Order', actionDescription: 'Dispense Chai Hu Shu Gan San formula.', priority: 'High', status: 'Completed' },
        ],
        safetyDisclaimer: 'All recommendations complement medical care.',
      },
    ],
  },
  {
    id: 'pt-102',
    name: 'Marcus Chen',
    age: 58,
    gender: 'Male',
    sex: 'Male',
    season: 'Winter (Water)',
    occupation: 'Architect & Urban Planner',
    tongue: 'Deep red body, dry with minimal coating, vertical center cracks, red tip.',
    pulse: 'Rapid, floating, and empty at the deep Kidney Chi positions.',
    complexion: 'Flushed cheeks, dry lusterless skin.',
    voice: 'Raspy, hyper-energetic speech.',
    bioMarkers: {
      hrv: '19 ms (Severely suppressed)',
      cortisol: 'Excess evening cortisol (31 nmol/L), elevated total 24h burden',
      crp: '4.2 mg/L',
      microbiome: 'Depleted SCFA producers (Roseburia, Faecalibacterium)',
      sleep: '51% Sleep Efficiency (Hot flashes & night sweats at 2 AM)',
      alphaWave: '6.5 Hz (Disrupted)',
      mitochondrial: '61% Redox Capacity',
      bloodPressure: '138/88 mmHg',
    },
    chiefComplaints: 'Severe insomnia, dry throat at night, tinnitus (high-pitched buzzing), lower back weakness, hyper-vigilance during work deadlines.',
    elementBalance: {
      wood: 50,
      fire: 88, // Heart Fire Blazing
      earth: 35,
      metal: 30,
      water: 20, // Severe Kidney Water Deficiency
    },
    existingMedications: ['Metformin 500mg', 'Atorvastatin 20mg'],
  },
  {
    id: 'pt-103',
    name: 'Sophia Wu, MD',
    age: 39,
    gender: 'Female',
    sex: 'Female',
    season: 'Summer (Fire)',
    occupation: 'Integrative Neurologist',
    tongue: 'Pale, puffy with thick white greasy coating.',
    pulse: 'Slippery and moderate.',
    complexion: 'Pale, slightly swollen facial contours.',
    voice: 'Heavy, slow deliberate speech.',
    bioMarkers: {
      hrv: '42 ms',
      cortisol: 'Flat low rhythm (11 nmol/L morning)',
      crp: '1.8 mg/L',
      microbiome: 'Moderate diversity, elevated Methanobrevibacter',
      sleep: '79% Sleep Efficiency (Morning groggliness & heavy limbs)',
      alphaWave: '9.5 Hz',
      mitochondrial: '82% Redox Capacity',
      bloodPressure: '112/72 mmHg',
    },
    chiefComplaints: 'Digestive fullness after small meals, heavy sensation in limbs, susceptibility to morning brain fog, mucus accumulation.',
    elementBalance: {
      wood: 40,
      fire: 40,
      earth: 85, // Damp Earth Accumulation
      metal: 45,
      water: 50,
    },
    existingMedications: ['Levothyroxine 75mcg', 'Sertraline 50mg'],
  },
];
