'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  createPortal,
} from 'react-dom';

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
  ListTree,
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
serviceHref: {
  pathname:
    '/services/[serviceSlug]';

  params: {
    serviceSlug:
      string;
  };
};

discoverLabel:
  string;  
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
    isQuickNavigationOpen,
    setIsQuickNavigationOpen,
  ] = useState(
    false,
  );

const [
  isQuickNavigationPortalReady,
  setIsQuickNavigationPortalReady,
] = useState(
  false,
);  

  const quickNavigationDialogRef =
    useRef<HTMLDivElement>(
      null,
    );

  const quickNavigationTriggerRef =
    useRef<HTMLButtonElement>(
      null,
    );


  const openQuickNavigation =
    () => {
      setIsQuickNavigationOpen(
        true,
      );
    };

  const closeQuickNavigation =
    (
      restoreTriggerFocus = false,
    ) => {
      setIsQuickNavigationOpen(
        false,
      );

      if (
        restoreTriggerFocus
      ) {
        window.requestAnimationFrame(
          () => {
            quickNavigationTriggerRef.current?.focus();
          },
        );
      }
    };

  const navigateToService =
    (
      serviceId: string,
    ) => {
      const targetElement =
        document.getElementById(
          serviceId,
        );

      setIsQuickNavigationOpen(
        false,
      );

      if (
        !targetElement
      ) {
        return;
      }

      const reduceMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

      window.requestAnimationFrame(
        () => {
          targetElement.scrollIntoView({
            behavior:
              reduceMotion
                ? 'auto'
                : 'smooth',

            block:
              'start',
          });

          window.history.replaceState(
            null,
            '',
            `#${serviceId}`,
          );
        },
      );
    };

  /*
   * Gestion de la popup :
   * - fermeture avec Échap ;
   * - blocage du scroll arrière-plan ;
   * - focus sur le premier service.
   */
  useEffect(
    () => {
      if (
        !isQuickNavigationOpen
      ) {
        return;
      }

      const previousBodyOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        'hidden';

      const firstServiceButton =
        quickNavigationDialogRef.current?.querySelector<HTMLButtonElement>(
          '.services-quick-navigation__service',
        );

      window.requestAnimationFrame(
        () => {
          firstServiceButton?.focus();
        },
      );

      const handleKeyDown =
        (
          event: KeyboardEvent,
        ) => {
          if (
            event.key ===
            'Escape'
          ) {
            event.preventDefault();

            closeQuickNavigation(
              true,
            );
          }
        };

      document.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body.style.overflow =
          previousBodyOverflow;

        document.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      isQuickNavigationOpen,
    ],
  );

useEffect(
  () => {
    setIsQuickNavigationPortalReady(
      true,
    );
  },
  [],
);  

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

      <div className="services-quick-navigation__anchor">
        <div className="site-container">
        <button
          ref={
            quickNavigationTriggerRef
          }
          type="button"
          className="services-quick-navigation__trigger"
          aria-expanded={
            isQuickNavigationOpen
          }
          aria-controls="services-quick-navigation-dialog"
          aria-label={
            isQuickNavigationOpen
              ? navigation.closeLabel
              : navigation.openLabel
          }
          onClick={
            () => {
              if (
                isQuickNavigationOpen
              ) {
                closeQuickNavigation();
                return;
              }

              openQuickNavigation();
            }
          }
        >
          <span className="services-quick-navigation__trigger-icon">
            {isQuickNavigationOpen ? (
              <X
                size={21}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            ) : (
              <ListTree
                size={21}
                strokeWidth={2.1}
                aria-hidden="true"
              />
            )}
          </span>

          <span className="services-quick-navigation__trigger-text">
            {navigation.label}
          </span>
        </button>
        </div>
      </div>

      <div
        id="services-content"
        className="services-content"
      >
  <div className="services-content__container">

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
<div
  data-reveal="up"
  data-reveal-delay="5"
  style={{
    marginTop:
      '1.25rem',
  }}
>
  <Link
    href={
      service.serviceHref
    }
    className="services-button services-button--primary"
  >
    <span>
      {
        service.discoverLabel
      }
    </span>

    <Target
      size={18}
      strokeWidth={2}
      aria-hidden="true"
    />
  </Link>
</div>                        
                      </div>
                    </article>
                  </section>
                );
              },
            )}
          </main>
        </div>
      </div>

      {/*
       * Nouvelle navigation rapide.
       *
       * Elle est placée hors de .services-content__container.
       * Son positionnement fixed l'empêche d'affecter le layout.
       */}
{isQuickNavigationPortalReady
  ? createPortal(
      <div
        className="services-quick-navigation"
        data-open={
          isQuickNavigationOpen
            ? 'true'
            : 'false'
        }
      >
        <button
          type="button"
          className="services-quick-navigation__backdrop"
          aria-label={
            navigation.closeLabel
          }
          tabIndex={
            isQuickNavigationOpen
              ? 0
              : -1
          }
          onClick={
            () =>
              closeQuickNavigation(
                true,
              )
          }
        />

        <div
          ref={
            quickNavigationDialogRef
          }
          id="services-quick-navigation-dialog"
          className="services-quick-navigation__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="services-quick-navigation-title"
          aria-hidden={
            !isQuickNavigationOpen
          }
        >
          <header className="services-quick-navigation__header">
            <div className="services-quick-navigation__heading">
              <span className="services-quick-navigation__label">
                {navigation.label}
              </span>

              <h2 id="services-quick-navigation-title">
                {navigation.title}
              </h2>
            </div>

            <button
              type="button"
              className="services-quick-navigation__close"
              aria-label={
                navigation.closeLabel
              }
              onClick={
                () =>
                  closeQuickNavigation(
                    true,
                  )
              }
            >
              <X
                size={20}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </button>
          </header>

          <nav
            className="services-quick-navigation__list"
            aria-label={
              navigation.title
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
                  <button
                    key={service.id}
                    type="button"
                    className="services-quick-navigation__service"
                    onClick={
                      () =>
                        navigateToService(
                          service.id,
                        )
                    }
                  >
                    <span
                      className="services-quick-navigation__service-icon"
                      aria-hidden="true"
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.9}
                      />
                    </span>

                    <span className="services-quick-navigation__service-content">
                      <span className="services-quick-navigation__service-heading">
                        <span className="services-quick-navigation__service-number">
                          {service.number}
                        </span>

                        <span className="services-quick-navigation__service-title">
                          {service.shortTitle}
                        </span>
                      </span>

                      <span className="services-quick-navigation__service-description">
                        {service.description}
                      </span>
                    </span>

                    <ArrowDown
                      className="services-quick-navigation__service-arrow"
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </button>
                );
              },
            )}
          </nav>
        </div>


      </div>,
      document.body,
    )
  : null}

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