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
  ORGANIZATION_FACEBOOK_URL,
  ORGANIZATION_ID,
  ORGANIZATION_INSTAGRAM_URL,
  ORGANIZATION_LINKEDIN_URL,
  ORGANIZATION_LOGO_URL,
  ORGANIZATION_NAME,
  ORGANIZATION_PHONE,
  SITE_URL,
} from '@/lib/site-config';

import {
  AgentationDevtools,
} from '@/components/development/agentation-devtools';

import {
  FloatingContactButton,
} from '@/components/common/floating-contact-button';

import {
  ScrollRevealController,
} from '@/components/common/scroll-reveal-controller';

import {
  AnalyticsRouteTracker,
} from '@/components/analytics/analytics-route-tracker';

import {
  ConsentManager,
} from '@/components/analytics/consent-manager';

import {
  GoogleTagManager,
} from '@/components/analytics/google-tag-manager';

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

icons: {
  icon:
    '/brand/logo_axplify_-_V12_icone-removebg-preview.png',

  shortcut:
    '/brand/logo_axplify_-_V12_icone-removebg-preview.png',

  apple:
    '/brand/logo_axplify_-_V12_icone-removebg-preview.png',
},

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

const organizationDescription =
  locale === 'fr'
    ? 'Axplify Services accompagne les entreprises dans leur transformation digitale en combinant développement web et mobile, automatisation, data, intelligence artificielle, CRM, analytics et stratégie marketing.'
    : locale === 'ar'
      ? 'تساعد Axplify Services الشركات على تطوير أعمالها رقمياً من خلال تطوير تطبيقات الويب والهاتف والأتمتة والبيانات والذكاء الاصطناعي وإدارة علاقات العملاء والتحليلات والاستراتيجية التسويقية.'
      : 'Axplify Services helps businesses transform their operations through web and mobile development, automation, data, artificial intelligence, CRM, analytics and marketing strategy.';

const organizationStructuredData = {
  '@context':
    'https://schema.org',

  '@type':
    'Organization',

  '@id':
    ORGANIZATION_ID,

  name:
    ORGANIZATION_NAME,

  url:
    SITE_URL,

  logo:
    ORGANIZATION_LOGO_URL,

  description:
    organizationDescription,

  sameAs: [
    ORGANIZATION_FACEBOOK_URL,
    ORGANIZATION_INSTAGRAM_URL,
    ORGANIZATION_LINKEDIN_URL,
  ],

  contactPoint: {
    '@type':
      'ContactPoint',

    telephone:
      ORGANIZATION_PHONE,

    contactType:
      'sales',

    availableLanguage: [
      'French',
      'English',
      'Arabic',
    ],
  },
};      

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
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html:
        JSON.stringify(
          organizationStructuredData,
        ).replace(
          /</g,
          '\\u003c',
        ),
    }}
  />

<NextIntlClientProvider
  messages={
    messages
  }
>
<ConsentManager />

<GoogleTagManager />

<AnalyticsRouteTracker
  locale={
    locale
  }
/>

<ScrollRevealController />

  <div className="page-shell">
    <SiteHeader />

<main className="page-main">
  {
    children
  }
</main>

<FloatingContactButton />

<SiteFooter />
  </div>

  <AgentationDevtools />
</NextIntlClientProvider>
      </body>
    </html>
  );
}