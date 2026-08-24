import { PartItem } from '../types';

const API_BASE = '/api';

export interface ApiProduct extends PartItem {
  isVisible?: boolean;
  featured?: boolean;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

function mapApiProductToPartItem(product: any): PartItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory || '',
    description: product.description || '',
    code: product.code,
    availability: product.availability || 'Disponível em Estoque',
    compatibleBrands: Array.isArray(product.compatibleBrands) ? product.compatibleBrands : [],
    price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0,
    imageUrl: product.imageUrl || undefined,
    rating: product.rating || 5.0,
    reviewsCount: product.reviewsCount || 1,
  };
}

function mapPartItemToApiBody(part: PartItem): any {
  return {
    name: part.name,
    code: part.code,
    category: part.category,
    subcategory: part.subcategory,
    description: part.description,
    price: part.price,
    stock: 0,
    compatibleBrands: part.compatibleBrands,
    imageUrl: part.imageUrl || '',
    availability: part.availability,
    isVisible: true,
    featured: false,
  };
}

async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON but received ${contentType}`);
  }
  return res.json();
}

const FETCH_TIMEOUT_MS = 2500;

function fetchWithTimeout(url: string, options?: RequestInit, timeout = FETCH_TIMEOUT_MS): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

export async function fetchProducts(): Promise<PartItem[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/products`);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    const data = await safeJson(res);
    return (data.products || []).map(mapApiProductToPartItem);
  } catch (err) {
    console.warn('Remote product fetch failed, returning empty list to use local fallback:', err);
    return [];
  }
}

export async function createProduct(part: PartItem): Promise<PartItem> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapPartItemToApiBody(part)),
  });
  if (!res.ok) {
    throw new Error(`Failed to create product: ${res.status}`);
  }
  const data = await safeJson(res);
  return mapApiProductToPartItem(data.product);
}

export async function updateProduct(part: PartItem): Promise<PartItem> {
  const res = await fetch(`${API_BASE}/products/${part.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapPartItemToApiBody(part)),
  });
  if (!res.ok) {
    throw new Error(`Failed to update product: ${res.status}`);
  }
  const data = await safeJson(res);
  return mapApiProductToPartItem(data.product);
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product: ${res.status}`);
  }
}

export async function uploadImage(base64Image: string, filename?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, filename }),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data.error || `Upload failed: ${res.status}`);
  }
  return data.url;
}
