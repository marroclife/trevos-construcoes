import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Truck, Building2, HardHat, Sparkles } from 'lucide-react';

interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaAction: () => void;
  icon: React.ReactNode;
  bgGradient: string;
  accentColor: string;
  highlight: string;
  imageUrl?: string;
}

interface PromoCarouselProps {
  onScrollToBudget: () => void;
  onWhatsApp: (text: string) => void;
}

export default function PromoCarousel({ onScrollToBudget, onWhatsApp }: PromoCarouselProps) {
  const slides: PromoSlide[] = [
    {
      id: 'promo-1',
      title: 'Tudo para sua obra em Mangaratiba',
      subtitle: 'Materiais, orientação e entrega programada para construir ou reformar com mais segurança. Consulte condições e disponibilidade.',
      cta: 'Agendar Entrega',
      ctaAction: () => onWhatsApp('materiais e entrega'),
      icon: <Truck className="w-16 h-16 md:w-24 md:h-24" />,
      bgGradient: 'from-green-800 via-green-900 to-green-950',
      accentColor: 'bg-orange-accent',
      highlight: 'LOJA E ENTREGA',
      imageUrl: '/hero-loja.webp',
    },
    {
      id: 'promo-2',
      title: 'Trevos Empresas & Governo',
      subtitle: 'Cotações para CNPJ, construtoras, condomínios e órgãos públicos com condições próprias de tributos, logística e faturamento.',
      cta: 'Solicitar Proposta',
      ctaAction: onScrollToBudget,
      icon: <Building2 className="w-16 h-16 md:w-24 md:h-24" />,
      bgGradient: 'from-emerald-800 via-green-900 to-green-950',
      accentColor: 'bg-yellow-500',
      highlight: 'CNPJ E LICITAÇÕES',
      imageUrl: '/hero-governo.webp',
    },
    {
      id: 'promo-3',
      title: 'Consultoria Técnica sem Custo',
      subtitle: 'Nosso time ajuda você a montar a lista exata de materiais por etapa da obra. Economize e evite desperdício.',
      cta: 'Solicitar Consultoria',
      ctaAction: onScrollToBudget,
      icon: <HardHat className="w-16 h-16 md:w-24 md:h-24" />,
      bgGradient: 'from-green-700 via-green-800 to-green-950',
      accentColor: 'bg-orange-accent',
      highlight: 'CONSULTORIA',
      imageUrl: '/hero-consultoria.webp',
    },
    {
      id: 'promo-4',
      title: 'Conheça a CYMAR',
      subtitle: 'Envie uma foto da parede, entenda a preparação necessária, veja materiais sugeridos e planeje uma nova cor para o ambiente.',
      cta: 'Usar a CYMAR',
      ctaAction: () => document.getElementById('cymar')?.scrollIntoView({ behavior: 'smooth' }),
      icon: <Sparkles className="w-16 h-16 md:w-24 md:h-24" />,
      bgGradient: 'from-green-900 via-emerald-900 to-green-950',
      accentColor: 'bg-green-400',
      highlight: 'IA DE OBRAS',
      imageUrl: '/hero-cymar.webp',
    },
  ];

  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goTo = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section
      className="relative bg-green-950 overflow-hidden"
      id="hero-promocoes"
    >
      <div className="relative w-full h-[420px] md:h-[520px] lg:h-[560px]">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const isPrev = index === (current - 1 + slides.length) % slides.length;
          const isNext = index === (current + 1) % slides.length;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 translate-x-0 z-10'
                  : isPrev
                  ? 'opacity-0 -translate-x-full z-0'
                  : isNext
                  ? 'opacity-0 translate-x-full z-0'
                  : 'opacity-0 translate-x-full z-0'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
              />
              {slide.imageUrl && <div className="absolute inset-0 bg-cover opacity-80" style={{ backgroundImage: `url(${slide.imageUrl})`, backgroundPosition: slide.id === 'promo-4' ? 'right top' : 'right center' }} />}
              <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-950/80 to-green-950/10" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#052e16_1px,transparent_1px),linear-gradient(to_bottom,#052e16_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-transparent to-transparent" />

              <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full py-10">
                  <div className="lg:col-span-7 space-y-5 text-left">
                    <div className={`inline-flex items-center gap-2 ${slide.accentColor} text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg`}>
                      {slide.highlight}
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.1]">
                      {slide.title}
                    </h2>

                    <p className="text-sm sm:text-base md:text-lg text-green-100/90 font-normal leading-relaxed max-w-xl lg:max-w-2xl font-sans font-light">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                      <button
                        onClick={slide.ctaAction}
                        className="bg-white text-green-900 hover:bg-green-50 font-bold py-3.5 px-6 md:py-4 md:px-8 rounded-xl transition-all shadow-xl text-center flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                      >
                        {slide.cta}
                      </button>

                      <button
                        onClick={onScrollToBudget}
                        className="bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-6 md:py-4 md:px-6 rounded-xl border border-white/20 hover:border-white/30 transition-all text-center text-sm md:text-base whitespace-nowrap"
                      >
                        Solicitar Orçamento
                      </button>
                    </div>
                  </div>

                  {!slide.imageUrl && <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
                    <div className="relative">
                      <div className={`absolute inset-0 ${slide.accentColor} opacity-20 blur-3xl rounded-full scale-125`} />
                      <div className="relative text-white/90 drop-shadow-2xl">
                        {slide.icon}
                      </div>
                    </div>
                  </div>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        <button
          onClick={() => { prev(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 8000); }}
          className="hidden sm:block absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => { next(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 8000); }}
          className="hidden sm:block absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === current
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
