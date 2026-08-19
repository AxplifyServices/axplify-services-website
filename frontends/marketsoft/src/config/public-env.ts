export const publicEnv = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  marketSoftProductKey:
    process.env.NEXT_PUBLIC_MARKETSOFT_PRODUCT_KEY ?? '',
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? '',
} as const;
