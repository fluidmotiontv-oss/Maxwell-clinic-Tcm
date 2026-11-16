import React from 'react';
import { Activity, Sparkles, Brain, Radio, Users } from 'lucide-react';

export type ActiveTab = 'intake' | 'careplan' | 'overview' | 'fiveelements' | 'meridians' | 'bioagents' | 'audio' | 'patients' | 'codex';

interface TopNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewIntakeClick: () => void;
  isSynthesizing?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  onNewIntakeClick,
  isSynthesizing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => setActiveTab('intake')}
          className="cursor-pointer flex items-center gap-2.5 shrink-0 select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
            <Brain className="w-4.5 h-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            MAXWELL CLINIC
          </span>
        </div>

        {/* Zone 2: 5 clean single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('intake')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'intake' || activeTab === 'careplan' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Clinical Intake &amp; Care Plan
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'overview' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Patient Overview
          </button>
          <button
            onClick={() => setActiveTab('fiveelements')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'fiveelements' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Five Elements Matrix
          </button>
          <button
            onClick={() => setActiveTab('meridians')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'meridians' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Acupuncture &amp; Meridians
          </button>
          <button
            onClick={() => setActiveTab('bioagents')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'bioagents' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Bio-Agent Orchestrator
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'audio' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Digital Frequency Matrix
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'patients' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Patient Records
          </button>
          <button
            onClick={() => setActiveTab('codex')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-200 ${
              activeTab === 'codex' ? 'text-teal-400 font-semibold border-b border-teal-500' : ''
            }`}
          >
            Plant Codex
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewIntakeClick}
            disabled={isSynthesizing}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 rounded-lg transition-all shadow-sm shadow-teal-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSynthesizing ? 'Synthesizing...' : '+ New Diagnostic Intake'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
