export interface ElementDetail {
  name: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  chineseName: string;
  zangOrgan: string; // Yin Organ
  fuOrgan: string; // Yang Organ
  emotion: string;
  season: string;
  flavor: string;
  frequencyHz: number;
  frequencyLabel: string;
  climate: string;
  color: string;
  accentHex: string;
  bioMarkerFocus: string;
  description: string;
  organClockHours: string;
}

export const FIVE_ELEMENTS: Record<string, ElementDetail> = {
  Wood: {
    name: 'Wood',
    chineseName: '木 (Mù)',
    zangOrgan: 'Liver (Gan)',
    fuOrgan: 'Gallbladder (Dan)',
    emotion: 'Anger / Irritability vs. Benevolence',
    season: 'Spring',
    flavor: 'Sour',
    frequencyHz: 174,
    frequencyLabel: '174Hz Growth & Vagal Mobilization',
    climate: 'Wind',
    color: 'Emerald Teal',
    accentHex: '#0D9488',
    bioMarkerFocus: 'Heart Rate Variability (HRV), Liver Enzymes (ALT/AST), Tendon Elasticity',
    description: 'Governs the smooth flow of Qi and Blood. Wood dictates growth, flexibility, decision making, and neuromuscular coordination.',
    organClockHours: '11 PM - 3 AM (Gallbladder 11pm-1am, Liver 1am-3am)',
  },
  Fire: {
    name: 'Fire',
    chineseName: '火 (Huǒ)',
    zangOrgan: 'Heart (Xin)',
    fuOrgan: 'Small Intestine (Xiao Chang)',
    emotion: 'Joy / Excess Excitement vs. Calm',
    season: 'Summer',
    flavor: 'Bitter',
    frequencyHz: 528,
    frequencyLabel: '528Hz Cardiac Coherence & Transformation',
    climate: 'Heat',
    color: 'Crimson Rose',
    accentHex: '#E11D48',
    bioMarkerFocus: 'Blood Pressure, EEG Alpha Synchronization, Microvascular Perfusion',
    description: 'Houses the Shen (Mind/Spirit) and governs blood vessels. Fire balances joy, clarity, sleep architecture, and emotional connection.',
    organClockHours: '11 AM - 3 PM (Heart 11am-1pm, Small Intestine 1pm-3pm)',
  },
  Earth: {
    name: 'Earth',
    chineseName: '土 (Tǔ)',
    zangOrgan: 'Spleen (Pi)',
    fuOrgan: 'Stomach (Wei)',
    emotion: 'Worry / Overthinking vs. Groundedness',
    season: 'Late Summer / Transition',
    flavor: 'Sweet (Mild natural)',
    frequencyHz: 432,
    frequencyLabel: '432Hz Grounding & Digestive Harmonic',
    climate: 'Dampness',
    color: 'Golden Amber',
    accentHex: '#D97706',
    bioMarkerFocus: 'Gut Microbiome Diversity, Fasting Insulin, Postprandial Glucose',
    description: 'The foundation of Post-Heaven Qi. Earth transforms and transports nutrients, regulates muscle tone, and stabilizes thought processes.',
    organClockHours: '7 AM - 11 AM (Stomach 7am-9am, Spleen 9am-11am)',
  },
  Metal: {
    name: 'Metal',
    chineseName: '金 (Jīn)',
    zangOrgan: 'Lungs (Fei)',
    fuOrgan: 'Large Intestine (Da Chang)',
    emotion: 'Grief / Sadness vs. Integrity',
    season: 'Autumn',
    flavor: 'Pungent / Acrid',
    frequencyHz: 639,
    frequencyLabel: '639Hz Respiration & Barrier Alignment',
    climate: 'Dryness',
    color: 'Slate Quartz',
    accentHex: '#64748B',
    bioMarkerFocus: 'hs-CRP (Inflammation), Secretory IgA, VO2 Max, Skin Barrier Function',
    description: 'Governs respiration, Wei Qi (defensive immunity), and skin integrity. Metal regulates boundaries, inspiration, and clearing waste.',
    organClockHours: '3 AM - 7 AM (Lungs 3am-5am, Large Intestine 5am-7am)',
  },
  Water: {
    name: 'Water',
    chineseName: '水 (Shuǐ)',
    zangOrgan: 'Kidneys (Shen)',
    fuOrgan: 'Urinary Bladder (Pang Guang)',
    emotion: 'Fear / Anxiety vs. Wisdom & Willpower (Zhi)',
    season: 'Winter',
    flavor: 'Salty (Natural mineral)',
    frequencyHz: 741,
    frequencyLabel: '741Hz Cellular Detox & Kidney Vigor',
    climate: 'Cold',
    color: 'Cobalt Indigo',
    accentHex: '#2563EB',
    bioMarkerFocus: 'Salivary Cortisol Rhythm, DHEA, Bone Mineral Density, Mitochondrial Index',
    description: 'Stores Jing (Pre-Heaven Essence) and governs marrow, brain, bones, and reproductive longevity. Water provides foundational stamina.',
    organClockHours: '3 PM - 7 PM (Bladder 3pm-5pm, Kidneys 5pm-7pm)',
  },
};
