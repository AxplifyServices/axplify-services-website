const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export type ProductRequestType = 'CONTACT' | 'DEMO' | 'ORDER';

export type PublicProductRequestPayload = {
  productKey: string;
  requestType: ProductRequestType;
  locale: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  message?: string;
  sourceUrl?: string;
  privacyConsent: boolean;
  website?: string;
};

export async function createPublicProductRequest(
  payload: PublicProductRequestPayload,
) {
  const response = await fetch(`${API_URL}/product-requests/public`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message || 'Impossible d\'envoyer la demande produit.',
    );
  }

  return body;
}
