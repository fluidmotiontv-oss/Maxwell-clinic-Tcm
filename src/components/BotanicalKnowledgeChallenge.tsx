import React, { useState, useMemo, useEffect } from 'react';
import {
  MEDICINAL_HERB_CODEX,
  MedicinalHerb,
  AlkaloidCompound,
} from '../data/medicinalHerbs';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Atom,
  Leaf,
  Award,
  BookOpen,
} from 'lucide-react';

export type ChallengeTrack = 'mixed' | 'properties' | 'chemistry';

interface ChallengeQuestion {
  id: string;
  track: 'properties' | 'chemistry';
  herb: MedicinalHerb;
  alkaloid?: AlkaloidCompound;
  prompt: string;
  options: string[];
  correctAnswer: string;
  rationale: string;
  scaffoldHint?: AlkaloidCompound['scaffoldType'];
  formulaHint?: string;
}

interface BotanicalKnowledgeChallengeProps {
  onSelectHerbInCodex?: (herbId: string, alkaloidId?: string) => void;
}

interface SavedTrainingStats {
  completedDrills: number;
  totalAnswered: number;
  totalCorrect: number;
  bestAccuracy: number;
  propertiesCorrect: number;
  propertiesTotal: number;
  chemistryCorrect: number;
  chemistryTotal: number;
}

const TRAINING_STATS_STORAGE_KEY = 'maxwell_botanical_challenge_stats_v1';

const DEFAULT_STATS: SavedTrainingStats = {
  completedDrills: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  bestAccuracy: 0,
  propertiesCorrect: 0,
  propertiesTotal: 0,
  chemistryCorrect: 0,
  chemistryTotal: 0,
};

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestionsFromCodex(
  track: ChallengeTrack,
  count: number
): ChallengeQuestion[] {
  const pool: ChallengeQuestion[] = [];
  const allAlkaloids = MEDICINAL_HERB_CODEX.flatMap((herb) =>
    herb.activeAlkaloids.map((alk) => ({ herb, alk }))
  );

  // Track 1: Medicinal Properties, Thermal Energetics, Tropism & Clinical Indications
  MEDICINAL_HERB_CODEX.forEach((herb) => {
    // Q1: Thermal Energetics
    const otherThermal = MEDICINAL_HERB_CODEX.filter((h) => h.id !== herb.id).map(
      (h) => h.thermalEnergetics
    );
    pool.push({
      id: `prop-thermal-${herb.id}`,
      track: 'properties',
      herb,
      prompt: `What are the classical TCM thermal energetics and flavors of ${herb.pinyin} (${herb.englishName})?`,
      options: shuffleArray([herb.thermalEnergetics, ...otherThermal.slice(0, 3)]),
      correctAnswer: herb.thermalEnergetics,
      rationale: `${herb.pinyin} (${herb.botanicalName}) is classified as ${herb.thermalEnergetics}, entering the ${herb.meridianTropism.join(', ')} channels.`,
    });

    // Q2: Meridian Tropism
    const correctTropism = `${herb.meridianTropism.join(', ')} Channels`;
    const otherTropisms = MEDICINAL_HERB_CODEX.filter((h) => h.id !== herb.id).map(
      (h) => `${h.meridianTropism.join(', ')} Channels`
    );
    pool.push({
      id: `prop-tropism-${herb.id}`,
      track: 'properties',
      herb,
      prompt: `Which TCM meridian tropism channels does ${herb.pinyin} (${herb.chineseName}) primarily enter?`,
      options: shuffleArray([correctTropism, ...otherTropisms.slice(0, 3)]),
      correctAnswer: correctTropism,
      rationale: `${herb.pinyin} targets the ${correctTropism} to exert its action: ${herb.primaryIndications}`,
    });

    // Q3: Clinical Indication -> Herb Match
    const correctHerbLabel = `${herb.pinyin} (${herb.englishName})`;
    const otherHerbLabels = MEDICINAL_HERB_CODEX.filter((h) => h.id !== herb.id).map(
      (h) => `${h.pinyin} (${h.englishName})`
    );
    pool.push({
      id: `prop-indication-${herb.id}`,
      track: 'properties',
      herb,
      prompt: `Which botanical from the codex is primarily indicated to: "${herb.primaryIndications}"`,
      options: shuffleArray([correctHerbLabel, ...otherHerbLabels.slice(0, 3)]),
      correctAnswer: correctHerbLabel,
      rationale: `${correctHerbLabel} (${herb.botanicalName}): ${herb.clinicalNotes}`,
    });
  });

  // Track 2: Organic Chemical Structures, Molecular Formulas, Classes & Pharmacokinetics
  allAlkaloids.forEach(({ herb, alk }) => {
    const shortName = alk.name.split(' (')[0];

    // Q4: Chemical Formula Identification
    const uniqueFormulas = Array.from(
      new Set(allAlkaloids.map((entry) => entry.alk.formula).filter((f) => f !== alk.formula))
    );
    pool.push({
      id: `chem-formula-${alk.id}`,
      track: 'chemistry',
      herb,
      alkaloid: alk,
      scaffoldHint: alk.scaffoldType,
      prompt: `Identify the molecular formula for ${shortName} (${alk.chemicalClass}), an active phytochemical isolated from ${herb.pinyin}.`,
      options: shuffleArray([alk.formula, ...shuffleArray(uniqueFormulas).slice(0, 3)]),
      correctAnswer: alk.formula,
      rationale: `${shortName} has empirical formula ${alk.formula} (MW ${alk.molecularWeight}). ${alk.pharmacodynamics}`,
    });

    // Q5: Chemical Structural Class -> Compound Match
    const uniqueClasses = Array.from(
      new Set(
        allAlkaloids
          .map((entry) => entry.alk.chemicalClass)
          .filter((c) => c !== alk.chemicalClass)
      )
    );
    pool.push({
      id: `chem-class-${alk.id}`,
      track: 'chemistry',
      herb,
      alkaloid: alk,
      scaffoldHint: alk.scaffoldType,
      formulaHint: alk.formula,
      prompt: `Based on the organic scaffold shown and molecular formula ${alk.formula}, what structural class characterizes ${shortName}?`,
      options: shuffleArray([alk.chemicalClass, ...shuffleArray(uniqueClasses).slice(0, 3)]),
      correctAnswer: alk.chemicalClass,
      rationale: `${shortName} (${alk.formula}) belongs to the ${alk.chemicalClass} family. Solubility: ${alk.solubility}`,
    });

    // Q6: Metabolic Pathway / Pharmacodynamics
    const otherCompounds = allAlkaloids
      .filter((entry) => entry.alk.id !== alk.id)
      .map((entry) => entry.alk.name.split(' (')[0]);
    pool.push({
      id: `chem-mech-${alk.id}`,
      track: 'chemistry',
      herb,
      alkaloid: alk,
      scaffoldHint: alk.scaffoldType,
      prompt: `Which active compound exhibits the following pharmacodynamic profile: "${alk.pharmacodynamics}"`,
      options: shuffleArray([shortName, ...shuffleArray(otherCompounds).slice(0, 3)]),
      correctAnswer: shortName,
      rationale: `${shortName} (${herb.pinyin} · ${alk.formula}) — Metabolism: ${alk.metabolicPathway}`,
    });
  });

  const filtered =
    track === 'mixed' ? pool : pool.filter((q) => q.track === track);

  return shuffleArray(filtered).slice(0, Math.min(count, filtered.length));
}

