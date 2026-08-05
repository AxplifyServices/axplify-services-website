'use client';

import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ChangeEvent,
  FormEvent,
} from 'react';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  createPublicContactRequest,
  PublicContactRequestApiError,
} from '@/lib/public-contact-requests-api';

import type {
  ContactRequestSource,
} from '@/lib/public-contact-requests-api';

type ContactAvailabilityFormValue = {
  id:
    string;

  date:
    string;

  startTime:
    string;

  endTime:
    string;

  note:
    string;
};

type ContactFormState = {
  firstName:
    string;

  lastName:
    string;

  companyName:
    string;

  jobTitle:
    string;

  email:
    string;

  phoneNumber:
    string;

  needDescription:
    string;

  wantsAppointment:
    boolean;

  privacyConsent:
    boolean;

  website:
    string;
};

export type ContactPageCopy = {
  hero: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;

    reassurance:
      string;
  };

  directContact: {
    title:
      string;

    description:
      string;

    whatsappLabel:
      string;

    whatsappMessage:
      string;

    emailLabel:
      string;

    phoneLabel:
      string;
  };

  form: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;

    sections: {
      identity:
        string;

      need:
        string;

      appointment:
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

      jobTitle: {
        label:
          string;

        placeholder:
          string;
      };

      email: {
        label:
          string;

        placeholder:
          string;
      };

      phoneNumber: {
        label:
          string;

        placeholder:
          string;
      };

      needDescription: {
        label:
          string;

        placeholder:
          string;

        hint:
          string;
      };
    };

    appointment: {
      title:
        string;

      description:
        string;

      yes:
        string;

      no:
        string;

      availabilityTitle:
        string;

      availabilityDescription:
        string;

      date:
        string;

      startTime:
        string;

      endTime:
        string;

      note:
        string;

      notePlaceholder:
        string;

      add:
        string;

      remove:
        string;

      maximum:
        string;
    };

    privacy: {
      prefix:
        string;

      linkLabel:
        string;

      suffix:
        string;

      modal: {
        eyebrow:
          string;

        title:
          string;

        introduction:
          string;

        collectedDataTitle:
          string;

        collectedData:
          string[];

        purposesTitle:
          string;

        purposes:
          string[];

        accessTitle:
          string;

        accessDescription:
          string;

        retentionTitle:
          string;

        retentionDescription:
          string;

        rightsTitle:
          string;

        rightsDescription:
          string;

        securityTitle:
          string;

        securityDescription:
          string;

        close:
          string;
      };
    };

    submit:
      string;

    submitting:
      string;

    required:
      string;
  };

  success: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;

    reference:
      string;

    newRequest:
      string;

    whatsapp:
      string;
  };

  errors: {
    generic:
      string;

    requiredFields:
      string;

    privacy:
      string;

    descriptionLength:
      string;

    appointmentAvailability:
      string;

    invalidAvailability:
      string;

    pastAvailability:
      string;
  };
};

type ContactPageContentProps = {
  locale:
    AppLocale;

  source:
    ContactRequestSource;

  copy:
    ContactPageCopy;

  whatsappNumber:
    string;

  publicEmail:
    string;

  publicPhone:
    string;
};

const INITIAL_FORM_STATE:
  ContactFormState =
  {
    firstName:
      '',

    lastName:
      '',

    companyName:
      '',

    jobTitle:
      '',

    email:
      '',

    phoneNumber:
      '',

    needDescription:
      '',

    wantsAppointment:
      false,

    privacyConsent:
      false,

    website:
      '',
  };

function createAvailability():
  ContactAvailabilityFormValue {
  return {
    id:
      crypto.randomUUID(),

    date:
      '',

    startTime:
      '',

    endTime:
      '',

    note:
      '',
  };
}

function normalizeWhatsappNumber(
  value:
    string,
) {
  return value.replace(
    /\D/g,
    '',
  );
}

