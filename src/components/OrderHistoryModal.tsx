import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  Package, 
  CheckCircle2, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Mail,
  RefreshCcw,
  BadgeAlert,
  Inbox
} from 'lucide-react';

interface OrderItem {
  name: string;
  code: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  city: string;
  district: string;
  deliveryMethod: 'pickup' | 'delivery';
  paymentMethod: 'pix' | 'card';
  items: OrderItem[];
  shippingFee: number;
  subtotal: number;
  total: number;
  status: 'Aprovado' | 'Preparando Envio' | 'Saiu para Entrega' | 'Retirada Disponível' | 'Concluído';
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadHistory = () => {
    try {
      const historyJson = localStorage.getItem('trevos-construcoes-orders');
      if (historyJson) {
        setOrders(JSON.parse(historyJson));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error reading localStorage logs', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleUpdateStatus = (id: string, newStatus: Order['status']) => {
    const updated = orders.map(order => {
      if (order.id === id) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updated);
    localStorage.setItem('trevos-construcoes-orders', JSON.stringify(updated));
  };

  const handleWhatsAppNotify = (order: Order) => {
    const text = encodeURIComponent(`Olá, ${order.clientName}! Gostaríamos de avisar que o seu pedido #${order.id} na Trevos Construções mudou de status para: *${order.status}* 📦. Muito obrigado por comprar conosco!`);
    window.open(`https://wa.me/${order.clientPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 font-sans bg-slate-950/75 backdrop-blur-sm" id="order-history-modal-container">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-850 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-accent/10 flex items-center justify-center border border-orange-accent/30">
              <History className="w-4 h-4 text-orange-accent" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base tracking-tight font-display text-white">Central e Gestão de Pedidos</h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Acompanhe o status e despache as ordens de venda efetuadas na loja
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4 inline" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Histórico ({orders.length} {orders.length === 1 ? 'Pedido' : 'Pedidos'})
            </span>
            <button
              onClick={loadHistory}
              className="text-[10px] font-bold text-green-brand hover:underline flex items-center gap-1.5 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" /> Recarregar Lista
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-sm">Nenhum Pedido Registrado</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
                  Sem vendas ativas gravadas nesta sessão de testes. Adicione materiais ao carrinho no catálogo e complete a finalização de checkout para simular as ordens!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                
                return (
                  <div 
                    key={order.id} 
                    className={`border border-slate-100 rounded-2xl overflow-hidden transition-all ${
                      isExpanded ? 'ring-1 ring-green-brand/25 shadow-md bg-slate-50/20' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Compact Item Toggle Bar */}
                    <div 
                      onClick={() => toggleExpandOrder(order.id)}
                      className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 font-mono">
                          #{order.id}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {order.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Label Pill */}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          order.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          order.status === 'Preparando Envio' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          order.status === 'Saiu para Entrega' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          order.status === 'Retirada Disponível' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {order.status}
                        </span>

                        <span className="font-extrabold font-mono text-slate-900 text-xs">
                          R$ {order.total.toFixed(2)}
                        </span>

                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expandable Order Details Panel */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-4.5 bg-slate-50/45 space-y-4.5 text-xs animate-slide-down">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Client Information */}
                          <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                            <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px] block">
                              Dados do Destinatário
                            </span>
                            <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" /> {order.clientName}
                            </p>
                            <p className="text-slate-500 font-mono">TEL: {order.clientPhone}</p>
                            <p className="text-slate-500 truncate">EMAIL: {order.clientEmail}</p>
                          </div>

                          {/* Logistics / Billing info */}
                          <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                            <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px] block">
                              Modalidade & Destino
                            </span>
                            <p className="font-semibold text-slate-700">
                              Tipo: {order.deliveryMethod === 'pickup' ? '🛍️ Retirada Direta' : '🚚 Envio p/ Endereço'}
                            </p>
                            <p className="text-slate-500">
                              Lugar: {order.city} - {order.district}
                            </p>
                            <p className="text-slate-505 text-slate-500">
                              Pagamento: <strong className="text-slate-700">{order.paymentMethod === 'pix' ? 'Pix Código Key' : 'Cartão de Crédito Gateway'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* List of Ordered Pieces */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px] block border-b border-slate-100 pb-1">
                            Resumo de Produtos Pedidas
                          </span>
                          <div className="space-y-1.5 divide-y divide-slate-100">
                            {order.items.map((item, id) => (
                              <div key={id} className="flex justify-between items-center pt-1.5 first:pt-0">
                                <span className="text-slate-700 truncate max-w-[280px]">
                                  {item.quantity}x {item.name} <span className="text-[10px] text-slate-400 font-mono">[{item.code}]</span>
                                </span>
                                <span className="font-mono text-slate-900 font-bold">
                                  R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Shipping and Totals */}
                          <div className="border-t border-slate-100 pt-2 flex flex-col items-end gap-1 font-mono text-[10px]">
                            <span className="text-slate-500">Subtotal Produtos: R$ {order.subtotal.toFixed(2)}</span>
                            <span className="text-slate-500">Taxa de Logística: R$ {order.shippingFee.toFixed(2)}</span>
                            <span className="text-xs font-bold text-slate-950 font-sans border-t border-slate-100 pt-1 mt-1">
                              Faturamento Total: R$ {order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Administrative Update Controls (Simulation for shop manager) */}
                        <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">
                              Gerir Logística:
                            </span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none"
                            >
                              <option value="Aprovado">Aprovado</option>
                              <option value="Preparando Envio">Preparando Envio</option>
                              <option value="Saiu para Entrega">Saiu para Entrega</option>
                              <option value="Retirada Disponível">Retirada Disponível</option>
                              <option value="Concluído">Concluído</option>
                            </select>
                          </div>
                          
                          {/* Direct Notification to client */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppNotify(order)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Notificar WhatsApp do Cliente
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
