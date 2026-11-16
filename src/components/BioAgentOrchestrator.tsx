import React, { useState } from 'react';
import { BIO_AGENTS } from '../data/bioAgents';
import { BioAgent, AgenticActionItem } from '../types/clinic';
import { Brain, Activity, Leaf, Headphones, Clock, Send, CheckCircle2, Play, RefreshCw, Terminal, Layers, Atom, Zap } from 'lucide-react';
import { BioAgentThreeVisualizer } from './BioAgentThreeVisualizer';
import { MolecularDockingVisualizer } from './MolecularDockingVisualizer';
import { ActiveBioAgentMolecularViewer } from './ActiveBioAgentMolecularViewer';

interface BioAgentOrchestratorProps {
  customDispatchedTasks?: AgenticActionItem[];
}

export const BioAgentOrchestrator: React.FC<BioAgentOrchestratorProps> = ({ customDispatchedTasks = [] }) => {
  const [agents, setAgents] = useState<BioAgent[]>(BIO_AGENTS);
  const [promptText, setPromptText] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [visualizerView, setVisualizerView] = useState<'molecules' | 'docking' | 'routing' | 'all'>('molecules');
  const [logs, setLogs] = useState<Array<{ id: string; time: string; agent: string; text: string; status: string }>>([
    {
      id: 'log-1',
      time: '12:04:15',
      agent: 'Diagnostic Bio-Synthesizer',
      text: 'Synchronized Elena Vance Zang-Fu diagnosis: Gan Yu Pi Xu with low vagal RMSSD (28ms).',
      status: 'Completed',
    },
    {
      id: 'log-2',
      time: '12:04:18',
      agent: 'Botanical Formulary Agent',
      text: 'Verified Xiao Yao San granular extract formulation against drug-herb safety matrix. 0 contraindications found.',
      status: 'Completed',
    },
    {
      id: 'log-3',
      time: '12:04:22',
      agent: 'Frequency Harmonic Audio Agent',
      text: 'Synthesized 174Hz Wood Solfeggio tone + 6Hz Theta entrainment for midnight dispatch.',
      status: 'Active',
    },
  ]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsExecuting(true);
    const newLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      agent: 'Bio-Agent Integration Hub',
      text: `Dispatch Directive: "${promptText}"`,
      status: 'Processing',
    };

    setLogs((prev) => [newLog, ...prev]);
    setPromptText('');

    setTimeout(() => {
      setIsExecuting(false);
      setLogs((prev) => [
        {
          id: `log-res-${Date.now()}`,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          agent: 'Diagnostic Bio-Synthesizer & Dispatcher',
          text: `Directive executed successfully across 5 bio-agents. Workflows updated.`,
          status: 'Completed',
        },
        ...prev,
      ]);
    }, 1500);
  };

  const getAgentIcon = (name: string) => {
    if (name.includes('Diagnostic')) return <Brain className="w-4 h-4 text-teal-400" />;
    if (name.includes('Meridian')) return <Activity className="w-4 h-4 text-amber-400" />;
    if (name.includes('Botanical')) return <Leaf className="w-4 h-4 text-emerald-400" />;
    if (name.includes('Frequency')) return <Headphones className="w-4 h-4 text-purple-400" />;
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Bio-Agent Orchestration</span>
            <span aria-hidden="true">·</span>
            <span>Automated Telemetry Dispatch</span>
            <span aria-hidden="true">·</span>
            <span>Digital Therapeutics Sync</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Maxwell Clinic Bio-Agent Command &amp; Telemetry Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Autonomous clinical agents coordinating patient telemetry tracking, botanical pharmacy routing, frequency sound app sync, and organ clock scheduling.
          </p>
        </div>
      </div>

      {/* Fleet Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {agents.map((ag) => (
          <div
            key={ag.id}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  {getAgentIcon(ag.name)}
                </div>
                <span className="text-[10px] font-mono text-slate-400">{ag.lastPing}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-100 leading-tight">{ag.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{ag.role}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className="text-teal-400 font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  {ag.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Active Tasks:</span>
                <span className="font-mono text-slate-200 font-bold">{ag.activeTaskCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Visualizer Mode Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Three.js 3D Bio-Agent &amp; Cellular Simulation Suite
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs flex-wrap">
          {[
            { id: 'molecules', label: 'Active Molecular Structures', icon: Atom },
            { id: 'docking', label: 'Molecular Docking Simulator', icon: Zap },
            { id: 'routing', label: 'Bio-Agent Signal Routing', icon: Activity },
            { id: 'all', label: 'View All Simulations', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = visualizerView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setVisualizerView(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-teal-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Three.js 3D Molecular Structures of Active Protocol Bio-Agents */}
      {(visualizerView === 'molecules' || visualizerView === 'all') && (
        <ActiveBioAgentMolecularViewer />
      )}

      {/* Three.js 3D Molecular Docking Simulation */}
      {(visualizerView === 'docking' || visualizerView === 'all') && (
        <MolecularDockingVisualizer />
      )}

      {/* Advanced Three.js Bio-Agent & Cellular Process Simulation */}
      {(visualizerView === 'routing' || visualizerView === 'all') && (
        <BioAgentThreeVisualizer />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Command Directive Dispatch Input */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" /> Bio-Agent Command Directive
            </h2>
            <span className="text-[11px] font-mono text-teal-400">Agentic Execution</span>
          </div>

          <form onSubmit={handleRunCommand} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                Issue Clinical Directive to Bio-Agent Fleet
              </label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Schedule midnight 174Hz audio therapy for Elena Vance, route Xiao Yao San granular extract to dispensary, and flag HRV recovery telemetry..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isExecuting || !promptText.trim()}
              className="w-full py-2.5 px-4 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching to Bio-Agents...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Bio-Agent Directive</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Workflows */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Quick Workflow Macros:</div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setPromptText('Initiate continuous 24h HRV vagal telemetry monitoring and sync sound therapy protocol.')}
                className="w-full text-left p-2 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-[11px] text-slate-300 transition-colors"
              >
                ⚡ Macro 1: 24h Continuous Vagal Telemetry Sync
              </button>
              <button
                type="button"
                onClick={() => setPromptText('Route customized botanical herbal formula to Maxwell Clinic dispensary with automated patient dosage reminders.')}
                className="w-full text-left p-2 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-[11px] text-slate-300 transition-colors"
              >
                ⚡ Macro 2: Dispensary Herbal Route &amp; Dosage Reminders
              </button>
            </div>
          </div>
        </div>

        {/* Live Execution Telemetry Feed */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Live Agentic Execution &amp; Dispatch Log
            </h2>
            <span className="text-[11px] font-mono text-amber-400">Real-Time Event Stream</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-950 border border-slate-800/90 p-3.5 rounded-lg space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">[{log.time}] {log.agent}</span>
                  <span className="text-teal-400 font-bold uppercase">{log.status}</span>
                </div>
                <p className="text-slate-200 font-sans leading-relaxed pt-1">
                  {log.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
