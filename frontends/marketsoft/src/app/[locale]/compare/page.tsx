import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
type Props={params:Promise<{locale:AppLocale}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;const c=getMarketSoftCopy(locale);return buildMetadata(locale,'/compare',`${c.compare.title} | MarketSoft`,c.compare.intro)}
export default async function Compare({params}:Props){const{locale}=await params;const c=getMarketSoftCopy(locale);return <div className="ms-page"><section className="ms-inner-hero"><div className="site-container"><span className="ms-eyebrow">{c.compare.eyebrow}</span><h1>{c.compare.title}</h1><p>{c.compare.intro}</p></div></section><section className="ms-section"><div className="site-container"><div className="ms-compare-wrap"><table className="ms-compare"><thead><tr><th>{c.compare.feature}</th>{c.packages.map(p=><th key={p.slug}>{p.name}</th>)}</tr></thead><tbody>{c.compare.rows.map(r=><tr key={r.label}><th>{r.label}</th>{r.values.map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table></div></div></section></div>}
