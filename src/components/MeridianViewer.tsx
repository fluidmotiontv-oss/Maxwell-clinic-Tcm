import React, { useState } from 'react';
import { MERIDIAN_CHANNELS, FEATURED_ACUPOINTS } from '../data/meridians';
import { AcupuncturePoint } from '../types/clinic';
import { Activity, Search, Compass, Info, CheckCircle2, ChevronRight, Thermometer } from 'lucide-react';

interface MeridianViewerProps {
  onSelectPointForCarePlan?: (point: AcupuncturePoint) => void;
  onAppendPointPrescription?: (point: AcupuncturePoint) => void;
  elementBalance?: { wood: number; fire: number; earth: number; metal: number; water: number };
}

export const MeridianViewer: React.FC<MeridianViewerProps> = ({
  onSelectPointForCarePlan,
  onAppendPointPrescription,
  elementBalance,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoint, setActivePoint] = useState<AcupuncturePoint>(FEATURED_ACUPOINTS[0]);
  const [appendedPoints, setAppendedPoints] = useState<Record<string, boolean>>({});
  const [showHeatmapLayer, setShowHeatmapLayer] = useState<boolean>(true);

  const filteredPoints = FEATURED_ACUPOINTS.filter((pt) => {
    const matchesChannel = selectedChannel === 'ALL' || pt.pointCode.startsWith(selectedChannel);
    const matchesQuery =
      pt.pointCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.clinicalAction.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Acupuncture Energetics</span>
            <span aria-hidden="true">·</span>
            <span>Jing-Luo Channels</span>
            <span aria-hidden="true">·</span>
            <span>Vagal &amp; Neuromodulation Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Acupuncture Channel &amp; Precision Acupoint Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Map clinical acupoint actions to physiological mechanisms, vagal tone regulation, autonomic balance, and cytokine suppression.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Anatomical Image & Channel Selector */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" /> Anatomical Meridian Model
            </h2>
            <span className="text-[11px] font-mono text-teal-400">Jing-Luo Energetics</span>
          </div>

          {/* Anatomical Image Container */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-[4/3] bg-slate-950 group">
            <img
              src="/src/assets/images/acupuncture_meridian_art_1794461555492.jpg"
              alt="Acupuncture Meridian Anatomical Visual"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/90 backdrop-blur-md rounded border border-slate-800 text-xs">
              <div className="text-teal-400 font-mono text-[10px]">SELECTED ACUPOINT:</div>
              <div className="text-slate-100 font-bold flex items-center justify-between mt-0.5">
                <span>{activePoint.pointCode} — {activePoint.name}</span>
                <span className="text-xs text-amber-300 font-mono">{activePoint.meridian.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Channel Filters */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Filter by Channel:</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedChannel('ALL')}
                className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                  selectedChannel === 'ALL'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All Channels
              </button>
              {MERIDIAN_CHANNELS.map((ch) => (
                <button
                  key={ch.code}
                  onClick={() => setSelectedChannel(ch.code)}
                  className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                    selectedChannel === ch.code
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {ch.code}
                </button>
              ))}
            </div>
          </div>

          {/* Meridian Imbalance Heatmap Layer Widget */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Thermometer className="w-4 h-4 text-rose-400" /> Imbalance Heatmap Layer
              </div>
              <button
                onClick={() => setShowHeatmapLayer(!showHeatmapLayer)}
                className="text-[10px] font-mono text-teal-400 hover:text-teal-300 underline"
              >
                {showHeatmapLayer ? 'Hide Heatmap' : 'Show Heatmap'}
              </button>
            </div>

            {showHeatmapLayer && (
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] text-slate-400 font-mono">
                  Thermal channel congestion &amp; Zang-Fu energy index:
                </div>
                {[
                  { name: 'Liver / Wood (LV)', code: 'LV', value: elementBalance?.wood || 85, status: 'Severe Qi Stagnation' },
                  { name: 'Heart / Fire (HT)', code: 'HT', value: elementBalance?.fire || 60, status: 'Moderate Flaring' },
                  { name: 'Spleen / Earth (SP)', code: 'SP', value: elementBalance?.earth || 30, status: 'Qi Deficiency' },
                  { name: 'Lung / Metal (LU)', code: 'LU', value: elementBalance?.metal || 40, status: 'Mild Suppression' },
                  { name: 'Kidney / Water (KI)', code: 'KI', value: elementBalance?.water || 45, status: 'Yin Deficiency' },
                ].map((item) => {
                  const isHigh = item.value > 70;
                  const isMod = item.value >= 50 && item.value <= 70;
                  const barColor = isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-teal-500';
                  const textColor = isHigh ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-teal-400';

                  return (
                    <div
                      key={item.code}
                      onClick={() => setSelectedChannel(item.code)}
                      className={`p-2.5 rounded border cursor-pointer transition-all space-y-1 ${
                        selectedChannel === item.code
                          ? 'bg-slate-900 border-teal-500/60 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{item.name}</span>
                        <span className={`font-mono font-bold ${textColor}`}>{item.value}% Intensity</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.value}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Status: {item.status}</span>
                        <span>Click to filter</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Acupoint Directory & Detail Viewer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Point Prescription Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/30 border border-teal-500/40 rounded-xl p-6 space-y-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500/20 text-teal-300 px-3.5 py-1 text-[10px] font-mono rounded-bl border-l border-b border-teal-500/40 font-bold uppercase tracking-wider">
              Point Prescription Card
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <span className="px-3.5 py-1.5 bg-teal-500/25 text-teal-300 font-mono text-lg font-extrabold rounded border border-teal-500/50 shadow-sm">
                  {activePoint.pointCode}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{activePoint.name}</h2>
                  <p className="text-xs text-teal-400 font-mono">{activePoint.meridian}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Anatomical Localization</div>
                <div className="text-slate-200 font-mono leading-relaxed">
                  {activePoint.location || 'Classical anatomical coordinates along channel pathway.'}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-teal-400 uppercase">Needling &amp; Frequency Spec</div>
                <div className="text-slate-200 font-mono leading-relaxed">
                  Perpendicular insertion 0.5-1.0 cun. Electro-acupuncture 2Hz / 15Hz mod.
                </div>
              </div>
            </div>

            <div className="space-y-1.5 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-[11px] font-mono text-teal-400 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Clinical Action &amp; Neuromodulation Mechanism:
              </div>
              <p className="text-slate-200 leading-relaxed text-xs font-medium">
                {activePoint.clinicalAction}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">
                Maxwell Clinic Meridian Telemetry Protocol
              </div>
              {onAppendPointPrescription && (
                <button
                  onClick={() => {
                    onAppendPointPrescription(activePoint);
                    setAppendedPoints((prev) => ({ ...prev, [activePoint.pointCode]: true }));
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-md ${
                    appendedPoints[activePoint.pointCode]
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {appendedPoints[activePoint.pointCode]
                      ? 'Appended to Active Care Plan!'
                      : 'Append to Active Care Plan'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Acupoint Directory List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Featured Clinical Acupoints ({filteredPoints.length})
              </h3>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ST36, Taichong..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {filteredPoints.map((pt) => {
                const isActive = activePoint.pointCode === pt.pointCode;
                return (
                  <div
                    key={pt.pointCode}
                    onClick={() => setActivePoint(pt)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                      isActive
                        ? 'bg-slate-800 border-teal-500/60 shadow-md shadow-teal-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-400">{pt.pointCode}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{pt.meridian.split(' ')[0]}</span>
                    </div>
                    <div className="font-bold text-slate-200 text-xs">{pt.name}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {pt.clinicalAction}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
