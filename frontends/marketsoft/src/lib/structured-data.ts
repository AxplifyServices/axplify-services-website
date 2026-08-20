import { getPathname } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { SITE_URL, SITE_NAME } from '@/lib/site-config';
import type { MarketSoftPackage } from '@/lib/marketsoft-content';

function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

/**
 * Extrait la valeur numérique d'un prix affiché ("20 000 MAD", "20,000 MAD",
 * "100 000 MAD"). Retourne null pour les prix sur devis ("Sur devis",
 * "Quote", "حسب الطلب") afin de ne jamais publier un prix numérique inventé
 * dans les données structurées.
 */
function parsePriceValue(value: string): number | null {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length > 0 ? Number(digits) : null;
}

export function createBreadcrumbStructuredData({
  locale,
  packagesLabel,
  packageName,
  packageSlug,
}: {
  locale: AppLocale;
  packagesLabel: string;
  packageName: string;
  packageSlug: string;
}) {
  const homeUrl = absoluteUrl(getPathname({ locale, href: '/' }));
  const packagesUrl = absoluteUrl(getPathname({ locale, href: '/packages' }));
  const packageUrl = absoluteUrl(
    getPathname({
      locale,
      href: { pathname: '/packages/[packageSlug]', params: { packageSlug } },
    }),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: homeUrl },
      { '@type': 'ListItem', position: 2, name: packagesLabel, item: packagesUrl },
      { '@type': 'ListItem', position: 3, name: packageName, item: packageUrl },
    ],
  };
}

export function createPackageProductStructuredData({
  locale,
  pkg,
}: {
  locale: AppLocale;
  pkg: MarketSoftPackage;
}) {
  const packageUrl = absoluteUrl(
    getPathname({
      locale,
      href: { pathname: '/packages/[packageSlug]', params: { packageSlug: pkg.slug } },
    }),
  );

  const price = parsePriceValue(pkg.firstYearPrice);

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: packageUrl,
    priceCurrency: 'MAD',
    availability: 'https://schema.org/InStock',
    // Formule sur devis (package "custom") : pas de prix fixe à publier.
    ...(price !== null ? { price } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${packageUrl}#product`,
    name: `MarketSoft — ${pkg.name}`,
    description: pkg.description,
    url: packageUrl,
    category: 'Business Software',
    brand: {
      '@type': 'Brand',
      name: 'MarketSoft',
    },
    offers: offer,
  };
}
