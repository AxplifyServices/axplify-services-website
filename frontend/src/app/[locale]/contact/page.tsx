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

import {
  createPageMetadata,
} from '@/lib/seo';

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

  return createPageMetadata(
    locale,
    'contact',
    '/contact',
  );
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

  const publicEmail =
    process.env
      .NEXT_PUBLIC_CONTACT_EMAIL ??
    '';

  const publicPhone =
    process.env
      .NEXT_PUBLIC_CONTACT_PHONE ??
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
      publicEmail={
        publicEmail
      }
      publicPhone={
        publicPhone
      }
    />
  );
}