const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export type PublicContactRequestPayload = {
  source: 'CONTACT_PAGE' | 'PRODUCT_REQUEST';
  locale: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle?: string;
  needDescription?: string;
  phoneNumber: string;
  email: string;
  wantsAppointment?: boolean;
  privacyConsent: boolean;
  availabilities?: Array<{
    date: string;
    startTime?: string;
    endTime?: string;
  }>;
  website?: string;
};

export async function createPublicContactRequest(
  payload: PublicContactRequestPayload,
) {
  const response = await fetch(`${API_URL}/contact-requests/public`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message || 'Impossible d\'envoyer la demande de contact.',
    );
  }

  return body;
}
