import {
  ArrowRight,
  Blocks,
  ChartNoAxesCombined,
  Sparkles,
} from 'lucide-react';

import {
  Link,
} from '@/i18n/navigation';

type HomeAboutSectionProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  description: string;
  promiseLabel: string;
  promise: string;
  pillars: Array<{
    title: string;
    description: string;
  }>;
  primaryCta: string;
  secondaryCta: string;
};

const pillarIcons = [
  Blocks,
  ChartNoAxesCombined,
  Sparkles,
] as const;

export function HomeAboutSection({
  eyebrow,
  title,
  introduction,
  description,
  promiseLabel,
  promise,
  pillars,
  primaryCta,
  secondaryCta,
}: HomeAboutSectionProps) {
  return (
    <section
      className="home-about"
      aria-labelledby="home-about-title"
    >
      <div
        className="home-about__background"
        aria-hidden="true"
      >
        <span className="home-about__orb home-about__orb--cyan" />
        <span className="home-about__orb home-about__orb--violet" />
        <span className="home-about__grid" />
      </div>

      <div className="site-container home-about__container">
        <div className="home-about__content">
          <p className="eyebrow">
            {eyebrow}
          </p>

          <h2 id="home-about-title">
            {title}
          </h2>

          <p className="home-about__lead">
            {introduction}
          </p>

          <p className="home-about__description">
            {description}
          </p>

          <div className="home-about__actions">
            <Link
              href="/about"
              className="button button--primary home-about__primary-cta"
            >
              <span>
                {primaryCta}
              </span>

              <ArrowRight
                size={18}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/assist"
              className="home-about__secondary-cta"
            >
              <span>
                {secondaryCta}
              </span>

              <ArrowRight
                size={17}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="home-about__experience">
          <div className="home-about__promise">
            <p className="home-about__promise-label">
              {promiseLabel}
            </p>

            <p className="home-about__promise-text">
              {promise}
            </p>
          </div>

          <div className="home-about__pillars">
            {pillars.map(
              (
                pillar,
                index,
              ) => {
                const Icon =
                  pillarIcons[
                    index %
                    pillarIcons.length
                  ];

                return (
                  <article
                    key={pillar.title}
                    className="home-about__pillar"
                  >
                    <div
                      className="home-about__pillar-icon"
                      aria-hidden="true"
                    >
                      <Icon
                        size={21}
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <h3>
                        {pillar.title}
                      </h3>

                      <p>
                        {pillar.description}
                      </p>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}