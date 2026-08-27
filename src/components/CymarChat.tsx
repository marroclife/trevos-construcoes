import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowUp, Camera, ExternalLink, MessageCircle, Sparkles, X } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Olá! Eu sou a CYMAR, assistente de obras da Trevos. Posso orientar sobre preparação, pintura, materiais e tipos de orçamento. Como posso ajudar?',
};

const QUICK_QUESTIONS = [
  'Como preparar uma parede para pintura?',
  'Quais materiais preciso para uma reforma?',
  'Como funciona orçamento para CNPJ?',
];

export default function CymarChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isLoading) inputRef.current?.focus();
  }, [isOpen, isLoading, messages]);

  const sendMessage = async (suggestion?: string) => {
    const content = (suggestion ?? draft).trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const history = messages.slice(-10);
    setMessages(current => [...current, userMessage]);
    setDraft('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/cymar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', message: content, history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao conversar com a CYMAR.');
      setMessages(current => [...current, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('CYMAR chat failed:', error);
      setMessages(current => [...current, {
        role: 'assistant',
        content: 'Não consegui responder agora. Você pode tentar novamente ou falar com um vendedor da Trevos pelo WhatsApp.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const openPhotoAnalysis = () => {
    setIsOpen(false);
    if (window.location.pathname !== '/') {
      window.location.assign('/#cymar');
      return;
    }
    document.getElementById('cymar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSeller = () => {
    const text = encodeURIComponent('Olá Trevos Construções! Conversei com a CYMAR e gostaria de falar com um vendedor.');
    window.open(`https://wa.me/5521990387232?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60] select-none">
      {isOpen && (
        <section
          aria-label="Chat com a CYMAR"
          className="absolute bottom-[4.75rem] right-0 flex h-[min(610px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-emerald-950/10 bg-[#f8f5ec] shadow-2xl shadow-emerald-950/25"
        >
          <header className="flex items-center gap-3 bg-green-950 px-4 py-3.5 text-white">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#d6b15e] bg-white">
              <img src="/cymar-assistant.png" alt="CYMAR" className="h-full w-full object-cover object-[50%_16%] scale-[1.65]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-bold"><Sparkles className="h-4 w-4 text-[#d6b15e]" /> CYMAR</div>
              <p className="truncate text-[11px] text-emerald-100">Assistente educacional de obras</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Fechar conversa">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${message.role === 'user' ? 'rounded-br-md bg-green-900 text-white' : 'rounded-bl-md border border-emerald-950/10 bg-white text-slate-700'}`}>
                  {message.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                {QUICK_QUESTIONS.map(question => (
                  <button key={question} onClick={() => void sendMessage(question)} className="block w-full rounded-xl border border-green-900/15 bg-white px-3 py-2 text-left text-xs font-semibold text-green-950 transition hover:border-[#d6b15e] hover:bg-[#fffdf7]">
                    {question}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map(dot => <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b58a31]" style={{ animationDelay: `${dot * 120}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-emerald-950/10 bg-white px-3 pb-3 pt-2.5">
            <div className="mb-2 flex gap-2">
              <button onClick={openPhotoAnalysis} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f3ead4] px-2 py-2 text-[11px] font-bold text-green-950 hover:bg-[#ead9b3]">
                <Camera className="h-3.5 w-3.5" /> Analisar uma foto
              </button>
              <button onClick={openSeller} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-2 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100">
                <ExternalLink className="h-3.5 w-3.5" /> Falar com vendedor
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-green-800">
              <input
                ref={inputRef}
                value={draft}
                onChange={event => setDraft(event.target.value)}
                maxLength={1200}
                disabled={isLoading}
                placeholder="Digite sua dúvida sobre a obra..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Mensagem para a CYMAR"
              />
              <button type="submit" disabled={!draft.trim() || isLoading} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-900 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensagem">
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[9px] leading-tight text-slate-400">Orientação educacional. Situações de risco exigem avaliação profissional presencial.</p>
          </div>
        </section>
      )}

      <button
        onClick={() => setIsOpen(current => !current)}
        aria-label={isOpen ? 'Fechar chat da CYMAR' : 'Conversar com a CYMAR'}
        aria-expanded={isOpen}
        className={`group relative ml-auto flex h-16 items-center rounded-full border border-[#d6b15e]/70 bg-[#fffdf8] shadow-2xl shadow-green-950/30 transition hover:-translate-y-1 hover:shadow-green-950/40 focus:outline-none focus:ring-4 focus:ring-[#d6b15e]/30 ${isOpen ? 'w-16 justify-center overflow-hidden border-[3px]' : 'w-16 justify-center p-1 sm:w-[236px] sm:justify-start sm:gap-3 sm:pr-5'}`}
      >
        <span className={`${isOpen ? 'h-full w-full' : 'h-14 w-14'} relative shrink-0 overflow-hidden rounded-full border-2 border-[#d6b15e] bg-white`}>
          <img src="/cymar-assistant.png" alt="" className="h-full w-full object-cover object-[50%_16%] scale-[1.6]" />
          <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
            <MessageCircle className="h-2.5 w-2.5 text-white" />
          </span>
        </span>
        {!isOpen && (
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block font-display text-sm font-extrabold leading-tight text-green-950">Posso ajudar na sua obra?</span>
            <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#9b7428]"><Sparkles className="h-3 w-3" /> Converse com a CYMAR</span>
          </span>
        )}
      </button>
    </div>
  );
}
