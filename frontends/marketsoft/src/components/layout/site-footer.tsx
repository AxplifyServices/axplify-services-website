import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { AXPLIFY_URL } from '@/lib/site-config';
import { CookiePreferencesButton } from '@/components/analytics/cookie-preferences-button';

export async function SiteFooter() {
  const locale = await getLocale() as AppLocale;
  const copy = getMarketSoftCopy(locale);
  const nav = [['/platform',copy.nav.platform],['/packages',copy.nav.packages],['/benefits',copy.nav.benefits],['/compare',copy.nav.compare],['/faq',copy.nav.faq],['/contact',copy.nav.contact]] as const;
  const cookieLabel = locale==='fr'?'Préférences cookies':locale==='ar'?'تفضيلات ملفات الارتباط':'Cookie preferences';
  const developed = locale==='fr'?'Développé par':locale==='ar'?'تم التطوير بواسطة':'Developed by';
  return <footer className="ms-footer">
    <div className="site-container ms-footer__grid">
      <div className="ms-footer__brand">
        <Image src="/brand/marketsoft-logo-wordmark.png" alt="MarketSoft" width={280} height={86}/>
        <p>{copy.slogan}</p>
      </div>
      <div className="ms-footer__links">{nav.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</div>
      <div className="ms-footer__cta"><Link href="/order" className="ms-button ms-button--primary">{copy.nav.order}</Link>
      <Link href="/contact" className="ms-button ms-button--ghost">{copy.nav.demo}</Link>
      </div>
    </div>
    <div className="site-container ms-footer__bottom">
      <span>© {new Date().getFullYear()} MarketSoft</span>
      <CookiePreferencesButton label={cookieLabel}/>
      <a href={AXPLIFY_URL} target="_blank" rel="noreferrer" className="ms-footer__axplify">
        <span>{developed}</span>
      <Image
  src="/brand/logo_axplify_-_V1_icone-removebg-preview.png"
  alt="Axplify Services"
  width={42}
  height={42}
/>
      </a>
    </div>
  </footer>;
}
