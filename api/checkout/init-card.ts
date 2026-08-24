import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Preference } from 'mercadopago';
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

function getMpClient() {
  if (!accessToken) throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
  return new MercadoPagoConfig({ accessToken });
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prisma = getPrisma();
  try {
    const { orderId, returnUrl, customer, items, shippingFee } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (!accessToken) {
      return res.status(200).json({ gatewayDisabled: true, message: 'Gateway desativado' });
    }

    const client = getMpClient();
    const preference = new Preference(client);

    const preferenceItems = items.map((item: any) => ({
      id: item.id,
      title: item.name,
      unit_price: round2(item.price),
      quantity: item.quantity,
      description: `Código: ${item.code}`,
    }));

    const notificationUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/webhooks/mercado-pago`
      : process.env.MERCADO_PAGO_WEBHOOK_URL || '';

    const preferenceResult = await preference.create({
      body: {
        items: preferenceItems,
        payer: {
          email: customer.email,
          name: customer.name,
          phone: { number: customer.phone.replace(/\D/g, '') },
        },
        back_urls: {
          success: `${returnUrl}/pedido/${orderId}/sucesso`,
          failure: `${returnUrl}/pedido/${orderId}/falha`,
          pending: `${returnUrl}/pedido/${orderId}/pendente`,
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: notificationUrl,
        shipments: { cost: round2(shippingFee || 0) },
      } as any,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { externalPaymentId: String(preferenceResult.id) },
    });

    return res.status(200).json({
      preferenceId: preferenceResult.id,
      initPoint: preferenceResult.init_point,
      sandboxInitPoint: preferenceResult.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('Init card checkout error:', error);
    return res.status(500).json({ error: 'Erro interno', details: error?.message });
  }
}
