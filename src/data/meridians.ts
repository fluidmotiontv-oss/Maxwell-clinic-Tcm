import { AcupuncturePoint } from '../types/clinic';

export interface MeridianChannel {
  code: string;
  name: string;
  pinYin: string;
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water' | 'Ren/Du';
  organ: string;
  highPeakHours: string;
  color: string;
  keyPointsCount: number;
}

export const MERIDIAN_CHANNELS: MeridianChannel[] = [
  { code: 'LV', name: 'Liver Channel', pinYin: 'Foot Jueyin', element: 'Wood', organ: 'Liver', highPeakHours: '1:00 AM - 3:00 AM', color: '#0D9488', keyPointsCount: 14 },
  { code: 'GB', name: 'Gallbladder Channel', pinYin: 'Foot Shaoyang', element: 'Wood', organ: 'Gallbladder', highPeakHours: '11:00 PM - 1:00 AM', color: '#14B8A6', keyPointsCount: 44 },
  { code: 'HT', name: 'Heart Channel', pinYin: 'Hand Shaoyin', element: 'Fire', organ: 'Heart', highPeakHours: '11:00 AM - 1:00 PM', color: '#F43F5E', keyPointsCount: 9 },
  { code: 'SI', name: 'Small Intestine Channel', pinYin: 'Hand Taiyang', element: 'Fire', organ: 'Small Intestine', highPeakHours: '1:00 PM - 3:00 PM', color: '#FB7185', keyPointsCount: 19 },
  { code: 'ST', name: 'Stomach Channel', pinYin: 'Foot Yangming', element: 'Earth', organ: 'Stomach', highPeakHours: '7:00 AM - 9:00 AM', color: '#F59E0B', keyPointsCount: 45 },
  { code: 'SP', name: 'Spleen Channel', pinYin: 'Foot Taiyin', element: 'Earth', organ: 'Spleen', highPeakHours: '9:00 AM - 11:00 AM', color: '#D97706', keyPointsCount: 21 },
  { code: 'LU', name: 'Lung Channel', pinYin: 'Hand Taiyin', element: 'Metal', organ: 'Lungs', highPeakHours: '3:00 AM - 5:00 AM', color: '#94A3B8', keyPointsCount: 11 },
  { code: 'LI', name: 'Large Intestine Channel', pinYin: 'Hand Yangming', element: 'Metal', organ: 'Large Intestine', highPeakHours: '5:00 AM - 7:00 AM', color: '#64748B', keyPointsCount: 20 },
  { code: 'KD', name: 'Kidney Channel', pinYin: 'Foot Shaoyin', element: 'Water', organ: 'Kidneys', highPeakHours: '5:00 PM - 7:00 PM', color: '#3B82F6', keyPointsCount: 27 },
  { code: 'UB', name: 'Bladder Channel', pinYin: 'Foot Taiyang', element: 'Water', organ: 'Urinary Bladder', highPeakHours: '3:00 PM - 5:00 PM', color: '#2563EB', keyPointsCount: 67 },
  { code: 'PC', name: 'Pericardium Channel', pinYin: 'Hand Jueyin', element: 'Fire', organ: 'Pericardium', highPeakHours: '7:00 PM - 9:00 PM', color: '#EC4899', keyPointsCount: 9 },
  { code: 'RN', name: 'Conception Vessel', pinYin: 'Ren Mai', element: 'Ren/Du', organ: 'Yin Channels Reservoir', highPeakHours: 'Continuous', color: '#A855F7', keyPointsCount: 24 },
  { code: 'DU', name: 'Governing Vessel', pinYin: 'Du Mai', element: 'Ren/Du', organ: 'Yang Channels Reservoir', highPeakHours: 'Continuous', color: '#8B5CF6', keyPointsCount: 28 },
];

export const FEATURED_ACUPOINTS: AcupuncturePoint[] = [
  {
    pointCode: 'ST36',
    name: 'Zusanli (Leg Three Miles)',
    meridian: 'Stomach Channel of Foot-Yangming',
    clinicalAction: 'Tonifies Qi and Blood, harmonizes Stomach & Spleen, boosts vagal nerve tone, suppresses pro-inflammatory IL-6 and TNF-alpha.',
    location: '3 cun below ST35, one finger-breadth lateral to the anterior crest of the tibia.',
  },
  {
    pointCode: 'LV3',
    name: 'Taichong (Great Surge)',
    meridian: 'Liver Channel of Foot-Jueyin',
    clinicalAction: 'Spreads Liver Qi, subdues Liver Yang, calms internal Wind & emotional stress. Regulates sympathetic tone and improves HRV.',
    location: 'On the dorsum of the foot, in the depression anterior to the junction of the 1st and 2nd metatarsal bones.',
  },
  {
    pointCode: 'SP6',
    name: 'Sanyinjiao (Three Yin Intersection)',
    meridian: 'Spleen Channel of Foot-Taiyin',
    clinicalAction: 'Cross-intersection of Spleen, Liver & Kidney channels. Fortifies Spleen Qi, nourishes Blood & Yin, calms Shen, regulates hormones.',
    location: '3 cun directly above the tip of the medial malleolus, posterior to the medial border of the tibia.',
  },
  {
    pointCode: 'LI4',
    name: 'Hegu (Joining Valley)',
    meridian: 'Large Intestine Channel of Hand-Yangming',
    clinicalAction: 'Yuan-Source point. Expels exterior Wind, relieves head & facial pain, regulates gut peristalsis, modulates central pain processing.',
    location: 'On the dorsum of the hand, between the 1st and 2nd metacarpal bones at the midpoint of the 2nd metacarpal.',
  },
  {
    pointCode: 'PC6',
    name: 'Neiguan (Inner Pass)',
    meridian: 'Pericardium Channel of Hand-Jueyin',
    clinicalAction: 'Luo-Connecting point. Unbinds the chest, regulates Heart Qi & Shen, alleviates nausea & anxiety, enhances cardiac autonomic balance.',
    location: '2 cun above the transverse crease of the wrist, between the tendons of m. palmaris longus and m. flexor carpi radialis.',
  },
  {
    pointCode: 'KD3',
    name: 'Taixi (Great Stream)',
    meridian: 'Kidney Channel of Foot-Shaoyin',
    clinicalAction: 'Yuan-Source & Shu-Stream point. Tonifies Kidney Yin & Yang, clears Deficiency Heat, supports adrenals & salivary cortisol curve.',
    location: 'In the depression between the tip of the medial malleolus and the Achilles tendon.',
  },
  {
    pointCode: 'RN12',
    name: 'Zhongwan (Middle Cavity)',
    meridian: 'Conception Vessel (Ren Mai)',
    clinicalAction: 'Front-Mu point of Stomach. Harmonizes middle jiao, resolves Dampness, improves postprandial glucose & gastric motility.',
    location: 'On the anterior midline of the abdomen, 4 cun above the umbilicus.',
  },
  {
    pointCode: 'UB23',
    name: 'Shenshu (Kidney Back-Shu)',
    meridian: 'Bladder Channel of Foot-Taiyang',
    clinicalAction: 'Back-Shu point of Kidney. Tonifies Kidney Essence, strengthens lower back & knees, enhances mitochondrial energy production.',
    location: '1.5 cun lateral to the lower border of the spinous process of the 2nd lumbar vertebra (L2).',
  },
];
