import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const ordersAccessToken = process.env.MERCADO_PAGO_ORDERS_ACCESS_TOKEN || accessToken;

function getMpClient(token?: string) {
  const t = token || accessToken;
  if (!t) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
  }
  return new MercadoPagoConfig({ accessToken: t });
}

async function fetchPaymentFromSdk(id: string, token?: string): Promise<any | null> {
  try {
    const client = getMpClient(token);
    const paymentApi = new Payment(client);
    return await paymentApi.get({ id });
  } catch (err: any) {
    console.log(`Payment SDK fetch failed with token ${token ? 'fallback' : 'primary'}:`, err?.message || err);
    return null;
  }
}

async function fetchOrderFromApi(id: string, token?: string): Promise<any | null> {
  const t = token || ordersAccessToken;
  if (!t) return null;
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/orders/${id}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) {
      console.log(`Order API fetch failed: HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err: any) {
    console.log('Order API fetch error:', err?.message || err);
    return null;
  }
}

function mapPaymentStatus(status?: string): string {
  const paymentStatusMap: Record<string, string> = {
    approved: 'APPROVED',
    pending: 'PENDING',
    in_process: 'PENDING',
    in_mediation: 'PENDING',
    rejected: 'REJECTED',
    cancelled: 'REJECTED',
    refunded: 'REFUNDED',
  };
  return paymentStatusMap[status || ''] || 'PENDING';
}

function mapOrderStatus(status?: string): string {
  const orderStatusMap: Record<string, string> = {
    approved: 'APPROVED',
    pending: 'APPROVED',
    in_process: 'APPROVED',
    in_mediation: 'APPROVED',
    rejected: 'CANCELED',
    cancelled: 'CANCELED',
    refunded: 'CANCELED',
    action_required: 'APPROVED',
    waiting_transfer: 'APPROVED',
  };
  return orderStatusMap[status || ''] || 'APPROVED';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always acknowledge webhooks quickly
  res.status(200).json({ received: true });

  try {
    const topic = req.query.topic || req.query.type || req.body?.topic || req.body?.type;
    const entityId =
      req.query.id || req.query['data.id'] || req.body?.id || req.body?.data?.id;

    if (!entityId) {
      console.log('Webhook received without entity id');
      return;
    }

    const prisma = getPrisma();

    let orderId: string | undefined;
    let status: string | undefined;
    let externalPaymentId = String(entityId);

    if (topic === 'order') {
      // Orders API notification (PIX via Orders API)
      const orderData = await fetchOrderFromApi(String(entityId));
      if (orderData) {
        orderId = orderData.external_reference || orderData.id;
        status = orderData.status;
        externalPaymentId = orderData.id;
      }
    } else {
      // Default to payment topic (Payments API or payment inside an order)
      const paymentData =
        (await fetchPaymentFromSdk(String(entityId))) ||
        (await fetchPaymentFromSdk(String(entityId), ordersAccessToken));

      if (paymentData) {
        orderId = paymentData.external_reference || paymentData.order?.id;
        status = paymentData.status;
        externalPaymentId = String(entityId);
      } else {
        // Fallback: maybe the entityId is an order id even with topic=payment
        const orderData = await fetchOrderFromApi(String(entityId));
        if (orderData) {
          orderId = orderData.external_reference || orderData.id;
          status = orderData.status;
          externalPaymentId = orderData.id;
        }
      }
    }

    if (!orderId) {
      console.log('Webhook: no external_reference found');
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: mapPaymentStatus(status) as any,
        status: mapOrderStatus(status) as any,
        externalPaymentId,
      },
    });

    console.log(`Order ${orderId} updated via webhook. Status: ${status}`);
  } catch (error: any) {
    console.error('Webhook error:', error?.message || error);
  }
}
