import {
  ArrowUpRight,
} from 'lucide-react';

import type {
  PublicProduct,
} from '@/lib/public-products-api';

type ProductCardProps = {
  product:
    PublicProduct;

  discoverLabel:
    string;

  compact?:
    boolean;
};

export function ProductCard({
  product,
  discoverLabel,
  compact = false,
}: ProductCardProps) {
  return (
    <article
      className="product-card"
      data-compact={
        compact
          ? 'true'
          : undefined
      }
    >
      <a
        href={
          product.linkUrl
        }
        className="product-card__link"
      >
        <div className="product-card__top">
          <span className="product-card__category">
            {product.category}
          </span>

          <span className="product-card__arrow">
            <ArrowUpRight
              size={19}
              aria-hidden="true"
            />
          </span>
        </div>

        <div className="product-card__identity">
          <span className="product-card__name">
            {product.name}
          </span>

          <h2>
            {product.title}
          </h2>
        </div>

        <p className="product-card__description">
          {product.description}
        </p>

        <div className="product-card__footer">
          <span>
            {discoverLabel}
          </span>

          <ArrowUpRight
            size={17}
            aria-hidden="true"
          />
        </div>
      </a>
    </article>
  );
}