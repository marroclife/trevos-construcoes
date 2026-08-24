import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, ShoppingCart as CartIcon } from 'lucide-react';

import { TESTIMONIALS, PARTS_LIST, COSTA_VERDE_CITIES, BRANDS } from './data/mockData';
import { PartItem } from './types';
import { fetchProducts } from './lib/api';
import { supabase, AuthUser } from './lib/supabase';

import Header from './components/Header';
import Footer from './components/Footer';
import BackofficeDashboard from './components/BackofficeDashboard';
import ShoppingCart from './components/ShoppingCart';
import CheckoutModal from './components/CheckoutModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import ProposalPage from './pages/ProposalPage';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(() => {
    try {
      const saved = sessionStorage.getItem('trevos-construcoes-admin-view');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Dynamic Parts List
  const [parts, setParts] = useState<PartItem[]>(PARTS_LIST);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const remote = await fetchProducts();
        if (!cancelled) setParts(remote.length > 0 ? remote : PARTS_LIST);
      } catch (err) {
        console.warn('Failed to load products from API:', err);
        try {
          const saved = localStorage.getItem('trevos-construcoes-parts');
          if (saved && !cancelled) setParts(JSON.parse(saved));
        } catch {
          if (!cancelled) setParts(PARTS_LIST);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('trevos-construcoes-parts', JSON.stringify(parts));
    } catch {}
  }, [parts]);

  useEffect(() => {
    sessionStorage.setItem('trevos-construcoes-admin-view', isAdminView ? 'true' : 'false');
  }, [isAdminView]);

  // E-commerce Cart
  const [cart, setCart] = useState<{ part: PartItem; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem('trevos-construcoes-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    localStorage.setItem('trevos-construcoes-cart', JSON.stringify(cart));
  }, [cart]);

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

  const handleAddToCart = (part: PartItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.part.id === part.id);
      if (existing) {
        return prevCart.map(item =>
          item.part.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { part, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.part.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.part.id !== id));
  };

  const handleClearCart = () => setCart([]);

  const handleCheckoutSuccess = () => setCart([]);

  const handleOpenCheckout = () => {
    if (!authUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOpenHistory = () => {
    if (!authUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsHistoryOpen(true);
  };

  const handleEnterAdmin = () => setIsAdminView(true);
  const handleExitAdmin = () => setIsAdminView(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isAdminView) {
    return (
      <BackofficeDashboard
        parts={parts}
        onPartsChange={setParts}
        onExit={handleExitAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={handleOpenHistory}
        onOpenAuth={() => setIsAuthOpen(true)}
        onEnterAdmin={handleEnterAdmin}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/loja"
          element={
            <StorePage
              parts={parts}
              setParts={setParts}
              cartItems={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onOpenCart={() => setIsCartOpen(true)}
            />
          }
        />
        <Route path="/proposta" element={<ProposalPage />} />
      </Routes>

      {location.pathname !== '/loja' && <Footer onEnterAdmin={handleEnterAdmin} />}

      {/* Persistent mobile emergency bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 flex sm:hidden justify-between items-center z-45 shadow-lg select-none">
        <div className="text-left pl-2">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans">Orçamento Rápido?</span>
          <strong className="text-green-900 text-xs font-mono font-bold block">(21) 99038-7232</strong>
        </div>
        <button
          onClick={() => {
            const text = encodeURIComponent('Olá Trevos Construções! Estou no site e gostaria de um orçamento de materiais.');
            window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
          }}
          className="bg-orange-accent border border-transparent hover:opacity-90 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Falar com Vendedor
        </button>
      </div>

      {/* Floating WhatsApp button */}
      <div className={`fixed ${location.pathname === '/' ? 'bottom-28' : 'bottom-6'} right-6 hidden sm:flex flex-col items-end z-45 select-none hover:scale-105 duration-200`}>
        <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 mb-2.5 relative animate-float">
          Plantão Trevos Construções Online
          <div className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-slate-900 transform rotate-45 border-r border-b border-slate-800"></div>
        </div>

        <button
          onClick={() => {
            const text = encodeURIComponent('Olá Trevos Construções! Preciso de ajuda com materiais ou serviços.');
            window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
          }}
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-600/30 flex items-center justify-center relative transition-transform ring-4 ring-emerald-400/20"
          title="Chame no WhatsApp agora!"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25"></span>
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current stroke-none">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.502 5.282 3.501 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.88 1.45a9.77 9.77 0 0 0 9.78-9.76 9.79 9.79 0 0 0-9.77-9.78C6.18 1.054 1.15 6.084 1.15 12.2a9.7 9.7 0 0 0 1.48 5.16l-.97 3.56 3.65-.96c1.78.93 2.92.83 4.31.25zm11.23-5.39c-.31-.15-1.82-.9-2.1-.11-.27-.1-.47-.42-.69-.7-.22-.27-.58-.81-.58-.81s-.31-.38-.36-.45c-.17-.23-.08-.43.1-.63.1-.11.23-.27.35-.41.11-.14.15-.24.23-.4.08-.16.04-.31-.02-.45-.06-.14-.58-1.41-.8-1.92-.21-.52-.43-.45-.58-.45-.15-.01-.33-.01-.51-.01-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.11 2.82.14.18 1.93 2.94 4.67 4.13.65.28 1.16.45 1.56.57.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.18.16-1.29-.07-.11-.26-.26-.57-.41z" />
          </svg>
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          </span>
        </button>
      </div>

      {/* Floating Cart button (only on home and not in admin) */}
      {location.pathname !== '/loja' && (
        <div className={`fixed z-45 flex flex-col items-start select-none ${location.pathname === '/' ? 'bottom-28' : 'bottom-6'} left-6`}>
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-14 h-14 bg-orange-accent hover:opacity-95 text-white rounded-full shadow-2xl shadow-orange-accent/35 flex items-center justify-center relative transition-transform ring-4 ring-orange-accent/10 cursor-pointer hover:scale-105 duration-200"
            title="Ver meu carrinho de compras"
          >
            <CartIcon className="w-6 h-6 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] text-white font-extrabold w-6 h-6 rounded-full flex items-center justify-center animate-bounce border-2 border-white shadow-md leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      )}

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={() => {
          setIsCartOpen(false);
          handleOpenCheckout();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(user) => {
          setAuthUser(user);
          setIsAuthOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onOrderSuccess={() => {
          handleCheckoutSuccess();
          setIsCheckoutOpen(false);
          setIsHistoryOpen(true);
        }}
      />

      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
