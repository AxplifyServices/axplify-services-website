'use client';

import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';

export function SiteHeader() {
  const locale = useLocale() as AppLocale;
  const copy = getMarketSoftCopy(locale);
  const pathname = usePathname();
  const router = useRouter();
  const [open,setOpen] = useState(false);
  const [languagesOpen,setLanguagesOpen] = useState(false);
  const nav = [
    ['/platform',copy.nav.platform],
    ['/packages',copy.nav.packages],
    ['/benefits',copy.nav.benefits],
    ['/compare',copy.nav.compare],
    ['/contact',copy.nav.contact]
  ] as const;
  const changeLocale = (next: AppLocale) => {
    router.replace(pathname, { locale: next });
    setLanguagesOpen(false); setOpen(false);
  };
  return <header className="ms-header">
    <div className="site-container ms-header__inner">
      <Link href="/" className="ms-header__brand" aria-label="MarketSoft">
        <Image src="/brand/marketsoft-logo-wordmark.png" alt="MarketSoft" width={260} height={80} priority />
      </Link>
      <nav className="ms-header__nav" aria-label="Navigation principale">
        {nav.map(([href,label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="ms-header__actions">
        <div className="ms-lang">
          <button type="button" onClick={()=>setLanguagesOpen(v=>!v)} aria-expanded={languagesOpen}>{locale.toUpperCase()} <ChevronDown size={15}/></button>
          {languagesOpen && <div className="ms-lang__menu">{(['fr','en','ar'] as AppLocale[]).map(item => <button key={item} type="button" onClick={()=>changeLocale(item)}>{item.toUpperCase()}</button>)}</div>}
        </div>
        <Link href="/order" className="ms-button ms-button--primary ms-header__cta">{copy.nav.order}</Link>
        <button type="button" className="ms-header__menu" onClick={()=>setOpen(v=>!v)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
      </div>
    </div>
    {open && <div className="ms-mobile-nav">
      <div className="site-container">
        {nav.map(([href,label]) => <Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
        <Link href="/order" className="ms-button ms-button--primary" onClick={()=>setOpen(false)}>{copy.nav.order}</Link>
      </div>
    </div>}
  </header>;
}
