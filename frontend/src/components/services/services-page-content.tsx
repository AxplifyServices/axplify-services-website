import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  CodeXml,
  DatabaseZap,
  Gauge,
  Megaphone,
  Radar,
  SearchCheck,
  ShieldCheck,
  Target,
  Workflow,
} from 'lucide-react';

import {
  Link,
} from '@/i18n/navigation';

export type ServicePageItem = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  promise: string;
  description: string;
  challengeTitle: string;
  challengeDescription: string;
  solutionsTitle: string;
  solutions: string[];
  benefitsTitle: string;
  benefits: string[];
  exampleLabel: string;
  example: string;
};

type ServicesPageContentProps = {
  hero: {
    eyebrow: string;
    title: string;
    introduction: string;
    description: string;
    navigationCta: string;
    contactCta: string;
  };

  navigation: {
    label: string;
    title: string;
  };

  services: ServicePageItem[];

  method: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      number: string;
      title: string;
      description: string;
    }>;
  };

  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };

  labels: {
    backToNavigation: string;
    discoverService: string;
  };
};

const serviceIcons = [
  CodeXml,
  Workflow,
  ChartNoAxesCombined,
  BrainCircuit,
  Megaphone,
  ShieldCheck,
  Gauge,
  Target,
  SearchCheck,
] as const;

