import {
  permanentRedirect,
} from 'next/navigation';

import {
  getPathname,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export default async function AssistPage({
  params,
}: PageProps) {
  const {
    locale,
  } = await params;

  permanentRedirect(
    getPathname({
      locale,
      href: '/contact',
    }),
  );
}