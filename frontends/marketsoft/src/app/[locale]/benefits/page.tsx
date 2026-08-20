import type { Metadata } from 'next';
import {
  BarChart3,
  Building2,
  Clock3,
  Database,
  Link2,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  UsersRound,
} from 'lucide-react';

import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

const benefitIcons = [
  Store,
  Clock3,
  Sparkles,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  Database,
  UsersRound,
  Building2,
  ShieldCheck,
  PackageSearch,
  Link2,
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return buildMetadata(
    locale,
    '/benefits',
    `${c.benefits.title} | MarketSoft`,
    c.benefits.intro,
  );
}

export default async function Benefits({ params }: Props) {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return (
    <div className="ms-page">
      <section className="ms-inner-hero">
        <div className="site-container">
          <span className="ms-eyebrow">{c.benefits.eyebrow}</span>
          <h1>{c.benefits.title}</h1>
          <p>{c.benefits.intro}</p>
        </div>
      </section>

      <section className="ms-section ms-benefits-section">
        <div className="site-container ms-results-grid">
          {c.benefits.items.map((item, index) => {
            const Icon = benefitIcons[index] ?? Sparkles;

            return (
              <article key={item.title} className="ms-result-card" data-reveal="up">
                <div className="ms-result-card__top">
                  <div className="ms-result-card__icon" aria-hidden="true">
                    <Icon />
                  </div>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
