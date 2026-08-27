import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, ShoppingCart as CartIcon } from 'lucide-react';

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
import CymarChat from './components/CymarChat';

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

      <CymarChat />

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