function combineLocalDateAndTime(
  date:
    string,

  time:
    string,
) {
  if (
    !date ||
    !time
  ) {
    return null;
  }

  const combined =
    new Date(
      `${date}T${time}:00`,
    );

  if (
    Number.isNaN(
      combined.getTime(),
    )
  ) {
    return null;
  }

  return combined;
}

function getBrowserTimezone() {
  try {
    return (
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone ||
      'Africa/Casablanca'
    );
  } catch {
    return 'Africa/Casablanca';
  }
}

export function ContactPageContent({
  locale,
  source,
  copy,
  whatsappNumber,
  publicEmail,
  publicPhone,
}: ContactPageContentProps) {
  const [
    form,
    setForm,
  ] =
    useState<ContactFormState>(
      INITIAL_FORM_STATE,
    );

  const [
    availabilities,
    setAvailabilities,
  ] =
    useState<
      ContactAvailabilityFormValue[]
    >(
      [],
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
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
    createdRequestId,
    setCreatedRequestId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
  ] =
    useState(
      false,
    );    

  const normalizedWhatsappNumber =
    useMemo(
      () =>
        normalizeWhatsappNumber(
          whatsappNumber,
        ),
      [
        whatsappNumber,
      ],
    );

  const whatsappUrl =
    useMemo(
      () => {
        const encodedMessage =
          encodeURIComponent(
            copy.directContact
              .whatsappMessage,
          );

        return normalizedWhatsappNumber
          ? `https://wa.me/${normalizedWhatsappNumber}?text=${encodedMessage}`
          : null;
      },
      [
        copy.directContact
          .whatsappMessage,
        normalizedWhatsappNumber,
      ],
    );

  const today =
    useMemo(
      () => {
        const now =
          new Date();

        const year =
          now.getFullYear();

        const month =
          String(
            now.getMonth() +
              1,
          ).padStart(
            2,
            '0',
          );

        const day =
          String(
            now.getDate(),
          ).padStart(
            2,
            '0',
          );

        return `${year}-${month}-${day}`;
      },
      [],
    );

  useEffect(
    () => {
      if (
        !isPrivacyModalOpen
      ) {
        return;
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          setIsPrivacyModalOpen(
            false,
          );
        }
      }

      const previousOverflow =
        document.body.style
          .overflow;

      document.body.style.overflow =
        'hidden';

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
      isPrivacyModalOpen,
    ],
  );    

  function updateTextField(
    event:
      ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
      >,
  ) {
    const {
      name,
      value,
    } =
      event.target;

    setForm(
      current => ({
        ...current,

        [
          name
        ]:
          value,
      }),
    );
  }

  function updatePrivacyConsent(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    setForm(
      current => ({
        ...current,

        privacyConsent:
          event.target.checked,
      }),
    );
  }

  function setAppointmentPreference(
    wantsAppointment:
      boolean,
  ) {
    setForm(
      current => ({
        ...current,

        wantsAppointment,
      }),
    );

    setErrorMessage(
      null,
    );

    if (
      wantsAppointment &&
      availabilities.length ===
        0
    ) {
      setAvailabilities([
        createAvailability(),
      ]);
    }

    if (
      !wantsAppointment
    ) {
      setAvailabilities(
        [],
      );
    }
  }

  function addAvailability() {
    if (
      availabilities.length >=
      3
    ) {
      return;
    }

    setAvailabilities(
      current => [
        ...current,
        createAvailability(),
      ],
    );
  }

  function updateAvailability(
    id:
      string,

    field:
      keyof Omit<
        ContactAvailabilityFormValue,
        'id'
      >,

    value:
      string,
  ) {
    setAvailabilities(
      current =>
        current.map(
          availability =>
            availability.id ===
            id
              ? {
                  ...availability,

                  [
                    field
                  ]:
                    value,
                }
              : availability,
        ),
    );
  }

  function removeAvailability(
    id:
      string,
  ) {
    setAvailabilities(
      current =>
        current.filter(
          availability =>
            availability.id !==
            id,
        ),
    );
  }

  function validateForm() {
    const requiredValues = [
      form.firstName,
      form.lastName,
      form.companyName,
      form.jobTitle,
      form.email,
      form.phoneNumber,
      form.needDescription,
    ];

    if (
      requiredValues.some(
        value =>
          value.trim().length ===
          0,
      )
    ) {
      return copy.errors
        .requiredFields;
    }

    if (
      form.needDescription
        .trim()
        .length <
      20
    ) {
      return copy.errors
        .descriptionLength;
    }

    if (
      !form.privacyConsent
    ) {
      return copy.errors
        .privacy;
    }

    if (
      !form.wantsAppointment
    ) {
      return null;
    }

    if (
      availabilities.length ===
      0
    ) {
      return copy.errors
        .appointmentAvailability;
    }

    const now =
      new Date();

    for (
      const availability of
      availabilities
    ) {
      const startsAt =
        combineLocalDateAndTime(
          availability.date,
          availability.startTime,
        );

      const endsAt =
        combineLocalDateAndTime(
          availability.date,
          availability.endTime,
        );

      if (
        !startsAt ||
        !endsAt ||
        endsAt <=
          startsAt
      ) {
        return copy.errors
          .invalidAvailability;
      }

      if (
        startsAt <=
        now
      ) {
        return copy.errors
          .pastAvailability;
      }
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      isSubmitting
    ) {
      return;
    }

    setErrorMessage(
      null,
    );

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

    try {
      const timezone =
        getBrowserTimezone();

      const response =
        await createPublicContactRequest(
          {
            source,

            locale,

            firstName:
              form.firstName.trim(),

            lastName:
              form.lastName.trim(),

            companyName:
              form.companyName.trim(),

            jobTitle:
              form.jobTitle.trim(),

            email:
              form.email
                .trim()
                .toLowerCase(),

            phoneNumber:
              form.phoneNumber.trim(),

            needDescription:
              form.needDescription.trim(),

            wantsAppointment:
              form.wantsAppointment,

            privacyConsent:
              form.privacyConsent,

            website:
              form.website,

            availabilities:
              form.wantsAppointment
                ? availabilities.map(
                    availability => {
                      const startsAt =
                        combineLocalDateAndTime(
                          availability.date,
                          availability.startTime,
                        );

                      const endsAt =
                        combineLocalDateAndTime(
                          availability.date,
                          availability.endTime,
                        );

                      if (
                        !startsAt ||
                        !endsAt
                      ) {
                        throw new Error(
                          'Invalid availability',
                        );
                      }

                      return {
                        startsAt:
                          startsAt.toISOString(),

                        endsAt:
                          endsAt.toISOString(),

                        timezone,

                        ...(availability.note
                          .trim()
                          ? {
                              note:
                                availability.note.trim(),
                            }
                          : {}),
                      };
                    },
                  )
                : [],
          },
        );

      setCreatedRequestId(
        response.request.id,
      );

      setForm(
        INITIAL_FORM_STATE,
      );

      setAvailabilities(
        [],
      );

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });
    } catch (
      error
    ) {
      if (
        error instanceof
        PublicContactRequestApiError
      ) {
        setErrorMessage(
          error.message,
        );
      } else {
        setErrorMessage(
          copy.errors.generic,
        );
      }
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  function resetForm() {
    setCreatedRequestId(
      null,
    );

    setErrorMessage(
      null,
    );

    setForm(
      INITIAL_FORM_STATE,
    );

    setAvailabilities(
      [],
    );
  }

  if (
    createdRequestId
  ) {
    return (
      <main className="contact-page">
        <section className="contact-success">
          <div className="site-container">
            <div className="contact-success__card">
              <span className="contact-success__icon">
                <CheckCircle2
                  size={
                    34
                  }
                  strokeWidth={
                    1.8
                  }
                  aria-hidden="true"
                />
              </span>

              <p className="eyebrow">
                {
                  copy.success
                    .eyebrow
                }
              </p>

              <h1>
                {
                  copy.success
                    .title
                }
              </h1>

              <p className="contact-success__description">
                {
                  copy.success
                    .description
                }
              </p>

              <p className="contact-success__reference">
                <span>
                  {
                    copy.success
                      .reference
                  }
                </span>

                <strong>
                  {
                    createdRequestId
                  }
                </strong>
              </p>

              <div className="contact-success__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={
                    resetForm
                  }
                >
                  {
                    copy.success
                      .newRequest
                  }

                  <ArrowRight
                    size={
                      18
                    }
                    aria-hidden="true"
                  />
                </button>

                {
                  whatsappUrl
                    ? (
                        <a
                          href={
                            whatsappUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="button button--secondary"
                        >
                          <MessageCircle
                            size={
                              18
                            }
                            aria-hidden="true"
                          />

                          {
                            copy.success
                              .whatsapp
                          }
                        </a>
                      )
                    : null
                }
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="contact-page">
      <section className="contact-page__hero">
        <div className="contact-page__hero-glow contact-page__hero-glow--one" />

        <div className="contact-page__hero-glow contact-page__hero-glow--two" />

        <div className="site-container contact-page__hero-content">
          <div className="contact-page__hero-copy">
            <p className="eyebrow">
              {
                copy.hero
                  .eyebrow
              }
            </p>

            <h1>
              {
                copy.hero
                  .title
              }
            </h1>

            <p className="contact-page__hero-description">
              {
                copy.hero
                  .description
              }
            </p>

            <p className="contact-page__hero-reassurance">
              <Check
                size={
                  18
                }
                aria-hidden="true"
              />

              {
                copy.hero
                  .reassurance
              }
            </p>
          </div>

          <aside className="contact-direct-card">
            <div className="contact-direct-card__heading">
              <span className="contact-direct-card__icon">
                <MessageCircle
                  size={
                    22
                  }
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2>
                  {
                    copy.directContact
                      .title
                  }
                </h2>

                <p>
                  {
                    copy.directContact
                      .description
                  }
                </p>
              </div>
            </div>

            <div className="contact-direct-card__actions">
              {
                whatsappUrl
                  ? (
                      <a
                        href={
                          whatsappUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="contact-direct-card__whatsapp"
                      >
                        <MessageCircle
                          size={
                            20
                          }
                          aria-hidden="true"
                        />

                        <span>
                          {
                            copy.directContact
                              .whatsappLabel
                          }
                        </span>

                        <ArrowRight
                          size={
                            18
                          }
                          aria-hidden="true"
                        />
                      </a>
                    )
                  : null
              }

              {
                publicEmail
                  ? (
                      <a
                        href={
                          `mailto:${publicEmail}`
                        }
                        className="contact-direct-card__line"
                      >
                        <Mail
                          size={
                            18
                          }
                          aria-hidden="true"
                        />

                        <span>
                          <small>
                            {
                              copy.directContact
                                .emailLabel
                            }
                          </small>

                          <strong>
                            {
                              publicEmail
                            }
                          </strong>
                        </span>
                      </a>
                    )
                  : null
              }

              {
                publicPhone
                  ? (
                      <a
                        href={
                          `tel:${publicPhone.replace(
                            /\s/g,
                            '',
                          )}`
                        }
                        className="contact-direct-card__line"
                      >
                        <Phone
                          size={
                            18
                          }
                          aria-hidden="true"
                        />

                        <span>
                          <small>
                            {
                              copy.directContact
                                .phoneLabel
                            }
                          </small>

                          <strong>
                            {
                              publicPhone
                            }
                          </strong>
                        </span>
                      </a>
                    )
                  : null
              }
            </div>
          </aside>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="site-container contact-form-section__layout">
          <div className="contact-form-section__introduction">
            <p className="eyebrow">
              {
                copy.form
                  .eyebrow
              }
            </p>

            <h2>
              {
                copy.form
                  .title
              }
            </h2>

            <p>
              {
                copy.form
                  .description
              }
            </p>

            <div className="contact-form-section__steps">
              <span>
                <UserRound
                  size={
                    18
                  }
                  aria-hidden="true"
                />

                {
                  copy.form
                    .sections
                    .identity
                }
              </span>

              <span>
                <MessageCircle
                  size={
                    18
                  }
                  aria-hidden="true"
                />

                {
                  copy.form
                    .sections
                    .need
                }
              </span>

              <span>
                <CalendarDays
                  size={
                    18
                  }
                  aria-hidden="true"
                />

                {
                  copy.form
                    .sections
                    .appointment
                }
              </span>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={
              handleSubmit
            }
            noValidate
          >
            <p className="contact-form__required">
              {
                copy.form
                  .required
              }
            </p>

            <fieldset className="contact-form__fieldset">
              <legend>
                {
                  copy.form
                    .sections
                    .identity
                }
              </legend>

              <div className="contact-form__grid">
                <label className="contact-form__field">
                  <span>
                    {
                      copy.form
                        .fields
                        .firstName
                        .label
                    }
                  </span>

                  <input
                    type="text"
                    name="firstName"
                    value={
                      form.firstName
                    }
                    onChange={
                      updateTextField
                    }
                    placeholder={
                      copy.form
                        .fields
                        .firstName
                        .placeholder
                    }
                    autoComplete="given-name"
                    minLength={
                      2
                    }
                    maxLength={
                      100
                    }
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>
                    {
                      copy.form
                        .fields
                        .lastName
                        .label
                    }
                  </span>

                  <input
                    type="text"
                    name="lastName"
                    value={
                      form.lastName
                    }
                    onChange={
                      updateTextField
                    }
                    placeholder={
                      copy.form
                        .fields
                        .lastName
                        .placeholder
                    }
                    autoComplete="family-name"
                    minLength={
                      2
                    }
                    maxLength={
                      100
                    }
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>
                    {
                      copy.form
                        .fields
                        .companyName
                        .label
                    }
                  </span>

                  <input
                    type="text"
                    name="companyName"
                    value={
                      form.companyName
                    }
                    onChange={
                      updateTextField
                    }
                    placeholder={
                      copy.form
                        .fields
                        .companyName
                        .placeholder
                    }
                    autoComplete="organization"
                    minLength={
                      2
                    }
                    maxLength={
                      180
                    }
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>
                    {
                      copy.form
                        .fields
                        .jobTitle
                        .label
                    }
                  </span>

                  <input
                    type="text"
                    name="jobTitle"
                    value={
                      form.jobTitle
                    }
                    onChange={
                      updateTextField
                    }
                    placeholder={
                      copy.form
                        .fields
                        .jobTitle
                        .placeholder
                    }
                    autoComplete="organization-title"
                    minLength={
                      2
                    }
                    maxLength={
                      180
                    }
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>
                    {
                      copy.form
                        .fields
                        .email
                        .label
                    }
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      updateTextField
                    }
                    placeholder={
                      copy.form
                        .fields
                        .email
                        .placeholder
                    }
                    autoComplete="email"
                    maxLength={
                      254
                    }
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>
                    {
                      copy.form
                        .fields
                        .phoneNumber
                        .label
                    }
                  </span>

                  <input
                    type="tel"
                    name="phoneNumber"
                    value={
                      form.phoneNumber
                    }
                    onChange={
                      updateTextField
                    }
                    placeholder={
                      copy.form
                        .fields
                        .phoneNumber
                        .placeholder
                    }
                    autoComplete="tel"
                    minLength={
                      6
                    }
                    maxLength={
                      40
                    }
                    required
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="contact-form__fieldset">
              <legend>
                {
                  copy.form
                    .sections
                    .need
                }
              </legend>

              <label className="contact-form__field contact-form__field--full">
                <span>
                  {
                    copy.form
                      .fields
                      .needDescription
                      .label
                  }
                </span>

                <textarea
                  name="needDescription"
                  value={
                    form.needDescription
                  }
                  onChange={
                    updateTextField
                  }
                  placeholder={
                    copy.form
                      .fields
                      .needDescription
                      .placeholder
                  }
                  minLength={
                    20
                  }
                  maxLength={
                    5000
                  }
                  rows={
                    7
                  }
                  required
                />

                <small>
                  {
                    copy.form
                      .fields
                      .needDescription
                      .hint
                  }
                </small>
              </label>
            </fieldset>

            <fieldset className="contact-form__fieldset">
              <legend>
                {
                  copy.form
                    .sections
                    .appointment
                }
              </legend>

              <div className="contact-appointment-choice">
                <div>
                  <h3>
                    {
                      copy.form
                        .appointment
                        .title
                    }
                  </h3>

                  <p>
                    {
                      copy.form
                        .appointment
                        .description
                    }
                  </p>
                </div>

                <div
                  className="contact-appointment-choice__options"
                  role="group"
                  aria-label={
                    copy.form
                      .appointment
                      .title
                  }
                >
                  <button
                    type="button"
                    data-selected={
                      form.wantsAppointment
                        ? 'true'
                        : 'false'
                    }
                    onClick={
                      () =>
                        setAppointmentPreference(
                          true,
                        )
                    }
                  >
                    <CalendarDays
                      size={
                        18
                      }
                      aria-hidden="true"
                    />

                    {
                      copy.form
                        .appointment
                        .yes
                    }
                  </button>

                  <button
                    type="button"
                    data-selected={
                      !form.wantsAppointment
                        ? 'true'
                        : 'false'
                    }
                    onClick={
                      () =>
                        setAppointmentPreference(
                          false,
                        )
                    }
                  >
                    {
                      copy.form
                        .appointment
                        .no
                    }
                  </button>
                </div>
              </div>

              {
                form.wantsAppointment
                  ? (
                      <div className="contact-availabilities">
                        <div className="contact-availabilities__heading">
                          <div>
                            <h3>
                              {
                                copy.form
                                  .appointment
                                  .availabilityTitle
                              }
                            </h3>

                            <p>
                              {
                                copy.form
                                  .appointment
                                  .availabilityDescription
                              }
                            </p>
                          </div>

                          <span>
                            {
                              availabilities.length
                            }
                            /3
                          </span>
                        </div>

                        <div className="contact-availabilities__list">
                          {
                            availabilities.map(
                              (
                                availability,
                                index,
                              ) => (
                                <article
                                  key={
                                    availability.id
                                  }
                                  className="contact-availability"
                                >
                                  <div className="contact-availability__header">
                                    <strong>
                                      {
                                        `${copy.form.appointment.availabilityTitle} ${index + 1}`
                                      }
                                    </strong>

                                    {
                                      availabilities.length >
                                      1
                                        ? (
                                            <button
                                              type="button"
                                              onClick={
                                                () =>
                                                  removeAvailability(
                                                    availability.id,
                                                  )
                                              }
                                              aria-label={
                                                copy.form
                                                  .appointment
                                                  .remove
                                              }
                                            >
                                              <Trash2
                                                size={
                                                  17
                                                }
                                                aria-hidden="true"
                                              />
                                            </button>
                                          )
                                        : null
                                    }
                                  </div>

                                  <div className="contact-availability__grid">
                                    <label className="contact-form__field">
                                      <span>
                                        {
                                          copy.form
                                            .appointment
                                            .date
                                        }
                                      </span>

                                      <input
                                        type="date"
                                        min={
                                          today
                                        }
                                        value={
                                          availability.date
                                        }
                                        onChange={
                                          event =>
                                            updateAvailability(
                                              availability.id,
                                              'date',
                                              event.target.value,
                                            )
                                        }
                                        required
                                      />
                                    </label>

                                    <label className="contact-form__field">
                                      <span>
                                        {
                                          copy.form
                                            .appointment
                                            .startTime
                                        }
                                      </span>

                                      <input
                                        type="time"
                                        value={
                                          availability.startTime
                                        }
                                        onChange={
                                          event =>
                                            updateAvailability(
                                              availability.id,
                                              'startTime',
                                              event.target.value,
                                            )
                                        }
                                        required
                                      />
                                    </label>

                                    <label className="contact-form__field">
                                      <span>
                                        {
                                          copy.form
                                            .appointment
                                            .endTime
                                        }
                                      </span>

                                      <input
                                        type="time"
                                        value={
                                          availability.endTime
                                        }
                                        onChange={
                                          event =>
                                            updateAvailability(
                                              availability.id,
                                              'endTime',
                                              event.target.value,
                                            )
                                        }
                                        required
                                      />
                                    </label>
                                  </div>

                                  <label className="contact-form__field contact-form__field--full">
                                    <span>
                                      {
                                        copy.form
                                          .appointment
                                          .note
                                      }
                                    </span>

                                    <input
                                      type="text"
                                      value={
                                        availability.note
                                      }
                                      onChange={
                                        event =>
                                          updateAvailability(
                                            availability.id,
                                            'note',
                                            event.target.value,
                                          )
                                      }
                                      placeholder={
                                        copy.form
                                          .appointment
                                          .notePlaceholder
                                      }
                                      maxLength={
                                        500
                                      }
                                    />
                                  </label>
                                </article>
                              ),
                            )
                          }
                        </div>

                        <div className="contact-availabilities__footer">
                          <button
                            type="button"
                            onClick={
                              addAvailability
                            }
                            disabled={
                              availabilities.length >=
                              3
                            }
                          >
                            <Plus
                              size={
                                17
                              }
                              aria-hidden="true"
                            />

                            {
                              copy.form
                                .appointment
                                .add
                            }
                          </button>

                          <small>
                            {
                              copy.form
                                .appointment
                                .maximum
                            }
                          </small>
                        </div>
                      </div>
                    )
                  : null
              }
            </fieldset>

            <div
              className="contact-form__honeypot"
              aria-hidden="true"
            >
              <label>
                Website

                <input
                  type="text"
                  name="website"
                  value={
                    form.website
                  }
                  onChange={
                    updateTextField
                  }
                  tabIndex={
                    -1
                  }
                  autoComplete="off"
                />
              </label>
            </div>

            <label className="contact-form__privacy">
              <input
                type="checkbox"
                checked={
                  form.privacyConsent
                }
                onChange={
                  updatePrivacyConsent
                }
                required
              />

              <span className="contact-form__privacy-check">
                <Check
                  size={
                    14
                  }
                  aria-hidden="true"
                />
              </span>

              <span>
                {
                  copy.form
                    .privacy
                    .prefix
                }

                {' '}

<button
  type="button"
  className="contact-form__privacy-button"
  onClick={
    event => {
      event.preventDefault();
      event.stopPropagation();

      setIsPrivacyModalOpen(
        true,
      );
    }
  }
>
  {
    copy.form
      .privacy
      .linkLabel
  }
</button>

                {
                  copy.form
                    .privacy
                    .suffix
                    ? ` ${copy.form.privacy.suffix}`
                    : ''
                }
              </span>
            </label>

            {
              errorMessage
                ? (
                    <div
                      className="contact-form__error"
                      role="alert"
                    >
                      {
                        errorMessage
                      }
                    </div>
                  )
                : null
            }

            <button
              type="submit"
              className="contact-form__submit"
              disabled={
                isSubmitting
              }
            >
              {
                isSubmitting
                  ? (
                      <>
                        <Clock3
                          size={
                            19
                          }
                          aria-hidden="true"
                        />

                        {
                          copy.form
                            .submitting
                        }
                      </>
                    )
                  : (
                      <>
                        <Send
                          size={
                            19
                          }
                          aria-hidden="true"
                        />

                        {
                          copy.form
                            .submit
                        }

                        <ArrowRight
                          size={
                            18
                          }
                          aria-hidden="true"
                        />
                      </>
                    )
              }
            </button>
          </form>
        </div>
      </section>

      {
        isPrivacyModalOpen
          ? (
              <div
                className="contact-privacy-modal"
                role="presentation"
                onMouseDown={
                  event => {
                    if (
                      event.target ===
                      event.currentTarget
                    ) {
                      setIsPrivacyModalOpen(
                        false,
                      );
                    }
                  }
                }
              >
                <section
                  className="contact-privacy-modal__dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="contact-privacy-modal-title"
                >
                  <div className="contact-privacy-modal__header">
                    <div>
                      <p className="eyebrow">
                        {
                          copy.form
                            .privacy
                            .modal
                            .eyebrow
                        }
                      </p>

                      <h2 id="contact-privacy-modal-title">
                        {
                          copy.form
                            .privacy
                            .modal
                            .title
                        }
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="contact-privacy-modal__close"
                      onClick={
                        () =>
                          setIsPrivacyModalOpen(
                            false,
                          )
                      }
                      aria-label={
                        copy.form
                          .privacy
                          .modal
                          .close
                      }
                    >
                      <X
                        size={
                          21
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="contact-privacy-modal__content">
                    <p className="contact-privacy-modal__introduction">
                      {
                        copy.form
                          .privacy
                          .modal
                          .introduction
                      }
                    </p>

                    <article>
                      <h3>
                        {
                          copy.form
                            .privacy
                            .modal
                            .collectedDataTitle
                        }
                      </h3>

                      <ul>
                        {
                          copy.form
                            .privacy
                            .modal
                            .collectedData
                            .map(
                              item => (
                                <li key={item}>
                                  {
                                    item
                                  }
                                </li>
                              ),
                            )
                        }
                      </ul>
                    </article>

                    <article>
                      <h3>
                        {
                          copy.form
                            .privacy
                            .modal
                            .purposesTitle
                        }
                      </h3>

                      <ul>
                        {
                          copy.form
                            .privacy
                            .modal
                            .purposes
                            .map(
                              item => (
                                <li key={item}>
                                  {
                                    item
                                  }
                                </li>
                              ),
                            )
                        }
                      </ul>
                    </article>

                    <article>
                      <h3>
                        {
                          copy.form
                            .privacy
                            .modal
                            .accessTitle
                        }
                      </h3>

                      <p>
                        {
                          copy.form
                            .privacy
                            .modal
                            .accessDescription
                        }
                      </p>
                    </article>

                    <article>
                      <h3>
                        {
                          copy.form
                            .privacy
                            .modal
                            .retentionTitle
                        }
                      </h3>

                      <p>
                        {
                          copy.form
                            .privacy
                            .modal
                            .retentionDescription
                        }
                      </p>
                    </article>

                    <article>
                      <h3>
                        {
                          copy.form
                            .privacy
                            .modal
                            .rightsTitle
                        }
                      </h3>

                      <p>
                        {
                          copy.form
                            .privacy
                            .modal
                            .rightsDescription
                        }
                      </p>
                    </article>

                    <article>
                      <h3>
                        {
                          copy.form
                            .privacy
                            .modal
                            .securityTitle
                        }
                      </h3>

                      <p>
                        {
                          copy.form
                            .privacy
                            .modal
                            .securityDescription
                        }
                      </p>
                    </article>
                  </div>

                  <div className="contact-privacy-modal__footer">
                    <button
                      type="button"
                      onClick={
                        () =>
                          setIsPrivacyModalOpen(
                            false,
                          )
                      }
                    >
                      {
                        copy.form
                          .privacy
                          .modal
                          .close
                      }
                    </button>
                  </div>
                </section>
              </div>
            )
          : null
      }
    </main>
  );
}