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
      const product = await prisma.product.findUnique({
        where: { id: String(id) },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ product });
    }

    if (req.method === 'PUT') {
      const body = req.body;
      const product = await prisma.product.update({
        where: { id: String(id) },
        data: {
          name: body.name,
          description: body.description,
          category: body.category,
          subcategory: body.subcategory,
          code: body.code,
          price: body.price,
          stock: body.stock,
          compatibleBrands: body.compatibleBrands,
          imageUrl: body.imageUrl,
          isVisible: body.isVisible,
          featured: body.featured,
        },
      });
      return res.status(200).json({ product });
    }

    if (req.method === 'DELETE') {
      await prisma.product.delete({
        where: { id: String(id) },
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Product detail API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
