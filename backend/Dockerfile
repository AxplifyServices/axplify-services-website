FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Prisma 7 lit DATABASE_URL via prisma.config.ts.
# La génération du client n'a pas besoin de joindre réellement la base.
ENV DATABASE_URL=postgresql://axplify:build_only@127.0.0.1:5432/axplify_db

RUN npm run prisma:generate
RUN npm run build

# On retire les dépendances uniquement nécessaires au build.
RUN npm prune --omit=dev


FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main"]