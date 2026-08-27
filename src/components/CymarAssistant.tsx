import React, { useRef, useState } from 'react';
import { Camera, Loader2, MessageSquare, Paintbrush, ShieldAlert, Sparkles, Upload, X } from 'lucide-react';

type Analysis = { summary: string; visibleSigns: string[]; preparationSteps: string[]; materials: { name: string; purpose: string; estimatedQuantity?: string }[]; cautions: string[]; questions: string[]; disclaimer: string };

export default function CymarAssistant() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [color, setColor] = useState('verde sálvia suave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [simulationImage, setSimulationImage] = useState('');

  const chooseImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Selecione uma imagem válida.');
    if (file.size > 8 * 1024 * 1024) return setError('Use uma foto de até 8 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result);
      const photo = new Image();
      photo.onload = () => {
        const max = 1600;
        const scale = Math.min(1, max / Math.max(photo.width, photo.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(photo.width * scale); canvas.height = Math.round(photo.height * scale);
        canvas.getContext('2d')?.drawImage(photo, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL('image/jpeg', 0.82)); setError(''); setAnalysis(null); setSimulationImage('');
      };
      photo.src = source;
    };
    reader.readAsDataURL(file);
  };

  const run = async (mode: 'diagnosis' | 'color') => {
    if (!image) return setError('Envie uma foto da parede ou do ambiente primeiro.');
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/cymar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image, question, color, mode }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha na análise');
      setAnalysis(data.analysis); setSimulationImage(data.simulationImage || '');
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível analisar a imagem.'); }
    finally { setLoading(false); }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 text-white overflow-hidden" id="cymar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 relative rounded-3xl bg-white/5 border border-white/10 min-h-[460px] overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,.2),transparent_55%)]" />
            <img src="/cymar-assistant.png" alt="CYMAR, assistente virtual de obras da Trevos" className="relative w-full h-[390px] object-contain object-bottom" />
            <div className="relative p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent -mt-24 pt-24">
              <span className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest"><Sparkles className="w-4 h-4" /> Conheça a CYMAR</span>
              <h2 className="text-3xl font-extrabold font-display mt-2">Sua assistente inteligente de obras</h2>
              <p className="text-sm text-slate-300 mt-3">Envie uma foto para receber orientação inicial de preparação, materiais e pintura.</p>
            </div>
          </div>

          <div className="lg:col-span-8 rounded-3xl bg-white text-slate-900 p-6 md:p-8">
            {!analysis ? <div className="grid md:grid-cols-2 gap-6 h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between"><h3 className="font-bold font-display text-xl">1. Envie a foto</h3>{image && <button onClick={() => setImage('')} aria-label="Remover foto"><X className="w-5 h-5 text-slate-400" /></button>}</div>
                <button type="button" onClick={() => inputRef.current?.click()} className="w-full min-h-64 rounded-2xl border-2 border-dashed border-green-200 bg-green-50/50 hover:bg-green-50 flex flex-col items-center justify-center gap-3 overflow-hidden">
                  {image ? <img src={image} alt="Ambiente enviado para análise" className="w-full h-64 object-cover" /> : <><div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><Camera className="w-6 h-6" /></div><strong className="text-sm">Tirar ou escolher uma foto</strong><span className="text-xs text-slate-500">JPG, PNG ou WebP — até 8 MB</span></>}
                </button>
                <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => chooseImage(e.target.files?.[0])} />
              </div>
              <div className="space-y-5">
                <h3 className="font-bold font-display text-xl">2. O que você quer fazer?</h3>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4} placeholder="Ex.: quero pintar esta parede, mas ela tem manchas e partes soltando." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-green-200 outline-none resize-none" />
                <div><label className="text-xs font-bold text-slate-600 block mb-2">Cor desejada para simulação</label><input value={color} onChange={e => setColor(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-200" /></div>
                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}
                <div className="grid sm:grid-cols-2 gap-3">
                  <button onClick={() => run('diagnosis')} disabled={loading} className="bg-green-brand text-white rounded-xl px-4 py-3 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Analisar preparação</button>
                  <button onClick={() => run('color')} disabled={loading} className="bg-orange-accent text-white rounded-xl px-4 py-3 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"><Paintbrush className="w-4 h-4" /> Planejar nova cor</button>
                </div>
                <p className="flex gap-2 text-[11px] text-slate-500 leading-relaxed"><ShieldAlert className="w-4 h-4 shrink-0" /> Orientação educacional preliminar. A foto não substitui vistoria técnica ou diagnóstico estrutural.</p>
              </div>
            </div> : <div className="space-y-6">
              <div className="flex justify-between gap-4"><div><span className="text-xs font-bold text-green-brand uppercase tracking-widest">Análise da CYMAR</span><h3 className="text-2xl font-extrabold font-display mt-1">Plano inicial para sua parede</h3></div><button onClick={() => setAnalysis(null)} className="text-xs font-bold text-slate-500">Nova análise</button></div>
              <p className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-slate-700">{analysis.summary}</p>
              {simulationImage && <div><h4 className="font-bold mb-3">Simulação da cor: {color}</h4><div className="grid sm:grid-cols-2 gap-3"><figure><img src={image} alt="Ambiente original" className="w-full aspect-video object-cover rounded-xl"/><figcaption className="text-[10px] text-slate-500 mt-1">Antes</figcaption></figure><figure><img src={simulationImage} alt={`Simulação da parede em ${color}`} className="w-full aspect-video object-cover rounded-xl"/><figcaption className="text-[10px] text-slate-500 mt-1">Simulação aproximada</figcaption></figure></div></div>}
              <div className="grid md:grid-cols-2 gap-5"><div><h4 className="font-bold mb-3">Preparação recomendada</h4><ol className="space-y-2">{analysis.preparationSteps?.map((step, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="font-bold text-green-brand">{i + 1}.</span>{step}</li>)}</ol></div><div><h4 className="font-bold mb-3">Materiais sugeridos</h4><div className="space-y-2">{analysis.materials?.map((item, i) => <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3"><strong className="text-sm block">{item.name}</strong><span className="text-xs text-slate-500">{item.purpose}{item.estimatedQuantity ? ` • ${item.estimatedQuantity}` : ''}</span></div>)}</div></div></div>
              {analysis.cautions?.length > 0 && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><strong className="text-sm text-amber-900">Pontos de atenção</strong><ul className="mt-2 text-xs text-amber-800 space-y-1">{analysis.cautions.map((x,i) => <li key={i}>• {x}</li>)}</ul></div>}
              <a href={`https://wa.me/5521990387232?text=${encodeURIComponent('Olá Trevos! Fiz uma análise com a CYMAR e quero confirmar os materiais sugeridos para minha obra.')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-orange-accent text-white rounded-xl px-5 py-3 font-bold text-xs"><MessageSquare className="w-4 h-4" /> Confirmar materiais com a Trevos</a>
              <p className="text-[10px] text-slate-400">{analysis.disclaimer}</p>
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
