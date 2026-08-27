import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, ShoppingCart as CartIcon, User, History, Camera, CreditCard, ShieldCheck, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { AuthUser } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { WHATSAPP_CHANNELS } from '../data/mockData';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenHistory: () => void;
  onOpenAuth: () => void;
  onEnterAdmin: () => void;
}

export default function Header({ cartCount, onOpenCart, onOpenHistory, onOpenAuth, onEnterAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        setAuthUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isHome = location.pathname === '/';

  const handleWhatsAppChannel = (channelPhone: string, reason: string) => {
    const text = encodeURIComponent(`Olá Trevos Construções! Estou no site e gostaria de falar com o setor: ${reason}.`);
    window.open(`https://wa.me/${channelPhone}?text=${text}`, '_blank');
    setChannelModalOpen(false);
  };

  const handlePhotoUploadWhatsApp = () => {
    const text = encodeURIComponent('Olá Trevos Construções! Tenho uma foto da lista de materiais no meu caderno/papel. Gostaria de enviar para vocês realizarem o orçamento.');
    window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
  };

  const scrollTo = (id: string) => {
    if (!isHome) {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Serviços', action: () => scrollTo('servicos'), href: '#servicos' },
    { label: 'Departamentos', action: () => scrollTo('departamentos'), href: '#departamentos' },
    { label: 'Orçamento', action: () => scrollTo('solicitar-orcamento'), href: '#solicitar-orcamento' },
    { label: 'Localização', action: () => scrollTo('autoridade-local'), href: '#autoridade-local' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d3717]/95 shadow-[0_8px_30px_rgba(3,22,8,0.18)] backdrop-blur-xl transition-all duration-250">
      {/* Top Banner Bar for Payment & Photo WhatsApp */}
      <div className="border-b border-white/5 bg-[#06101d] px-4 py-1.5 text-[11px] text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-emerald-400" />
              Consulte condições de parcelamento
            </span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Faturamento CNPJ para Construtoras
            </span>
          </div>

          <button
            onClick={handlePhotoUploadWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-accent px-3 py-0.5 text-[10px] font-bold text-white shadow-sm transition-all hover:brightness-110"
          >
            <Camera className="w-3 h-3" />
            <span className="sm:hidden">Envie sua lista por foto</span>
            <span className="hidden sm:inline">Tire uma foto da lista e receba seu orçamento</span>
          </button>
        </div>
      </div>

      <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-8" id="header-navigation">
        <Link to="/" className="shrink-0 px-1 py-1 transition-transform hover:scale-[1.02]">
          <Logo variant="light" className="[&_img]:h-12 sm:[&_img]:h-14" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-5 text-[13px] font-semibold text-white/85 xl:flex 2xl:gap-7">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="whitespace-nowrap transition-colors hover:text-[#e7c979]"
            >
              {link.label}
            </button>
          ))}
          <Link to="/loja" className="whitespace-nowrap transition-colors hover:text-[#e7c979]">
            Loja
          </Link>
          <button onClick={() => scrollTo('licitacoes')} className="whitespace-nowrap transition-colors hover:text-[#e7c979]">Empresas & Governo</button>
        </div>

        {/* Desktop Actions */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          <button
            onClick={onOpenAuth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/12"
            title={authUser ? `Logado como ${authUser.email}` : 'Entrar'}
            aria-label={authUser ? 'Minha conta' : 'Entrar'}
          >
            <User className="h-4 w-4" />
          </button>


          <button
            onClick={onOpenHistory}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/12"
            title="Central de Vendas e Pedidos"
            aria-label="Meus pedidos"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenCart}
            className="relative flex h-10 items-center gap-2 rounded-xl bg-orange-accent px-3.5 text-xs font-bold text-white shadow-md transition hover:brightness-110"
            title="Abrir Meu Carrinho"
          >
            <CartIcon className="w-4 h-4" />
            <span>Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] text-white font-black w-5.5 h-5.5 rounded-full flex items-center justify-center animate-bounce border-2 border-white leading-none">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setChannelModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-green-brand shadow-md transition hover:bg-[#fff8e7]"
          >
            <Phone className="h-3.5 w-3.5" /> Atendimento <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ml-auto rounded-xl border border-white/10 p-2.5 text-white hover:bg-white/10 focus:outline-none md:hidden"
          aria-label="Menu principal"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* WhatsApp Channel Selector Modal */}
      {channelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left border border-slate-100 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-green-brand uppercase tracking-wider block">Atendimento Trevos</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">Escolha o Setor no WhatsApp</h3>
              </div>
              <button
                onClick={() => setChannelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {WHATSAPP_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleWhatsAppChannel(ch.phone, ch.label)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-green-300 hover:bg-green-50/40 transition-all group flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-green-brand group-hover:text-white transition-all mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-display group-hover:text-green-brand transition-colors">
                      {ch.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5 font-light">{ch.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
              <span>Atendimento de Seg a Sáb</span>
              <span>Mangaratiba - RJ</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu expanded */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-green-dark/20 bg-green-brand px-4 py-5 space-y-3.5 shadow-lg relative z-30 animate-fade-in text-left">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="block w-full text-left text-sm font-bold text-white hover:text-green-100 px-3 py-1.5 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          <button onClick={() => scrollTo('licitacoes')} className="block w-full text-left text-sm font-bold text-white hover:text-green-100 px-3 py-1.5">Empresas & Governo</button>

          <div className="grid grid-cols-2 gap-2 px-3 pt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenHistory(); }}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4 text-white/80" /> Meus Pedidos
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCart(); }}
              className="bg-orange-accent text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 relative cursor-pointer"
            >
              <CartIcon className="w-4 h-4" />
              Ver Carrinho
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] text-white font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="border-t border-green-dark/20 pt-4 flex flex-col gap-3 px-3 text-xs text-white/80">
            <span className="flex items-center gap-1.5">
              contato@trevosconstrucoes.com
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Phone className="w-4 h-4 text-green-200" /> (21) 99038-7232 (WhatsApp)
            </span>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setChannelModalOpen(true);
            }}
            className="w-full bg-white text-green-brand hover:bg-green-50 font-bold text-center py-3 rounded-xl block text-xs tracking-wider uppercase cursor-pointer"
          >
            Falar no WhatsApp por Setor
          </button>
        </div>
      )}
    </header>
  );
}
