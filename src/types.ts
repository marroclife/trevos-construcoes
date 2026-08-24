export interface PartItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  code: string;
  availability: 'Disponível em Estoque' | 'Sob Encomenda (Rápido)' | 'Últimas Unidades' | 'Pronta Retirada na Loja' | 'Entrega em até 24h';
  compatibleBrands: string[];
  price: number;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  antiMaresia?: boolean;
  unitLabel?: string;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface DiagnosticIssue {
  id: string;
  category: string;
  equipmentType: string;
  complaint: string;
  likelyCauses: string[];
  suggestedAction: string;
  requiredParts: string[];
  severity: 'Aviso Simples' | 'Requer Atenção' | 'Crítico - Risco de Perda';
}

export interface KitStage {
  id: string;
  title: string;
  icon: string;
  description: string;
  estimatedPrice: number;
  items: { name: string; qty: string; price: number }[];
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  serviceType: string;
  equipment: string;
  date: string;
  time: string;
  description: string;
  dischargeMethod?: string;
  accessType?: string;
  status: 'Novo' | 'Confirmado' | 'Concluído' | 'Cancelado';
  createdAt: string;
}

export interface CustomerBudget {
  name: string;
  phone: string;
  city: string;
  equipmentType: string;
  description: string;
  preferredTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  date: string;
  verified: boolean;
}

