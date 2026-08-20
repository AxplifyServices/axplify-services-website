import type { AppLocale } from '@/i18n/routing';
import type { ContactPageCopy } from '@/components/contact/contact-page-content';
import frContent from '@/messages/fr.json';
import enContent from '@/messages/en.json';
import arContent from '@/messages/ar.json';

export type PackageSlug = 'store' | 'advanced' | 'marketplace' | 'custom';

export type MarketSoftPackage = {
  slug: PackageSlug;
  level: string;
  name: string;
  target: string;
  price: string;
  basePrice: string;
  firstYearSupportPrice: string;
  firstYearPrice: string;
  annualSupportPrice: string;
  delay: string;
  shortFeatures: string[];
  audiences: string[];
  modules: { title: string; items: string[] }[];
  outcomes: string[];
  options: string[];
};

type Copy = {
  slogan: string;
  nav: { platform: string; packages: string; benefits: string; compare: string; faq: string; contact: string; order: string; demo: string };
  hero: { eyebrow: string; title: string; description: string; primary: string; secondary: string };
  homeBenefits: { title: string; description: string; items: { title: string; text: string }[] };
  packagesEyebrow: string;
  packagesTitle: string;
  packagesDescription: string;
  packageActions: { details: string; order: string; demo: string };
  packageDetail: { eyebrow: string; audienceTitle: string; outcomesTitle: string; includedTitle: string; optionsTitle: string };
  pricing: {
    firstYearShort: string;
    thenShort: string;
    perYearShort: string;
    title: string;
    intro: string;
    firstYearLabel: string;
    firstYearDescription: string;
    basePriceLabel: string;
    firstYearSupportLabel: string;
    annualLabel: string;
    annualDescription: string;
    maintenanceTitle: string;
    maintenanceIntro: string;
    maintenanceItems: { title: string; text: string }[];
    supportTitle: string;
    supportIntro: string;
    supportItems: { title: string; text: string }[];
    exclusions: string;
  };
  why: { title: string; items: { title: string; text: string }[] };
  finalCta: { title: string; text: string; order: string; expert: string };
  galleryControls: { previous: string; next: string; close: string; fullscreen: string; slide: string };
  platform: { eyebrow: string; title: string; intro: string; sections: { title: string; text: string; bullets: string[] }[]; galleryTitle: string; galleryText: string };
  benefits: { eyebrow: string; title: string; intro: string; items: { title: string; text: string }[] };
  compare: { eyebrow: string; title: string; intro: string; feature: string; rows: { label: string; values: string[] }[] };
  faq: { eyebrow: string; title: string; intro: string; items: { q: string; a: string }[] };
  contact: ContactPageCopy;
  order: { eyebrow: string; orderTitle: string; demoTitle: string; intro: string; fields: { firstName:string; lastName:string; company:string; email:string; phone:string; message:string; package:string; privacy:string }; submitOrder:string; submitDemo:string; success:string; missingKey:string; genericError:string };
  packages: MarketSoftPackage[];
};

export const MARKETSOFT_CONTENT = {
  fr: frContent,
  en: enContent,
  ar: arContent,
} as unknown as Record<AppLocale, Copy>;

export function getMarketSoftCopy(locale: AppLocale): Copy {
  return MARKETSOFT_CONTENT[locale] ?? MARKETSOFT_CONTENT.fr;
}

export function getPackage(locale: AppLocale, slug: string) {
  return getMarketSoftCopy(locale).packages.find((pkg) => pkg.slug === slug);
}
