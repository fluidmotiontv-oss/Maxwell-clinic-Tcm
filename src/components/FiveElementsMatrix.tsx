import React, { useState } from 'react';
import { FIVE_ELEMENTS, ElementDetail } from '../data/fiveElements';
import { Headphones, Clock, Sparkles, Activity, Layers } from 'lucide-react';

interface FiveElementsMatrixProps {
  onPlayFrequency?: (freqHz: number, title: string) => void;
}

export const FiveElementsMatrix: React.FC<FiveElementsMatrixProps> = ({ onPlayFrequency }) => {
  const [selectedElement, setSelectedElement] = useState<string>('Wood');

  const activeDetail: ElementDetail = FIVE_ELEMENTS[selectedElement] || FIVE_ELEMENTS['Wood'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Five Elements (Wu Xing)</span>
            <span aria-hidden="true">·</span>
            <span>Generating &amp; Controlling Cycles</span>
            <span aria-hidden="true">·</span>
            <span>Organ Clock Chronobiology</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            TCM Five Elements &amp; Organ System Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Explore the dynamic relationships between Zang-Fu organ pairs, acoustic resonances, emotional energetics, and modern bio-markers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Graphic Pentagon Matrix + Element Selector */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" /> Five Element Selector
            </h2>
            <span className="text-[11px] font-mono text-teal-400">Wu Xing Matrix</span>
          </div>

          {/* Elemental Graphic Asset */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-square bg-slate-950 flex items-center justify-center group">
            <img
              src="/src/assets/images/tcm_five_elements_1794461555170.jpg"
              alt="TCM Five Elements Diagram"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              onError={(e) => {
                // Fallback container if image loading fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/90 backdrop-blur-md rounded border border-slate-800 text-xs">
              <div className="text-slate-400 font-mono text-[10px]">SELECTED ELEMENT DYNAMIC:</div>
              <div className="text-slate-100 font-bold flex items-center justify-between mt-0.5">
                <span>{activeDetail.chineseName}</span>
                <span className="text-teal-400 font-mono">{activeDetail.frequencyLabel}</span>
              </div>
            </div>
          </div>

          {/* Element Selection Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {Object.keys(FIVE_ELEMENTS).map((key) => {
              const el = FIVE_ELEMENTS[key];
              const isSelected = selectedElement === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedElement(key)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{key}</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">{el.frequencyHz}Hz</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Element Details & Organ Clock Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Selected Element Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-teal-400 uppercase tracking-widest">Zang-Fu Organ System</span>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  <span>{activeDetail.name} Element</span>
                  <span className="text-sm font-normal text-slate-400">{activeDetail.chineseName}</span>
                </h2>
              </div>

              {onPlayFrequency && (
                <button
                  onClick={() => onPlayFrequency(activeDetail.frequencyHz, `${activeDetail.name} - ${activeDetail.frequencyLabel}`)}
                  className="px-3.5 py-2 text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg border border-teal-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Play {activeDetail.frequencyHz}Hz Tone</span>
                </button>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {activeDetail.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Zang (Yin) Organ</div>
                <div className="text-sm font-bold text-teal-300 mt-1">{activeDetail.zangOrgan}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Fu (Yang) Organ</div>
                <div className="text-sm font-bold text-amber-300 mt-1">{activeDetail.fuOrgan}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg col-span-2 sm:col-span-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Organ Clock Peak</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-1">{activeDetail.organClockHours}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Emotional Energetic</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">{activeDetail.emotion}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Season &amp; Climate</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">{activeDetail.season} ({activeDetail.climate})</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Dietary Flavor</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">{activeDetail.flavor}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-teal-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Modern Bio-Marker &amp; Telemetry Focus:
              </div>
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
                {activeDetail.bioMarkerFocus}
              </p>
            </div>
          </div>

          {/* 24-Hour Organ Clock Dial Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> 24-Hour Organ Clock Chronobiology
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Circadian Peak Windows</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-teal-400 font-mono font-bold">1 AM - 3 AM</div>
                <div className="text-slate-200 font-semibold mt-0.5">Liver (Gan)</div>
                <div className="text-[10px] text-slate-400">Deep detox &amp; Blood storage</div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 font-mono font-bold">3 AM - 5 AM</div>
                <div className="text-slate-200 font-semibold mt-0.5">Lungs (Fei)</div>
                <div className="text-[10px] text-slate-400">Respiration &amp; Oxygenation</div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-amber-400 font-mono font-bold">7 AM - 9 AM</div>
                <div className="text-slate-200 font-semibold mt-0.5">Stomach (Wei)</div>
                <div className="text-[10px] text-slate-400">Digestive Qi ignition</div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-rose-400 font-mono font-bold">11 AM - 1 PM</div>
                <div className="text-slate-200 font-semibold mt-0.5">Heart (Xin)</div>
                <div className="text-[10px] text-slate-400">Circulation &amp; Shen balance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
