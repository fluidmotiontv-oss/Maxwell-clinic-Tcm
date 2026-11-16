import React, { useState, useEffect, useRef } from 'react';
import { FREQUENCY_PRESETS } from '../data/bioAgents';
import { FrequencyPreset } from '../types/clinic';
import { Headphones, Play, Pause, Volume2, Radio, Sparkles, Activity, Layers } from 'lucide-react';

interface DigitalTherapeuticsPlayerProps {
  initialFrequency?: number;
  initialTitle?: string;
}

export const DigitalTherapeuticsPlayer: React.FC<DigitalTherapeuticsPlayerProps> = ({
  initialFrequency,
  initialTitle,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<FrequencyPreset>(FREQUENCY_PRESETS[0]);
  const [customHz, setCustomHz] = useState<number>(initialFrequency || 528);
  const [binauralHz, setBinauralHz] = useState<number>(6); // Theta 6Hz
  const [volume, setVolume] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [prescriptionPrompt, setPrescriptionPrompt] = useState<string>('');
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState<boolean>(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  // Web Audio References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainOscRef = useRef<OscillatorNode | null>(null);
  const binauralLeftOscRef = useRef<OscillatorNode | null>(null);
  const binauralRightOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle external frequency trigger
  useEffect(() => {
    if (initialFrequency) {
      setCustomHz(initialFrequency);
    }
  }, [initialFrequency]);

  const selectPreset = (preset: FrequencyPreset) => {
    setSelectedPreset(preset);
    setCustomHz(preset.frequency);
    setBinauralHz(preset.binauralBeat);
    if (isPlaying) {
      stopAudio();
    }
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Analyser for visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      gainNode.connect(analyser);
      analyser.connect(ctx.destination);

      // Main Solfeggio / Carrier Tone
      const mainOsc = ctx.createOscillator();
      mainOsc.type = 'sine';
      mainOsc.frequency.setValueAtTime(customHz, ctx.currentTime);
      mainOsc.connect(gainNode);
      mainOsc.start();
      mainOscRef.current = mainOsc;

      // Binaural Beat Setup (Left = Carrier - Beat/2, Right = Carrier + Beat/2)
      if (binauralHz > 0) {
        const leftFreq = customHz - binauralHz / 2;
        const rightFreq = customHz + binauralHz / 2;

        const leftPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (leftPanner) leftPanner.pan.setValueAtTime(-0.8, ctx.currentTime);

        const leftOsc = ctx.createOscillator();
        leftOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(leftFreq, ctx.currentTime);
        if (leftPanner) {
          leftOsc.connect(leftPanner);
          leftPanner.connect(gainNode);
        } else {
          leftOsc.connect(gainNode);
        }
        leftOsc.start();
        binauralLeftOscRef.current = leftOsc;

        const rightPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (rightPanner) rightPanner.pan.setValueAtTime(0.8, ctx.currentTime);

        const rightOsc = ctx.createOscillator();
        rightOsc.type = 'sine';
        rightOsc.frequency.setValueAtTime(rightFreq, ctx.currentTime);
        if (rightPanner) {
          rightOsc.connect(rightPanner);
          rightPanner.connect(gainNode);
        } else {
          rightOsc.connect(gainNode);
        }
        rightOsc.start();
        binauralRightOscRef.current = rightOsc;
      }

      setIsPlaying(true);
      startVisualizer();
    } catch (err) {
      console.error('Audio initialization error:', err);
    }
  };

  const stopAudio = () => {
    if (mainOscRef.current) {
      try { mainOscRef.current.stop(); } catch (e) {}
    }
    if (binauralLeftOscRef.current) {
      try { binauralLeftOscRef.current.stop(); } catch (e) {}
    }
    if (binauralRightOscRef.current) {
      try { binauralRightOscRef.current.stop(); } catch (e) {}
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Canvas Oscilloscope Visualizer
  const startVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = `rgb(13, 148, 136)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  // Generate AI sound prescription
  const handleGeneratePrescription = async () => {
    if (!prescriptionPrompt.trim()) return;
    setIsGeneratingPrescription(true);
    try {
      const response = await fetch('/api/gemini/frequency-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: prescriptionPrompt,
          element: selectedPreset.element,
          targetOutcome: 'Vagal stimulation & insomnia reduction',
        }),
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setCustomHz(resData.data.frequency || 528);
        setBinauralHz(resData.data.binauralBeat || 6);
        setAiRationale(resData.data.clinicalRationale);
        if (isPlaying) {
          stopAudio();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrescription(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Digital Therapeutics</span>
            <span aria-hidden="true">·</span>
            <span>Solfeggio Acoustic Frequencies</span>
            <span aria-hidden="true">·</span>
            <span>Binaural Vagal Entrainment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Digital Healing App &amp; Frequency Audio Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Real-time Web Audio API sound synthesizer generating Solfeggio tones, Schumann earth harmonics, and binaural beats for Maxwell Clinic healing app profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player & Real-Time Visualizer */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {initialTitle || selectedPreset.name}
                </h2>
                <p className="text-xs font-mono text-purple-300">
                  Target Organ: {selectedPreset.organTarget}
                </p>
              </div>
            </div>

            <button
              onClick={togglePlay}
              className={`px-5 py-2.5 text-xs font-bold uppercase rounded-lg border transition-all flex items-center gap-2 ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-teal-400 hover:bg-teal-300 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Stop Sound Healing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Sound Therapy</span>
                </>
              )}
            </button>
          </div>

          {/* HTML5 Canvas Spectrum Visualizer */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/7] flex items-center justify-center">
            <canvas ref={canvasRef} width={600} height={200} className="w-full h-full object-cover" />
            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-center p-4 space-y-2">
                <Radio className="w-8 h-8 text-teal-400 animate-pulse" />
                <div className="text-xs font-mono text-slate-300">
                  Web Audio Synthesizer Standby ({customHz} Hz + {binauralHz} Hz Binaural)
                </div>
                <p className="text-[11px] text-slate-500">Press "Start Sound Therapy" to play audio and activate spectrum analyzer.</p>
              </div>
            )}
          </div>

          {/* Controls: Tone & Binaural Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <div className="flex justify-between font-mono text-slate-300 mb-1.5">
                <span>Primary Tone Frequency</span>
                <span className="text-purple-400 font-bold">{customHz} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="963"
                value={customHz}
                onChange={(e) => {
                  setCustomHz(parseFloat(e.target.value));
                  if (isPlaying) stopAudio();
                }}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono text-slate-300 mb-1.5">
                <span>Binaural Entrainment Beat</span>
                <span className="text-teal-400 font-bold">{binauralHz} Hz (Theta)</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={binauralHz}
                onChange={(e) => {
                  setBinauralHz(parseFloat(e.target.value));
                  if (isPlaying) stopAudio();
                }}
                className="w-full accent-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Solfeggio Presets & AI Prescription Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400" /> Solfeggio &amp; TCM Presets
              </h3>
              <span className="text-[11px] font-mono text-teal-400 font-bold">5 Tones</span>
            </div>

            <div className="space-y-2 text-xs">
              {FREQUENCY_PRESETS.map((pst) => (
                <div
                  key={pst.id}
                  onClick={() => selectPreset(pst)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPreset.id === pst.id
                      ? 'bg-slate-800 border-purple-500/60 text-slate-100 shadow-md shadow-purple-500/10'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-purple-300">{pst.frequency} Hz ({pst.element})</span>
                    <span className="text-[10px] text-teal-400">{pst.binauralType}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-1">{pst.name}</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">{pst.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Custom Prescription Generator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Frequency Prescription
              </h3>
              <span className="text-[11px] font-mono text-amber-400">Gemini 3.8 Synth</span>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="e.g. Severe Liver Qi Stagnation with midnight insomnia..."
                value={prescriptionPrompt}
                onChange={(e) => setPrescriptionPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />

              <button
                onClick={handleGeneratePrescription}
                disabled={isGeneratingPrescription || !prescriptionPrompt.trim()}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors"
              >
                {isGeneratingPrescription ? 'Synthesizing Audio Specs...' : 'Generate Frequency Prescription'}
              </button>

              {aiRationale && (
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 space-y-1">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">Clinical Rationale:</div>
                  <p className="text-[11px] leading-relaxed">{aiRationale}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
