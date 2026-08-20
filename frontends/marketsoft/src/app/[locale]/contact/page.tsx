import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ContactPageContent } from '@/components/contact/contact-page-content';
import type { AppLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return buildMetadata(
    locale,
    '/contact',
    `${c.contact.hero.title} | MarketSoft`,
    c.contact.hero.description,
  );
}

export default async function ContactPage({
  params,
}: PageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const c = getMarketSoftCopy(locale);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  return (
    <ContactPageContent
      locale={locale}
      source="CONTACT_PAGE"
      copy={c.contact}
      whatsappNumber={whatsappNumber}
      originCode="marketsoft"
    />
  );
}
