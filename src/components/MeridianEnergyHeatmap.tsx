import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PresetPatient } from '../data/mockPatients';
import { Flame, Compass, Clock, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface MeridianEnergyHeatmapProps {
  patient: PresetPatient;
}

type MeridianPolarity = 'Yin (Zang)' | 'Yang (Fu)';
type FiveElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
type HeatmapDimensionKey =
  | 'elementalLoad'
  | 'biomarkerStrain'
  | 'symptomMatch'
  | 'compositeIntensity';

interface MeridianMeta {
  code: string;
  name: string;
  channelTitle: string;
  element: FiveElement;
  polarity: MeridianPolarity;
  organClock: string;
  keyPoints: string;
  clinicalRole: string;
}

interface MeridianProfile extends MeridianMeta {
  elementalLoad: number;
  biomarkerStrain: number;
  symptomMatch: number;
  compositeIntensity: number;
  stateLabel: 'Excess / Stagnant' | 'Elevated' | 'Balanced' | 'Deficient';
  intakeDrivers: string[];
}

interface HeatmapCellDatum {
  meridianCode: string;
  meridianName: string;
  dimensionKey: HeatmapDimensionKey;
  dimensionLabel: string;
  value: number;
}

const TWELVE_MERIDIANS: MeridianMeta[] = [
  {
    code: 'LU',
    name: 'Lung',
    channelTitle: 'Hand Taiyin',
    element: 'Metal',
    polarity: 'Yin (Zang)',
    organClock: '3:00–5:00 AM',
    keyPoints: 'LU9 (Taiyuan) · LU5 (Chize)',
    clinicalRole: 'Governs Qi respiration, Wei Qi defense, and mucosal immunity.',
  },
  {
    code: 'LI',
    name: 'Large Intestine',
    channelTitle: 'Hand Yangming',
    element: 'Metal',
    polarity: 'Yang (Fu)',
    organClock: '5:00–7:00 AM',
    keyPoints: 'LI4 (Hegu) · LI11 (Quchi)',
    clinicalRole: 'Regulates bowel transit, heat clearing, and microbiome elimination.',
  },
  {
    code: 'ST',
    name: 'Stomach',
    channelTitle: 'Foot Yangming',
    element: 'Earth',
    polarity: 'Yang (Fu)',
    organClock: '7:00–9:00 AM',
    keyPoints: 'ST36 (Zusanli) · ST44 (Neiting)',
    clinicalRole: 'Rotting & ripening digestion, vagal gastric tone, and mucosal barrier.',
  },
  {
    code: 'SP',
    name: 'Spleen',
    channelTitle: 'Foot Taiyin',
    element: 'Earth',
    polarity: 'Yin (Zang)',
    organClock: '9:00–11:00 AM',
    keyPoints: 'SP6 (Sanyinjiao) · SP9 (Yinlingquan)',
    clinicalRole: 'Transforms dampness, generates Blood/Qi, and sustains daytime clarity.',
  },
  {
    code: 'HT',
    name: 'Heart',
    channelTitle: 'Hand Shaoyin',
    element: 'Fire',
    polarity: 'Yin (Zang)',
    organClock: '11:00 AM–1:00 PM',
    keyPoints: 'HT7 (Shenmen) · HT3 (Shaohai)',
    clinicalRole: 'Houses Shen consciousness, autonomic coherence, and vascular rhythm.',
  },
  {
    code: 'SI',
    name: 'Small Intestine',
    channelTitle: 'Hand Taiyang',
    element: 'Fire',
    polarity: 'Yang (Fu)',
    organClock: '1:00–3:00 PM',
    keyPoints: 'SI3 (Houxi) · SI8 (Xiaohai)',
    clinicalRole: 'Separates clear from turbid; releases neck/scapular Taiyang tension.',
  },
  {
    code: 'BL',
    name: 'Bladder',
    channelTitle: 'Foot Taiyang',
    element: 'Water',
    polarity: 'Yang (Fu)',
    organClock: '3:00–5:00 PM',
    keyPoints: 'BL23 (Shenshu) · BL40 (Weizhong)',
    clinicalRole: 'Back-Shu autonomic paraspinal axis and fluid regulation.',
  },
  {
    code: 'KI',
    name: 'Kidney',
    channelTitle: 'Foot Shaoyin',
    element: 'Water',
    polarity: 'Yin (Zang)',
    organClock: '5:00–7:00 PM',
    keyPoints: 'KI3 (Taixi) · KI6 (Zhaohai)',
    clinicalRole: 'Stores Jing essence, anchors adrenal cortisol slope, and cools Fire.',
  },
  {
    code: 'PC',
    name: 'Pericardium',
    channelTitle: 'Hand Jueyin',
    element: 'Fire',
    polarity: 'Yin (Zang)',
    organClock: '7:00–9:00 PM',
    keyPoints: 'PC6 (Neiguan) · PC7 (Daling)',
    clinicalRole: 'Shields the Heart, modulates vagal HRV tone, and eases chest constriction.',
  },
  {
    code: 'TE',
    name: 'Triple Energizer',
    channelTitle: 'Hand Shaoyang',
    element: 'Fire',
    polarity: 'Yang (Fu)',
    organClock: '9:00–11:00 PM',
    keyPoints: 'TE5 (Waiguan) · TE17 (Yifeng)',
    clinicalRole: 'Coordinates San Jiao endocrine, thermoregulatory, and sleep onset pathways.',
  },
  {
    code: 'GB',
    name: 'Gallbladder',
    channelTitle: 'Foot Shaoyang',
    element: 'Wood',
    polarity: 'Yang (Fu)',
    organClock: '11:00 PM–1:00 AM',
    keyPoints: 'GB34 (Yanglingquan) · GB20 (Fengchi)',
    clinicalRole: 'Governs lateral sinews, temporal tension, and biliary circadian timing.',
  },
  {
    code: 'LV',
    name: 'Liver',
    channelTitle: 'Foot Jueyin',
    element: 'Wood',
    polarity: 'Yin (Zang)',
    organClock: '1:00–3:00 AM',
    keyPoints: 'LV3 (Taichong) · LV14 (Qimen)',
    clinicalRole: 'Ensures smooth Qi flow, nocturnal blood storage, and stress resilience.',
  },
];

const DIMENSIONS: { key: HeatmapDimensionKey; label: string }[] = [
  { key: 'elementalLoad', label: 'Elemental Qi Load' },
  { key: 'biomarkerStrain', label: 'Biomarker Strain' },
  { key: 'symptomMatch', label: 'Intake Symptom Match' },
  { key: 'compositeIntensity', label: 'Composite Intensity' },
];

const clamp = (val: number, min = 10, max = 98) => Math.round(Math.max(min, Math.min(max, val)));

const parseFirstNumber = (text: string | undefined, fallback: number): number => {
  if (!text) return fallback;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : fallback;
};

const deriveMeridianProfiles = (patient: PresetPatient): MeridianProfile[] => {
  const eb = patient.elementBalance || { wood: 50, fire: 50, earth: 50, metal: 50, water: 50 };
  const hrvVal = parseFirstNumber(patient.bioMarkers?.hrv, 30);
  const crpVal = parseFirstNumber(patient.bioMarkers?.crp, 2.5);
  const sleepPct = parseFirstNumber(patient.bioMarkers?.sleep, 68);
  const mitoPct = parseFirstNumber(patient.bioMarkers?.mitochondrial, 72);

  // Normalized biomarker stress factors (0 - 100)
  const hrvStress = clamp(((50 - hrvVal) / 35) * 85 + 15, 15, 96);
  const inflammationStress = clamp((crpVal / 6) * 85 + 12, 15, 95);
  const sleepStress = clamp(((90 - sleepPct) / 45) * 88 + 12, 15, 96);
  const metabolicFatigue = clamp(((92 - mitoPct) / 40) * 80 + 18, 15, 94);

  const intakeCorpus = [
    patient.tongue,
    patient.pulse,
    patient.complexion,
    patient.voice,
    patient.chiefComplaints,
    patient.bioMarkers?.sleep,
    patient.bioMarkers?.cortisol,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const seasonLower = (patient.season || '').toLowerCase();

  return TWELVE_MERIDIANS.map((meta) => {
    const elementKey = meta.element.toLowerCase() as keyof typeof eb;
    const baseElement = eb[elementKey] ?? 50;

    // Seasonal modulation (+6 if patient's intake season aligns with meridian's element)
    const seasonBoost = seasonLower.includes(meta.element.toLowerCase()) ? 6 : 0;
    const polarityOffset = meta.polarity === 'Yin (Zang)' ? 3 : -2;
    const elementalLoad = clamp(baseElement + seasonBoost + polarityOffset);

    // Biomarker strain coupling per meridian physiology
    let biomarkerRaw = 50;
    const drivers: string[] = [];

    if (meta.code === 'LV' || meta.code === 'GB' || meta.code === 'PC' || meta.code === 'HT') {
      biomarkerRaw = hrvStress * 0.55 + sleepStress * 0.45;
      if (hrvVal < 35) drivers.push(`Suppressed HRV (${hrvVal} ms)`);
      if (sleepPct < 75) drivers.push(`Sleep efficiency ${sleepPct}%`);
    } else if (meta.code === 'SP' || meta.code === 'ST') {
      biomarkerRaw = inflammationStress * 0.5 + metabolicFatigue * 0.5;
      if (crpVal >= 2.5) drivers.push(`hs-CRP ${crpVal} mg/L`);
      if (mitoPct < 75) drivers.push(`Mitochondrial redox ${mitoPct}%`);
    } else if (meta.code === 'KI' || meta.code === 'BL') {
      biomarkerRaw = sleepStress * 0.45 + metabolicFatigue * 0.35 + hrvStress * 0.2;
      if (mitoPct < 75) drivers.push(`ATP redox capacity ${mitoPct}%`);
    } else if (meta.code === 'LU' || meta.code === 'LI') {
      biomarkerRaw = inflammationStress * 0.6 + hrvStress * 0.4;
      if (crpVal >= 2.5) drivers.push(`Systemic CRP ${crpVal} mg/L`);
    } else {
      biomarkerRaw = sleepStress * 0.5 + hrvStress * 0.5;
    }
    const biomarkerStrain = clamp(biomarkerRaw);

    // Intake Symptom & Tongue/Pulse Lexical Correlation
    let symptomScore = baseElement * 0.45 + 22;
    const addMatch = (keywords: string[], delta: number, label: string) => {
      if (keywords.some((kw) => intakeCorpus.includes(kw))) {
        symptomScore += delta;
        drivers.push(label);
      }
    };

    if (meta.code === 'LV') {
      addMatch(['liver', '1-3 am', '1:30 am', 'wiry', 'guan', 'irritability', 'intercostal'], 26, 'Wiry pulse / 1–3 AM Liver clock cues');
    } else if (meta.code === 'GB') {
      addMatch(['neck', 'shoulder', 'headache', 'tension', '2 am', 'intercostal'], 22, 'Neck/temporal Shao Yang tension');
    } else if (meta.code === 'SP') {
      addMatch(['teeth marks', 'pale', 'damp', 'bloating', 'fog', 'heavy', 'greasy'], 20, 'Spleen Qi dampness / scalloped tongue');
    } else if (meta.code === 'ST') {
      addMatch(['bloating', 'fullness', 'digestive', 'coating', 'dry throat'], 18, 'Middle Jiao digestive fullness');
    } else if (meta.code === 'HT') {
      addMatch(['red tip', 'insomnia', 'shen', 'rapid', 'awaken'], 24, 'Heart Shen / sleep fragmentation');
    } else if (meta.code === 'PC') {
      addMatch(['chest', 'stress', 'deadline', 'hyper-vigilance', 'irritability'], 20, 'Sympathetic chest / vagal strain');
    } else if (meta.code === 'KI') {
      addMatch(['kidney', 'tinnitus', 'lower back', 'night sweats', 'hot flashes', 'cracks'], 22, 'Kidney Jing/Yin depletion markers');
    } else if (meta.code === 'BL') {
      addMatch(['lower back', 'neck', 'upper back', 'paraspinal'], 18, 'Taiyang back/spinal tension');
    } else if (meta.code === 'LU') {
      addMatch(['cun', 'mucus', 'voice', 'dry throat', 'sighing'], 18, 'Lung Qi / Cun pulse respiratory signs');
    } else if (meta.code === 'LI') {
      addMatch(['mucus', 'greasy', 'firmicutes', 'bloating'], 16, 'Gut-microbiome Yangming load');
    } else if (meta.code === 'SI') {
      addMatch(['neck', 'shoulder', 'red tip', 'tinnitus'], 15, 'Upper Taiyang shoulder/ear signs');
    } else if (meta.code === 'TE') {
      addMatch(['cortisol', 'hot flashes', 'tinnitus', 'deadline'], 18, 'San Jiao circadian & neuroendocrine drift');
    }

    const symptomMatch = clamp(symptomScore);
    const compositeIntensity = clamp(
      elementalLoad * 0.4 + biomarkerStrain * 0.3 + symptomMatch * 0.3
    );

    const stateLabel: MeridianProfile['stateLabel'] =
      compositeIntensity >= 80
        ? 'Excess / Stagnant'
        : compositeIntensity >= 65
          ? 'Elevated'
          : compositeIntensity >= 38
            ? 'Balanced'
            : 'Deficient';

    if (drivers.length === 0) {
      drivers.push(`${meta.element} element baseline at ${baseElement}%`);
    }

    return {
      ...meta,
      elementalLoad,
      biomarkerStrain,
      symptomMatch,
      compositeIntensity,
      stateLabel,
      intakeDrivers: Array.from(new Set(drivers)),
    };
  });
};

export const MeridianEnergyHeatmap: React.FC<MeridianEnergyHeatmapProps> = ({ patient }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(960);
  const [sortBy, setSortBy] = useState<'clock' | 'intensity'>('clock');
  const [polarityFilter, setPolarityFilter] = useState<'all' | 'yin' | 'yang'>('all');
  const [selectedCode, setSelectedCode] = useState<string>('LV');
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCellDatum;
    x: number;
    y: number;
  } | null>(null);

  // Responsive container measurement for D3 SVG
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = el.clientWidth;
      if (next > 0) setContainerWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allProfiles = useMemo(() => deriveMeridianProfiles(patient), [patient]);

  const visibleProfiles = useMemo(() => {
    const filtered = allProfiles.filter((m) => {
      if (polarityFilter === 'yin') return m.polarity === 'Yin (Zang)';
      if (polarityFilter === 'yang') return m.polarity === 'Yang (Fu)';
      return true;
    });
    if (sortBy === 'intensity') {
      return [...filtered].sort((a, b) => b.compositeIntensity - a.compositeIntensity);
    }
    return filtered;
  }, [allProfiles, polarityFilter, sortBy]);

  // Keep selectedCode synchronized if filter hides it or patient changes
  useEffect(() => {
    if (!visibleProfiles.some((p) => p.code === selectedCode) && visibleProfiles.length > 0) {
      setSelectedCode(visibleProfiles[0].code);
    }
  }, [visibleProfiles, selectedCode]);

  const selectedProfile =
    visibleProfiles.find((m) => m.code === selectedCode) ||
    allProfiles.find((m) => m.code === selectedCode) ||
    allProfiles[0];

  const excessCount = allProfiles.filter((m) => m.compositeIntensity >= 65).length;
  const deficientCount = allProfiles.filter((m) => m.compositeIntensity < 38).length;
  const peakMeridian = [...allProfiles].sort(
    (a, b) => b.compositeIntensity - a.compositeIntensity
  )[0];

  // D3.js Heatmap Rendering Effect
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || visibleProfiles.length === 0) return;

    const width = Math.max(640, containerWidth);
    const height = 285;
    const margin = { top: 44, right: 20, bottom: 38, left: 156 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xDomain = visibleProfiles.map((m) => m.code);
    const yDomain = DIMENSIONS.map((d) => d.key);

    const xScale = d3.scaleBand<string>().domain(xDomain).range([0, innerWidth]).padding(0.08);
    const yScale = d3.scaleBand<string>().domain(yDomain).range([0, innerHeight]).padding(0.14);

    // Clinical 4-stop color scale: Deficient (cool blue) -> Balanced (teal) -> Elevated (amber) -> Excess (rose)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([15, 45, 68, 88])
      .range(['#1d4ed8', '#0d9488', '#d97706', '#e11d48'])
      .clamp(true);

    const cells: HeatmapCellDatum[] = [];
    for (const profile of visibleProfiles) {
      for (const dim of DIMENSIONS) {
        cells.push({
          meridianCode: profile.code,
          meridianName: profile.name,
          dimensionKey: dim.key,
          dimensionLabel: dim.label,
          value: profile[dim.key],
        });
      }
    }

    // Top X-axis labels (Meridian Codes + Element sub-label)
    const topLabels = g
      .selectAll<SVGGElement, MeridianProfile>('g.meridian-col-label')
      .data(visibleProfiles, (d) => d.code)
      .enter()
      .append('g')
      .attr('class', 'meridian-col-label')
      .attr('transform', (d) => `translate(${(xScale(d.code) ?? 0) + xScale.bandwidth() / 2}, -10)`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelectedCode(d.code));

    topLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -12)
      .attr('fill', (d) => (d.code === selectedCode ? '#2dd4bf' : '#e2e8f0'))
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => d.code);

    topLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 2)
      .attr('fill', '#94a3b8')
      .attr('font-size', '9.5px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .text((d) => d.element);

    // Left Y-axis labels (Diagnostic Dimensions)
    g.selectAll<SVGTextElement, (typeof DIMENSIONS)[number]>('text.dim-row-label')
      .data(DIMENSIONS)
      .enter()
      .append('text')
      .attr('class', 'dim-row-label')
      .attr('x', -12)
      .attr('y', (d) => (yScale(d.key) ?? 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', (d) => (d.key === 'compositeIntensity' ? '#f1f5f9' : '#94a3b8'))
      .attr('font-size', '11px')
      .attr('font-weight', (d) => (d.key === 'compositeIntensity' ? '700' : '500'))
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => d.label);

    // Bottom X-axis labels (Organ Clock windows)
    g.selectAll<SVGTextElement, MeridianProfile>('text.clock-label')
      .data(visibleProfiles, (d) => d.code)
      .enter()
      .append('text')
      .attr('class', 'clock-label')
      .attr('x', (d) => (xScale(d.code) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', innerHeight + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '9.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => d.organClock.split('–')[0].replace(':00', ''));

    // Subtle hairline separator above Composite Intensity row
    const compositeY = yScale('compositeIntensity') ?? 0;
    g.append('line')
      .attr('x1', -140)
      .attr('x2', innerWidth)
      .attr('y1', compositeY - yScale.step() * 0.07)
      .attr('y2', compositeY - yScale.step() * 0.07)
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '3 3');

    // Heatmap Cells
    const cellGroups = g
      .selectAll<SVGGElement, HeatmapCellDatum>('g.heatmap-cell')
      .data(cells, (d) => `${d.meridianCode}-${d.dimensionKey}`)
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell')
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).select('rect').attr('stroke', '#f8fafc').attr('stroke-width', 1.8);
        const svgRect = svgEl.getBoundingClientRect();
        setHoveredCell({
          cell: d,
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
        });
      })
      .on('mousemove', function (event, d) {
        const svgRect = svgEl.getBoundingClientRect();
        setHoveredCell({
          cell: d,
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
        });
      })
      .on('mouseleave', function (_, d) {
        d3.select(this)
          .select('rect')
          .attr('stroke', d.meridianCode === selectedCode ? '#2dd4bf' : '#0f172a')
          .attr('stroke-width', d.meridianCode === selectedCode ? 1.8 : 1);
        setHoveredCell(null);
      })
      .on('click', (_, d) => {
        setSelectedCode(d.meridianCode);
      });

    cellGroups
      .append('rect')
      .attr('x', (d) => xScale(d.meridianCode) ?? 0)
      .attr('y', (d) => yScale(d.dimensionKey) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', (d) => colorScale(d.value))
      .attr('fill-opacity', (d) =>
        d.dimensionKey === 'compositeIntensity' ? 0.95 : 0.82
      )
      .attr('stroke', (d) => (d.meridianCode === selectedCode ? '#2dd4bf' : '#0f172a'))
      .attr('stroke-width', (d) => (d.meridianCode === selectedCode ? 1.8 : 1));

    cellGroups
      .append('text')
      .attr('x', (d) => (xScale(d.meridianCode) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => (yScale(d.dimensionKey) ?? 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8fafc')
      .attr('font-size', (d) => (d.dimensionKey === 'compositeIntensity' ? '12px' : '11px'))
      .attr('font-weight', (d) => (d.dimensionKey === 'compositeIntensity' ? '700' : '600'))
      .attr('font-family', 'JetBrains Mono, monospace')
      .style('pointer-events', 'none')
      .text((d) => d.value);
  }, [visibleProfiles, containerWidth, selectedCode]);

  const getStatusStyle = (state: MeridianProfile['stateLabel']) => {
    switch (state) {
      case 'Excess / Stagnant':
        return { text: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/20' };
      case 'Elevated':
        return { text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/20' };
      case 'Deficient':
        return { text: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-950/20' };
      default:
        return { text: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-950/20' };
    }
  };

  const selectedStyle = getStatusStyle(selectedProfile.stateLabel);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
      {/* Header & Interactive Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Meridian Energy Heatmap — 12 Primary Channels</span>
              <span className="text-xs font-mono font-normal text-teal-400 tabular-nums">
                · Peak: {peakMeridian.code} ({peakMeridian.compositeIntensity})
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              D3.js intensity matrix across the 12 primary Jing-Luo meridians derived from {patient.name}&rsquo;s diagnostic intake
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Polarity Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {(
              [
                { id: 'all', label: 'All 12' },
                { id: 'yin', label: 'Yin Zang' },
                { id: 'yang', label: 'Yang Fu' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPolarityFilter(opt.id)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                  polarityFilter === opt.id
                    ? 'bg-slate-800 text-teal-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            <button
              type="button"
              onClick={() => setSortBy('clock')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'clock'
                  ? 'bg-slate-800 text-teal-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Organ Clock
            </button>
            <button
              type="button"
              onClick={() => setSortBy('intensity')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                sortBy === 'intensity'
                  ? 'bg-slate-800 text-teal-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Intensity
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics & Intensity Color Key */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap font-mono text-slate-400 tabular-nums">
          <span>
            Elevated / Stagnant Channels:{' '}
            <strong className="text-amber-400">{excessCount}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Deficient Channels:{' '}
            <strong className="text-sky-400">{deficientCount}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>Click any cell to inspect meridian drivers</span>
        </div>

        {/* Continuous Scale Legend */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
          <span>Deficient (15)</span>
          <svg
            width="144"
            height="10"
            viewBox="0 0 144 10"
            className="rounded border border-slate-700 shrink-0"
            aria-label="Meridian intensity scale from 15 deficient to 95 excess"
          >
            <defs>
              <linearGradient id="meridianHeatmapLegendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="38%" stopColor="#0d9488" />
                <stop offset="72%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="144" height="10" fill="url(#meridianHeatmapLegendGrad)" />
          </svg>
          <span>Excess (90+)</span>
        </div>
      </div>

      {/* D3.js Interactive SVG Heatmap Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto bg-slate-950/80 border border-slate-800 rounded-lg p-3"
      >
        <svg ref={svgRef} className="block min-w-[640px] w-full select-none" />

        {hoveredCell && (
          <div
            className="pointer-events-none absolute z-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-0.5"
            style={{
              left: Math.min(containerWidth - 210, Math.max(12, hoveredCell.x + 14)),
              top: Math.max(8, hoveredCell.y - 54),
            }}
          >
            <div className="font-bold text-slate-100">
              {hoveredCell.cell.meridianCode} · {hoveredCell.cell.meridianName}
            </div>
            <div className="text-[11px] font-mono text-teal-400 tabular-nums">
              {hoveredCell.cell.dimensionLabel}: {hoveredCell.cell.value} / 100
            </div>
          </div>
        )}
      </div>

      {/* Interactive Selected Meridian Clinical Breakdown */}
      <div
        className={`rounded-lg border p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center ${selectedStyle.bg} ${selectedStyle.border}`}
      >
        <div className="lg:col-span-5 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-100">
              {selectedProfile.code} — {selectedProfile.name} Meridian ({selectedProfile.channelTitle})
            </span>
            <span className={`text-xs font-mono font-bold flex items-center gap-1 ${selectedStyle.text}`}>
              {selectedProfile.compositeIntensity >= 65 ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              ) : selectedProfile.compositeIntensity < 38 ? (
                <Info className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>· {selectedProfile.stateLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap text-[11px] font-mono text-slate-300 tabular-nums">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-teal-400" />
              {selectedProfile.element} · {selectedProfile.polarity}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              {selectedProfile.organClock}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{selectedProfile.clinicalRole}</p>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 divide-x divide-slate-800/80 text-xs font-mono tabular-nums lg:border-x lg:border-slate-800/80 lg:px-4">
          <div className="pr-3 py-1">
            <div className="text-[10px] text-slate-400">Composite Intensity</div>
            <div className={`text-lg font-bold ${selectedStyle.text}`}>
              {selectedProfile.compositeIntensity} / 100
            </div>
          </div>
          <div className="pl-4 py-1">
            <div className="text-[10px] text-slate-400">Elemental · Bio Strain</div>
            <div className="text-sm font-bold text-slate-100 mt-1">
              {selectedProfile.elementalLoad} · {selectedProfile.biomarkerStrain}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-1.5 text-xs">
          <div className="text-[11px] font-mono text-slate-400">Intake Drivers &amp; Key Points</div>
          <div className="text-slate-200 leading-relaxed">
            {selectedProfile.intakeDrivers.join(' · ')}
          </div>
          <div className="text-[11px] font-mono text-teal-300">{selectedProfile.keyPoints}</div>
        </div>
      </div>
    </section>
  );
};
