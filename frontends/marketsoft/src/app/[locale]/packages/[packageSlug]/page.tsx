import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  ArrowRight,
  Check,
  LifeBuoy,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

import {
  getMarketSoftCopy,
  getPackage,
} from '@/lib/marketsoft-content';

import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{
    locale: AppLocale;
    packageSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, packageSlug } = await params;
  const pkg = getPackage(locale, packageSlug);

  if (!pkg) {
    return {};
  }

  return buildMetadata(
    locale,
    {
      pathname: '/packages/[packageSlug]',
      params: { packageSlug },
    },
    `${pkg.name} | MarketSoft`,
    pkg.target,
  );
}

export default async function PackageDetail({
  params,
}: Props) {
  const { locale, packageSlug } = await params;
  const c = getMarketSoftCopy(locale);
  const pkg = getPackage(locale, packageSlug);

  if (!pkg) {
    notFound();
  }

  const numericFirstYear = /\d/.test(pkg.firstYearPrice);
  const numericAnnual = /\d/.test(pkg.annualSupportPrice);
  const numericBase = /\d/.test(pkg.basePrice);
  const numericInitialSupport = /\d/.test(pkg.firstYearSupportPrice);

  return (
    <div className="ms-page ms-package-detail-page">
      <section className="ms-inner-hero ms-package-detail-hero">
        <div className="site-container">
          <span className="ms-eyebrow">
            {c.packageDetail.eyebrow}
          </span>

          <div className="ms-package-detail-hero__title-row">
            <h1>{pkg.name}</h1>

            <Link
              href={{
                pathname: '/order',
                query: {
                  package: pkg.slug,
                  intent: 'order',
                },
              }}
              className="ms-button ms-button--primary"
            >
              {c.packageActions.order}
              <ArrowRight size={16} />
            </Link>
          </div>

          <p className="ms-package-detail-hero__description">
            {pkg.target}
          </p>
        </div>
      </section>

      <section className="ms-package-overview">
        <div className="site-container">
          <div className="ms-package-overview__top">
            <article>
              <h2>{c.packageDetail.audienceTitle}</h2>

              <ul className="ms-check-list ms-check-list--compact">
                {pkg.audiences.map(item => (
                  <li key={item}>
                    <Check size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <h2>{c.packageDetail.outcomesTitle}</h2>

              <ul className="ms-check-list ms-check-list--compact">
                {pkg.outcomes.map(item => (
                  <li key={item}>
                    <Check size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="ms-package-overview__modules">
            <h2>{c.packageDetail.includedTitle}</h2>

            <div className="ms-module-grid ms-module-grid--compact">
              {pkg.modules.map(module => (
                <article key={module.title}>
                  <h3>{module.title}</h3>

                  <ul>
                    {module.items.map(item => (
                      <li key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ms-section ms-package-pricing-section">
        <div className="site-container">
          <div className="ms-section-head ms-section-head--wide">
            <h2>{c.pricing.title}</h2>
            <p>{c.pricing.intro}</p>
          </div>

          <div className="ms-pricing-breakdown">
            <article className="ms-pricing-breakdown__card">
              <span className="ms-pricing-breakdown__eyebrow">
                {c.pricing.firstYearLabel}
              </span>

              <strong
                className="ms-pricing-breakdown__total"
                dir={numericFirstYear ? 'ltr' : undefined}
              >
                {pkg.firstYearPrice}
              </strong>

              <p>{c.pricing.firstYearDescription}</p>

              <div className="ms-pricing-breakdown__line">
                <span>{c.pricing.basePriceLabel}</span>

                <strong dir={numericBase ? 'ltr' : undefined}>
                  {pkg.basePrice}
                </strong>
              </div>

              <div className="ms-pricing-breakdown__line">
                <span>{c.pricing.firstYearSupportLabel}</span>

                <strong dir={numericInitialSupport ? 'ltr' : undefined}>
                  {pkg.firstYearSupportPrice}
                </strong>
              </div>
            </article>

            <article className="ms-pricing-breakdown__card ms-pricing-breakdown__card--renewal">
              <span className="ms-pricing-breakdown__eyebrow">
                {c.pricing.annualLabel}
              </span>

              <strong
                className="ms-pricing-breakdown__total"
                dir={numericAnnual ? 'ltr' : undefined}
              >
                {pkg.annualSupportPrice}
              </strong>

              <p>{c.pricing.annualDescription}</p>
            </article>
          </div>

          <div className="ms-maintenance-grid">
            <article>
              <div className="ms-maintenance-grid__heading">
                <Wrench aria-hidden="true" />

                <div>
                  <h3>{c.pricing.maintenanceTitle}</h3>
                  <p>{c.pricing.maintenanceIntro}</p>
                </div>
              </div>

              <div className="ms-maintenance-list">
                {c.pricing.maintenanceItems.map(item => (
                  <div key={item.title}>
                    <ShieldCheck aria-hidden="true" />

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article>
              <div className="ms-maintenance-grid__heading">
                <LifeBuoy aria-hidden="true" />

                <div>
                  <h3>{c.pricing.supportTitle}</h3>
                  <p>{c.pricing.supportIntro}</p>
                </div>
              </div>

              <div className="ms-maintenance-list">
                {c.pricing.supportItems.map(item => (
                  <div key={item.title}>
                    <Check aria-hidden="true" />

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <p className="ms-pricing-exclusions">
            {c.pricing.exclusions}
          </p>
        </div>
      </section>
    </div>
  );
}
