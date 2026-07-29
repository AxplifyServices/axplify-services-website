import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

import {
  defineConfig,
  env,
} from 'prisma/config';

/**
 * Charge explicitement backend/.env.
 *
 * Cela évite que Prisma cherche le fichier .env dans la racine du monorepo
 * lorsque la commande est lancée depuis le package.json principal.
 */
loadEnv({
  path: resolve(__dirname, '.env'),
});

export default defineConfig({
  schema: resolve(__dirname, 'prisma/schema.prisma'),

  datasource: {
    url: env('DATABASE_URL'),
  },
});