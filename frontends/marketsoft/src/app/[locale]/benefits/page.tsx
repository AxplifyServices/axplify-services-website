import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
type Props={params:Promise<{locale:AppLocale}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;const c=getMarketSoftCopy(locale);return buildMetadata(locale,'/benefits',`${c.benefits.title} | MarketSoft`,c.benefits.intro)}
export default async function Benefits({params}:Props){const{locale}=await params;const c=getMarketSoftCopy(locale);return <div className="ms-page"><section className="ms-inner-hero"><div className="site-container"><span className="ms-eyebrow">{c.benefits.eyebrow}</span><h1>{c.benefits.title}</h1><p>{c.benefits.intro}</p></div></section><section className="ms-section"><div className="site-container ms-results-grid">{c.benefits.items.map((x,i)=><article key={x.title} data-reveal="up"><span>0{i+1}</span><h2>{x.title}</h2><p>{x.text}</p></article>)}</div></section></div>}
