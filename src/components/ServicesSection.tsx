import React from 'react';
import { Truck, ClipboardList, HardHat, Store, Clock, ShieldCheck, CheckCircle2, ChevronRight, Wrench } from 'lucide-react';
import { SERVICE_EQUIPMENTS } from '../data/mockData';

interface ServicesSectionProps {
  onScrollToBudget: () => void;
}

export default function ServicesSection({ onScrollToBudget }: ServicesSectionProps) {
  const services = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Entrega de Materiais',
      description: 'Entrega local em Mangaratiba e região, com agendamento na obra ou residência. Opções de descarga e volumes sob consulta.',
      tags: ['Entrega Local', 'Na Obra', 'Agendada'],
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: 'Consultoria para Obras',
      description: 'Auxílio na montagem da lista de materiais por etapa da obra. Orçamento detalhado e indicação de produtos adequados.',
      tags: ['Lista de Materiais', 'Orçamento', 'Planejamento'],
    },
    {
      icon: <HardHat className="w-6 h-6" />,
      title: 'Serviços para Projetos',
      description: 'Atendimento para construtoras, pedreiros e arquitetos. Levantamento de necessidades, mão de obra especializada e acompanhamento.',
      tags: ['Projetos', 'Reformas', 'Mão de Obra'],
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: 'Loja de Materiais',
      description: 'Catálogo estruturado de hidráulica, elétrica, ferragens, ferramentas, pintura, materiais básicos, louças, pisos e muito mais.',
      tags: ['Hidráulica', 'Elétrica', 'Ferragens'],
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Atendimento Imediato',
      description: 'Atendimento de segunda a sábado para tirar dúvidas, confirmar estoque, agendar entregas e acelerar sua obra.',
      tags: ['Segunda a Sábado', 'WhatsApp', 'Rápido'],
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Outros Serviços',
      description: 'Cortes de madeira e metal, reserva de material, troca e devolução, assistência pós-venda e serviços sob consulta.',
      tags: ['Cortes', 'Reservas', 'Pós-venda'],
    },
  ];

  return (
    <section className="py-16 bg-white" id="servicos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-green-brand uppercase tracking-widest block">O que fazemos</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
            Serviços da Trevos Construções
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-sans font-light">
            Mais do que uma loja de materiais: entregamos conveniência, consultoria e agilidade para
            construtoras, profissionais e donos de casa da região.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 text-left">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-slate-50 border border-slate-100 rounded-3xl p-7 hover:border-green-brand/20 hover:shadow-xl hover:shadow-slate-100/50 transition-all group"
            >
              <div className="w-12 h-12 bg-green-gely text-green-brand rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-brand group-hover:text-white transition-all">
                {service.icon}
              </div>

              <h3 className="text-lg md:text-xl font-bold font-display text-slate-950 mb-2">
                {service.title}
              </h3>
              <p className="text-slate-600 text-sm font-sans leading-relaxed font-light mb-4">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {service.tags.map((tag) => (
                  <span key={tag} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={onScrollToBudget}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-green-brand hover:text-green-800 transition-colors cursor-pointer"
              >
                Solicitar orçamento <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-green-brand text-white rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-100 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Garantia de Atendimento
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-display">
              Precisa de um material específico para sua obra?
            </h3>
            <p className="text-green-100 text-sm font-light max-w-xl">
              Além dos serviços, mantemos um catálogo estruturado de materiais de construção.
              Consulte compatibilidade, disponibilidade e preço com nossos vendedores.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/loja"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-brand hover:bg-green-50 font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              Ir para a Loja de Materiais
            </a>
            <button
              onClick={onScrollToBudget}
              className="inline-flex items-center justify-center gap-2 bg-orange-accent hover:opacity-95 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              <Wrench className="w-3.5 h-3.5" /> Falar com Vendedor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
