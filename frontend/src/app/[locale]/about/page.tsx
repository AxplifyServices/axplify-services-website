import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';

import {PagePlaceholder} from '@/components/common/page-placeholder';
import type {AppLocale} from '@/i18n/routing';
import {createPageMetadata} from '@/lib/seo';

type PageProps = {
  params: Promise<{locale: AppLocale}>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {locale} = await params;

  return createPageMetadata(
    locale,
    'about',
    '/about',
  );
}

export default async function AboutPage({
  params,
}: PageProps) {
  const {locale} = await params;

  setRequestLocale(locale);

  return <PagePlaceholder namespace="about" />;
}