import React, { useState } from 'react';
import { PARTS_LIST, BRANDS, DEPARTMENTS } from '../data/mockData';
import { PartItem } from '../types';
import { 
  Tag, 
  Check, 
  ArrowRight, 
  Layers, 
  ShoppingBag, 
  ShieldCheck, 
  CornerDownRight, 
  Package,
  Plus,
  Minus,
  ShoppingCart as CartIcon
} from 'lucide-react';

interface CartItem {
  part: PartItem;
  quantity: number;
}

interface PartsCatalogProps {
  parts: PartItem[];
  cartItems?: CartItem[];
  onAddToCart?: (part: PartItem) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
}

export default function PartsCatalog({
  parts = [],
  cartItems = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem
}: PartsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Parts dynamically
  const filteredParts = parts.filter(part => {
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' ||
                         part.compatibleBrands.length === 0 ||
                         part.compatibleBrands.includes(selectedBrand) ||
                         part.compatibleBrands.includes('Todas as Marcas') ||
                         part.compatibleBrands.includes('Universal') ||
                         part.compatibleBrands.includes('Geral');
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          part.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          part.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'Disponível em Estoque':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Últimas Unidades':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handleOrderPartDirect = (part: PartItem) => {
    const message = `Olá Trevos Construções! Gostaria de falar com o balcão. Vi o produto:\n\n` +
      `• Produto: ${part.name}\n` +
      `• Código: ${part.code}\n` +
      `• Valor: R$ ${part.price.toFixed(2)}\n\n` +
      `Está disponível para pronta retirada hoje?`;
    window.open(`https://wa.me/5521990387232?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 text-left" id="catalogo-materiais">
      {/* Catalog Intro Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
            1. Escolha o Departamento
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedBrand('All'); }}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="all">Todos os Departamentos</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.key} value={dept.key}>
                {dept.icon} {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand filtering */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
            2. Filtrar por Marca
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="All">Todas as Marcas</option>
            {BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Search inside filter */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Pesquisar no catálogo de materiais (ex: tubo, cimento, tinta, torneira...)`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all font-sans text-sm"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-50 text-green-700 text-[10px] font-bold py-1 px-2.5 rounded-lg uppercase tracking-wider font-sans">
          {filteredParts.length} {filteredParts.length === 1 ? 'Produto' : 'Produtos'}
        </span>
      </div>

      {/* Parts items grid */}
      {filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => {
            const inCartItem = cartItems.find(item => item.part.id === part.id);
            const isInCart = !!inCartItem;

            return (
              <div
                key={part.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-green-500/30 hover:shadow-xl hover:shadow-slate-100/80 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle top subcategory highlight bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-600 via-green-500 to-beige-brand opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div>
                  {/* Product Image Placeholder */}
                  {part.imageUrl ? (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[4/3] flex items-center justify-center">
                      <img
                        src={part.imageUrl}
                        alt={part.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 bg-gradient-to-br from-green-50 to-slate-100 aspect-[4/3] flex items-center justify-center text-green-200">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  {/* Visual Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <span className="bg-slate-100/80 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md tracking-wide font-sans uppercase">
                      {part.subcategory}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {part.antiMaresia && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1" title="Resistente à maresia e oxidação da zona litorânea">
                          <ShieldCheck className="w-3 h-3 text-blue-600" /> Anti-Maresia
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border ${getAvailabilityBadge(part.availability)}`}>
                        {part.availability}
                      </span>
                    </div>
                  </div>

                  {/* Part Name & Code */}
                  <h4 className="text-base font-bold text-slate-950 font-sans group-hover:text-green-brand transition-colors mb-1.5 line-clamp-2">
                    {part.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-2">
                    <span className="text-slate-400 font-sans text-[11px]">Código:</span>
                    <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                      {part.code}
                    </span>
                    {part.unitLabel && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-sans">
                        {part.unitLabel}
                      </span>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-500 font-bold mb-3">
                    <span className="flex items-center">⭐ {part.rating?.toFixed(1) || '4.8'}</span>
                    <span className="text-slate-400 font-normal">({part.reviewsCount || 10} avaliações)</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-sans leading-relaxed mb-4 font-light">
                    {part.description}
                  </p>
                </div>

                <div>
                  {/* Pricing Badge Info for E-commerce & Wholesale */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl mb-4 text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Valor Unitário (Varejo)
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold font-mono text-green-brand">
                        R$ {part.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        à vista no Pix
                      </span>
                    </div>

                    {part.wholesalePrice && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-bold">Preço de Atacado:</span>
                        <span className="font-extrabold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          R$ {part.wholesalePrice.toFixed(2)} <span className="text-[9px] font-normal text-slate-500">(acima de {part.wholesaleMinQty || 10}un)</span>
                        </span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 mt-1">
                      ou em até 10x de R$ {(part.price / 10).toFixed(2)} sem juros
                    </div>
                  </div>

                  {/* Brand compatibility badges */}
                  <div className="border-t border-slate-100 pt-3.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-sans">
                      Marcas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {part.compatibleBrands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="bg-green-50/70 text-green-900 text-[10px] font-medium px-2 py-0.5 rounded border border-green-100/30"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Add to Cart / Quantity Selector */}
                  <div className="space-y-1.5 pt-1">
                    {isInCart ? (
                      <div className="flex items-center justify-between border-2 border-orange-accent/20 bg-orange-50/30 rounded-xl p-1 transition-all">
                        <button
                          type="button"
                          onClick={() => {
                            if (inCartItem.quantity === 1) {
                              onRemoveItem?.(part.id);
                            } else {
                              onUpdateQuantity?.(part.id, inCartItem.quantity - 1);
                            }
                          }}
                          className="w-10 h-10 rounded-lg bg-orange-accent/10 hover:bg-orange-accent/20 text-orange-accent flex items-center justify-center transition-all cursor-pointer font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400 font-bold block leading-none">CARRINHO</span>
                          <span className="text-sm font-black font-mono text-slate-900">{inCartItem.quantity} un</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onUpdateQuantity?.(part.id, inCartItem.quantity + 1)}
                          className="w-10 h-10 rounded-lg bg-orange-accent/10 hover:bg-orange-accent/20 text-orange-accent flex items-center justify-center transition-all cursor-pointer font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-12 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAddToCart?.(part)}
                          className="col-span-9 bg-orange-accent hover:opacity-95 text-white font-bold text-xs py-3 rounded-xl transition-all tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <CartIcon className="w-3.5 h-3.5" />
                          Adicionar ao Carrinho
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOrderPartDirect(part)}
                          className="col-span-3 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                          title="Falar direto com balconista sobre este produto"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-3xl max-w-lg mx-auto bg-slate-50/40">
          <Layers className="w-12 h-12 text-slate-350 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-800 mb-1 font-display">
            Nenhum produto correspondente
          </h4>
          <p className="text-sm text-slate-500 mb-6 font-sans">
            Não encontrou o material exato no filtro atual? Temos muito mais opções disponíveis na loja física e sob consulta.
          </p>
          <button
            onClick={() => {
              const text = encodeURIComponent('Olá Trevos Construções! Estou precisando de um material que não encontrei catalogado no site de vocês. Poderiam me ajudar a cotar?');
              window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
            }}
            className="inline-flex items-center gap-2 bg-green-brand hover:opacity-95 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md"
          >
            Falar com Vendedor <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Peace of mind highlight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
        <div className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-800">Marcas Reconhecidas</h5>
            <p className="text-[11px] text-slate-500 font-light">Produtos de fabricantes consagrados do mercado de construção.</p>
          </div>
        </div>
        <div className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl">
          <CornerDownRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-800">Entrega na Obra</h5>
            <p className="text-[11px] text-slate-500 font-light">Programamos entregas para o dia e horário que sua obra precisa.</p>
          </div>
        </div>
        <div className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-800">Consultoria Técnica</h5>
            <p className="text-[11px] text-slate-500 font-light">Tire dúvidas de compatibilidade e monte sua lista com um vendedor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
