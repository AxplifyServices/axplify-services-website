import type {
  Metadata,
} from 'next';

import {
  NextIntlClientProvider,
  hasLocale,
} from 'next-intl';

import {
  getMessages,
  setRequestLocale,
} from 'next-intl/server';

import {
  notFound,
} from 'next/navigation';

import {
  SiteFooter,
} from '@/components/layout/site-footer';

import {
  SiteHeader,
} from '@/components/layout/site-header';

import {
  routing,
} from '@/i18n/routing';

import {
  SITE_URL,
} from '@/lib/site-config';

import {
  AgentationDevtools,
} from '@/components/development/agentation-devtools';

import '../globals.css';

export const metadata: Metadata = {
  metadataBase:
    new URL(
      SITE_URL,
    ),

  title: {
    default:
      'Axplify Services',

    template:
      '%s | Axplify Services',
  },

  description:
    'Axplify Services accompagne les entreprises dans leur transformation digitale, l’automatisation, la data et l’intelligence artificielle.',

  applicationName:
    'Axplify Services',

  authors: [
    {
      name:
        'Axplify Services',
    },
  ],

  creator:
    'Axplify Services',

  publisher:
    'Axplify Services',

  robots: {
    index:
      true,

    follow:
      true,
  },
};

export function generateStaticParams() {
  return routing.locales.map(
    (
      locale,
    ) => ({
      locale,
    }),
  );
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children:
    React.ReactNode;

  params:
    Promise<{
      locale: string;
    }>;
}>) {
  const {
    locale,
  } =
    await params;

  if (
    !hasLocale(
      routing.locales,
      locale,
    )
  ) {
    notFound();
  }

  setRequestLocale(
    locale,
  );

  const messages =
    await getMessages();

  const direction =
    locale === 'ar'
      ? 'rtl'
      : 'ltr';

  return (
    <html
      lang={
        locale
      }
      dir={
        direction
      }
      suppressHydrationWarning
    >
      <body>
<NextIntlClientProvider
  messages={
    messages
  }
>
  <div className="page-shell">
    <SiteHeader />

    <main className="page-main">
      {
        children
      }
    </main>

    <SiteFooter />
  </div>

  <AgentationDevtools />
</NextIntlClientProvider>
      </body>
    </html>
  );
}