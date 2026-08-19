import type { MetadataRoute } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { MARKETSOFT_CONTENT } from '@/lib/marketsoft-content';
import { publicPageHrefs, SITE_URL } from '@/lib/site-config';
const absolute=(p:string)=>new URL(p,SITE_URL).toString();
export default function sitemap():MetadataRoute.Sitemap{const staticEntries=publicPageHrefs.flatMap(href=>{const languages=Object.fromEntries(routing.locales.map(locale=>[locale,absolute(getPathname({locale,href}))]));return routing.locales.map(locale=>({url:languages[locale],changeFrequency:'monthly' as const,priority:href==='/'?1:0.75,alternates:{languages}}))});const packageEntries=MARKETSOFT_CONTENT.fr.packages.flatMap(pkg=>{const languages=Object.fromEntries(routing.locales.map(locale=>[locale,absolute(getPathname({locale,href:{pathname:'/packages/[packageSlug]',params:{packageSlug:pkg.slug}}}))]));return routing.locales.map(locale=>({url:languages[locale],changeFrequency:'monthly' as const,priority:0.8,alternates:{languages}}))});return[...staticEntries,...packageEntries]}
