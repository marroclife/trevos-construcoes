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
  try {
    if (req.method === 'GET') {
      const { type } = req.query;
      const categories = await prisma.category.findMany({
        where: type ? { type: String(type) } : undefined,
        orderBy: { name: 'asc' },
      });
      return res.status(200).json({ categories });
    }

    if (req.method === 'POST') {
      const { name, type } = req.body;
      const category = await prisma.category.create({
        data: { name, type: type || 'outros' },
      });
      return res.status(201).json({ category });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
