import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
type Props={params:Promise<{locale:AppLocale}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;const c=getMarketSoftCopy(locale);return buildMetadata(locale,'/faq',`${c.faq.title} | MarketSoft`,c.faq.intro)}
export default async function Faq({params}:Props){const{locale}=await params;const c=getMarketSoftCopy(locale);const jsonLd={'@context':'https://schema.org','@type':'FAQPage',mainEntity:c.faq.items.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))};return <div className="ms-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/><section className="ms-inner-hero"><div className="site-container"><span className="ms-eyebrow">{c.faq.eyebrow}</span><h1>{c.faq.title}</h1><p>{c.faq.intro}</p></div></section><section className="ms-section"><div className="site-container ms-faq-list">{c.faq.items.map(x=><details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div></section></div>}
