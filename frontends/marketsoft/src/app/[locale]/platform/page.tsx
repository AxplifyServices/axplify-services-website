import type { Metadata } from 'next';
import {
  BarChart3,
  Boxes,
  CalendarCheck2,
  CreditCard,
  Globe2,
  Megaphone,
  PackageCheck,
  Plug,
  ShieldCheck,
  Store,
  Tags,
  UsersRound,
  Check,
} from 'lucide-react';

import { ScreenshotGallery } from '@/components/marketsoft/screenshot-gallery';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

const platformIcons = [
  Tags,
  CreditCard,
  PackageCheck,
  Megaphone,
  UsersRound,
  Boxes,
  Store,
  BarChart3,
  CalendarCheck2,
  ShieldCheck,
  Plug,
  Globe2,
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return buildMetadata(
    locale,
    '/platform',
    `${c.platform.title} | MarketSoft`,
    c.platform.intro,
  );
}

export default async function Platform({ params }: Props) {
  const { locale } = await params;
  const c = getMarketSoftCopy(locale);

  return (
    <div className="ms-page">
      <section className="ms-inner-hero ms-platform-hero">
        <div className="site-container" data-reveal="up">
          <span className="ms-eyebrow">{c.platform.eyebrow}</span>
          <h1>{c.platform.title}</h1>
          <p>{c.platform.intro}</p>
        </div>
      </section>

      <section className="ms-section ms-section--gallery">
        <div className="site-container">
          <div className="ms-section-head" data-reveal="up">
            <h2>{c.platform.galleryTitle}</h2>
            <p>{c.platform.galleryText}</p>
          </div>
          <div data-reveal="scale">
            <ScreenshotGallery locale={locale} />
          </div>
        </div>
      </section>

      <section className="ms-section ms-section--dark">
        <div className="site-container ms-platform-grid">
          {c.platform.sections.map((section, index) => {
            const Icon = platformIcons[index] ?? Boxes;

            return (
              <article key={section.title} className="ms-platform-card" data-reveal="up" data-reveal-delay={String((index % 3) + 1)}>
                <div className="ms-platform-card__icon" aria-hidden="true">
                  <Icon />
                </div>
                <div className="ms-platform-card__content">
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                  <ul>
                    {section.bullets.map((item) => (
                      <li key={item}>
                        <Check aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
