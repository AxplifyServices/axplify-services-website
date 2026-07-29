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
    'products',
    '/products',
  );
}

export default async function ProductsPage({
  params,
}: PageProps) {
  const {locale} = await params;

  setRequestLocale(locale);

  return <PagePlaceholder namespace="products" />;
}