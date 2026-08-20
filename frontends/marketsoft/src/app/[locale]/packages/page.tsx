import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
import { PackageCard } from '@/components/marketsoft/package-card';
type Props={params:Promise<{locale:AppLocale}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;const c=getMarketSoftCopy(locale);return buildMetadata(locale,'/packages',`${c.packagesTitle} | MarketSoft`,c.packagesDescription)}
export default async function Packages({params}:Props){const{locale}=await params;const c=getMarketSoftCopy(locale);return <div className="ms-page"><section className="ms-inner-hero ms-packages-list-hero"><div className="site-container" data-reveal="up"><span className="ms-eyebrow">{c.packagesEyebrow}</span><h1>{c.packagesTitle}</h1><p>{c.packagesDescription}</p></div></section><section className="ms-section ms-section--dark"><div className="site-container ms-package-grid">{c.packages.map(pkg=><PackageCard key={pkg.slug} pkg={pkg} actions={c.packageActions} pricing={c.pricing} multilingualLabel={c.packageMultilingualLabel}/>)}</div></section></div>}
