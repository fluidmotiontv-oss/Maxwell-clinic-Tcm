import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPatientName?: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentPatientName = 'Elena Vance',
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: `Greetings, Doctor. I am Maxwell Clinic’s Clinical AI Engine. Ask me about TCM pattern differentiation, herb-drug interaction matrices, acupuncture vagal mechanisms, or bio-agent dispatch directives.`,
      time: '12:00',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.sender, content: m.text })),
          currentContext: { patientName: currentPatientName },
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to generate response');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Clinical Assistant Error: ${err.message || 'Unable to consult clinical AI backend.'}`,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Brain className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Maxwell Clinical AI Copilot</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Context: <span className="text-teal-300 font-medium">{currentPatientName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`text-[9px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-slate-900 opacity-70' : 'text-slate-500'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Synthesizing clinical response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask about TCM patterns, herbs, acupoints, or bio-agents..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 p-1.5 text-teal-400 hover:text-teal-300 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
