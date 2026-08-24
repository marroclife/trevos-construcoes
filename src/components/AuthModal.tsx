import React, { useState, useEffect } from 'react';
import { X, Chrome, Loader2, User, LogOut } from 'lucide-react';
import { supabase, AuthUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: AuthUser) => void;
  mode?: 'login' | 'profile';
}

export default function AuthModal({ isOpen, onClose, onLogin, mode = 'login' }: AuthModalProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {mode === 'profile' && user ? (
          <div className="space-y-4 pt-2">
            <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name || user.email} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user.name || 'Usuário'}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Sair da conta
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{mode === 'profile' ? 'Sua Conta' : 'Faça login para continuar'}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {mode === 'profile'
                  ? 'Gerencie sua sessão'
                  : 'Autentique-se com Google para finalizar a compra com segurança.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4 text-blue-500" />}
              Continuar com Google
            </button>

            <p className="text-[11px] text-slate-400">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
