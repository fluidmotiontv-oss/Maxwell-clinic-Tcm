import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Clinical System Prompt
const SYSTEM_INSTRUCTION = `You are the advanced clinical AI assistant and integration engine for Maxwell Clinic.
Your mission is to seamlessly bridge modern bio-agent workflows, digital healing applications, and Traditional Chinese Medicine (TCM) diagnostics/therapeutics.

When synthesizing physiological data, herbal/acupuncture frameworks, frequency-based wellness principles, and automated agentic dispatch, you MUST structure all care plans and diagnostic syntheses into EXACTLY these three sections:

1. Constitutional & Pattern Summary: TCM diagnosis (Zang-Fu organ systems, Eight Principles, Yin/Yang, Five Elements) and modern bio-marker correlation (HRV, Cortisol, hs-CRP, Microbiome, Sleep, Alpha Waves).
2. Integrative Protocol: Recommended herbal formulation & thermology energetics, acupuncture channel & specific point focus, dietary energetics, and digital healing app integration (frequency sound therapy, binaural tones, breathwork).
3. Agentic Action Items: Automated tasks, scheduling reminders, pharmacy dispatch, or follow-up telemetry for the clinic's bio-agents.

Safety Protocol: Ensure all TCM and bio-agent recommendations are framed as supportive, integrative clinical pathways that complement primary medical supervision.`;

// API Endpoint: Synthesize Diagnostic & Care Plan
app.post('/api/gemini/synthesize', async (req, res) => {
  try {
    const { patientProfile, tonguePulse, bioMarkers, chiefComplaints, elementBalance } = req.body;

    const prompt = `Perform a comprehensive Maxwell Clinic Integrative Diagnostic Synthesis & Care Plan for the following patient intake:

Patient Profile:
- Name/ID: ${patientProfile?.name || 'Anonymous Patient'}
- Age: ${patientProfile?.age || '42'}, Gender: ${patientProfile?.gender || patientProfile?.sex || 'Female'}, Season: ${patientProfile?.season || 'Autumn'}

Tongue & Pulse Presentation:
- Tongue: ${tonguePulse?.tongue || 'Pale with thin white coating'}
- Pulse: ${tonguePulse?.pulse || 'Deep, wiry, slightly rapid'}
- Complexion / Voice: ${tonguePulse?.complexion || 'Dull complexion, low soft voice'}

Modern Bio-Markers:
- Heart Rate Variability (HRV): ${bioMarkers?.hrv || '32 ms (Low vagal tone)'}
- Salivary Cortisol Rhythm: ${bioMarkers?.cortisol || 'Elevated morning (22 nmol/L), flat evening'}
- Inflammation (hs-CRP): ${bioMarkers?.crp || '3.2 mg/L (Mild systemic elevation)'}
- Gut Microbiome Diversity: ${bioMarkers?.microbiome || 'Low Akkermansia, High Firmicutes/Bacteroidetes'}
- Sleep Efficiency: ${bioMarkers?.sleep || '64% (Frequent nocturnal awakenings)'}
- EEG Alpha Wave Power: ${bioMarkers?.alphaWave || 'Suppressed 8-10 Hz power'}
- Mitochondrial Redox Index: ${bioMarkers?.mitochondrial || '71% efficiency'}

Chief Complaints & Symptoms:
${chiefComplaints || 'Chronic fatigue, middle-of-the-night awakening (1-3 AM Liver channel time), digestive bloating after meals, neck and shoulder tension, emotional irritability.'}

Five Element Dynamic:
Wood: ${elementBalance?.wood || 40}%, Fire: ${elementBalance?.fire || 60}%, Earth: ${elementBalance?.earth || 35}%, Metal: ${elementBalance?.metal || 75}%, Water: ${elementBalance?.water || 45}%.

Please output a structured JSON care plan according to the response schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            constitutionalSummary: {
              type: Type.OBJECT,
              properties: {
                tcmPatternDiagnosis: { type: Type.STRING, description: 'Zang-Fu and Eight Principle Diagnosis' },
                yinYangBalance: { type: Type.STRING, description: 'Status of Yin, Yang, Qi, and Blood' },
                fiveElementDynamic: { type: Type.STRING, description: 'Dominant element imbalance (Mother/Child/Overacting)' },
                bioMarkerCorrelation: { type: Type.STRING, description: 'Correlation between bio-markers and TCM patterns' },
                rootCauseAnalysis: { type: Type.STRING, description: 'Underlying systemic root cause synthesis' },
              },
              required: ['tcmPatternDiagnosis', 'yinYangBalance', 'fiveElementDynamic', 'bioMarkerCorrelation', 'rootCauseAnalysis'],
            },
            integrativeProtocol: {
              type: Type.OBJECT,
              properties: {
                herbalFormulation: {
                  type: Type.OBJECT,
                  properties: {
                    classicFormula: { type: Type.STRING, description: 'Primary classical formula name (Pin Yin & English)' },
                    keyHerbs: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Key botanical herbs and thermal energetics' },
                    dosageInstruction: { type: Type.STRING, description: 'Specific dosage & timing instructions' },
                  },
                  required: ['classicFormula', 'keyHerbs', 'dosageInstruction'],
                },
                acupuncturePoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pointCode: { type: Type.STRING, description: 'e.g. LV3, ST36, SP6' },
                      name: { type: Type.STRING, description: 'Pin Yin name e.g. Taichong' },
                      meridian: { type: Type.STRING, description: 'Associated channel' },
                      clinicalAction: { type: Type.STRING, description: 'Channel energetic action & bio-marker effect' },
                    },
                    required: ['pointCode', 'name', 'meridian', 'clinicalAction'],
                  },
                },
                dietaryTherapy: {
                  type: Type.OBJECT,
                  properties: {
                    thermalEnergetics: { type: Type.STRING, description: 'Warm/Cool/Neutral dietary recommendation' },
                    recommendedFoods: { type: Type.ARRAY, items: { type: Type.STRING } },
                    foodsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['thermalEnergetics', 'recommendedFoods', 'foodsToAvoid'],
                },
                digitalTherapeutics: {
                  type: Type.OBJECT,
                  properties: {
                    frequencyHz: { type: Type.NUMBER, description: 'Target Solfeggio or TCM Hz frequency e.g. 528' },
                    frequencyName: { type: Type.STRING, description: 'e.g. 528Hz Wood/Heart Resonance' },
                    binauralBeat: { type: Type.STRING, description: 'e.g. 6Hz Theta Entrainment for vagal stimulation' },
                    circadianRecommendation: { type: Type.STRING, description: 'Light exposure & Organ Clock alignment' },
                    breathworkPattern: { type: Type.STRING, description: 'Breath pacing protocol' },
                  },
                  required: ['frequencyHz', 'frequencyName', 'binauralBeat', 'circadianRecommendation', 'breathworkPattern'],
                },
              },
              required: ['herbalFormulation', 'acupuncturePoints', 'dietaryTherapy', 'digitalTherapeutics'],
            },
            agenticActionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentName: { type: Type.STRING, description: 'Target bio-agent name' },
                  taskType: { type: Type.STRING, description: 'e.g. Pharmacy Route, Telemetry Track, Audio Sync' },
                  actionDescription: { type: Type.STRING, description: 'Detailed instruction for the bio-agent' },
                  priority: { type: Type.STRING, description: 'High, Medium, Routine' },
                },
                required: ['agentName', 'taskType', 'actionDescription', 'priority'],
              },
            },
            safetyDisclaimer: { type: Type.STRING },
          },
          required: ['constitutionalSummary', 'integrativeProtocol', 'agenticActionItems', 'safetyDisclaimer'],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Synthesis Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to synthesize care plan' });
  }
});

// API Endpoint: Clinical Copilot Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, currentContext } = req.body;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}
You are answering clinical inquiries from Maxwell Clinic practitioners. Present highly authoritative, precise TCM and biomedical advice with exact herb names, acupoint coordinates, physiological mechanisms, and bio-agent dispatch protocols.
Current Patient Context: ${currentContext ? JSON.stringify(currentContext) : 'General Clinical Inquiry'}`,
      },
    });

    const lastMessage = messages[messages.length - 1]?.content || 'Hello';
    const response = await chat.sendMessage({ message: lastMessage });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to consult AI copilot' });
  }
});

