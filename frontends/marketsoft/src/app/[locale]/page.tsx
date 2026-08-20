import type { Metadata } from 'next';
import {
  ArrowRight,
  Boxes,
  Layers3,
  LayoutTemplate,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  TrendingUp,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';
import { PackageCard } from '@/components/marketsoft/package-card';
import { ScreenshotGallery } from '@/components/marketsoft/screenshot-gallery';

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

const BENEFIT_ICONS = [ShoppingCart, Boxes, Store, TrendingUp] as const;
const WHY_ICONS = [SlidersHorizontal, ShieldCheck, LayoutTemplate, Layers3] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return buildMetadata(
    locale,
    '/',
    `${c.hero.title} | MarketSoft`,
    c.hero.description,
  );
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return (
    <div className="ms-page">
      <section className="ms-hero">
        <div className="site-container ms-hero__grid">
          <div className="ms-hero__copy" data-reveal="up">
            <span className="ms-eyebrow">{c.hero.eyebrow}</span>
            <h1>{c.hero.title}</h1>
            <p>{c.hero.description}</p>

            <div className="ms-actions">
              <a href="#packages" className="ms-button ms-button--primary">
                {c.hero.primary}
                <ArrowRight size={17} />
              </a>

              <Link href="/contact" className="ms-button ms-button--ghost">
                {c.hero.secondary}
              </Link>
            </div>
          </div>

          <div className="ms-hero__visual" data-reveal="left">
            <ScreenshotGallery locale={locale} />
          </div>
        </div>
      </section>

      <section className="ms-section ms-home-benefits">
        <div className="site-container">
          <div className="ms-section-head ms-section-head--wide">
            <h2>{c.homeBenefits.title}</h2>
            <p>{c.homeBenefits.description}</p>
          </div>

          <div className="ms-benefit-grid">
            {c.homeBenefits.items.map((item, index) => {
              const Icon = BENEFIT_ICONS[index] ?? TrendingUp;

              return (
                <article className="ms-benefit-card" key={item.title}>
                  <Icon aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="packages" className="ms-section ms-section--dark">
        <div className="site-container">
          <div className="ms-section-head ms-section-head--wide">
            <h2>{c.packagesTitle}</h2>
            <p>{c.packagesDescription}</p>
          </div>

          <div className="ms-package-grid">
            {c.packages.map((pkg) => (
              <PackageCard
                key={pkg.slug}
                pkg={pkg}
                actions={c.packageActions}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="ms-section">
        <div className="site-container">
          <div className="ms-section-head">
            <h2>{c.why.title}</h2>
          </div>

          <div className="ms-why-grid">
            {c.why.items.map((item, index) => {
              const Icon = WHY_ICONS[index] ?? Layers3;

              return (
                <article key={item.title}>
                  <span className="ms-why-grid__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ms-final-cta">
        <div className="site-container">
          <h2>{c.finalCta.title}</h2>
          <p>{c.finalCta.text}</p>

          <div className="ms-actions">
            <Link href="/order" className="ms-button ms-button--primary">
              {c.finalCta.order}
            </Link>

            <Link href="/contact" className="ms-button ms-button--ghost">
              {c.finalCta.expert}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
