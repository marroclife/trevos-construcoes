import React, { useState, useEffect } from 'react';
import { PartItem } from '../types';
import { COSTA_VERDE_CITIES } from '../data/mockData';
import { loadMercadoPagoSdk, openMercadoPagoCheckout } from '../lib/mercadopago';
import {
  X, CreditCard, QrCode, CheckCircle2, ShieldCheck, Truck, Store, Loader2,
  Copy, Check, ArrowRight, MessageSquare, Mail, Printer, AlertTriangle
} from 'lucide-react';

interface CartItem {
  part: PartItem;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: () => void;
}

interface OrderHistoryItem {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  city: string;
  district: string;
  deliveryMethod: 'pickup' | 'delivery';
  paymentMethod: 'pix' | 'card';
  items: { name: string; code: string; quantity: number; price: number }[];
  shippingFee: number;
  subtotal: number;
  total: number;
  status: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
}

export default function CheckoutModal({ isOpen, onClose, cartItems, onOrderSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [pixPaid, setPixPaid] = useState(false);
  const [pixInitiated, setPixInitiated] = useState(false);
  const [gatewayDisabled, setGatewayDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [selectedCity, setSelectedCity] = useState('Angra dos Reis');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('delivery');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const districtsOfSelectedCity = COSTA_VERDE_CITIES.find(c => c.name === selectedCity)?.districts || [];

  useEffect(() => {
    if (districtsOfSelectedCity.length > 0) {
      setSelectedDistrict(districtsOfSelectedCity[0]);
    }
  }, [selectedCity]);

  useEffect(() => {
    let timer: any;
    if (step === 2 && paymentMethod === 'pix' && pixTimeLeft > 0 && !pixPaid) {
      timer = setTimeout(() => setPixTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, paymentMethod, pixTimeLeft, pixPaid]);

  // Auto-start PIX charge generation when entering step 2
  useEffect(() => {
    if (step === 2 && paymentMethod === 'pix' && !paymentData && !loading && !gatewayDisabled && !pixPaid && !pixInitiated) {
      setPixInitiated(true);
      processPayment();
    }
  }, [step, paymentMethod, paymentData, loading, gatewayDisabled, pixPaid, pixInitiated]);

  // Poll pix payment status when active
  useEffect(() => {
    if (step !== 2 || paymentMethod !== 'pix' || !orderId || pixPaid || gatewayDisabled) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.order?.paymentStatus === 'APPROVED') {
          setPixPaid(true);
          clearInterval(interval);
          setStep(3);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, paymentMethod, orderId, pixPaid, gatewayDisabled]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.part.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 250;
  const shippingFee = deliveryMethod === 'pickup' || isFreeShipping ? 0 : (() => {
    switch (selectedCity) {
      case 'Angra dos Reis': return 15;
      case 'Mangaratiba': return 20;
      case 'Paraty': return 25;
      case 'Itaguaí': return 22;
      default: return 15;
    }
  })();
  const total = subtotal + shippingFee;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nome completo é obrigatório.';
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits) errors.phone = 'Telefone para contato é obrigatório.';
    else if (phoneDigits.length < 10) errors.phone = 'Insira um telefone/WhatsApp válido com DDD.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Insira um endereço de e-mail válido.';
    if (!cpf.trim()) errors.cpf = 'CPF é obrigatório para o gateway.';
    if (deliveryMethod === 'delivery' && !selectedDistrict) errors.district = 'Selecione seu bairro.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNavigateToPayment = () => {
    if (!validateStep1()) return;
    setFormErrors({});
    setPixInitiated(false);
    setStep(2);
  };

  const processPayment = async () => {
    setError(null);
    setLoading(true);
    setLoadingText('Iniciando transação segura...');
    try {
      const payload = {
        customer: { name, phone, email, cpf: cpf.replace(/\D/g, '') },
        deliveryMethod,
        city: selectedCity,
        district: selectedDistrict,
        paymentMethod,
        items: cartItems.map(item => ({
          id: item.part.id,
          name: item.part.name,
          code: item.part.code,
          quantity: item.quantity,
          price: item.part.price,
        })),
        shippingFee,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no checkout');

      setOrderId(data.order.id);
      setOrderNumber(data.order.orderNumber);
      if (data.gatewayDisabled) setGatewayDisabled(true);

      // Persist history in localStorage
      const newOrder: OrderHistoryItem = {
        id: data.order.id,
        date: new Date().toLocaleDateString('pt-BR'),
        clientName: name,
        clientPhone: phone,
        clientEmail: email,
        city: selectedCity,
        district: selectedDistrict || 'Retirada em Loja',
        deliveryMethod,
        paymentMethod,
        items: cartItems.map(item => ({
          name: item.part.name,
          code: item.part.code,
          quantity: item.quantity,
          price: item.part.price,
        })),
        shippingFee,
        subtotal,
        total,
        status: data.gatewayDisabled ? 'Pendente (Gateway Desativado)' : 'Aguardando Pagamento',
        qrCode: data.payment?.qrCode,
        qrCodeBase64: data.payment?.qrCodeBase64,
        ticketUrl: data.payment?.ticketUrl,
      };
      const history = JSON.parse(localStorage.getItem('trevos-construcoes-orders') || '[]');
      history.unshift(newOrder);
      localStorage.setItem('trevos-construcoes-orders', JSON.stringify(history));

      if (paymentMethod === 'card') {
        if (data.preferenceId && data.initPoint) {
          try {
            await loadMercadoPagoSdk();
            openMercadoPagoCheckout(data.preferenceId);
          } catch (sdkErr: any) {
            window.open(data.initPoint, '_blank');
          }
          setLoading(false);
          return; // keep modal open until user returns
        }
        throw new Error('Não foi possível iniciar o checkout do cartão');
      }

      // PIX flow
      setPaymentData(data.payment || null);
      setPixTimeLeft(300);
      setStep(2);
      setLoading(false);
    } catch (err: any) {
      console.error('Checkout error', err);
      setError(err.message || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    const code = paymentData?.qrCode;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    });
  };

  const formatTimeLeft = () => {
    const mins = Math.floor(pixTimeLeft / 60);
    const secs = pixTimeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendWhatsAppNotification = () => {
    const itemsListText = cartItems.map(item =>
      `• ${item.quantity}x ${item.part.name} [${item.part.code}] - R$ ${(item.part.price * item.quantity).toFixed(2)}`
    ).join('\n');
    const message =
      `🚨 *NOVO PEDIDO - FRIO COSTA VERDE* 🚨\n\n` +
      `*Código:* #${orderNumber}\n` +
      `*Status:* ${pixPaid ? 'Pago ✅' : 'Aguardando Pagamento'}\n` +
      `*Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `*CLIENTE:*\n` +
      `• ${name}\n` +
      `• ${phone}\n` +
      `• ${email}\n\n` +
      `*ENTREGA:*\n` +
      `• ${deliveryMethod === 'pickup' ? '🛍️ Retirada na Loja' : '🚚 Entrega'}\n` +
      `• ${selectedCity} - ${selectedDistrict || 'Retirada'}\n\n` +
      `*ITENS:*\n${itemsListText}\n\n` +
      `*VALORES:*\n` +
      `• Subtotal: R$ ${subtotal.toFixed(2)}\n` +
      `• Frete: R$ ${shippingFee.toFixed(2)}\n` +
      `• *TOTAL:* R$ ${total.toFixed(2)} (via ${paymentMethod === 'pix' ? 'PIX' : 'Cartão'})`;
    window.open(`https://wa.me/5521990387232?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleClose = () => {
    onOrderSuccess();
    onClose();
    setStep(1);
    setPaymentData(null);
    setPixPaid(false);
    setPixInitiated(false);
    setOrderId('');
    setOrderNumber('');
    setError(null);
    setGatewayDisabled(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 font-sans bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base tracking-tight text-white">Checkout Seguro de Produtos</h3>
              <p className="text-[10px] text-slate-400">Transação criptografada via Mercado Pago</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4 inline" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step !== 3 && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                  {step === 1 ? '1' : <Check className="w-3.5 h-3.5" />}
                </span>
                <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>Identificação & Entrega</span>
              </div>
              <div className="flex-1 h-[2px] bg-slate-100 mx-4" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</span>
                <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Gateway de Pagamento</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Nome Completo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João da Silva Santos"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${formErrors.name ? 'border-red-500' : 'border-slate-200'}`} />
                  {formErrors.name && <p className="text-[10px] text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">WhatsApp com DDD</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex: (21) 99495-4092"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${formErrors.phone ? 'border-red-500' : 'border-slate-200'}`} />
                  {formErrors.phone && <p className="text-[10px] text-red-500">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: joao@gmail.com"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${formErrors.email ? 'border-red-500' : 'border-slate-200'}`} />
                  {formErrors.email && <p className="text-[10px] text-red-500">{formErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">CPF</label>
                  <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${formErrors.cpf ? 'border-red-500' : 'border-slate-200'}`} />
                  {formErrors.cpf && <p className="text-[10px] text-red-500">{formErrors.cpf}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 block">Forma de Obtenção</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-xl border text-left flex gap-3 transition-all ${deliveryMethod === 'delivery' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50'}`}>
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-bold text-xs block">Entrega em Domicílio</span>
                      <span className="text-[10px] text-slate-500">{isFreeShipping ? 'Grátis' : 'Calculado no checkout'}</span>
                    </div>
                  </button>
                  <button type="button" onClick={() => setDeliveryMethod('pickup')}
                    className={`p-4 rounded-xl border text-left flex gap-3 transition-all ${deliveryMethod === 'pickup' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50'}`}>
                    <Store className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-bold text-xs block">Retirada em Loja</span>
                      <span className="text-[10px] text-slate-500">Pronta retirada física (Grátis)</span>
                    </div>
                  </button>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Município</label>
                    <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
                      {COSTA_VERDE_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Bairro</label>
                    <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs ${formErrors.district ? 'border-red-500' : 'border-slate-200'}`}>
                      {districtsOfSelectedCity.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {formErrors.district && <p className="text-[10px] text-red-500">{formErrors.district}</p>}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal: {formatCurrency(subtotal)}</span>
                  <span>Frete: {shippingFee === 0 ? 'Grátis' : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                  <span className="text-xs font-bold text-slate-900">Total</span>
                  <span className="text-base font-extrabold font-mono text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <button type="button" onClick={handleNavigateToPayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                Seguir para Pagamento <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setPaymentMethod('pix')} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'pix' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600'}`}>
                  <QrCode className="w-4 h-4 text-cyan-600" /> PIX Instantâneo
                </button>
                <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'card' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600'}`}>
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Cartão de Crédito
                </button>
              </div>

              {paymentMethod === 'pix' && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-4">
                  {gatewayDisabled ? (
                    <div className="text-center space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">Gateway do Mercado Pago desativado</h4>
                      <p className="text-xs text-slate-500">As credenciais não estão configuradas. O pedido foi salvo no sistema e pode ser pago diretamente com o balconista.</p>
                      <button onClick={() => setStep(3)} className="bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl">Ver resumo do pedido</button>
                    </div>
                  ) : paymentData ? (
                    <>
                      <div className="flex justify-between items-center bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl text-xs max-w-xs mx-auto">
                        <span className="text-slate-500">Expira em:</span>
                        <span className="font-mono text-blue-600 font-bold animate-pulse">{formatTimeLeft()}</span>
                      </div>
                      {paymentData.qrCodeBase64 ? (
                        <img src={`data:image/png;base64,${paymentData.qrCodeBase64}`} alt="QR Code PIX" className="w-44 h-44 mx-auto bg-white p-2 rounded-xl border border-slate-200" />
                      ) : (
                        <div className="w-44 h-44 bg-white border border-slate-200 rounded-2xl p-2.5 mx-auto flex items-center justify-center text-slate-400 text-xs">QR Code não disponível</div>
                      )}
                      <p className="text-xs font-bold text-slate-800">Escaneie com seu app bancário</p>
                      <div className="flex gap-2 max-w-xs mx-auto">
                        <button onClick={handleCopyPix} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5">
                          {copiedPix ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar Pix</>}
                        </button>
                        {paymentData.ticketUrl && (
                          <a href={paymentData.ticketUrl} target="_blank" rel="noreferrer" className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1">
                            Pagar no app
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Aguardando confirmação automática do Mercado Pago...</p>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Gerando cobrança PIX...</p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center space-y-4">
                  <CreditCard className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Pagamento com Cartão</h4>
                  <p className="text-xs text-slate-500">Você será redirecionado para o checkout seguro do Mercado Pago para finalizar o pagamento.</p>
                  <button onClick={processPayment} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 mx-auto">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadingText}</> : <>Pagar {formatCurrency(total)} com Cartão</>}
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} disabled={loading} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl transition-all disabled:opacity-50">Voltar</button>
                {paymentMethod === 'pix' && !gatewayDisabled && (
                  <button onClick={() => setStep(3)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl">Já realizei o pagamento</button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 pt-2 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">{pixPaid ? 'Compra Confirmada!' : 'Pedido Registrado!'}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {pixPaid
                    ? 'Pagamento aprovado pelo gateway. Suas produtos foram reservadas no estoque.'
                    : 'Seu pedido foi salvo no sistema. Finalize o pagamento para liberar a separação no estoque.'}
                </p>
                <div className="inline-block bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 font-mono text-xs text-slate-700 font-bold">
                  Ordem: <span className="text-blue-600">#{orderNumber || orderId}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl max-w-md mx-auto text-left space-y-3">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wider">Detalhamento</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-600">
                      <span className="truncate max-w-[280px]">{item.quantity}x {item.part.name}</span>
                      <span className="font-mono font-medium">R$ {(item.part.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>Total</span>
                  <span className="font-mono text-blue-600 text-sm">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3.5 max-w-md mx-auto">
                <p className="text-xs font-bold text-slate-700 block">Ações de Expedição:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button onClick={handleSendWhatsAppNotification} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Enviar p/ Loja
                  </button>
                  <button onClick={() => alert(`Resumo enviado para ${email}`)} className="bg-slate-900 text-slate-100 hover:text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Enviar p/ E-mail
                  </button>
                </div>
                <button onClick={() => window.print()} className="w-full text-slate-500 hover:text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 py-1">
                  <Printer className="w-3.5 h-3.5" /> Imprimir Comprovante
                </button>
              </div>

              <div className="pt-4 max-w-xs mx-auto border-t border-slate-100">
                <button onClick={handleClose} className="w-full bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-all">
                  Voltar ao Catálogo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
