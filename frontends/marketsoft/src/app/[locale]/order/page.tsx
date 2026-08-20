import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
import { ProductRequestForm } from '@/components/marketsoft/product-request-form';
type Props={params:Promise<{locale:AppLocale}>;searchParams:Promise<{package?:string;intent?:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;const c=getMarketSoftCopy(locale);return {...buildMetadata(locale,'/order',`${c.order.orderTitle} | MarketSoft`,c.order.intro),robots:{index:false,follow:true}}}
export default async function Order({params,searchParams}:Props){const{locale}=await params;const q=await searchParams;const intent=q.intent==='demo'?'demo':'order';const c=getMarketSoftCopy(locale);return <div className="ms-page ms-order-page"><section className="ms-inner-hero"><div className="site-container"><span className="ms-eyebrow">{c.order.eyebrow}</span><h1>{intent==='demo'?c.order.demoTitle:c.order.orderTitle}</h1><p>{c.order.intro}</p></div></section><section className="ms-section"><div className="site-container ms-request-shell"><ProductRequestForm locale={locale} initialPackage={q.package} intent={intent}/></div></section></div>}
