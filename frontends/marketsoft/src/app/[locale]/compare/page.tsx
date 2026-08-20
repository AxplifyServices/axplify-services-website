import type {
  Metadata,
} from 'next';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getMarketSoftCopy,
} from '@/lib/marketsoft-content';

import {
  buildMetadata,
} from '@/lib/seo';

type Props = {
  params:
    Promise<{
      locale:
        AppLocale;
    }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  const c =
    getMarketSoftCopy(
      locale,
    );

  return buildMetadata(
    locale,
    '/compare',
    `${c.compare.title} | MarketSoft`,
    c.compare.intro,
  );
}

export default async function Compare({
  params,
}: Props) {
  const {
    locale,
  } =
    await params;

  const c =
    getMarketSoftCopy(
      locale,
    );

  return (
    <div className="ms-page">
      <section className="ms-inner-hero">
        <div className="site-container" data-reveal="up">
          <span className="ms-eyebrow">
            {c.compare.eyebrow}
          </span>

          <h1>
            {c.compare.title}
          </h1>

          <p>
            {c.compare.intro}
          </p>
        </div>
      </section>

      <section className="ms-section">
        <div className="site-container">
          <div className="ms-compare-wrap" data-reveal="up">
            <table className="ms-compare">
              <thead>
                <tr>
                  <th>
                    {c.compare.feature}
                  </th>

                  {c.packages.map(
                    pkg => (
                      <th key={pkg.slug}>
                        {pkg.level}
                        <span className="ms-compare__package-name">
                          {pkg.name}
                        </span>
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                <tr className="ms-compare__pricing-row">
                  <th>
                    {c.pricing.title}
                  </th>

                  {c.packages.map(
                    pkg => (
                      <td key={pkg.slug}>
                        {pkg.slug === 'custom' ? (
                          <strong className="ms-compare__quote">
                            {pkg.firstYearPrice}
                          </strong>
                        ) : (
                          <>
                            <span>
                              {c.pricing.firstYearShort}
                            </span>

                            <strong dir="ltr">
                              {pkg.firstYearPrice}
                            </strong>

                            <span>
                              {c.pricing.thenShort}
                            </span>

                            <strong dir="ltr">
                              {pkg.annualSupportPrice}
                            </strong>
                          </>
                        )}
                      </td>
                    ),
                  )}
                </tr>

                {c.compare.rows.map(
                  row => (
                    <tr key={row.label}>
                      <th>
                        {row.label}
                      </th>

                      {row.values.map(
                        (
                          value,
                          index,
                        ) => (
                          <td key={index}>
                            {value}
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
