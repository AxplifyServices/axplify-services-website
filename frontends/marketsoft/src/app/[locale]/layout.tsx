import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { FloatingContactButton } from '@/components/layout/floating-contact-button';
import { routing } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { AgentationDevtools } from '@/components/development/agentation-devtools';
import { ScrollRevealController } from '@/components/common/scroll-reveal-controller';
import { AnalyticsRouteTracker } from '@/components/analytics/analytics-route-tracker';
import { ConsentManager } from '@/components/analytics/consent-manager';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { SITE_NAME, SITE_SLOGAN, SITE_URL, MARKETSOFT_FACEBOOK_URL, MARKETSOFT_INSTAGRAM_URL, MARKETSOFT_LINKEDIN_URL } from '@/lib/site-config';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_SLOGAN}`, template: `%s | ${SITE_NAME}` },
  description: 'MarketSoft centralise la commercialisation de produits et services, les ventes, réservations, paiements et opérations dans une plateforme commerce évolutive.',
  applicationName: SITE_NAME,
  icons: { icon:'/brand/marketsoft-icon.png', shortcut:'/brand/marketsoft-icon.png', apple:'/brand/marketsoft-icon.png' },
  robots:{index:true,follow:true}
};
export function generateStaticParams(){return routing.locales.map(locale=>({locale}));}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params; if(!hasLocale(routing.locales,locale))notFound(); setRequestLocale(locale); const messages=await getMessages(); const dir=locale==='ar'?'rtl':'ltr'; const copy=getMarketSoftCopy(locale as AppLocale);
 const structured={
  '@context':'https://schema.org',
  '@graph':[
    {
      '@type':'Organization',
      '@id':`${SITE_URL.replace(/\/$/,'')}#organization`,
      name:'Axplify Services',
      url:'https://axplify-services.com',
      logo:new URL('/brand/marketsoft-icon.png', SITE_URL).toString(),
      sameAs:[MARKETSOFT_FACEBOOK_URL, MARKETSOFT_INSTAGRAM_URL, MARKETSOFT_LINKEDIN_URL]
    },
    {
      '@type':'WebSite',
      '@id':`${SITE_URL.replace(/\/$/,'')}#website`,
      name:SITE_NAME,
      url:SITE_URL,
      inLanguage:['fr','en','ar'],
      publisher:{'@id':`${SITE_URL.replace(/\/$/,'')}#organization`}
    },
    {
      '@type':'SoftwareApplication',
      '@id':`${SITE_URL.replace(/\/$/,'')}#software`,
      name:SITE_NAME,
      applicationCategory:'BusinessApplication',
      operatingSystem:'Web',
      url:SITE_URL,
      description:'Commerce operating platform for products and services, including sales, bookings, payments, operations and marketplace models.',
      provider:{'@id':`${SITE_URL.replace(/\/$/,'')}#organization`}
    }
  ]
};
 return <html lang={locale} dir={dir} suppressHydrationWarning><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/><NextIntlClientProvider messages={messages}><ConsentManager/><GoogleTagManager/><AnalyticsRouteTracker locale={locale}/><ScrollRevealController/><div className="page-shell"><SiteHeader/><main className="page-main">{children}</main><Suspense fallback={null}><FloatingContactButton label={copy.nav.contact}/></Suspense><SiteFooter/></div><AgentationDevtools/></NextIntlClientProvider></body></html>
}
