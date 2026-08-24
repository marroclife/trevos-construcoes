import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PARTS_LIST } from '../src/data/mockData';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⏳ Seeding database...');

  for (const part of PARTS_LIST) {
    await prisma.product.upsert({
      where: { code: part.code },
      update: {},
      create: {
        name: part.name,
        description: part.description,
        category: part.category,
        subcategory: part.subcategory,
        code: part.code,
        price: part.price,
        stock: part.availability === 'Últimas Unidades' ? 2 : 10,
        compatibleBrands: part.compatibleBrands,
        imageUrl: part.imageUrl || '',
        isVisible: true,
      },
    });
  }

  const categories = [
    { name: 'Compressores', type: 'refrigeracao' },
    { name: 'Termostatos', type: 'refrigeracao' },
    { name: 'Sensores e Elétrica', type: 'refrigeracao' },
    { name: 'Vedações', type: 'refrigeracao' },
    { name: 'Ventilação', type: 'refrigeracao' },
    { name: 'Tubulação e Cobre', type: 'refrigeracao' },
    { name: 'Bombas d\'Água', type: 'lavadora' },
    { name: 'Mecânica e Transmissão', type: 'lavadora' },
    { name: 'Placas Eletrônicas', type: 'lavadora' },
    { name: 'Acessórios Plásticos', type: 'lavadora' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const brands = [
    'Electrolux', 'Brastemp', 'Consul', 'Samsung', 'LG',
    'Metalfrio', 'Gelopar', 'Continental', 'Midea', 'Panasonic',
    'Universal', 'Todas as Marcas', 'Geral', 'Frigobar'
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand },
      update: {},
      create: { name: brand },
    });
  }

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
