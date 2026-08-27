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
const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;

function getMpClient(token?: string) {
  const t = token || accessToken;
  if (!t) throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
  return new MercadoPagoConfig({ accessToken: t });
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

interface CheckoutItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  price: number;
}

async function handleCreateCheckout(req: VercelRequest, res: VercelResponse) {
  const prisma = getPrisma();
  const {
    customer,
    deliveryMethod,
    city,
    district,
    items,
    shippingFee,
    paymentMethod,
  } = req.body;

  if (!customer?.name || !customer?.phone || !customer?.email) {
    return res.status(400).json({ error: 'Dados do cliente incompletos' });
  }

  const rawCpf = String(customer.cpf || '').replace(/\D/g, '');
  const validCpf = rawCpf.length === 11 ? rawCpf : '';
  const buildIdentification = () => {
    if (!validCpf) return undefined;
    return { type: 'CPF' as const, number: validCpf };
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  const safePaymentMethod = paymentMethod === 'card' ? 'card' : 'pix';
  const safeDeliveryMethod = deliveryMethod === 'pickup' ? 'pickup' : 'delivery';

  const subtotal = round2(
    items.reduce((acc: number, item: CheckoutItem) => acc + item.price * item.quantity, 0)
  );
  const safeShippingFee = round2(Number(shippingFee) || 0);
  const total = round2(subtotal + safeShippingFee);

  const productIds = items.map((i: CheckoutItem) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isVisible: true },
  });

  const missingIds = productIds.filter((id: string) => !products.find((p) => p.id === id));
  if (missingIds.length > 0) {
    return res.status(400).json({ error: 'Produtos inválidos ou indisponíveis', missingIds });
  }

  const order = await prisma.order.create({
    data: {
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      city: city || 'Angra dos Reis',
      district: district || (safeDeliveryMethod === 'pickup' ? 'Retirada em Loja' : ''),
      deliveryMethod: safeDeliveryMethod,
      paymentMethod: safePaymentMethod,
      paymentStatus: 'PENDING',
      status: 'APPROVED',
      shippingFee: safeShippingFee,
      subtotal,
      total,
      notes: `Pedido via ${safePaymentMethod.toUpperCase()} - FCV App`,
      items: {
        create: items.map((item: CheckoutItem) => ({
          productId: item.id,
          name: item.name,
          code: item.code,
          quantity: item.quantity,
          price: round2(item.price),
        })),
      },
    },
  });

  if (!accessToken || !publicKey) {
    return res.status(200).json({
      order,
      gatewayDisabled: true,
      message: 'Credenciais do Mercado Pago não configuradas. Pedido salvo como pendente.',
    });
  }

  const client = getMpClient();
  const preferenceItems = items.map((item: CheckoutItem) => ({
    id: item.id,
    title: item.name,
    unit_price: round2(item.price),
    quantity: item.quantity,
    description: `Código: ${item.code}`,
  }));

  const notificationUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/webhooks/mercado-pago`
    : process.env.MERCADO_PAGO_WEBHOOK_URL || '';

  if (safePaymentMethod === 'pix') {
    const ordersAccessToken = process.env.MERCADO_PAGO_ORDERS_ACCESS_TOKEN || accessToken;
    if (!ordersAccessToken) {
      return res.status(500).json({ error: 'Token de acesso do Mercado Pago não configurado' });
    }

    const payerEmail = process.env.MERCADO_PAGO_SANDBOX_BUYER_EMAIL || customer.email;
    const idempotencyKey = `fcv-pix-${order.id}-${Date.now()}`;

    const orderResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ordersAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        type: 'online',
        total_amount: String(total),
        external_reference: order.id,
        payer: {
          email: payerEmail,
          first_name: customer.name.split(' ')[0] || 'Cliente',
          last_name: customer.name.split(' ').slice(1).join(' ') || '',
        },
        transactions: {
          payments: [
            {
              amount: String(total),
              payment_method: { id: 'pix', type: 'bank_transfer' },
            },
          ],
        },
      }),
    });

    const orderResult: any = await orderResponse.json().catch(() => ({}));

    if (!orderResponse.ok) {
      console.error('Orders API PIX error:', orderResult);
      return res.status(500).json({
        error: 'Erro ao criar pagamento PIX',
        details: orderResult?.message || orderResult?.errors?.[0]?.message || `HTTP ${orderResponse.status}`,
      });
    }

    const pixPayment = orderResult.transactions?.payments?.[0];
    const pixData = pixPayment?.payment_method;

    await prisma.order.update({
      where: { id: order.id },
      data: { externalPaymentId: String(orderResult.id) },
    });

    return res.status(200).json({
      order,
      payment: {
        id: orderResult.id,
        paymentId: pixPayment?.id,
        status: orderResult.status,
        statusDetail: orderResult.status_detail,
        qrCode: pixData?.qr_code || '',
        qrCodeBase64: pixData?.qr_code_base64 || '',
        ticketUrl: pixData?.ticket_url || '',
        expirationDate: pixPayment?.date_of_expiration || '',
      },
    });
  }

  const preference = new Preference(client);
  const preferenceResult = await preference.create({
    body: {
      items: preferenceItems,
      payer: {
        email: customer.email,
        name: customer.name,
        phone: { number: customer.phone.replace(/\D/g, '') },
        ...(buildIdentification() ? { identification: buildIdentification() } : {}),
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || ''}/pedido/${order.id}/sucesso`,
        failure: `${process.env.FRONTEND_URL || ''}/pedido/${order.id}/falha`,
        pending: `${process.env.FRONTEND_URL || ''}/pedido/${order.id}/pendente`,
      },
      auto_return: 'approved',
      external_reference: order.id,
      notification_url: notificationUrl,
      shipments: { cost: safeShippingFee },
    } as any,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { externalPaymentId: String(preferenceResult.id) },
  });

  return res.status(200).json({
    order,
    preferenceId: preferenceResult.id,
    initPoint: preferenceResult.init_point,
    sandboxInitPoint: preferenceResult.sandbox_init_point,
  });
}

async function handleInitCard(req: VercelRequest, res: VercelResponse) {
  const prisma = getPrisma();
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action = 'create' } = req.body || {};
    if (action === 'init-card') {
      return await handleInitCard(req, res);
    }
    return await handleCreateCheckout(req, res);
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return res.status(500).json({
      error: 'Erro ao processar checkout',
      details: error?.message || 'Internal server error',
    });
  }
}
