import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = getPrisma();
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const order = await prisma.order.findUnique({
          where: { id: String(id) },
          include: { items: true },
        });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
        return res.status(200).json({ order });
      }

      const { phone, email, status } = req.query;
      const orders = await prisma.order.findMany({
        where: {
          ...(phone && { customerPhone: String(phone) }),
          ...(email && { customerEmail: String(email) }),
          ...(status && { status: String(status) as any }),
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ orders });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: 'Erro interno', details: error?.message });
  }
}
