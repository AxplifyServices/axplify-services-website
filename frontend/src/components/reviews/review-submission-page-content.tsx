'use client';

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Quote,
  Send,
  Star,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
  KeyboardEvent,
} from 'react';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  createPublicReview,
  PublicReviewsApiError,
  validatePublicReviewInvitation,
} from '@/lib/public-reviews-api';

import type {
  PublicReviewProject,
} from '@/lib/public-reviews-api';

export type ReviewSubmissionPageCopy = {
  hero: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;
  };

  project: {
    label:
      string;

    clientLabel:
      string;
  };

  rating: {
    label:
      string;

    description:
      string;

    selected:
      string;

    required:
      string;
  };

  fields: {
    firstName: {
      label:
        string;

      placeholder:
        string;
    };

    lastName: {
      label:
        string;

      placeholder:
        string;
    };

    companyName: {
      label:
        string;

      placeholder:
        string;
    };

    companyRole: {
      label:
        string;

      placeholder:
        string;
    };

    comment: {
      label:
        string;

      placeholder:
        string;

      hint:
        string;
    };
  };

  privacy: {
    text:
      string;
  };

  submit:
    string;

  submitting:
    string;

  validation: {
    required:
      string;

    commentMin:
      string;

    commentMax:
      string;
  };

  states: {
    loading: {
      title:
        string;

      description:
        string;
    };

    invalid: {
      title:
        string;

      description:
        string;
    };

    expired: {
      title:
        string;

      description:
        string;
    };

    used: {
      title:
        string;

      description:
        string;
    };

    success: {
      eyebrow:
        string;

      title:
        string;

      description:
        string;

      moderation:
        string;
    };
  };
};

type ReviewSubmissionPageContentProps = {
  locale:
    AppLocale;

  token:
    string;

  copy:
    ReviewSubmissionPageCopy;
};

type FormState = {
  rating:
    number;

  firstName:
    string;

  lastName:
    string;

  companyName:
    string;

  companyRole:
    string;

  comment:
    string;
};

type InvitationState =
  | {
      status:
        'loading';
    }
  | {
      status:
        'ready';

      project:
        PublicReviewProject | null;
    }
  | {
      status:
        'invalid';

      reason:
        'invalid' |
        'expired' |
        'used';
    };

const INITIAL_FORM_STATE:
  FormState =
  {
    rating:
      0,

    firstName:
      '',

    lastName:
      '',

    companyName:
      '',

    companyRole:
      '',

    comment:
      '',
  };

function resolveProjectTitle(
  project:
    PublicReviewProject,

  locale:
    AppLocale,
) {
  if (
    locale ===
    'ar'
  ) {
    return (
      project.titleAr ||
      project.titleEn ||
      project.titleFr
    );
  }

  if (
    locale ===
    'en'
  ) {
    return (
      project.titleEn ||
      project.titleFr ||
      project.titleAr
    );
  }

  return (
    project.titleFr ||
    project.titleEn ||
    project.titleAr
  );
}

function resolveInvitationError(
  error:
    PublicReviewsApiError,
):
  'invalid' |
  'expired' |
  'used'
{
  if (
    error.status ===
    409
  ) {
    return 'used';
  }

  const normalizedMessage =
    error.message.toLocaleLowerCase();

  if (
    normalizedMessage.includes(
      'expir',
    )
  ) {
    return 'expired';
  }

  if (
    normalizedMessage.includes(
      'déjà',
    ) ||
    normalizedMessage.includes(
      'already',
    )
  ) {
    return 'used';
  }

  return 'invalid';
}

function RatingSelector({
  value,
  onChange,
  label,
  selectedLabel,
}: {
  value:
    number;

  onChange: (
    rating:
      number,
  ) => void;

  label:
    string;

  selectedLabel:
    string;
}) {
  const [
    hoveredRating,
    setHoveredRating,
  ] =
    useState(
      0,
    );

  const visibleRating =
    hoveredRating ||
    value;

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      event.key !==
        'ArrowRight' &&
      event.key !==
        'ArrowLeft'
    ) {
      return;
    }

    event.preventDefault();

    const direction =
      event.key ===
      'ArrowRight'
        ? 1
        : -1;

    const nextValue =
      Math.min(
        5,
        Math.max(
          1,
          (
            value ||
            1
          ) +
            direction,
        ),
      );

    onChange(
      nextValue,
    );
  }

  return (
    <div
      className="review-submit__rating-control"
      role="radiogroup"
      aria-label={
        label
      }
      onKeyDown={
        handleKeyDown
      }
      onMouseLeave={
        () =>
          setHoveredRating(
            0,
          )
      }
    >
      <div className="review-submit__stars">
        {Array.from({
          length:
            5,
        }).map(
          (
            _,
            index,
          ) => {
            const rating =
              index +
              1;

            const filled =
              rating <=
              visibleRating;

            return (
              <button
                key={
                  rating
                }
                type="button"
                role="radio"
                aria-checked={
                  value ===
                  rating
                }
                aria-label={`${rating} / 5`}
                className="review-submit__star"
                data-active={
                  filled
                }
                onMouseEnter={
                  () =>
                    setHoveredRating(
                      rating,
                    )
                }
                onFocus={
                  () =>
                    setHoveredRating(
                      rating,
                    )
                }
                onBlur={
                  () =>
                    setHoveredRating(
                      0,
                    )
                }
                onClick={
                  () =>
                    onChange(
                      rating,
                    )
                }
              >
                <Star
                  size={32}
                  strokeWidth={1.7}
                  fill={
                    filled
                      ? 'currentColor'
                      : 'none'
                  }
                  aria-hidden="true"
                />
              </button>
            );
          },
        )}
      </div>

      {value >
      0 ? (
        <span className="review-submit__rating-value">
          {selectedLabel.replace(
            '{rating}',
            String(
              value,
            ),
          )}
        </span>
      ) : null}
    </div>
  );
}

