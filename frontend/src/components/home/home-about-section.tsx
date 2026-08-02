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
};

const pillarIcons = [
  Blocks,
  ChartNoAxesCombined,
  Sparkles,
] as const;

export function HomeAboutSection({
  title,
  introduction,
  description,
  promiseLabel,
  promise,
  pillars,
  primaryCta,
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
<div
  className="home-about__content"
  data-reveal="right"
>
<h2
  id="home-about-title"
  data-reveal="up"
  data-reveal-delay="1"
>
            {title}
          </h2>

<p
  className="home-about__lead"
  data-reveal="up"
  data-reveal-delay="2"
>
            {introduction}
          </p>

<p
  className="home-about__description"
  data-reveal="up"
  data-reveal-delay="3"
>
            {description}
          </p>

<div
  className="home-about__actions"
  data-reveal="up"
  data-reveal-delay="4"
>
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
          </div>
        </div>

<div
  className="home-about__experience"
  data-reveal="left"
  data-reveal-delay="1"
>
<div
  className="home-about__promise"
  data-reveal="scale"
  data-reveal-delay="2"
>
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
  data-reveal="up"
  data-reveal-delay={
    String(
      Math.min(
        index + 3,
        6,
      ),
    )
  }
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