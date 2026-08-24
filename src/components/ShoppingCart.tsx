import React from 'react';
import { PartItem } from '../types';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Truck,
  RotateCcw
} from 'lucide-react';

interface CartItem {
  part: PartItem;
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export default function ShoppingCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout
}: ShoppingCartProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.part.price * item.quantity), 0);
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Free shipping threshold for Mangaratiba: R$ 250,00
  const FREE_SHIPPING_THRESHOLD = 250;
  const progressToFreeShipping = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" id="shopping-cart-drawer">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out border-l border-slate-100">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-green-brand/20 rounded-xl flex items-center justify-center border border-green-500/20">
                <ShoppingBag className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight font-display">Seu Carrinho</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {itemsCount} {itemsCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              id="close-cart-btn"
            >
              <X className="w-5 h-5 inline" />
            </button>
          </div>

          {/* Core Content area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Free shipping banner */}
            {cartItems.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-green-brand" /> 
                    {remainingForFreeShipping > 0 ? (
                      <span>Falta pouco para <strong>Frete Grátis</strong>!</span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        Você ganhou <strong>Frete Grátis!</strong>
                      </span>
                    )}
                  </span>
                  {remainingForFreeShipping > 0 && (
                    <span className="font-bold text-green-brand">R$ {remainingForFreeShipping.toFixed(2)}</span>
                  )}
                </div>
                
                {/* Visual Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Válido para todas as cidades da Mangaratiba (Angra, Mangaratiba, Paraty, Itaguaí) em compras acima de R$ {FREE_SHIPPING_THRESHOLD.toFixed(2)}.
                </p>
              </div>
            )}

            {/* Cart Items list */}
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Carrinho Vazio</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                    Seu carrinho está esperando! Navegue por nossa seleção de produtos originais de materiais de construção de alta durabilidade e adicione o que seu equipamento precisa.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-green-brand text-white font-bold text-xs py-2.5 px-5 rounded-xl hover:opacity-95 transition-all shadow-sm"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item.part.id} className="py-4.5 first:pt-0 last:pb-0 flex gap-4">
                    {/* Visual representative icon box */}
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-inner relative group">
                      <span className="block transform group-hover:scale-110 transition-transform">
                        {item.part.category === 'refrigeracao' ? '❄️' : '🧺'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-slate-900 text-xs truncate leading-snug hover:text-green-brand transition-colors" title={item.part.name}>
                          {item.part.name}
                        </h4>
                        <button 
                          onClick={() => onRemoveItem(item.part.id)}
                          className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 font-mono">
                        Código: {item.part.code} • {item.part.subcategory}
                      </p>

                      <div className="flex items-center justify-between pt-1.5">
                        {/* Quantity picker */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => onUpdateQuantity(item.part.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 px-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800 text-center min-w-[20px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.part.id, item.quantity + 1)}
                            className="p-1 px-2 text-slate-500 hover:bg-slate-100 transition-all text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price computation */}
                        <div className="text-right">
                          <span className="text-[10px] block text-slate-400 font-medium">
                            {item.quantity}x R$ {item.part.price.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-900">
                            R$ {(item.part.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer controls & summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-100 p-6 bg-slate-50 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Entrega (Mangaratiba)</span>
                  <span className="font-semibold text-emerald-700">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? 'GRÁTIS' : 'Calculado no Checkout'}
                  </span>
                </div>
                <div className="border-t border-slate-200 my-1 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Estimado</span>
                  <span className="font-extrabold font-mono text-green-brand text-base">
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Secure Checkout Badging */}
              <div className="flex gap-2 justify-center items-center text-[10px] text-slate-500 py-1 border-y border-dashed border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Checkout 100% Criptografado e Seguro</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={onCheckout}
                  className="w-full bg-orange-accent hover:opacity-95 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-orange-accent/20 flex items-center justify-center gap-2 cursor-pointer"
                  id="go-to-checkout-btn"
                >
                  Finalizar Compra Segura <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={onClearCart}
                  className="w-full text-slate-400 hover:text-slate-600 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpar Carrinho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
