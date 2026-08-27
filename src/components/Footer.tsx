import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, MessageSquare, Instagram } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  onEnterAdmin: () => void;
}

export default function Footer({ onEnterAdmin }: FooterProps) {
  const handleWhatsAppContact = (reason: string) => {
    const text = encodeURIComponent(`Olá Trevos Construções! Estou no site e gostaria de tirar uma dúvida sobre ${reason}.`);
    window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 pt-16 pb-24 relative overflow-hidden" id="footer-contato">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start text-left">
          <div className="lg:col-span-5 space-y-5">
            <Logo variant="light" />
            <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed font-light max-w-sm">
              Loja de materiais de construção em Mangaratiba. Variedade de produtos, entrega na obra,
              consultoria técnica e serviços para projetos residenciais e comerciais.
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs text-slate-400 font-sans">
                Siga-nos ou tire dúvidas online:
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleWhatsAppContact('balcão')}
                  className="bg-slate-900 hover:bg-orange-accent text-white border border-slate-800 hover:border-transparent p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Contato WhatsApp
                </button>
                <a
                  href="https://www.instagram.com/trevosconstrucoes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-green-brand text-white border border-slate-800 hover:border-transparent p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
                <a
                  href="mailto:contato@trevosconstrucoes.com"
                  className="bg-slate-900 hover:bg-green-brand text-white border border-slate-800 hover:border-transparent p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> E-mail
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans">Acesso Rápido</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/" onClick={scrollToTop} className="hover:text-white transition-colors">Início</Link></li>
              <li><a href="/#servicos" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="/#departamentos" className="hover:text-white transition-colors">Departamentos</a></li>
              <li><a href="/#assistente-materiais" className="hover:text-white transition-colors">Assistente de Materiais</a></li>
              <li><a href="/#cymar" className="hover:text-white transition-colors">CYMAR — IA de Obras</a></li>
              <li><a href="/#licitacoes" className="hover:text-white transition-colors">Empresas & Governo</a></li>
              <li><a href="/#solicitar-orcamento" className="hover:text-white transition-colors">Solicitar Orçamento</a></li>
              <li><Link to="/loja" className="hover:text-white transition-colors">Loja de Materiais</Link></li>
              <li><a href="/#autoridade-local" className="hover:text-white transition-colors">Sobre Nós e Cobertura</a></li>
              <li><a href="/#avaliacoes-google" className="hover:text-white transition-colors">Avaliações do Google</a></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans">Contatos Oficiais</h4>
            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex gap-3 items-start">
                <Mail className="w-4.5 h-4.5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 font-sans uppercase tracking-wider block text-[10px]">E-mail</span>
                  <strong className="text-white font-bold font-mono">contato@trevosconstrucoes.com</strong>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <Phone className="w-4.5 h-4.5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 font-sans uppercase tracking-wider block text-[10px]">Celular & WhatsApp Oficial</span>
                  <strong className="text-white font-bold font-mono text-base">(21) 99038-7232</strong>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <MapPin className="w-4.5 h-4.5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 font-sans uppercase tracking-wider block text-[10px]">Área de Atendimento Principal</span>
                  <strong className="font-semibold block font-sans">Mangaratiba e Região Costa Verde / RJ</strong>
                  <span className="text-slate-500 text-[10px] leading-relaxed block font-light">Atendimento em Mangaratiba, Angra dos Reis, Itaguaí, Paraty e distritos vizinhos.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>© 2026 Trevos Construções. Todos os direitos reservados.</p>
            <p className="text-[10px] text-slate-600 mt-1">Materiais de construção, ferragens, hidráulica, elétrica e acabamentos.</p>
            <p className="text-[10px] text-slate-600 mt-1">
              Desenvolvido por{" "}
              <a
                href="https://marroc.xyz/solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-green-brand transition-colors"
              >
                Marroc Solutions
              </a>
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hover:text-white transition-all cursor-default text-[10px] uppercase font-sans tracking-widest bg-slate-900 px-3 py-1 rounded">
              CNPJ SOB CONSULTA
            </span>
            <button onClick={scrollToTop} className="hover:text-white transition-colors cursor-pointer text-xs">
              Voltar ao Topo ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
