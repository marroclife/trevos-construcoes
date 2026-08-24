import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Deleting order items...');
  const deletedItems = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${deletedItems.count} order items`);

  console.log('Deleting orders...');
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} orders`);

  console.log('Deleting all existing products...');
  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} products`);

  console.log('Creating "Moeda do Infinito"...');
  const product = await prisma.product.create({
    data: {
      name: 'Moeda do Infinito',
      description: 'Item de teste para validação de checkout Frio Costa Verde',
      category: 'teste',
      subcategory: 'checkout',
      code: 'MOEDA-INFINITO-001',
      price: 0.01,
      stock: 9999,
      compatibleBrands: [],
      imageUrl: '',
      isVisible: true,
      featured: true,
    },
  });

  console.log('Created product:', product);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Error:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