// Clean SVG Organic Chemical Scaffold Diagram for structure recognition questions
const ChemicalScaffoldPreview: React.FC<{
  scaffoldType: AlkaloidCompound['scaffoldType'];
  formulaHint?: string;
}> = ({ scaffoldType, formulaHint }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row items-center gap-4">
      <svg
        viewBox="0 0 220 96"
        className="w-48 h-20 shrink-0 text-teal-400"
        aria-label={`Chemical scaffold schematic for ${scaffoldType}`}
      >
        {scaffoldType === 'triterpenoid-saponin' && (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            {/* Fused 6-6-6-6-5 Pentacyclic Triterpene Core + Glycoside Sugar */}
            <polygon points="22,38 36,28 50,38 50,56 36,66 22,56" />
            <polygon points="50,38 64,28 78,38 78,56 64,66 50,56" />
            <polygon points="64,28 78,18 92,28 92,46 78,56 64,46" />
            <polygon points="92,28 106,18 120,28 120,46 106,56 92,46" />
            <polygon points="120,28 136,24 144,38 132,50 120,46" />
            <line x1="22" y1="56" x2="10" y2="66" stroke="#f59e0b" />
            <circle cx="158" cy="40" r="14" stroke="#38bdf8" strokeDasharray="3 2" />
            <text x="150" y="43" fill="#38bdf8" fontSize="8" stroke="none" fontFamily="monospace">
              Gly
            </text>
            <text x="4" y="76" fill="#f59e0b" fontSize="8" stroke="none" fontFamily="monospace">
              OH
            </text>
          </g>
        )}

        {scaffoldType === 'cyclopeptide-alkaloid' && (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            {/* 14-membered Macrocyclic Peptide-Alkaloid Ring with Amide Nitrogens */}
            <polygon points="62,18 118,18 148,46 124,76 66,76 42,46" stroke="#38bdf8" />
            <polygon points="148,46 168,36 184,46 184,64 168,74 148,64" />
            <circle cx="62" cy="18" r="5" fill="#0f172a" stroke="#60a5fa" />
            <circle cx="118" cy="18" r="5" fill="#0f172a" stroke="#60a5fa" />
            <circle cx="66" cy="76" r="5" fill="#0f172a" stroke="#f43f5e" />
            <text x="58" y="11" fill="#60a5fa" fontSize="8" stroke="none" fontFamily="monospace">
              NH
            </text>
            <text x="114" y="11" fill="#60a5fa" fontSize="8" stroke="none" fontFamily="monospace">
              N
            </text>
            <text x="58" y="89" fill="#f43f5e" fontSize="8" stroke="none" fontFamily="monospace">
              O=C
            </text>
          </g>
        )}

        {scaffoldType === 'phenylpropanoid' && (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            {/* Aromatic Ring + Propenoic Acid Chain */}
            <polygon points="34,34 52,24 70,34 70,56 52,66 34,56" />
            <circle cx="52" cy="45" r="10" strokeDasharray="3 2" />
            <line x1="70" y1="34" x2="98" y2="24" />
            <line x1="98" y1="24" x2="124" y2="40" strokeWidth="3" />
            <line x1="124" y1="40" x2="152" y2="28" stroke="#f43f5e" />
            <line x1="152" y1="28" x2="176" y2="42" stroke="#f43f5e" />
            <line x1="34" y1="56" x2="16" y2="66" stroke="#f59e0b" />
            <text x="8" y="76" fill="#f59e0b" fontSize="8" stroke="none" fontFamily="monospace">
              HO
            </text>
            <text x="168" y="54" fill="#f43f5e" fontSize="8" stroke="none" fontFamily="monospace">
              COOH
            </text>
          </g>
        )}

        {scaffoldType === 'phthalide' && (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            {/* Bicyclic Benzofuranone Phthalide Core + Aliphatic Tail */}
            <polygon points="44,34 64,22 84,34 84,58 64,70 44,58" />
            <polygon points="84,34 114,34 126,46 114,58 84,58" stroke="#f59e0b" />
            <line x1="114" y1="34" x2="124" y2="18" stroke="#f43f5e" />
            <line x1="126" y1="46" x2="156" y2="46" stroke="#2dd4bf" />
            <line x1="156" y1="46" x2="184" y2="60" stroke="#2dd4bf" />
            <text x="122" y="15" fill="#f43f5e" fontSize="8" stroke="none" fontFamily="monospace">
              =O
            </text>
            <text x="108" y="68" fill="#f59e0b" fontSize="8" stroke="none" fontFamily="monospace">
              O
            </text>
          </g>
        )}

        {scaffoldType === 'isoflavone' && (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            {/* Chromone Core + 3-Phenyl Ring + Beta-D-Glucoside */}
            <polygon points="36,34 54,24 72,34 72,56 54,66 36,56" />
            <polygon points="72,34 90,24 108,34 108,56 90,66 72,56" stroke="#f59e0b" />
            <line x1="108" y1="56" x2="132" y2="62" />
            <polygon points="132,52 150,42 168,52 168,72 150,82 132,72" />
            <text x="86" y="19" fill="#f43f5e" fontSize="8" stroke="none" fontFamily="monospace">
              =O
            </text>
            <text x="86" y="76" fill="#f59e0b" fontSize="8" stroke="none" fontFamily="monospace">
              O
            </text>
            <text x="12" y="48" fill="#38bdf8" fontSize="8" stroke="none" fontFamily="monospace">
              GlcO-
            </text>
          </g>
        )}
      </svg>

      <div className="text-[11px] space-y-1 text-slate-300">
        <div className="font-mono text-teal-300 font-semibold uppercase tracking-wide">
          Structural Scaffold Cue
        </div>
        <p className="text-slate-400 leading-relaxed">
          Inspect the core ring topology, heteroatoms (<span className="font-mono text-blue-300">N</span> / <span className="font-mono text-rose-300">O</span>), and glycosidic substitutions
          {formulaHint ? (
            <>
              {' '}for formula <strong className="font-mono text-slate-100">{formulaHint}</strong>.
            </>
          ) : (
            '.'
          )}
        </p>
      </div>
    </div>
  );
};

