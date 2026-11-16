import React, { useState } from 'react';
import { Leaf, FlaskConical, Search, Atom, GraduationCap } from 'lucide-react';
import { MolecularStructureViewer } from './MolecularStructureViewer';
import { MEDICINAL_HERB_CODEX } from '../data/medicinalHerbs';
import { BotanicalKnowledgeChallenge } from './BotanicalKnowledgeChallenge';

export const PlantCodexDashboard: React.FC = () => {
  const [selectedHerbId, setSelectedHerbId] = useState<string>(MEDICINAL_HERB_CODEX[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlkaloidId, setSelectedAlkaloidId] = useState<string | null>(null);

  const filteredHerbs = MEDICINAL_HERB_CODEX.filter(
    (h) =>
      h.chineseName.includes(searchQuery) ||
      h.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.botanicalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeHerb =
    MEDICINAL_HERB_CODEX.find((h) => h.id === selectedHerbId) || MEDICINAL_HERB_CODEX[0];

  const activeAlkaloid =
    activeHerb.activeAlkaloids.find((a) => a.id === selectedAlkaloidId) ||
    activeHerb.activeAlkaloids[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Plant Codex</span>
            <span aria-hidden="true">·</span>
            <span>Organic Chemistry &amp; Alkaloids</span>
            <span aria-hidden="true">·</span>
            <span>TCM Botanical Tropism</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Botanical Codex &amp; Active Alkaloid Compound Analysis</span>
            <Leaf className="w-5 h-5 text-teal-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Interactive codex linking classical TCM herbal properties with rigorous organic chemistry, molecular weights, aqueous/lipid solubility, and metabolic pathways.
          </p>
        </div>

        {/* Search & Quick Jump to Challenge */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search herbs, pinyin, botanicals..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById('botanical-knowledge-challenge')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="px-3.5 py-2 text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
            <span>Staff Knowledge Challenge</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Herb Selector List (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Leaf className="w-4 h-4 text-teal-400" /> Medicinal Botany Codex ({filteredHerbs.length})
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredHerbs.map((herb) => {
              const isSelected = herb.id === activeHerb.id;
              return (
                <button
                  key={herb.id}
                  type="button"
                  onClick={() => {
                    setSelectedHerbId(herb.id);
                    setSelectedAlkaloidId(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-teal-500/70 text-slate-100 shadow-md'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{herb.pinyin}</span>
                      <span className="text-base text-teal-400 font-serif">{herb.chineseName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate font-mono">
                      {herb.englishName}
                    </div>
                    <div className="text-[10px] text-slate-500 italic truncate">
                      {herb.botanicalName}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded shrink-0">
                    {herb.activeAlkaloids.length} alkaloids
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Herb Details & Compound Analysis Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Herb Overview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500/20 text-teal-300 px-3.5 py-1 text-[10px] font-mono rounded-bl border-l border-b border-teal-500/40 font-bold uppercase tracking-wider">
              {activeHerb.botanicalName}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-100">{activeHerb.pinyin}</h2>
                <span className="text-3xl text-teal-400 font-serif">{activeHerb.chineseName}</span>
                <span className="text-sm text-slate-400 font-mono">({activeHerb.englishName})</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-slate-300">
                <span className="text-teal-400">Thermal Energetics: {activeHerb.thermalEnergetics}</span>
                <span aria-hidden="true">·</span>
                <span>Tropism: {activeHerb.meridianTropism.join(', ')} Channels</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="font-mono text-slate-400 uppercase text-[10px]">Primary Indications</div>
                <p className="text-slate-200 leading-relaxed">{activeHerb.primaryIndications}</p>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-slate-400 uppercase text-[10px]">Clinical Protocol Role</div>
                <p className="text-slate-200 leading-relaxed">{activeHerb.clinicalNotes}</p>
              </div>
            </div>
          </div>

          {/* Compound Analysis Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Compound Analysis — Active Alkaloids &amp; Phytochemicals
                  </h3>
                  <p className="text-xs text-slate-400">
                    Molecular weight, aqueous/lipid solubility, and hepatic CYP450 metabolic pathway profiles
                  </p>
                </div>
              </div>

              {/* Alkaloid Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
                {activeHerb.activeAlkaloids.map((alk) => {
                  const isAlkSelected =
                    (selectedAlkaloidId === alk.id) ||
                    (!selectedAlkaloidId && alk === activeHerb.activeAlkaloids[0]);
                  return (
                    <button
                      key={alk.id}
                      type="button"
                      onClick={() => setSelectedAlkaloidId(alk.id)}
                      className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                        isAlkSelected
                          ? 'bg-slate-800 text-teal-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {alk.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Three.js Interactive 3D Molecular Structure Viewer */}
            <MolecularStructureViewer
              herbName={activeHerb.englishName}
              alkaloidName={activeAlkaloid.name}
              formula={activeAlkaloid.formula}
            />

            {/* Selected Alkaloid Detailed Specifications */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Atom className="w-4 h-4 text-teal-400" />
                    <span>{activeAlkaloid.name}</span>
                  </h4>
                  <div className="text-xs font-mono text-teal-400 mt-1 tabular-nums">
                    Chemical Formula: <strong className="text-slate-200">{activeAlkaloid.formula}</strong>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-teal-500/10 text-teal-300 font-mono text-xs rounded border border-teal-500/30 shrink-0">
                  Verified Phytochemical
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg">
                  <div className="font-mono text-slate-400 uppercase text-[10px]">Molecular Weight</div>
                  <div className="text-base font-bold font-mono text-slate-100 tabular-nums">
                    {activeAlkaloid.molecularWeight}
                  </div>
                  <div className="text-[11px] text-slate-400">Calculated molar mass from empirical formula.</div>
                </div>

                <div className="space-y-1.5 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg">
                  <div className="font-mono text-slate-400 uppercase text-[10px]">Solubility Profile</div>
                  <div className="text-slate-200 leading-relaxed font-medium">
                    {activeAlkaloid.solubility}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg text-xs">
                <div className="font-mono text-slate-400 uppercase text-[10px]">Metabolic Pathway &amp; Pharmacokinetics</div>
                <p className="text-slate-200 leading-relaxed">{activeAlkaloid.metabolicPathway}</p>
              </div>

              <div className="space-y-1.5 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg text-xs">
                <div className="font-mono text-slate-400 uppercase text-[10px]">Pharmacodynamics &amp; Clinical Mechanism</div>
                <p className="text-slate-200 leading-relaxed">{activeAlkaloid.pharmacodynamics}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Training: Botanical Knowledge Challenge Widget */}
      <BotanicalKnowledgeChallenge
        onSelectHerbInCodex={(herbId, alkaloidId) => {
          setSelectedHerbId(herbId);
          setSelectedAlkaloidId(alkaloidId || null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