export function ReviewSubmissionPageContent({
  locale,
  token,
  copy,
}: ReviewSubmissionPageContentProps) {
  const [
    invitation,
    setInvitation,
  ] =
    useState<InvitationState>({
      status:
        'loading',
    });

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      INITIAL_FORM_STATE,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );

  const [
    isSubmitted,
    setIsSubmitted,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      let cancelled =
        false;

      async function validateInvitation() {
        try {
          const response =
            await validatePublicReviewInvitation(
              token,
            );

          if (
            cancelled
          ) {
            return;
          }

          setInvitation({
            status:
              'ready',

            project:
              response.invitation.project,
          });
        } catch (
          error
        ) {
          if (
            cancelled
          ) {
            return;
          }

          if (
            error instanceof
            PublicReviewsApiError
          ) {
            setInvitation({
              status:
                'invalid',

              reason:
                resolveInvitationError(
                  error,
                ),
            });

            return;
          }

          setInvitation({
            status:
              'invalid',

            reason:
              'invalid',
          });
        }
      }

      void validateInvitation();

      return () => {
        cancelled =
          true;
      };
    },
    [
      token,
    ],
  );

  const commentLength =
    form.comment.length;

  const projectTitle =
    useMemo(
      () => {
        if (
          invitation.status !==
            'ready' ||
          !invitation.project
        ) {
          return null;
        }

        return resolveProjectTitle(
          invitation.project,
          locale,
        );
      },
      [
        invitation,
        locale,
      ],
    );

  function updateField<
    TKey extends keyof FormState,
  >(
    field:
      TKey,

    value:
      FormState[TKey],
  ) {
    setForm(
      current => ({
        ...current,

        [field]:
          value,
      }),
    );

    setErrorMessage(
      null,
    );
  }

  function validateForm() {
    if (
      form.rating <
      1
    ) {
      return copy.rating.required;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.companyName.trim() ||
      !form.companyRole.trim() ||
      !form.comment.trim()
    ) {
      return copy.validation.required;
    }

    if (
      form.comment.trim().length <
      10
    ) {
      return copy.validation.commentMin;
    }

    if (
      form.comment.length >
      3000
    ) {
      return copy.validation.commentMax;
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      invitation.status !==
      'ready'
    ) {
      return;
    }

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setErrorMessage(
        validationError,
      );

      return;
    }

    setIsSubmitting(
      true,
    );

    setErrorMessage(
      null,
    );

    try {
      await createPublicReview(
        token,
        {
          rating:
            form.rating,

          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim(),

          companyName:
            form.companyName.trim(),

          companyRole:
            form.companyRole.trim(),

          comment:
            form.comment.trim(),

          locale,
        },
      );

      setIsSubmitted(
        true,
      );
    } catch (
      error
    ) {
      if (
        error instanceof
        PublicReviewsApiError
      ) {
        if (
          error.status ===
            409 ||
          error.message
            .toLocaleLowerCase()
            .includes(
              'déjà',
            )
        ) {
          setInvitation({
            status:
              'invalid',

            reason:
              'used',
          });

          return;
        }

        setErrorMessage(
          error.message,
        );

        return;
      }

      setErrorMessage(
        copy.states.invalid.description,
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  if (
    invitation.status ===
    'loading'
  ) {
    return (
      <section className="review-submit review-submit--state">
        <div className="site-container">
          <div className="review-submit__state-card">
            <LoaderCircle
              size={34}
              className="review-submit__spinner"
              aria-hidden="true"
            />

            <h1>
              {copy.states.loading.title}
            </h1>

            <p>
              {copy.states.loading.description}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    invitation.status ===
    'invalid'
  ) {
    const stateCopy =
      copy.states[
        invitation.reason
      ];

    return (
      <section className="review-submit review-submit--state">
        <div className="site-container">
          <div className="review-submit__state-card review-submit__state-card--error">
            <AlertCircle
              size={36}
              aria-hidden="true"
            />

            <h1>
              {stateCopy.title}
            </h1>

            <p>
              {stateCopy.description}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    isSubmitted
  ) {
    return (
      <section className="review-submit review-submit--state">
        <div className="site-container">
          <div className="review-submit__state-card review-submit__state-card--success">
            <CheckCircle2
              size={42}
              aria-hidden="true"
            />

            <span className="review-submit__eyebrow">
              {copy.states.success.eyebrow}
            </span>

            <h1>
              {copy.states.success.title}
            </h1>

            <p>
              {copy.states.success.description}
            </p>

            <small>
              {copy.states.success.moderation}
            </small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="review-submit">
      <div className="site-container review-submit__container">
        <header className="review-submit__hero">
          <span className="review-submit__eyebrow">
            {copy.hero.eyebrow}
          </span>

          <h1>
            {copy.hero.title}
          </h1>

          <p>
            {copy.hero.description}
          </p>
        </header>

        {invitation.project &&
        projectTitle ? (
          <aside className="review-submit__project">
            <div className="review-submit__project-icon">
              <Quote
                size={19}
                aria-hidden="true"
              />
            </div>

            <div>
              <span>
                {copy.project.label}
              </span>

              <strong>
                {projectTitle}
              </strong>

              {invitation.project.client
                ?.name ? (
                <small>
                  {copy.project.clientLabel}:{' '}
                  {
                    invitation.project
                      .client.name
                  }
                </small>
              ) : null}
            </div>
          </aside>
        ) : null}

        <form
          className="review-submit__form"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <section className="review-submit__form-section review-submit__rating-section">
            <div className="review-submit__section-heading">
              <div>
                <h2>
                  {copy.rating.label}
                </h2>

                <p>
                  {copy.rating.description}
                </p>
              </div>
            </div>

            <RatingSelector
              value={
                form.rating
              }
              label={
                copy.rating.label
              }
              selectedLabel={
                copy.rating.selected
              }
              onChange={
                rating =>
                  updateField(
                    'rating',
                    rating,
                  )
              }
            />
          </section>

          <section className="review-submit__form-section">
            <div className="review-submit__fields-grid">
              <label className="review-submit__field">
                <span>
                  {copy.fields.firstName.label}
                </span>

                <input
                  type="text"
                  autoComplete="given-name"
                  maxLength={120}
                  required
                  value={
                    form.firstName
                  }
                  placeholder={
                    copy.fields
                      .firstName
                      .placeholder
                  }
                  onChange={
                    event =>
                      updateField(
                        'firstName',
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label className="review-submit__field">
                <span>
                  {copy.fields.lastName.label}
                </span>

                <input
                  type="text"
                  autoComplete="family-name"
                  maxLength={120}
                  required
                  value={
                    form.lastName
                  }
                  placeholder={
                    copy.fields
                      .lastName
                      .placeholder
                  }
                  onChange={
                    event =>
                      updateField(
                        'lastName',
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label className="review-submit__field">
                <span>
                  {copy.fields.companyName.label}
                </span>

                <input
                  type="text"
                  autoComplete="organization"
                  maxLength={180}
                  required
                  value={
                    form.companyName
                  }
                  placeholder={
                    copy.fields
                      .companyName
                      .placeholder
                  }
                  onChange={
                    event =>
                      updateField(
                        'companyName',
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label className="review-submit__field">
                <span>
                  {copy.fields.companyRole.label}
                </span>

                <input
                  type="text"
                  autoComplete="organization-title"
                  maxLength={180}
                  required
                  value={
                    form.companyRole
                  }
                  placeholder={
                    copy.fields
                      .companyRole
                      .placeholder
                  }
                  onChange={
                    event =>
                      updateField(
                        'companyRole',
                        event.target
                          .value,
                      )
                  }
                />
              </label>
            </div>

            <label className="review-submit__field review-submit__field--comment">
              <span>
                {copy.fields.comment.label}
              </span>

              <textarea
                rows={7}
                minLength={10}
                maxLength={3000}
                required
                value={
                  form.comment
                }
                placeholder={
                  copy.fields
                    .comment
                    .placeholder
                }
                onChange={
                  event =>
                    updateField(
                      'comment',
                      event.target
                        .value,
                    )
                }
              />

              <div className="review-submit__comment-meta">
                <small>
                  {copy.fields.comment.hint}
                </small>

                <span
                  data-limit={
                    commentLength >
                    3000
                  }
                >
                  {commentLength}
                  /3000
                </span>
              </div>
            </label>
          </section>

          {errorMessage ? (
            <div
              className="review-submit__error"
              role="alert"
            >
              <AlertCircle
                size={18}
                aria-hidden="true"
              />

              <span>
                {errorMessage}
              </span>
            </div>
          ) : null}

          <footer className="review-submit__footer">
            <p>
              {copy.privacy.text}
            </p>

            <button
              type="submit"
              className="button button--primary review-submit__submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting ? (
                <LoaderCircle
                  size={18}
                  className="review-submit__spinner"
                  aria-hidden="true"
                />
              ) : (
                <Send
                  size={18}
                  aria-hidden="true"
                />
              )}

              {isSubmitting
                ? copy.submitting
                : copy.submit}
            </button>
          </footer>
        </form>
      </div>
    </section>
  );
}