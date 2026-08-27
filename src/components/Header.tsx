import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, ShoppingCart as CartIcon, User, Settings, History, Camera, Truck, CreditCard, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-green-brand backdrop-blur-md border-b border-green-dark/20 shadow-md transition-all duration-250">
      {/* Top Banner Bar for Payment & Photo WhatsApp */}
      <div className="bg-slate-950 text-white text-[11px] py-1.5 px-4 border-b border-slate-800">
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
            className="inline-flex items-center gap-1.5 bg-orange-accent hover:opacity-90 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] transition-all cursor-pointer shadow-sm"
          >
            <Camera className="w-3 h-3" />
            Tire foto da sua lista no caderno e mande no Zap!
          </button>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" id="header-navigation">
        <Link to="/" className="hover:opacity-95 transition-opacity bg-white rounded-xl px-3 py-2 shadow-sm">
          <Logo variant="dark" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="hover:text-green-100 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <Link to="/loja" className="hover:text-green-100 transition-colors">
            Loja de Materiais
          </Link>
          <button onClick={() => scrollTo('licitacoes')} className="hover:text-green-100 transition-colors">Empresas & Governo</button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onOpenAuth}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title={authUser ? `Logado como ${authUser.email}` : 'Entrar'}
          >
            <User className="w-4 h-4 text-white/80" />
            <span>{authUser ? 'Conta' : 'Entrar'}</span>
          </button>


          <button
            onClick={onOpenHistory}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Central de Vendas e Pedidos"
          >
            <History className="w-4 h-4 text-white/80" />
            <span>Pedidos</span>
          </button>

          <button
            onClick={onOpenCart}
            className="bg-orange-accent hover:opacity-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5 relative cursor-pointer"
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
            className="bg-white text-green-brand hover:bg-green-50 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" /> Falar no WhatsApp
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-cyan-100 focus:outline-none"
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
