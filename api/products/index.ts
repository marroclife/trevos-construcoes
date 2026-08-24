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
      const { category, brand, visible, search } = req.query;

      const products = await prisma.product.findMany({
        where: {
          isVisible: visible === 'false' ? false : true,
          ...(category && { category: String(category) }),
          ...(brand && {
            compatibleBrands: {
              has: String(brand),
            },
          }),
          ...(search && {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
              { code: { contains: String(search), mode: 'insensitive' } },
              { subcategory: { contains: String(search), mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ products });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const product = await prisma.product.create({
        data: {
          name: body.name,
          description: body.description || '',
          category: body.category,
          subcategory: body.subcategory || '',
          code: body.code,
          price: body.price,
          stock: body.stock ?? 0,
          compatibleBrands: body.compatibleBrands || [],
          imageUrl: body.imageUrl || '',
          isVisible: body.isVisible ?? true,
          featured: body.featured ?? false,
        },
      });
      return res.status(201).json({ product });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
