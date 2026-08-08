import {
  ArrowRight,
} from 'lucide-react';

import {
  ProductCard,
} from '@/components/products/product-card';

import {
  Link,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import type {
  PublicProduct,
} from '@/lib/public-products-api';

type HomeProductsSectionProps = {
  locale:
    AppLocale;

  products:
    PublicProduct[];

  eyebrow:
    string;

  title:
    string;

  description:
    string;

  discoverLabel:
    string;

  viewAllLabel:
    string;
};

export function HomeProductsSection({
  locale,
  products,
  eyebrow,
  title,
  description,
  discoverLabel,
  viewAllLabel,
}: HomeProductsSectionProps) {
  if (
    products.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      className="home-products"
      dir={
        locale ===
        'ar'
          ? 'rtl'
          : 'ltr'
      }
    >
      <div className="site-container">
        <header
          className="home-products__heading"
          data-reveal="up"
        >
          <div className="home-products__heading-copy">
            <span className="home-products__eyebrow">
              {eyebrow}
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>

          <Link
            href="/products"
            className="home-products__view-all"
          >
            <span>
              {viewAllLabel}
            </span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </header>

        <div
          className="home-products__grid"
          data-reveal="up"
        >
          {products.map(
            product => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
                discoverLabel={
                  discoverLabel
                }
                compact
              />
            ),
          )}
        </div>

        <div className="home-products__mobile-footer">
          <Link
            href="/products"
            className="home-products__view-all"
          >
            <span>
              {viewAllLabel}
            </span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}