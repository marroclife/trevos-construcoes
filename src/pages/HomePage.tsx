import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
  Star,
  Truck,
  HardHat,
  ClipboardList,
  Users,
  Camera,
} from 'lucide-react';

import { TESTIMONIALS, COSTA_VERDE_CITIES, BRANDS, DEPARTMENTS, DISTRICT_DELIVERY_INFO } from '../data/mockData';
import Logo from '../components/Logo';
import DiagnosticTool from '../components/DiagnosticTool';
import BudgetCalculator from '../components/BudgetCalculator';
import ServicesSection from '../components/ServicesSection';
import PromoCarousel from '../components/PromoCarousel';

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(state.scrollTo!);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleWhatsAppContact = (reason: string) => {
    const text = encodeURIComponent(`Olá Trevos Construções! Estou no site e gostaria de tirar uma dúvida sobre ${reason}.`);
    window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
  };

  const scrollToBudget = () => {
    const el = document.getElementById('solicitar-orcamento');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      {/* PROMO CAROUSEL HERO */}
      <PromoCarousel
        onScrollToBudget={scrollToBudget}
        onWhatsApp={(reason) => handleWhatsAppContact(reason)}
      />

      {/* TRUST BAR */}
      <section className="bg-white border-y border-slate-150 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Marcas e Fornecedores Referência
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-14 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all font-display text-sm font-semibold text-slate-600">
            {BRANDS.slice(0, 8).map((brand) => (
              <span key={brand} className="hover:text-green-800 transition-colors cursor-default select-none tracking-wider text-base">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="bg-green-brand text-white py-10" id="hero-urgency">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-green-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Entrega na Obra</h3>
                <p className="text-green-100/80 text-xs font-light mt-0.5">Mangaratiba e região com agendamento.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-green-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Lista de Materiais</h3>
                <p className="text-green-100/80 text-xs font-light mt-0.5">Consultoria para montar seu orçamento.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <HardHat className="w-5 h-5 text-green-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Serviços para Projetos</h3>
                <p className="text-green-100/80 text-xs font-light mt-0.5">Mão de obra e acompanhamento de obra.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Atendimento Rápido</h3>
                <p className="text-green-100/80 text-xs font-light mt-0.5">De segunda a sábado pelo WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <ServicesSection onScrollToBudget={scrollToBudget} />

      {/* DEPARTMENTS GRID */}
      <section className="py-16 bg-slate-50 border-y border-slate-200" id="departamentos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-green-gely text-green-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ClipboardList className="w-3.5 h-3.5" /> Catálogo
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight tracking-tight text-slate-900">
              Departamentos da Loja
            </h2>
            <p className="text-slate-500 text-sm font-sans font-light">
              Estrutura completa de materiais de construção, elétrica, hidráulica, ferragens, ferramentas e acabamentos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.key}
                onClick={() => {
                  const el = document.getElementById('assistente-materiais');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white border border-slate-100 hover:border-green-200 hover:bg-green-50/30 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="text-3xl mb-3">{dept.icon}</div>
                <h3 className="text-sm font-bold text-slate-900 font-display group-hover:text-green-brand transition-colors">
                  {dept.label}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Ver produtos</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DIAGNOSTIC TOOL */}
      <section className="py-16 bg-slate-100 border-y border-slate-200" id="assistente-materiais">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-green-gely text-green-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Assistente Virtual
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight tracking-tight text-slate-900">
              Monte Sua Lista de Materiais
            </h2>
            <p className="text-slate-500 text-sm font-sans font-light">
              Selecione produtos por departamento e envie sua lista direto para um vendedor da Trevos.
            </p>
          </div>

          <DiagnosticTool />
        </div>
      </section>

      {/* ESPAÇO DO PROFISSIONAL DA CONSTRUÇÃO */}
      <section className="py-10 bg-gradient-to-r from-slate-900 via-green-950 to-slate-950 text-white text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-extrabold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                👷 Espaço do Profissional da Construção
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold font-display">É Pedreiro, Eletricista ou Empreiteiro?</h3>
              <p className="text-xs md:text-sm text-orange-100 font-light">
                Cadastre-se na Trevos Construções para receber atendimento prioritário no WhatsApp, faturamento facilitado para CNPJ e indicação de clientes.
              </p>
            </div>

            <button
              onClick={() => {
                const text = encodeURIComponent('Olá Trevos Construções! Sou profissional da construção (pedreiro/empreiteiro) e gostaria de me cadastrar para atendimento prioritário e faturamento.');
                window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
              }}
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-4 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Users className="w-4 h-4 text-orange-400" /> Cadastrar como Profissional Parceiro
            </button>
          </div>
        </div>
      </section>

      {/* BUDGET CALCULATOR */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BudgetCalculator />
        </div>
      </section>

      {/* LOCAL AUTHORITY */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden" id="autoridade-local">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-green-400/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-brand/10 text-green-300 border border-green-brand/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> Referência em Mangaratiba e Região
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight text-white tracking-tight">
                A Única Loja de Materiais de Construção de Mangaratiba com Site Estruturado
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed font-sans font-light">
                Localizada estrategicamente no município de Mangaratiba, a <strong className="text-white">Trevos Construções</strong> conecta
                construtoras, pedreiros, arquitetos e donos de casa a uma variedade completa de materiais.
              </p>

              {/* Tabela Transparente de Frete por Distrito */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans">
                  Regras de Frete & Entrega por Distrito:
                </h4>
                <div className="space-y-2">
                  {DISTRICT_DELIVERY_INFO.map((info, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                      <div>
                        <strong className="text-white block font-display">{info.district}</strong>
                        <span className="text-[11px] text-slate-400">{info.rule}</span>
                      </div>
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-2 py-1 rounded">
                        {info.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-left space-y-6">
                <div>
                  <h3 className="text-lg md:text-xl font-bold font-display text-white">Cidades e Distritos Atendidos</h3>
                  <p className="text-slate-500 text-xs font-sans mt-0.5">Entregamos materiais e atendemos serviços nos seguintes pontos:</p>
                </div>

                <div className="space-y-4">
                  {COSTA_VERDE_CITIES.map((city) => (
                    <div key={city.name} className="border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-accent"></span>
                        <h4 className="text-sm font-bold text-white font-display">{city.name}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-4.5">
                        {city.districts.map((district) => (
                          <span
                            key={district}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded transition-all"
                          >
                            {district}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-green-600/10 border border-green-500/20 p-4.5 rounded-2xl flex items-center gap-3.5">
                  <Clock className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <p className="text-xs text-green-200 leading-relaxed font-sans font-light">
                    Atendimento de segunda a sábado com entregas programadas para Mangaratiba e cidades vizinhas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-slate-50" id="depoimentos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-green-brand uppercase tracking-widest block">Histórias Reais de Sucesso</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-slate-900">
              Quem já confia na <span className="text-green-brand">Trevos Construções</span>
            </h2>
            <p className="text-slate-500 text-sm font-sans font-light">
              Veja o feedback de construtoras, pedreiros e donos de casa da região.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex text-amber-500 gap-0.5" aria-hidden="true">
                      {Array.from({ length: testimonial.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current text-amber-500" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold py-0.5 px-2 rounded-full uppercase border border-emerald-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        Cliente Verificado
                      </span>
                    )}
                  </div>

                  <p className="text-slate-700 text-xs sm:text-sm font-sans italic leading-relaxed font-light">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-5 flex justify-between items-center text-xs text-slate-500">
                  <div>
                    <strong className="text-slate-900 font-bold block">{testimonial.name}</strong>
                    <span className="text-slate-400 text-[11px] block">{testimonial.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-700 font-semibold block">{testimonial.location}</span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{testimonial.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
