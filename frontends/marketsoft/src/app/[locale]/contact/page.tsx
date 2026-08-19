import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ContactPageContent,
} from '@/components/contact/contact-page-content';

import type {
  ContactPageCopy,
} from '@/components/contact/contact-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import { buildMetadata } from '@/lib/seo';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;
    }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  const c = getMarketSoftCopy(locale);
  return buildMetadata(locale, '/contact', `Contact | MarketSoft`, c.finalCta.text);
}

export default async function ContactPage({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const translations =
    await getTranslations({
      locale,

      namespace:
        'pages.contact',
    });

  const copy =
    translations.raw(
      'content',
    ) as ContactPageCopy;

  const whatsappNumber =
    process.env
      .NEXT_PUBLIC_WHATSAPP_NUMBER ??
    '';

  return (
    <ContactPageContent
      locale={
        locale
      }
      source="CONTACT_PAGE"
      copy={
        copy
      }
      whatsappNumber={
        whatsappNumber
      }
    />
  );
}