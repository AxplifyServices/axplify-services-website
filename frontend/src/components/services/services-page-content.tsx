'use client';

import {
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  ArrowDown,
  BarChart3,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  CodeXml,
  DatabaseZap,
  Gauge,
  List,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  SearchCheck,
  ShieldCheck,
  Target,
  Workflow,
  X,
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
  };

  navigation: {
    label: string;
    title: string;
    openLabel: string;
    closeLabel: string;
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
    secondaryCta: string;
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
}: ServicesPageContentProps) {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(
    false,
  );

const mobileNavigationButtonRef =
  useRef<HTMLButtonElement | null>(
    null,
  );

const sidebarNavigationRef =
  useRef<HTMLElement | null>(
    null,
  );  

const [
  mobileSidebarTop,
  setMobileSidebarTop,
] = useState(
  0,
);  
const openMobileSidebar =
  () => {
    const button =
      mobileNavigationButtonRef.current;

    if (!button) {
      return;
    }

    const buttonRect =
      button.getBoundingClientRect();

    /*
     * Le drawer commence juste sous le bouton réellement cliqué.
     * La valeur est relative au viewport visible.
     */
    const calculatedTop =
      Math.max(
        8,
        Math.min(
          buttonRect.bottom + 8,
          window.innerHeight - 220,
        ),
      );

    setMobileSidebarTop(
      calculatedTop,
    );

    setIsSidebarOpen(
      true,
    );

    /*
     * La liste repart toujours du service 01.
     */
    window.requestAnimationFrame(
      () => {
        sidebarNavigationRef.current?.scrollTo({
          top: 0,
          behavior: 'auto',
        });
      },
    );
  };


  const closeSidebar =
    () => {
      setIsSidebarOpen(
        false,
      );
    };

  const toggleSidebar =
    () => {
      setIsSidebarOpen(
        (
          currentValue,
        ) =>
          !currentValue,
      );
    };

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
                href="#services-content"
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

            <div className="services-hero__orbit services-hero__orbit--inner">
              <div className="services-hero__orbit-counter services-hero__orbit-counter--inner">
                <div className="services-hero__visual-node services-hero__visual-node--one">
                  <CodeXml
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>
              </div>
            </div>

            <div className="services-hero__orbit services-hero__orbit--outer services-hero__orbit--outer-first">
              <div className="services-hero__orbit-counter services-hero__orbit-counter--outer-first">
                <div className="services-hero__visual-node services-hero__visual-node--two">
                  <BarChart3
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>
              </div>
            </div>

            <div className="services-hero__orbit services-hero__orbit--outer services-hero__orbit--outer-second">
              <div className="services-hero__orbit-counter services-hero__orbit-counter--outer-second">
                <div className="services-hero__visual-node services-hero__visual-node--three">
                  <Radar
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

<div
  id="services-content"
  className="services-content"
  style={
    {
      '--services-mobile-sidebar-top':
        `${mobileSidebarTop}px`,
    } as CSSProperties
  }
>
        <div className="services-mobile-navigation">
<button
  ref={
    mobileNavigationButtonRef
  }
  type="button"
  className="services-mobile-navigation__button"
  onClick={
    openMobileSidebar
  }
            aria-expanded={
              isSidebarOpen
            }
            aria-controls="services-sidebar-navigation"
          >
            <List
              size={19}
              strokeWidth={2.1}
              aria-hidden="true"
            />

            <span>
              {navigation.label}
            </span>
          </button>
        </div>

        <button
          type="button"
          className="services-sidebar__backdrop"
          data-open={
            isSidebarOpen
          }
          aria-label={
            navigation.closeLabel
          }
          tabIndex={
            isSidebarOpen
              ? 0
              : -1
          }
          onClick={
            closeSidebar
          }
        />

        <div
          className={[
            'services-content__container',
            isSidebarOpen
              ? 'services-content__container--sidebar-open'
              : 'services-content__container--sidebar-collapsed',
          ].join(' ')}
        >
<aside
  className={[
    'services-sidebar',
    isSidebarOpen
      ? 'services-sidebar--open'
      : 'services-sidebar--collapsed',
  ].join(' ')}
>
            <div className="services-sidebar__panel">
              <div className="services-sidebar__header">
                <div className="services-sidebar__heading">
                  <span className="services-sidebar__label">
                    {navigation.label}
                  </span>

                  <span className="services-sidebar__title">
                    {navigation.title}
                  </span>
                </div>

                <button
                  type="button"
                  className="services-sidebar__toggle"
                  onClick={
                    toggleSidebar
                  }
                  aria-expanded={
                    isSidebarOpen
                  }
                  aria-controls="services-sidebar-navigation"
                  aria-label={
                    isSidebarOpen
                      ? navigation.closeLabel
                      : navigation.openLabel
                  }
                >
                  <span className="services-sidebar__toggle-desktop">
                    {isSidebarOpen ? (
                      <PanelLeftClose
                        size={19}
                        strokeWidth={2.1}
                        aria-hidden="true"
                      />
                    ) : (
                      <PanelLeftOpen
                        size={19}
                        strokeWidth={2.1}
                        aria-hidden="true"
                      />
                    )}
                  </span>

                  <span className="services-sidebar__toggle-mobile">
                    <X
                      size={20}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </div>

<nav
  ref={
    sidebarNavigationRef
  }
  id="services-sidebar-navigation"
  className="services-sidebar__navigation"
                aria-label={
                  navigation.title
                }
                aria-hidden={
                  !isSidebarOpen
                }
              >
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
                        className="services-sidebar__item"
                        tabIndex={
                          isSidebarOpen
                            ? 0
                            : -1
                        }
                        onClick={
                          closeSidebar
                        }
                      >
                        <span className="services-sidebar__item-icon">
                          <Icon
                            size={17}
                            strokeWidth={1.9}
                            aria-hidden="true"
                          />
                        </span>

                        <span className="services-sidebar__item-text">
                          <span className="services-sidebar__number">
                            {service.number}
                          </span>

                          <span className="services-sidebar__name">
                            {service.shortTitle}
                          </span>
                        </span>
                      </a>
                    );
                  },
                )}
              </nav>
            </div>
          </aside>

          <main className="services-details">
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
                    <article className="service-detail__layout">
                      <div
                        className="service-detail__heading"
                        data-reveal="up"
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
                      </div>
                    </article>
                  </section>
                );
              },
            )}
          </main>
        </div>
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