export const BotanicalKnowledgeChallenge: React.FC<BotanicalKnowledgeChallengeProps> = ({
  onSelectHerbInCodex,
}) => {
  const [track, setTrack] = useState<ChallengeTrack>('mixed');
  const [questionCount, setQuestionCount] = useState<5 | 10>(5);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>(() =>
    generateQuestionsFromCodex('mixed', 5)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answersLog, setAnswersLog] = useState<
    { question: ChallengeQuestion; chosen: string; isCorrect: boolean }[]
  >([]);
  const [streak, setStreak] = useState<number>(0);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);

  const [stats, setStats] = useState<SavedTrainingStats>(() => {
    try {
      const saved = localStorage.getItem(TRAINING_STATS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRAINING_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage errors
    }
  }, [stats]);

  const currentQuestion = questions[currentIndex];

  const startNewSession = (nextTrack: ChallengeTrack = track, nextCount: 5 | 10 = questionCount) => {
    setTrack(nextTrack);
    setQuestionCount(nextCount);
    setQuestions(generateQuestionsFromCodex(nextTrack, nextCount));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswersLog([]);
    setStreak(0);
    setIsSessionComplete(false);
  };

  const handleChooseOption = (option: string) => {
    if (selectedOption !== null || !currentQuestion) return;

    const isCorrect = option === currentQuestion.correctAnswer;
    setSelectedOption(option);
    setAnswersLog((prev) => [
      ...prev,
      { question: currentQuestion, chosen: option, isCorrect },
    ]);
    setStreak((s) => (isCorrect ? s + 1 : 0));

    setStats((prev) => ({
      ...prev,
      totalAnswered: prev.totalAnswered + 1,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      propertiesTotal:
        prev.propertiesTotal + (currentQuestion.track === 'properties' ? 1 : 0),
      propertiesCorrect:
        prev.propertiesCorrect +
        (currentQuestion.track === 'properties' && isCorrect ? 1 : 0),
      chemistryTotal:
        prev.chemistryTotal + (currentQuestion.track === 'chemistry' ? 1 : 0),
      chemistryCorrect:
        prev.chemistryCorrect +
        (currentQuestion.track === 'chemistry' && isCorrect ? 1 : 0),
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      const correctInRun = answersLog.filter((a) => a.isCorrect).length;
      const runAccuracy = Math.round((correctInRun / questions.length) * 100);
      setStats((prev) => ({
        ...prev,
        completedDrills: prev.completedDrills + 1,
        bestAccuracy: Math.max(prev.bestAccuracy, runAccuracy),
      }));
      setIsSessionComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const sessionCorrectCount = useMemo(
    () => answersLog.filter((a) => a.isCorrect).length,
    [answersLog]
  );

  const lifetimeAccuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  return (
    <section
      id="botanical-knowledge-challenge"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6"
    >
      {/* Challenge Header & Track Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Botanical Knowledge Challenge — Staff Training &amp; Competency Drill
            </h2>
            <p className="text-xs text-slate-400">
              Practice assessment dynamically generated from codex medicinal properties, meridian tropisms, and organic phytochemical structures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Track Filter Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {(
              [
                { id: 'mixed', label: 'All Topics' },
                { id: 'properties', label: 'Medicinal Properties' },
                { id: 'chemistry', label: 'Organic Chemistry' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => startNewSession(t.id, questionCount)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  track === t.id
                    ? 'bg-slate-800 text-teal-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Drill Length Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            {([5, 10] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => startNewSession(track, cnt)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap tabular-nums ${
                  questionCount === cnt
                    ? 'bg-slate-800 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cnt} Qs
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => startNewSession(track, questionCount)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            <span>New Drill</span>
          </button>
        </div>
      </div>

      {/* Staff Training Telemetry Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase">Current Drill Score</div>
          <div className="text-lg font-bold text-teal-300 mt-0.5">
            {sessionCorrectCount} / {questions.length}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase">Active Streak</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5">{streak} Correct</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase">Cumulative Accuracy</div>
          <div className="text-lg font-bold text-slate-100 mt-0.5">
            {lifetimeAccuracy}% ({stats.totalCorrect}/{stats.totalAnswered})
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase">Drills Completed · Best</div>
          <div className="text-lg font-bold text-emerald-300 mt-0.5">
            {stats.completedDrills} · {stats.bestAccuracy}%
          </div>
        </div>
      </div>

      {/* Main Quiz Stage or Completion Summary */}
      {isSessionComplete ? (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Training Drill Complete — {Math.round((sessionCorrectCount / questions.length) * 100)}% Accuracy
                </h3>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  Scored {sessionCorrectCount} out of {questions.length} questions in{' '}
                  {track === 'mixed' ? 'Mixed Codex Track' : track === 'properties' ? 'Medicinal Properties' : 'Organic Chemistry'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startNewSession(track, questionCount)}
              className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Challenge</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="font-mono text-slate-400 uppercase text-[11px]">
              Question-by-Question Clinical Review
            </div>
            {answersLog.map((entry, idx) => (
              <div
                key={entry.question.id}
                className={`p-3.5 rounded-lg border space-y-1.5 ${
                  entry.isCorrect
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-rose-950/15 border-rose-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-slate-100 flex items-center gap-2">
                    {entry.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      Q{idx + 1}. {entry.question.prompt}
                    </span>
                  </div>
                  {onSelectHerbInCodex && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectHerbInCodex(entry.question.herb.id, entry.question.alkaloid?.id)
                      }
                      className="px-2 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 rounded whitespace-nowrap shrink-0"
                    >
                      Inspect {entry.question.herb.pinyin}
                    </button>
                  )}
                </div>
                {!entry.isCorrect && (
                  <div className="text-[11px] font-mono text-rose-300">
                    Your Answer: {entry.chosen} · Correct: <strong className="text-emerald-300">{entry.question.correctAnswer}</strong>
                  </div>
                )}
                <p className="text-[11px] text-slate-300 leading-relaxed">{entry.question.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      ) : currentQuestion ? (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-5">
          {/* Question Progress & Topic Line */}
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-teal-300 font-bold tabular-nums">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                {currentQuestion.track === 'chemistry' ? (
                  <>
                    <Atom className="w-3.5 h-3.5 text-purple-400" />
                    <span>Organic Chemistry &amp; Structure</span>
                  </>
                ) : (
                  <>
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Medicinal Properties &amp; Tropism</span>
                  </>
                )}
              </span>
            </div>

            {onSelectHerbInCodex && (
              <button
                type="button"
                onClick={() =>
                  onSelectHerbInCodex(currentQuestion.herb.id, currentQuestion.alkaloid?.id)
                }
                className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" />
                <span>Reference in Codex</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 transition-all duration-300"
              style={{
                width: `${((currentIndex + (selectedOption ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Prompt */}
          <h3 className="text-base font-semibold text-slate-100 leading-relaxed">
            {currentQuestion.prompt}
          </h3>

          {/* Organic Chemical Scaffold Visual Cue when applicable */}
          {currentQuestion.scaffoldHint && (
            <ChemicalScaffoldPreview
              scaffoldType={currentQuestion.scaffoldHint}
              formulaHint={currentQuestion.formulaHint}
            />
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentQuestion.options.map((opt, idx) => {
              const isChosen = selectedOption === opt;
              const isCorrectOption = opt === currentQuestion.correctAnswer;
              const isRevealed = selectedOption !== null;

              let btnStyle =
                'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-teal-500/50 text-slate-200';
              if (isRevealed) {
                if (isCorrectOption) {
                  btnStyle = 'bg-emerald-950/35 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isChosen && !isCorrectOption) {
                  btnStyle = 'bg-rose-950/35 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
                }
              }

              return (
                <button
                  key={`${currentQuestion.id}-opt-${idx}`}
                  type="button"
                  disabled={isRevealed}
                  onClick={() => handleChooseOption(opt)}
                  className={`p-3.5 rounded-lg border text-left transition-colors flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-slate-400 font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>
                  {isRevealed && isCorrectOption && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {isRevealed && isChosen && !isCorrectOption && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback & Clinical Rationale */}
          {selectedOption !== null && (
            <div
              className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
                selectedOption === currentQuestion.correctAnswer
                  ? 'bg-emerald-950/25 border-emerald-500/40'
                  : 'bg-rose-950/25 border-rose-500/40'
              }`}
            >
              <div className="space-y-1">
                <div
                  className={`font-bold flex items-center gap-1.5 ${
                    selectedOption === currentQuestion.correctAnswer
                      ? 'text-emerald-300'
                      : 'text-rose-300'
                  }`}
                >
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct Answer</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect — Correct Answer: {currentQuestion.correctAnswer}</span>
                    </>
                  )}
                </div>
                <p className="text-slate-200 leading-relaxed">{currentQuestion.rationale}</p>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 self-end sm:self-center"
              >
                <span>
                  {currentIndex + 1 >= questions.length ? 'Finish & View Summary' : 'Next Question'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};
