import React from 'react';
import { Building2, FileCheck2, Landmark, Truck } from 'lucide-react';

export default function InstitutionalServices({ onBudget }: { onBudget: () => void }) {
  const cards = [
    { icon: Landmark, title: 'Órgãos Públicos e Licitações', text: 'Fornecimento de materiais e propostas com condições adequadas a editais, tributos e prazos de faturamento.' },
    { icon: Building2, title: 'Reformas de Prédios Públicos', text: 'Pintura, manutenção predial, elétrica, hidráulica, fachadas, acabamentos e serviços sob escopo técnico.' },
    { icon: FileCheck2, title: 'Proposta Institucional', text: 'Orçamento separado do balcão, com validade, documentação, logística e cronograma de atendimento.' },
    { icon: Truck, title: 'Logística para Grandes Volumes', text: 'Planejamento de entrega, descarga, acesso ao local e fornecimento programado por etapa.' },
  ];
  return <section className="py-16 bg-slate-950 text-white" id="licitacoes"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="max-w-3xl mb-10"><span className="text-xs font-bold uppercase tracking-widest text-orange-400">Trevos Empresas & Governo</span><h2 className="text-3xl md:text-4xl font-extrabold font-display mt-2">Fornecimento e serviços para contratos de maior escala</h2><p className="text-slate-300 text-sm mt-4">Atendimento próprio para CNPJ, construtoras, condomínios e órgãos públicos. Os valores institucionais consideram tributos, logística, volume e prazo de pagamento.</p></div><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">{cards.map(({icon: Icon, title, text}) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><Icon className="w-6 h-6 text-orange-400 mb-4"/><h3 className="font-bold font-display text-lg">{title}</h3><p className="text-xs text-slate-400 mt-3 leading-relaxed">{text}</p></article>)}</div><div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-900/40 border border-green-700/30 rounded-2xl p-5"><p className="text-xs text-green-100">Preços de balcão não são aplicados automaticamente a licitações ou faturamento com prazo estendido.</p><button onClick={onBudget} className="bg-orange-accent text-white text-xs font-bold rounded-xl px-5 py-3 whitespace-nowrap">Solicitar proposta institucional</button></div></div></section>;
}
