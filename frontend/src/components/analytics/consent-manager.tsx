'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

import {
  useTranslations,
} from 'next-intl';

import {
  acceptAllConsent,
  acceptEssentialOnly,
  CONSENT_VERSION,
  DEFAULT_CONSENT_STATE,
  getStoredConsent,
  OPEN_CONSENT_PREFERENCES_EVENT,
  saveConsent,
  type ConsentState,
} from '@/lib/analytics/consent';

type ConsentView =
  | 'hidden'
  | 'banner'
  | 'preferences';

type ExpandedCategory =
  | 'essential'
  | 'analytics'
  | 'marketing'
  | null;

export function ConsentManager() {
  const t =
    useTranslations(
      'cookieConsent',
    );

  const [
    view,
    setView,
  ] =
    useState<ConsentView>(
      'hidden',
    );

  const [
    preferences,
    setPreferences,
  ] =
    useState<ConsentState>(
      DEFAULT_CONSENT_STATE,
    );

  const [
    expandedCategory,
    setExpandedCategory,
  ] =
    useState<ExpandedCategory>(
      null,
    );

  /*
   * =======================================================
   * INITIALIZATION
   * =======================================================
   */

  useEffect(
    () => {
      const storedConsent =
        getStoredConsent();

      if (
        storedConsent
      ) {
        setPreferences(
          storedConsent,
        );

        setView(
          'hidden',
        );

        return;
      }

      setView(
        'banner',
      );
    },
    [],
  );

  /*
   * =======================================================
   * OPEN FROM FOOTER
   * =======================================================
   */

  useEffect(
    () => {
      const handleOpenPreferences =
        () => {
          const storedConsent =
            getStoredConsent();

          setPreferences(
            storedConsent ??
              DEFAULT_CONSENT_STATE,
          );

          setExpandedCategory(
            null,
          );

          setView(
            'preferences',
          );
        };

      window.addEventListener(
        OPEN_CONSENT_PREFERENCES_EVENT,
        handleOpenPreferences,
      );

      return () => {
        window.removeEventListener(
          OPEN_CONSENT_PREFERENCES_EVENT,
          handleOpenPreferences,
        );
      };
    },
    [],
  );

  /*
   * =======================================================
   * MODAL BODY LOCK + ESC
   * =======================================================
   */

  useEffect(
    () => {
      if (
        view !==
        'preferences'
      ) {
        return;
      }

      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        'hidden';

      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
            'Escape'
          ) {
            setView(
              getStoredConsent()
                ? 'hidden'
                : 'banner',
            );
          }
        };

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body.style.overflow =
          previousOverflow;

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      view,
    ],
  );

  /*
   * =======================================================
   * ACTIONS
   * =======================================================
   */

  const handleAcceptAll =
    () => {
      acceptAllConsent();

      setPreferences({
        version:
          CONSENT_VERSION,

        analytics:
          true,

        marketing:
          true,
      });

      setView(
        'hidden',
      );
    };

  const handleEssentialOnly =
    () => {
      acceptEssentialOnly();

      setPreferences({
        version:
          CONSENT_VERSION,

        analytics:
          false,

        marketing:
          false,
      });

      setView(
        'hidden',
      );
    };

  const handleSavePreferences =
    () => {
      saveConsent({
        version:
          CONSENT_VERSION,

        analytics:
          preferences.analytics,

        marketing:
          preferences.marketing,
      });

      setView(
        'hidden',
      );
    };

  const handleCancelPreferences =
    () => {
      const storedConsent =
        getStoredConsent();

      if (
        storedConsent
      ) {
        setPreferences(
          storedConsent,
        );

        setView(
          'hidden',
        );

        return;
      }

      setPreferences(
        DEFAULT_CONSENT_STATE,
      );

      setView(
        'banner',
      );
    };

  const toggleExpandedCategory =
    (
      category:
        Exclude<
          ExpandedCategory,
          null
        >,
    ) => {
      setExpandedCategory(
        (
          current,
        ) =>
          current ===
          category
            ? null
            : category,
      );
    };

  if (
    view ===
    'hidden'
  ) {
    return null;
  }

  return (
    <>
      {view ===
        'banner' && (
        <section
          className="cookie-consent__banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-banner-title"
        >
          <div className="cookie-consent__banner-inner">
            <div className="cookie-consent__banner-copy">
              <h2
                id="cookie-consent-banner-title"
                className="cookie-consent__title"
              >
                {t(
                  'banner.title',
                )}
              </h2>

              <p className="cookie-consent__intro">
                {t(
                  'banner.description',
                )}
              </p>

              <ul className="cookie-consent__summary-list">
                <li>
                  <strong>
                    {t(
                      'categories.essential.title',
                    )}
                  </strong>{' '}
                  {t(
                    'categories.essential.shortDescription',
                  )}
                </li>

                <li>
                  <strong>
                    {t(
                      'categories.analytics.title',
                    )}
                  </strong>{' '}
                  {t(
                    'categories.analytics.shortDescription',
                  )}
                </li>

                <li>
                  <strong>
                    {t(
                      'categories.marketing.title',
                    )}
                  </strong>{' '}
                  {t(
                    'categories.marketing.shortDescription',
                  )}
                </li>
              </ul>
            </div>

            <div className="cookie-consent__banner-actions">
              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--primary"
                onClick={
                  handleAcceptAll
                }
              >
                {t(
                  'actions.acceptAll',
                )}
              </button>

              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--secondary"
                onClick={
                  handleEssentialOnly
                }
              >
                {t(
                  'actions.essentialOnly',
                )}
              </button>

              <button
                type="button"
                className="cookie-consent__details-link"
                onClick={
                  () =>
                    setView(
                      'preferences',
                    )
                }
              >
                {t(
                  'actions.viewDetails',
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {view ===
        'preferences' && (
        <div
          className="cookie-consent__backdrop"
          role="presentation"
          onMouseDown={
            (
              event,
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                handleCancelPreferences();
              }
            }
          }
        >
          <section
            className="cookie-consent__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-dialog-title"
          >
            <header className="cookie-consent__dialog-header">
              <div>
                <p className="cookie-consent__eyebrow">
                  {t(
                    'preferences.eyebrow',
                  )}
                </p>

                <h2
                  id="cookie-consent-dialog-title"
                  className="cookie-consent__title"
                >
                  {t(
                    'preferences.title',
                  )}
                </h2>

                <p className="cookie-consent__intro">
                  {t(
                    'preferences.description',
                  )}
                </p>
              </div>

              <button
                type="button"
                className="cookie-consent__close"
                onClick={
                  handleCancelPreferences
                }
                aria-label={t(
                  'actions.close',
                )}
              >
                <X
                  size={
                    20
                  }
                  aria-hidden="true"
                />
              </button>
            </header>

            <div className="cookie-consent__categories">
              <ConsentCategory
                title={t(
                  'categories.essential.title',
                )}
                description={t(
                  'categories.essential.description',
                )}
                expanded={
                  expandedCategory ===
                  'essential'
                }
                onToggleDetails={
                  () =>
                    toggleExpandedCategory(
                      'essential',
                    )
                }
                detailsLabel={
                  expandedCategory ===
                  'essential'
                    ? t(
                        'actions.hideServices',
                      )
                    : t(
                        'actions.showServices',
                      )
                }
                status={
                  t(
                    'categories.essential.alwaysActive',
                  )
                }
              >
                <div className="cookie-consent__provider">
                  <div>
                    <strong>
                      Axplify Services
                    </strong>

                    <p>
                      {t(
                        'providers.axplify.purpose',
                      )}
                    </p>
                  </div>

                  <code>
                    {t(
                      'providers.axplify.cookie',
                    )}
                  </code>
                </div>
              </ConsentCategory>

              <ConsentCategory
                title={t(
                  'categories.analytics.title',
                )}
                description={t(
                  'categories.analytics.description',
                )}
                expanded={
                  expandedCategory ===
                  'analytics'
                }
                onToggleDetails={
                  () =>
                    toggleExpandedCategory(
                      'analytics',
                    )
                }
                detailsLabel={
                  expandedCategory ===
                  'analytics'
                    ? t(
                        'actions.hideServices',
                      )
                    : t(
                        'actions.showServices',
                      )
                }
                checked={
                  preferences.analytics
                }
                onCheckedChange={
                  (
                    checked,
                  ) =>
                    setPreferences(
                      (
                        current,
                      ) => ({
                        ...current,
                        analytics:
                          checked,
                      }),
                    )
                }
              >
                <p className="cookie-consent__empty-provider">
                  {t(
                    'providers.noneConfigured',
                  )}
                </p>
              </ConsentCategory>

              <ConsentCategory
                title={t(
                  'categories.marketing.title',
                )}
                description={t(
                  'categories.marketing.description',
                )}
                expanded={
                  expandedCategory ===
                  'marketing'
                }
                onToggleDetails={
                  () =>
                    toggleExpandedCategory(
                      'marketing',
                    )
                }
                detailsLabel={
                  expandedCategory ===
                  'marketing'
                    ? t(
                        'actions.hideServices',
                      )
                    : t(
                        'actions.showServices',
                      )
                }
                checked={
                  preferences.marketing
                }
                onCheckedChange={
                  (
                    checked,
                  ) =>
                    setPreferences(
                      (
                        current,
                      ) => ({
                        ...current,
                        marketing:
                          checked,
                      }),
                    )
                }
              >
                <p className="cookie-consent__empty-provider">
                  {t(
                    'providers.noneConfigured',
                  )}
                </p>
              </ConsentCategory>
            </div>

            <footer className="cookie-consent__dialog-footer">
              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--outline"
                onClick={
                  handleCancelPreferences
                }
              >
                {t(
                  'actions.cancel',
                )}
              </button>

              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--primary"
                onClick={
                  handleSavePreferences
                }
              >
                {t(
                  'actions.save',
                )}
              </button>

              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--secondary"
                onClick={
                  handleEssentialOnly
                }
              >
                {t(
                  'actions.essentialOnly',
                )}
              </button>

              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--tertiary"
                onClick={
                  handleAcceptAll
                }
              >
                {t(
                  'actions.acceptAll',
                )}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

type ConsentCategoryProps = {
  title:
    string;

  description:
    string;

  expanded:
    boolean;

  detailsLabel:
    string;

  onToggleDetails:
    () => void;

  checked?:
    boolean;

  onCheckedChange?:
    (
      checked:
        boolean,
    ) => void;

  status?:
    string;

  children:
    React.ReactNode;
};

function ConsentCategory({
  title,
  description,
  expanded,
  detailsLabel,
  onToggleDetails,
  checked,
  onCheckedChange,
  status,
  children,
}: ConsentCategoryProps) {
  return (
    <article className="cookie-consent__category">
      <div className="cookie-consent__category-main">
        <div className="cookie-consent__category-copy">
          <h3>
            {
              title
            }
          </h3>

          <p>
            {
              description
            }
          </p>
        </div>

        {typeof checked ===
        'boolean' ? (
          <button
            type="button"
            className="cookie-consent__switch"
            role="switch"
            aria-checked={
              checked
            }
            data-checked={
              checked
            }
            onClick={
              () =>
                onCheckedChange?.(
                  !checked,
                )
            }
          >
            <span className="cookie-consent__switch-thumb" />
          </button>
        ) : (
          <span className="cookie-consent__required">
            {
              status
            }
          </span>
        )}
      </div>

      <button
        type="button"
        className="cookie-consent__category-details"
        onClick={
          onToggleDetails
        }
        aria-expanded={
          expanded
        }
      >
        <span>
          {
            detailsLabel
          }
        </span>

        {expanded ? (
          <ChevronUp
            size={
              15
            }
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            size={
              15
            }
            aria-hidden="true"
          />
        )}
      </button>

      {expanded && (
        <div className="cookie-consent__providers">
          {
            children
          }
        </div>
      )}
    </article>
  );
}