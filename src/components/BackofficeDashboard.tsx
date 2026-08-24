import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  LogOut, 
  Globe, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  User, 
  Clock,
  ArrowLeft,
  ChevronRight,
  X,
  PlusCircle,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { PartItem, Appointment } from '../types';
import { PARTS_LIST } from '../data/mockData';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../lib/api';

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

interface BackofficeDashboardProps {
  parts: PartItem[];
  onPartsChange: (updatedParts: PartItem[]) => void;
  onExit: () => void;
}

export default function BackofficeDashboard({
  parts,
  onPartsChange,
  onExit
}: BackofficeDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'products' | 'orders' | 'settings'>('dashboard');

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('all');
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Products CRUD State
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'hidraulica' | 'obras'>('all');
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PartItem | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<'hidraulica' | 'obras' | 'teste'>('hidraulica');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formAvailability, setFormAvailability] = useState<'Disponível em Estoque' | 'Sob Encomenda (Rápido)' | 'Últimas Unidades'>('Disponível em Estoque');
  const [formBrands, setFormBrands] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageLoading, setFormImageLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Check login session
  useEffect(() => {
    const token = sessionStorage.getItem('trevos-construcoes-admin-token');
    if (token === 'logged') {
      setIsAuthenticated(true);
    }
    loadOrders();
    loadAppointments();
  }, []);

  // Load products from API when entering admin view
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    async function load() {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const remote = await fetchProducts();
        if (!cancelled) {
          if (remote.length > 0) {
            onPartsChange(remote);
          }
        }
      } catch (err) {
        console.warn('CMS failed to load remote products:', err);
        if (!cancelled) {
          setProductsError('Servidor indisponível. Alterações ficarão apenas neste navegador.');
        }
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const loadAppointments = () => {
    try {
      const saved = localStorage.getItem('trevos-construcoes-appointments');
      if (saved) {
        setAppointments(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load appointments', err);
    }
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
    setAppointments(updated);
    localStorage.setItem('trevos-construcoes-appointments', JSON.stringify(updated));
  };

  const deleteAppointment = (id: string) => {
    if (!confirm('Tem certeza que deseja remover este agendamento?')) return;
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem('trevos-construcoes-appointments', JSON.stringify(updated));
  };

  const loadOrders = () => {
    try {
      const ordersJson = localStorage.getItem('trevos-construcoes-orders');
      if (ordersJson) {
        setOrders(JSON.parse(ordersJson));
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'costaverde2026') {
      sessionStorage.setItem('trevos-construcoes-admin-token', 'logged');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('trevos-construcoes-admin-token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Calculations for Dashboard
  const activeOrdersCount = orders.filter(o => o.status !== 'Concluído').length;
  const completedOrders = orders.filter(o => o.status === 'Concluído');
  const totalSalesRevenue = orders
    .filter(o => o.status !== 'Preparando Envio' && o.status !== 'Aprovado') // Summing those that are advanced or done
    .reduce((sum, o) => sum + o.total, 0);
  
  const lowStockProducts = parts.filter(p => p.availability === 'Últimas Unidades');

  // Products CRUD Actions
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCode('');
    setFormCategory('hidraulica');
    setFormSubcategory('');
    setFormDescription('');
    setFormPrice('');
    setFormAvailability('Disponível em Estoque');
    setFormBrands('Universal');
    setFormImageUrl('');
    setFormImageLoading(false);
    setFormError('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: PartItem) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCode(product.code);
    setFormCategory(product.category as 'hidraulica' | 'obras' | 'teste');
    setFormSubcategory(product.subcategory);
    setFormDescription(product.description);
    setFormPrice(product.price.toString());
    setFormAvailability(product.availability);
    setFormBrands(product.compatibleBrands.join(', '));
    setFormImageUrl(product.imageUrl || '');
    setFormImageLoading(false);
    setFormError('');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaveError(null);

    if (!formName.trim() || !formCode.trim() || !formSubcategory.trim() || !formPrice.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Por favor, insira um preço válido maior que zero.');
      return;
    }

    const brandsArray = formBrands
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    let imageUrl: string | undefined = formImageUrl.trim() || undefined;

    // If editing and image didn't change, keep it. If new base64 upload, send to Cloudinary.
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      try {
        setFormImageLoading(true);
        const uploadedUrl = await uploadImage(imageUrl, formCode);
        imageUrl = uploadedUrl;
      } catch (err: any) {
        setFormError(err.message || 'Falha ao enviar imagem. Verifique as configurações do Cloudinary.');
        setFormImageLoading(false);
        return;
      } finally {
        setFormImageLoading(false);
      }
    }

    const baseProduct: PartItem = editingProduct || {
      id: `custom-${Date.now()}`,
      name: '',
      code: '',
      category: 'hidraulica',
      subcategory: '',
      description: '',
      price: 0,
      availability: 'Disponível em Estoque',
      compatibleBrands: [],
      rating: 5.0,
      reviewsCount: 1,
    };

    const productData: PartItem = {
      ...baseProduct,
      name: formName,
      code: formCode,
      category: formCategory,
      subcategory: formSubcategory,
      description: formDescription,
      price: priceNum,
      availability: formAvailability,
      compatibleBrands: brandsArray.length > 0 ? brandsArray : ['Universal'],
      imageUrl,
    };

    try {
      if (editingProduct) {
        // Check duplicate code excluding current product
        if (parts.some(p => p.id !== editingProduct.id && p.code.toLowerCase() === formCode.toLowerCase())) {
          setFormError('Este código de peça já está cadastrado.');
          return;
        }

        const updated = await updateProduct(productData);
        const updatedPartsList = parts.map(p => p.id === updated.id ? updated : p);
        onPartsChange(updatedPartsList);
      } else {
        if (parts.some(p => p.code.toLowerCase() === formCode.toLowerCase())) {
          setFormError('Este código de peça já está cadastrado.');
          return;
        }

        const created = await createProduct(productData);
        const updatedPartsList = [...parts, created];
        onPartsChange(updatedPartsList);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setSaveError(err.message || 'Erro ao salvar no servidor. O catálogo local foi atualizado.');

      // Fallback: update localStorage so the user doesn't lose the change
      let updatedPartsList = [...parts];
      if (editingProduct) {
        updatedPartsList = updatedPartsList.map(p =>
          p.id === editingProduct.id ? productData : p
        );
      } else {
        updatedPartsList.push(productData);
      }
      onPartsChange(updatedPartsList);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja remover esta peça permanentemente do catálogo?')) return;

    try {
      await deleteProduct(id);
      const updated = parts.filter(p => p.id !== id);
      onPartsChange(updated);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setSaveError('Erro ao remover no servidor. Removendo apenas localmente.');
      const updated = parts.filter(p => p.id !== id);
      onPartsChange(updated);
    }
  };

  const handleQuickUpdateAvailability = async (id: string, value: PartItem['availability']) => {
    const product = parts.find(p => p.id === id);
    if (!product) return;

    const updated = parts.map(p => p.id === id ? { ...p, availability: value } : p);
    onPartsChange(updated);

    try {
      await updateProduct({ ...product, availability: value });
    } catch (err: any) {
      console.error('Failed to update availability:', err);
      setSaveError('Erro ao sincronizar disponibilidade. Alteração mantida localmente.');
    }
  };

  const handleQuickUpdatePrice = async (id: string, value: string) => {
    const priceNum = parseFloat(value);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const product = parts.find(p => p.id === id);
    if (!product) return;

    const updated = parts.map(p => p.id === id ? { ...p, price: priceNum } : p);
    onPartsChange(updated);

    try {
      await updateProduct({ ...product, price: priceNum });
    } catch (err: any) {
      console.error('Failed to update price:', err);
      setSaveError('Erro ao sincronizar preço. Alteração mantida localmente.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Por favor, envie apenas arquivos de imagem (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError('A imagem deve ter no máximo 2MB. Tente comprimir antes de enviar.');
      return;
    }

    setFormImageLoading(true);
    setFormError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImageUrl(reader.result as string);
      setFormImageLoading(false);
    };
    reader.onerror = () => {
      setFormError('Erro ao ler a imagem. Tente novamente.');
      setFormImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setFormImageUrl('');
  };

  // Orders status update
  const handleUpdateOrderStatus = (id: string, newStatus: Order['status']) => {
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
    const statusMessages = {
      'Aprovado': 'foi aprovado e já está em processamento',
      'Preparando Envio': 'está sendo embalado e preparado para envio',
      'Saiu para Entrega': 'saiu para entrega e deve chegar em breve no seu endereço',
      'Retirada Disponível': 'já está pronto para retirada no nosso balcão',
      'Concluído': 'foi concluído com sucesso. Agradecemos a preferência'
    };

    const msg = `Olá, ${order.clientName}! Gostaríamos de informar que o status do seu pedido #${order.id} na Trevos Construções mudou para: *${order.status}* (${statusMessages[order.status] || ''}) 📦.`;
    window.open(`https://wa.me/${order.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Import / Export Settings
  const handleExportData = () => {
    const backupData = {
      parts,
      orders,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_trevos_construcoes_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.parts)) {
            // Restore catalog
            onPartsChange(parsed.parts);
            localStorage.setItem('trevos-construcoes-parts', JSON.stringify(parsed.parts));
            
            // Restore orders if present
            if (Array.isArray(parsed.orders)) {
              setOrders(parsed.orders);
              localStorage.setItem('trevos-construcoes-orders', JSON.stringify(parsed.orders));
            }
            alert('Backup restaurado com sucesso!');
            setActiveTab('dashboard');
          } else {
            alert('Formato de arquivo inválido. O arquivo de backup deve conter a lista de produtos.');
          }
        } catch (err) {
          alert('Erro ao decodificar o arquivo JSON.');
        }
      };
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Aviso: Isso irá redefinir todo o inventário para as produtos padrão de fábrica. Deseja prosseguir?')) {
      onPartsChange(PARTS_LIST);
      localStorage.setItem('trevos-construcoes-parts', JSON.stringify(PARTS_LIST));
      alert('Inventário restaurado para o padrão com sucesso!');
    }
  };

  // Filtering Products
  const filteredProducts = parts.filter(p => {
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                          p.subcategory.toLowerCase().includes(productSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtering Orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch = o.clientName.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(orderSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Login Screen Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-left">
        {/* Luminous Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 glass-panel-dark text-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-blue-600/20 text-cyan-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Acesso Restrito
            </div>
            <h2 className="text-2xl font-black font-display text-white tracking-tight">Trevos Construções</h2>
            <p className="text-slate-400 text-xs mt-1">Painel Administrativo de Gestão</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Usuário</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-sans"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-brand hover:opacity-95 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
            >
              Entrar no Painel <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <button
            onClick={onExit}
            className="w-full text-center text-slate-500 hover:text-slate-350 text-xs font-semibold mt-6 transition-colors block"
          >
            Voltar para a Loja Pública
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans text-left">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 z-30">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-8 border-b border-slate-800 pb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-accent/20 flex items-center justify-center border border-orange-accent/30">
              <span className="text-orange-accent font-black text-sm">❄️</span>
            </div>
            <div>
              <h3 className="font-extrabold text-xs tracking-tight text-white uppercase">Mangaratiba</h3>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">BACKOFFICE CMS</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-green-brand text-white shadow-md shadow-blue-900/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Dashboard Principal</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'appointments' ? 'bg-green-brand text-white shadow-md shadow-blue-900/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              <span>Agendamentos</span>
              {appointments.filter(a => a.status === 'Novo').length > 0 && (
                <span className="ml-auto bg-red-600 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none">
                  {appointments.filter(a => a.status === 'Novo').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'products' ? 'bg-green-brand text-white shadow-md shadow-blue-900/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              <span>Gerir Produtos</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'orders' ? 'bg-green-brand text-white shadow-md shadow-blue-900/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Gerir Pedidos</span>
              {activeOrdersCount > 0 && (
                <span className="ml-auto bg-red-600 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'settings' ? 'bg-green-brand text-white shadow-md shadow-blue-900/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Configurações / Backup</span>
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 space-y-2">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all text-left cursor-pointer"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Voltar ao Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Desconectar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tab Headers */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="text-2xl font-black font-display text-white tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard de Desempenho'}
              {activeTab === 'appointments' && 'Agendamentos e Visitas Técnicas'}
              {activeTab === 'products' && 'Catálogo e Inventário de Produtos'}
              {activeTab === 'orders' && 'Central de Rastreamento de Pedidos'}
              {activeTab === 'settings' && 'Segurança e Redundância de Dados'}
            </h1>
            <p className="text-slate-400 text-xs font-sans mt-0.5">
              {activeTab === 'dashboard' && 'Visão instantânea das estatísticas da loja e do fluxo de faturamento.'}
              {activeTab === 'appointments' && 'Gerencie visitas técnicas e orçamentos solicitados pelo site.'}
              {activeTab === 'products' && 'Adicione, atualize e gerencie os itens expostos para venda.'}
              {activeTab === 'orders' && 'Monitore vendas locais e atualize seus clientes via WhatsApp.'}
              {activeTab === 'settings' && 'Importe ou exporte planilhas JSON para backup ou restabeleça o padrão.'}
            </p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400 font-mono">
            Sessão segura: <span className="text-emerald-400 font-bold">ATIVA</span>
          </div>
        </div>

        {/* Core Tab Renderers */}
        <div className="relative z-10">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl transition-all shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faturamento Líquido</span>
                    <DollarSign className="w-5 h-5 text-emerald-400 bg-emerald-500/10 p-1 rounded" />
                  </div>
                  <div className="mt-3.5">
                    <span className="text-xl font-extrabold text-white font-mono">
                      R$ {totalSalesRevenue.toFixed(2)}
                    </span>
                    <span className="text-[10px] block text-slate-500 mt-1">Excluindo orçamentos provisórios</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl transition-all shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total de Pedidos</span>
                    <ShoppingBag className="w-5 h-5 text-blue-400 bg-blue-500/10 p-1 rounded" />
                  </div>
                  <div className="mt-3.5">
                    <span className="text-xl font-extrabold text-white font-mono">{orders.length}</span>
                    <span className="text-[10px] block text-slate-500 mt-1">
                      <span className="text-emerald-400 font-bold">{orders.filter(o => o.status === 'Concluído').length}</span> já finalizados
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl transition-all shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catálogo Público</span>
                    <Package className="w-5 h-5 text-purple-400 bg-purple-500/10 p-1 rounded" />
                  </div>
                  <div className="mt-3.5">
                    <span className="text-xl font-extrabold text-white font-mono">{parts.length} Produtos</span>
                    <span className="text-[10px] block text-slate-500 mt-1">Divididas em 2 categorias</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl transition-all shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estoque Baixo</span>
                    <AlertTriangle className="w-5 h-5 text-orange-400 bg-orange-500/10 p-1 rounded" />
                  </div>
                  <div className="mt-3.5">
                    <span className="text-xl font-extrabold text-white font-mono">{lowStockProducts.length} Itens</span>
                    <span className="text-[10px] block text-slate-500 mt-1">Marcados como "Últimas Unidades"</span>
                  </div>
                </div>

              </div>

              {/* Lower Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Recent Orders Card */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4">Vendas e Encomendas Recentes</h3>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      Nenhum pedido efetuado ainda no site público.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-2">ID</th>
                            <th className="pb-3 pr-2">Cliente</th>
                            <th className="pb-3 pr-2">Data</th>
                            <th className="pb-3 pr-2">Total</th>
                            <th className="pb-3 pr-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {orders.slice(-5).reverse().map((order) => (
                            <tr key={order.id} className="hover:bg-slate-850/30">
                              <td className="py-3 font-mono font-bold text-blue-400">#{order.id}</td>
                              <td className="py-3 font-medium text-slate-200">{order.clientName}</td>
                              <td className="py-3 text-slate-400">{order.date}</td>
                              <td className="py-3 font-mono text-slate-200">R$ {order.total.toFixed(2)}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  order.status === 'Preparando Envio' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  order.status === 'Saiu para Entrega' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  order.status === 'Retirada Disponível' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Stock Alerts Column */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">Alertas de Reposição</h3>
                  
                  {lowStockProducts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      Todos os produtos operando com estabilidade de estoque.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {lowStockProducts.map((p) => (
                        <div key={p.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{p.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">CÓD: {p.code}</span>
                          </div>
                          <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0">
                            Esgotando
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Appointments Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-850 p-4.5 rounded-2xl">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setAppointmentStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appointmentStatusFilter === 'all' ? 'bg-green-brand text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setAppointmentStatusFilter('Novo')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appointmentStatusFilter === 'Novo' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Novos
                    </button>
                    <button
                      onClick={() => setAppointmentStatusFilter('Confirmado')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appointmentStatusFilter === 'Confirmado' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Confirmados
                    </button>
                    <button
                      onClick={() => setAppointmentStatusFilter('Concluído')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        appointmentStatusFilter === 'Concluído' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Concluídos
                    </button>
                  </div>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, bairro ou aparelho..."
                    value={appointmentSearchTerm}
                    onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Appointments List */}
              {(() => {
                const filtered = appointments
                  .filter(a => appointmentStatusFilter === 'all' || a.status === appointmentStatusFilter)
                  .filter(a => {
                    const term = appointmentSearchTerm.toLowerCase();
                    return (
                      a.name.toLowerCase().includes(term) ||
                      a.district.toLowerCase().includes(term) ||
                      a.city.toLowerCase().includes(term) ||
                      a.equipment.toLowerCase().includes(term) ||
                      a.serviceType.toLowerCase().includes(term)
                    );
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                if (filtered.length === 0) {
                  return (
                    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 text-xs">
                      Nenhum agendamento encontrado.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((a) => (
                      <div
                        key={a.id}
                        className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden transition-all"
                      >
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-blue-400 text-xs font-bold">#{a.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                a.status === 'Novo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                a.status === 'Confirmado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                a.status === 'Concluído' ? 'bg-slate-700 text-slate-300 border-slate-600' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {a.status}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(a.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{a.name}</h4>
                            <p className="text-[11px] text-slate-400">
                              {a.phone} • {a.district ? `${a.district}, ` : ''}{a.city}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {a.serviceType} • {a.equipment} • {a.date ? new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'A combinar'} {a.time}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={a.status}
                              onChange={(e) => updateAppointmentStatus(a.id, e.target.value as Appointment['status'])}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="Novo">Novo</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Concluído">Concluído</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>

                            <a
                              href={`https://wa.me/${a.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${a.name}! Recebemos seu agendamento na Trevos Construções. Confirmamos sua visita para ${a.date ? new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'a combinar'} às ${a.time || 'a combinar'}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-all"
                              title="Confirmar via WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => setExpandedAppointmentId(expandedAppointmentId === a.id ? null : a.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-all"
                              title="Ver detalhes"
                            >
                              {expandedAppointmentId === a.id ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => deleteAppointment(a.id)}
                              className="bg-red-950/20 hover:bg-red-950/40 text-red-400 p-2 rounded-lg transition-all"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {expandedAppointmentId === a.id && (
                          <div className="border-t border-slate-850 px-4 py-3 bg-slate-950/50 text-xs text-slate-300 space-y-2">
                            {a.email && <p><span className="text-slate-500">E-mail:</span> {a.email}</p>}
                            <p><span className="text-slate-500">Endereço:</span> {a.district ? `${a.district}, ` : ''}{a.city}</p>
                            <p><span className="text-slate-500">Serviço:</span> {a.serviceType}</p>
                            <p><span className="text-slate-500">Aparelho:</span> {a.equipment}</p>
                            <p><span className="text-slate-500">Data/hora:</span> {a.date ? new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'A combinar'} às {a.time || 'a combinar'}</p>
                            {a.description && (
                              <p><span className="text-slate-500">Descrição:</span> {a.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">

              {/* Server Status */}
              {(productsLoading || productsError || saveError) && (
                <div className="space-y-3">
                  {productsLoading && (
                    <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3 text-xs text-blue-300">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sincronizando catálogo com o servidor...</span>
                    </div>
                  )}
                  {productsError && (
                    <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-300">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{productsError}</span>
                    </div>
                  )}
                  {saveError && (
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 text-xs text-red-300">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{saveError}</span>
                        <button
                          onClick={() => setSaveError(null)}
                          className="ml-2 underline hover:text-red-200"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Product Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-850 p-4.5 rounded-2xl">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  
                  {/* Category Filter */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setProductCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        productCategoryFilter === 'all' ? 'bg-green-brand text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todos ({parts.length})
                    </button>
                    <button
                      onClick={() => setProductCategoryFilter('hidraulica')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        productCategoryFilter === 'hidraulica' ? 'bg-green-brand text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Materiais de Construção
                    </button>
                    <button
                      onClick={() => setProductCategoryFilter('obras')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        productCategoryFilter === 'obras' ? 'bg-green-brand text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Obras
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Pesquisar por nome ou código..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>

                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="bg-orange-accent hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer w-full md:w-auto justify-center"
                >
                  <PlusCircle className="w-4.5 h-4.5" /> Adicionar Nova Peça
                </button>
              </div>

              {/* Products Table grid */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Cód. Peça</th>
                        <th className="p-4">Nome do Item</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço (R$)</th>
                        <th className="p-4">Disponibilidade</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500">
                            Nenhuma peça correspondente encontrada no filtro atual.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-850/20 group">
                            
                            {/* Code */}
                            <td className="p-4 font-mono font-bold text-slate-350">{product.code}</td>
                            
                            {/* Name */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {product.imageUrl ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0">
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <ShoppingBag className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-200 text-xs leading-snug">{product.name}</h4>
                                  <span className="text-[10px] text-slate-500 block mt-0.5">{product.subcategory}</span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4 uppercase tracking-wider text-[10px] font-semibold text-slate-400">
                              {product.category === 'hidraulica' ? '❄️ Frio' : '🧺 Obra'}
                            </td>

                            {/* Price */}
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-semibold">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={product.price.toFixed(2)}
                                  onBlur={(e) => handleQuickUpdatePrice(product.id, e.target.value)}
                                  className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 font-mono text-slate-100 font-bold focus:outline-none w-20 py-0.5"
                                  title="Aperte Tab ou clique fora para salvar preço"
                                />
                              </div>
                            </td>

                            {/* Availability */}
                            <td className="p-4">
                              <select
                                value={product.availability}
                                onChange={(e) => handleQuickUpdateAvailability(product.id, e.target.value as PartItem['availability'])}
                                className={`bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 font-bold text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  product.availability === 'Disponível em Estoque' ? 'text-emerald-400' :
                                  product.availability === 'Últimas Unidades' ? 'text-red-400' : 'text-amber-400'
                                }`}
                              >
                                <option className="text-emerald-400" value="Disponível em Estoque">Estoque OK</option>
                                <option className="text-amber-400" value="Sob Encomenda (Rápido)">Encomenda</option>
                                <option className="text-red-400" value="Últimas Unidades">Esgotando</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-center">
                              <div className="flex justify-center items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className="p-1.5 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                                  title="Editar Produto"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
                                  title="Remover Produto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Order Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-850 p-4.5 rounded-2xl">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                  {['all', 'Aprovado', 'Preparando Envio', 'Saiu para Entrega', 'Retirada Disponível', 'Concluído'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        orderStatusFilter === status ? 'bg-green-brand text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {status === 'all' ? 'Todos' : status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Buscar por cliente ou ID..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Order History Listing */}
              {filteredOrders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 text-xs">
                  Nenhum pedido localizado no filtro atual.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredOrders.slice().reverse().map((order) => {
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <div 
                        key={order.id} 
                        className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all ${
                          isExpanded ? 'border-blue-500/30 ring-1 ring-blue-500/10 shadow-lg' : 'border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        {/* Compact Header toggle */}
                        <div 
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-blue-400 font-mono text-sm">#{order.id}</span>
                            <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> {order.date}
                            </span>
                            <span className="text-slate-350 font-bold">{order.clientName}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              order.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              order.status === 'Preparando Envio' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              order.status === 'Saiu para Entrega' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              order.status === 'Retirada Disponível' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {order.status}
                            </span>

                            <span className="font-bold text-white font-mono">R$ {order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="bg-slate-950/50 border-t border-slate-850 p-5 space-y-5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              
                              {/* Client Details */}
                              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Contato do Cliente</span>
                                <h4 className="font-bold text-white flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" /> {order.clientName}</h4>
                                <p className="font-mono text-slate-400">TEL: {order.clientPhone}</p>
                                <p className="text-slate-400 truncate">EMAIL: {order.clientEmail}</p>
                              </div>

                              {/* Logistics Details */}
                              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Informações Logísticas</span>
                                <p className="font-semibold text-slate-200">Entrega: {order.deliveryMethod === 'pickup' ? '🛍️ Retirada em Loja' : '🚚 Envio para Endereço'}</p>
                                <p className="text-slate-400">Destino: {order.city} - {order.district}</p>
                                <p className="text-slate-400">Pagamento: <strong className="text-slate-350">{order.paymentMethod === 'pix' ? 'Pix à vista' : 'Cartão de Crédito'}</strong></p>
                              </div>

                            </div>

                            {/* Cart Items Details */}
                            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-1.5">Itens do Pedido</span>
                              <div className="divide-y divide-slate-850">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-2 first:pt-0">
                                    <div>
                                      <span className="font-bold text-slate-200">{item.quantity}x {item.name}</span>
                                      <span className="text-[10px] text-slate-500 font-mono block">Cód: {item.code}</span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-300">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="border-t border-slate-850 pt-2.5 flex flex-col items-end gap-1 font-mono text-[10px] text-slate-400">
                                <span>Subtotal: R$ {order.subtotal.toFixed(2)}</span>
                                <span>Frete: R$ {order.shippingFee.toFixed(2)}</span>
                                <span className="text-xs font-bold text-white font-sans border-t border-slate-800 pt-1.5 mt-1">Total Geral: R$ {order.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Administrative Controls */}
                            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alterar Status do Pedido:</span>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                  className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 font-bold text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="Aprovado">Aprovado</option>
                                  <option value="Preparando Envio">Preparando Envio</option>
                                  <option value="Saiu para Entrega">Saiu para Entrega</option>
                                  <option value="Retirada Disponível">Retirada Disponível</option>
                                  <option value="Concluído">Concluído</option>
                                </select>
                              </div>

                              <button
                                onClick={() => handleWhatsAppNotify(order)}
                                className="bg-slate-950 hover:bg-slate-850 text-white font-bold text-[10px] py-2 px-4 rounded-xl border border-slate-850 hover:border-slate-800 flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
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
          )}

          {/* TAB 4: SETTINGS & BACKUP */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              
              {/* Export Panel */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Exportar Backup Completo</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                      Baixe um arquivo JSON contendo todo o catálogo atualizado de produtos e o histórico de pedidos. Isso permite salvar os dados localmente.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportData}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Fazer Download do JSON
                </button>
              </div>

              {/* Import Panel */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-orange-accent mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Importar Backup JSON</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                      Restaure o inventário e o histórico de pedidos a partir de um arquivo JSON previamente exportado. <strong className="text-red-400">Aviso:</strong> Isso substituirá o catálogo atual!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Selecionar Arquivo JSON
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset Panel */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Redefinir Configurações de Fábrica</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                      Apague todas as edições, novos cadastros e exclusões efetuadas no inventário, e retorne o catálogo da loja para a versão padrão de fábrica.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetToDefaults}
                  className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-red-400 font-bold text-xs py-2.5 px-4 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Restabelecer Inventário Padrão
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* PRODUCT CREATION/EDITION FORM MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 font-sans bg-slate-950/85 backdrop-blur-sm">
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-left space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div>
                <h3 className="font-bold text-base text-white font-display">
                  {editingProduct ? 'Editar Peça' : 'Cadastrar Nova Peça'}
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  {editingProduct ? 'Altere as informações da peça cadastrada.' : 'Preencha os campos obrigatórios para expor o item no site.'}
                </p>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5 inline" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Row 1: Code and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cód. Peça (SKU) *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Ex: EMB-14-134"
                    disabled={!!editingProduct}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                    required
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Compressor Embraco 1/4 HP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Category and Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Categoria Principal *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as 'hidraulica' | 'obras' | 'teste')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="hidraulica">Materiais de Construção e Frio ❄️</option>
                    <option value="obras">Máquinas de Lavar 🧺</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subcategoria *</label>
                  <input
                    type="text"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="Ex: Compressores, Sensores"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Price and Stock Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status de Disponibilidade *</label>
                  <select
                    value={formAvailability}
                    onChange={(e) => setFormAvailability(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Disponível em Estoque">Disponível em Estoque</option>
                    <option value="Sob Encomenda (Rápido)">Sob Encomenda (Rápido)</option>
                    <option value="Últimas Unidades">Últimas Unidades (Estoque Baixo)</option>
                  </select>
                </div>
              </div>

              {/* Brands compatibility */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Marcas Compatíveis (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={formBrands}
                  onChange={(e) => setFormBrands(e.target.value)}
                  placeholder="Ex: Electrolux, Brastemp, Consul, Universal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Descrição Comercial</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Peça fabricada em cobre puro com alta tolerância à maresia do litoral..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Imagem do Produto</label>

                {formImageUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={formImageUrl}
                        alt="Preview do produto"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-2 right-2 bg-red-950/80 hover:bg-red-900 text-red-400 p-1.5 rounded-lg transition-colors"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Imagem salva junto com o produto. Clique no ícone acima para remover.
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-800 bg-slate-950 hover:border-blue-500/40 hover:bg-slate-900/50 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      {formImageLoading ? (
                        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mb-2" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-500 mb-2" />
                      )}
                      <span className="text-xs font-bold text-slate-300">
                        {formImageLoading ? 'Carregando...' : 'Clique para fazer upload'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        JPG, PNG ou WEBP · Máx. 2MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={formImageLoading}
                    />
                  </label>
                )}
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Save Controls */}
              <div className="border-t border-slate-850 pt-4 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-accent hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Salvar Produto
                </button>
              </div>

            </form>

          </div>
          
        </div>
      )}

    </div>
  );
}
