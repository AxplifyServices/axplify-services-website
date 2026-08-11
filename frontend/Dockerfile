FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_CONTACT_PHONE

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=${NEXT_PUBLIC_WHATSAPP_NUMBER}
ENV NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL}
ENV NEXT_PUBLIC_CONTACT_PHONE=${NEXT_PUBLIC_CONTACT_PHONE}

ENV NODE_ENV=production

RUN npm run build


FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup \
    --system \
    --gid 1001 \
    nodejs \
  && adduser \
    --system \
    --uid 1001 \
    nextjs

COPY --from=builder \
  --chown=nextjs:nodejs \
  /app/public \
  ./public

COPY --from=builder \
  --chown=nextjs:nodejs \
  /app/.next/standalone \
  ./

COPY --from=builder \
  --chown=nextjs:nodejs \
  /app/.next/static \
  ./.next/static

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]