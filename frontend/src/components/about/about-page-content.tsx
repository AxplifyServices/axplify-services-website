import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  ChartNoAxesCombined,
  Compass,
  Layers3,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react';

import {
  Link,
} from '@/i18n/navigation';

type AboutPageContentProps = {
hero: {
  eyebrow: string;
  title: string;
  introduction: string;
  description: string;
  secondaryCta: string;
};

  story: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    statement: string;
  };

  mission: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };

  model: {
    eyebrow: string;
    title: string;
    description: string;
    activities: Array<{
      number: string;
      title: string;
      description: string;
      linkLabel: string;
      href:
        | '/services'
        | '/products';
    }>;
  };

  values: {
    eyebrow: string;
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };

finalCta: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
};
};

const missionIcons = [
  Compass,
  Layers3,
  BrainCircuit,
] as const;

const valueIcons = [
  Target,
  Lightbulb,
  ChartNoAxesCombined,
  Sparkles,
] as const;

export function AboutPageContent({
  hero,
  story,
  mission,
  model,
  values,
  finalCta,
}: AboutPageContentProps) {
  return (
    <div className="about-page">
      <section
        className="about-hero"
        aria-labelledby="about-page-title"
      >
        <div
          className="about-hero__background"
          aria-hidden="true"
        >
          <span className="about-hero__orb about-hero__orb--cyan" />
          <span className="about-hero__orb about-hero__orb--violet" />
          <span className="about-hero__grid" />
        </div>

        <div className="site-container about-hero__container">
          <div className="about-hero__content">
            <p className="eyebrow">
              {hero.eyebrow}
            </p>

            <h1 id="about-page-title">
              {hero.title}
            </h1>

            <p className="about-hero__lead">
              {hero.introduction}
            </p>

            <p className="about-hero__description">
              {hero.description}
            </p>

<div className="about-hero__actions">
  <Link
    href="/about/work-process"
    className="about-hero__secondary-link"
  >
    <span>
      {hero.secondaryCta}
    </span>

    <ArrowRight
      size={17}
      strokeWidth={2.2}
      aria-hidden="true"
    />
  </Link>
</div>
          </div>

          <div
            className="about-hero__visual"
            aria-hidden="true"
          >
            <div className="about-hero__visual-center">
              <Blocks
                size={38}
                strokeWidth={1.7}
              />
            </div>

            <div className="about-hero__visual-ring about-hero__visual-ring--one" />
            <div className="about-hero__visual-ring about-hero__visual-ring--two" />

            <div className="about-hero__visual-node about-hero__visual-node--one">
              <BrainCircuit
                size={23}
                strokeWidth={1.8}
              />
            </div>

            <div className="about-hero__visual-node about-hero__visual-node--two">
              <ChartNoAxesCombined
                size={23}
                strokeWidth={1.8}
              />
            </div>

            <div className="about-hero__visual-node about-hero__visual-node--three">
              <Sparkles
                size={23}
                strokeWidth={1.8}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="site-container about-story__container">
          <div className="about-section-heading">
            <p className="eyebrow">
              {story.eyebrow}
            </p>

            <h2>
              {story.title}
            </h2>
          </div>

          <div className="about-story__content">
            <div className="about-story__paragraphs">
              {story.paragraphs.map(
                (
                  paragraph,
                ) => (
                  <p key={paragraph}>
                    {paragraph}
                  </p>
                ),
              )}
            </div>

            <blockquote className="about-story__statement">
              <span
                className="about-story__statement-mark"
                aria-hidden="true"
              >
                “
              </span>

              <p>
                {story.statement}
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="about-mission">
        <div className="site-container">
          <div className="about-section-heading about-section-heading--center">
            <p className="eyebrow">
              {mission.eyebrow}
            </p>

            <h2>
              {mission.title}
            </h2>

            <p>
              {mission.description}
            </p>
          </div>

          <div className="about-mission__grid">
            {mission.items.map(
              (
                item,
                index,
              ) => {
                const Icon =
                  missionIcons[
                    index %
                    missionIcons.length
                  ];

                return (
                  <article
                    key={item.title}
                    className="about-mission__card"
                  >
                    <div className="about-mission__icon">
                      <Icon
                        size={25}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section className="about-model">
        <div className="site-container">
          <div className="about-section-heading">
            <p className="eyebrow">
              {model.eyebrow}
            </p>

            <h2>
              {model.title}
            </h2>

            <p>
              {model.description}
            </p>
          </div>

          <div className="about-model__grid">
            {model.activities.map(
              (
                activity,
              ) => (
                <article
                  key={activity.number}
                  className="about-model__card"
                >
                  <span className="about-model__number">
                    {activity.number}
                  </span>

                  <h3>
                    {activity.title}
                  </h3>

                  <p>
                    {activity.description}
                  </p>

                  <Link
                    href={activity.href}
                    className="about-model__link"
                  >
                    <span>
                      {activity.linkLabel}
                    </span>

                    <ArrowRight
                      size={17}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="site-container">
          <div className="about-section-heading about-section-heading--center">
            <p className="eyebrow">
              {values.eyebrow}
            </p>

            <h2>
              {values.title}
            </h2>
          </div>

          <div className="about-values__grid">
            {values.items.map(
              (
                item,
                index,
              ) => {
                const Icon =
                  valueIcons[
                    index %
                    valueIcons.length
                  ];

                return (
                  <article
                    key={item.title}
                    className="about-values__item"
                  >
                    <div className="about-values__icon">
                      <Icon
                        size={22}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description}
                      </p>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section className="about-final-cta">
        <div className="site-container">
          <div className="about-final-cta__card">
            <div className="about-final-cta__content">
              <p className="about-final-cta__eyebrow">
                {finalCta.eyebrow}
              </p>

              <h2>
                {finalCta.title}
              </h2>

              <p>
                {finalCta.description}
              </p>
            </div>

<div className="about-final-cta__actions">
  <Link
    href="/assist"
    className="button button--primary"
  >
    <span>
      {finalCta.primaryCta}
    </span>

    <ArrowRight
      size={18}
      strokeWidth={2.2}
      aria-hidden="true"
    />
  </Link>
</div>
          </div>
        </div>
      </section>
    </div>
  );
}