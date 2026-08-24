import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