export function ServicesPageContent({
  hero,
  navigation,
  services,
  method,
  finalCta,
  labels,
}: ServicesPageContentProps) {
  return (
    <div className="services-page">
      <section
        className="services-hero"
        aria-labelledby="services-page-title"
      >
        <div
          className="services-hero__background"
          aria-hidden="true"
        >
          <span className="services-hero__orb services-hero__orb--cyan" />
          <span className="services-hero__orb services-hero__orb--violet" />
          <span className="services-hero__grid" />
        </div>

        <div className="site-container services-hero__container">
          <div className="services-hero__content">
            <p
              className="eyebrow"
              data-reveal="up"
              data-reveal-delay="1"
            >
              {hero.eyebrow}
            </p>

            <h1
              id="services-page-title"
              data-reveal="up"
              data-reveal-delay="2"
            >
              {hero.title}
            </h1>

            <p
              className="services-hero__lead"
              data-reveal="up"
              data-reveal-delay="3"
            >
              {hero.introduction}
            </p>

            <p
              className="services-hero__description"
              data-reveal="up"
              data-reveal-delay="4"
            >
              {hero.description}
            </p>

            <div
              className="services-hero__actions"
              data-reveal="up"
              data-reveal-delay="5"
            >
              <a
                href="#services-navigation"
                className="services-button services-button--primary"
              >
                <span>
                  {hero.navigationCta}
                </span>

                <ArrowDown
                  size={18}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </a>

              <Link
                href="/contact"
                className="services-button services-button--secondary"
              >
                <span>
                  {hero.contactCta}
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
            className="services-hero__visual"
            data-reveal="scale"
            data-reveal-delay="3"
            aria-hidden="true"
          >
            <div className="services-hero__visual-core">
              <Bot
                size={40}
                strokeWidth={1.7}
              />
            </div>

            <div className="services-hero__visual-ring services-hero__visual-ring--one" />
            <div className="services-hero__visual-ring services-hero__visual-ring--two" />

            <div className="services-hero__visual-node services-hero__visual-node--one">
              <CodeXml
                size={24}
                strokeWidth={1.8}
              />
            </div>

            <div className="services-hero__visual-node services-hero__visual-node--two">
              <BarChart3
                size={24}
                strokeWidth={1.8}
              />
            </div>

            <div className="services-hero__visual-node services-hero__visual-node--three">
              <Radar
                size={24}
                strokeWidth={1.8}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="services-navigation"
        className="services-navigation"
        aria-labelledby="services-navigation-title"
      >
        <div className="site-container">
          <div
            className="services-navigation__heading"
            data-reveal="up"
          >
            <p className="services-navigation__label">
              {navigation.label}
            </p>

            <h2 id="services-navigation-title">
              {navigation.title}
            </h2>
          </div>

          <nav
            className="services-navigation__scroll"
            aria-label={navigation.title}
          >
            <div className="services-navigation__list">
              {services.map(
                (
                  service,
                  index,
                ) => {
                  const Icon =
                    serviceIcons[
                      index %
                        serviceIcons.length
                    ];

                  return (
                    <a
                      key={service.id}
                      href={`#${service.id}`}
                      className="services-navigation__item"
                      data-reveal="up"
                      data-reveal-delay={
                        String(
                          (index % 3) +
                            1,
                        )
                      }
                    >
                      <span className="services-navigation__item-icon">
                        <Icon
                          size={18}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      </span>

                      <span className="services-navigation__item-content">
                        <span className="services-navigation__number">
                          {service.number}
                        </span>

                        <span className="services-navigation__name">
                          {service.shortTitle}
                        </span>
                      </span>
                    </a>
                  );
                },
              )}
            </div>
          </nav>
        </div>
      </section>

      <div className="services-details">
        {services.map(
          (
            service,
            index,
          ) => {
            const Icon =
              serviceIcons[
                index %
                  serviceIcons.length
              ];

            return (
              <section
                key={service.id}
                id={service.id}
                className="service-detail"
                aria-labelledby={`${service.id}-title`}
              >
                <div className="site-container">
                  <article className="service-detail__layout">
                    <div
                      className="service-detail__heading"
                      data-reveal={
                        index % 2 === 0
                          ? 'right'
                          : 'left'
                      }
                    >
                      <div className="service-detail__heading-top">
                        <span className="service-detail__number">
                          {service.number}
                        </span>

                        <div
                          className="service-detail__icon"
                          aria-hidden="true"
                        >
                          <Icon
                            size={27}
                            strokeWidth={1.8}
                          />
                        </div>
                      </div>

                      <h2 id={`${service.id}-title`}>
                        {service.title}
                      </h2>

                      <p className="service-detail__promise">
                        {service.promise}
                      </p>

                      <p className="service-detail__description">
                        {service.description}
                      </p>
                    </div>

                    <div className="service-detail__content">
                      <div
                        className="service-detail__challenge"
                        data-reveal="up"
                        data-reveal-delay="1"
                      >
                        <p className="service-detail__block-label">
                          {service.challengeTitle}
                        </p>

                        <p>
                          {service.challengeDescription}
                        </p>
                      </div>

                      <div className="service-detail__columns">
                        <div
                          className="service-detail__list-card"
                          data-reveal="up"
                          data-reveal-delay="2"
                        >
                          <h3>
                            {service.solutionsTitle}
                          </h3>

                          <ul>
                            {service.solutions.map(
                              (
                                solution,
                              ) => (
                                <li key={solution}>
                                  <Check
                                    size={17}
                                    strokeWidth={2.3}
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {solution}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        <div
                          className="service-detail__list-card service-detail__list-card--benefits"
                          data-reveal="up"
                          data-reveal-delay="3"
                        >
                          <h3>
                            {service.benefitsTitle}
                          </h3>

                          <ul>
                            {service.benefits.map(
                              (
                                benefit,
                              ) => (
                                <li key={benefit}>
                                  <Check
                                    size={17}
                                    strokeWidth={2.3}
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {benefit}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>

                      <aside
                        className="service-detail__example"
                        data-reveal="up"
                        data-reveal-delay="4"
                      >
                        <div className="service-detail__example-icon">
                          <DatabaseZap
                            size={21}
                            strokeWidth={1.9}
                            aria-hidden="true"
                          />
                        </div>

                        <div>
                          <p className="service-detail__example-label">
                            {service.exampleLabel}
                          </p>

                          <p>
                            {service.example}
                          </p>
                        </div>
                      </aside>

                      <div
                        className="service-detail__footer"
                        data-reveal="up"
                      >
                        <a
                          href="#services-navigation"
                          className="service-detail__back"
                        >
                          <ArrowUp
                            size={17}
                            strokeWidth={2.2}
                            aria-hidden="true"
                          />

                          <span>
                            {labels.backToNavigation}
                          </span>
                        </a>

                        <Link
                          href="/contact"
                          className="service-detail__contact"
                        >
                          <span>
                            {labels.discoverService}
                          </span>

                          <ArrowRight
                            size={17}
                            strokeWidth={2.2}
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            );
          },
        )}
      </div>

      <section className="services-method">
        <div className="site-container">
          <div
            className="services-section-heading services-section-heading--center"
            data-reveal="up"
          >
            <p className="eyebrow">
              {method.eyebrow}
            </p>

            <h2>
              {method.title}
            </h2>

            <p>
              {method.description}
            </p>
          </div>

          <div className="services-method__grid">
            {method.items.map(
              (
                item,
                index,
              ) => (
                <article
                  key={item.number}
                  className="services-method__item"
                  data-reveal="up"
                  data-reveal-delay={
                    String(
                      index + 1,
                    )
                  }
                >
                  <span className="services-method__number">
                    {item.number}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="services-final-cta">
        <div className="site-container">
          <div
            className="services-final-cta__card"
            data-reveal="scale"
          >
            <div>
              <p className="eyebrow">
                {finalCta.eyebrow}
              </p>

              <h2>
                {finalCta.title}
              </h2>

              <p>
                {finalCta.description}
              </p>
            </div>

            <div className="services-final-cta__actions">
              <Link
                href="/contact"
                className="services-button services-button--primary"
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

              <Link
                href="/assist"
                className="services-button services-button--light"
              >
                <span>
                  {finalCta.secondaryCta}
                </span>

                <Target
                  size={18}
                  strokeWidth={2}
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