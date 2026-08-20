import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type {
  MarketSoftPackage,
} from '@/lib/marketsoft-content';

export function PackageCard({
  pkg,
  actions,
  pricing,
}: {
  pkg: MarketSoftPackage;
  actions: {
    details: string;
    order: string;
  };
  pricing: {
    firstYearShort: string;
    thenShort: string;
  };
}) {
  const numericFirstYear =
    /\d/.test(
      pkg.firstYearPrice,
    );

  const numericAnnual =
    /\d/.test(
      pkg.annualSupportPrice,
    );

  return (
    <article
      className="ms-package-card"
      data-package={pkg.slug}
      data-reveal="up"
    >
      <div>
        <span className="ms-package-card__kicker">
          {pkg.level}
        </span>

        <h3>
          {pkg.name}
        </h3>

        <p>
          {pkg.description}
        </p>
      </div>

      <ul>
        {pkg.shortFeatures.map(
          item => (
            <li key={item}>
              <Check size={16} />
              {item}
            </li>
          ),
        )}
      </ul>

      <div className="ms-package-card__stats">
        {pkg.stats.map(stat => (
          <div className="ms-package-card__stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="ms-package-card__price ms-package-card__price--annual">
        {pkg.slug === 'custom' ? (
          <div className="ms-package-card__price-row ms-package-card__price-row--single">
            <strong>{pkg.firstYearPrice}</strong>
          </div>
        ) : (
          <>
            <div className="ms-package-card__price-row">
              <span>{pricing.firstYearShort}</span>
              <strong dir={numericFirstYear ? 'ltr' : undefined}>
                {pkg.firstYearPrice}
              </strong>
            </div>

            <div className="ms-package-card__price-row">
              <span>{pricing.thenShort}</span>
              <strong
                className="ms-package-card__renewal"
                dir={numericAnnual ? 'ltr' : undefined}
              >
                {pkg.annualSupportPrice}
              </strong>
            </div>
          </>
        )}
      </div>

      <div className="ms-package-card__actions">
        <Link
          href={{
            pathname:
              '/packages/[packageSlug]',
            params: {
              packageSlug:
                pkg.slug,
            },
          }}
          className="ms-button ms-button--ghost"
        >
          {actions.details}
          <ArrowRight size={16} />
        </Link>

        <Link
          href={{
            pathname:
              '/order',
            query: {
              package:
                pkg.slug,
              intent:
                'order',
            },
          }}
          className="ms-button ms-button--primary"
        >
          {actions.order}
        </Link>
      </div>
    </article>
  );
}
