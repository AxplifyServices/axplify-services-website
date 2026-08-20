import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
import { ScreenshotGallery } from '@/components/marketsoft/screenshot-gallery';
type Props={params:Promise<{locale:AppLocale}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;const c=getMarketSoftCopy(locale);return buildMetadata(locale,'/platform',`${c.platform.title} | MarketSoft`,c.platform.intro)}
export default async function Platform({params}:Props){const{locale}=await params;const c=getMarketSoftCopy(locale);return <div className="ms-page"><section className="ms-inner-hero"><div className="site-container"><span className="ms-eyebrow">{c.platform.eyebrow}</span><h1>{c.platform.title}</h1><p>{c.platform.intro}</p></div></section><section className="ms-section"><div className="site-container"><div className="ms-section-head"><h2>{c.platform.galleryTitle}</h2><p>{c.platform.galleryText}</p></div><ScreenshotGallery locale={locale}/></div></section><section className="ms-section ms-section--dark"><div className="site-container ms-platform-grid">{c.platform.sections.map(section=><article key={section.title} className="ms-platform-card" data-reveal="up"><h2>{section.title}</h2><p>{section.text}</p><ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div></section></div>}
