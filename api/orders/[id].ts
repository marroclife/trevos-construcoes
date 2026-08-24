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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prisma = getPrisma();
  const { id } = req.query;

  try {
    const order = await prisma.order.findUnique({
      where: { id: String(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    return res.status(200).json({ order });
  } catch (error: any) {
    console.error('Order detail error:', error);
    return res.status(500).json({ error: 'Erro interno', details: error?.message });
  }
}