// API Endpoint: Generate Custom Frequency Prescription Specs
app.post('/api/gemini/frequency-prescription', async (req, res) => {
  try {
    const { pattern, element, targetOutcome } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Design a digital therapeutic harmonic sound protocol for a patient with TCM pattern "${pattern}" and element "${element}" targeting "${targetOutcome}". Output JSON with frequency (Hz), carrier (Hz), binauralBeat (Hz), binauralWaveType, description, and elementColor.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frequency: { type: Type.NUMBER, description: 'Primary Solfeggio or organ frequency e.g. 528' },
            carrierFrequency: { type: Type.NUMBER, description: 'Base carrier tone e.g. 216' },
            binauralBeat: { type: Type.NUMBER, description: 'Differential beat frequency e.g. 6' },
            binauralWaveType: { type: Type.STRING, description: 'Theta, Alpha, Delta, or Gamma' },
            prescriptionTitle: { type: Type.STRING },
            clinicalRationale: { type: Type.STRING },
            recommendedDurationMinutes: { type: Type.NUMBER },
            organClockWindow: { type: Type.STRING },
          },
          required: ['frequency', 'carrierFrequency', 'binauralBeat', 'binauralWaveType', 'prescriptionTitle', 'clinicalRationale', 'recommendedDurationMinutes', 'organClockWindow'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Frequency Gen Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite Middleware for Development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(viteServer.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await viteServer.transformIndexHtml(url, `
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maxwell Clinic - Bio-Agent &amp; TCM Clinical Operations Engine</title>
    <meta name="description" content="Clinical AI engine for Maxwell Clinic bridging Traditional Chinese Medicine diagnostics, modern bio-marker correlation, digital frequency therapeutics, and bio-agent orchestration." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300..800;1,300..800&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        viteServer.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Maxwell Clinic Operations Server running on http://localhost:${PORT}`);
  });
}

startServer();
