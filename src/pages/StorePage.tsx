import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  CornerDownRight,
  Check,
  Phone,
} from 'lucide-react';

import PartsCatalog from '../components/PartsCatalog';
import { PartItem } from '../types';
import { fetchProducts } from '../lib/api';
import { PARTS_LIST, BRANDS } from '../data/mockData';

interface StorePageProps {
  parts: PartItem[];
  setParts: React.Dispatch<React.SetStateAction<PartItem[]>>;
  cartItems: { part: PartItem; quantity: number }[];
  onAddToCart: (part: PartItem) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCart: () => void;
}

export default function StorePage({
  parts,
  setParts,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCart,
}: StorePageProps) {
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Start with local data immediately to avoid blank loading state
      const saved = localStorage.getItem('trevos-construcoes-parts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!cancelled) setParts(parsed);
        } catch {
          if (!cancelled) setParts(PARTS_LIST);
        }
      } else {
        if (!cancelled) setParts(PARTS_LIST);
        localStorage.setItem('trevos-construcoes-parts', JSON.stringify(PARTS_LIST));
      }

      // Try to refresh from remote in background
      try {
        const remote = await fetchProducts();
        if (!cancelled && remote.length > 0) {
          setParts(remote);
          setPartsError(null);
        }
      } catch (err) {
        console.warn('Remote product refresh failed:', err);
        if (!cancelled) {
          setPartsError('Catálogo remoto indisponível. Exibindo catálogo local.');
        }
      } finally {
        if (!cancelled) setPartsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [setParts]);

  useEffect(() => {
    try {
      localStorage.setItem('trevos-construcoes-parts', JSON.stringify(parts));
    } catch {}
  }, [parts]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Simple back/context bar */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-green-brand transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar ao Site
          </Link>
          <a
            href="tel:+5521990387232"
            className="flex items-center gap-1.5 text-xs font-bold text-green-brand hover:text-green-dark transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> (21) 99038-7232
          </a>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Intro */}
        <div className="text-center md:text-left space-y-3">
          <span className="text-xs font-bold text-green-brand uppercase tracking-widest block">Loja de Materiais de Construção</span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Catálogo de Materiais para Sua Obra
          </h1>
          <p className="text-slate-600 text-sm md:text-base font-sans font-light max-w-3xl">
            Encontre hidráulica, elétrica, ferragens, ferramentas, pintura, materiais básicos, louças, pisos e muito mais.
            Tire dúvidas de estoque e compatibilidade pelo WhatsApp antes de comprar.
          </p>
        </div>

        {partsError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-3 rounded-xl">
            {partsError}
          </div>
        )}

        {partsLoading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-green-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-500">Carregando catálogo de materiais...</p>
          </div>
        ) : (
          <PartsCatalog
            parts={parts}
            cartItems={cartItems}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        )}

        {/* Trust row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-8">
          <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-800">Produtos de Qualidade</h5>
              <p className="text-[11px] text-slate-500 font-light">Marcas reconhecidas do mercado de construção.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-slate-100">
            <CornerDownRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-800">Maresia Protection</h5>
              <p className="text-[11px] text-slate-500 font-light">Peças testadas e vedadas contra oxidação salina da Costa.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-slate-100">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-800">Retirada ou Envio Veloz</h5>
              <p className="text-[11px] text-slate-500 font-light">Entregas programadas ou pronta retirada na loja no mesmo dia.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
