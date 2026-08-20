'use client';

import {
  FormEvent,
  useMemo,
  useState,
} from 'react';

import {
  CheckCircle2,
} from 'lucide-react';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getMarketSoftCopy,
  type PackageSlug,
} from '@/lib/marketsoft-content';

import {
  MARKETSOFT_PRODUCT_KEY,
} from '@/lib/site-config';

import {
  createPublicProductRequest,
  PublicProductRequestApiError,
  type ProductRequestType,
} from '@/lib/public-product-requests-api';

import {
  ANALYTICS_EVENTS,
} from '@/lib/analytics/events';

import {
  trackEvent,
} from '@/lib/analytics/tracking';

export function ProductRequestForm({
  locale,
  initialPackage,
  intent,
}: {
  locale: AppLocale;
  initialPackage?: string;
  intent: 'order' | 'demo';
}) {
  const copy =
    getMarketSoftCopy(
      locale,
    );

  const [
    pkg,
    setPkg,
  ] =
    useState<PackageSlug>(
      (
        copy.packages.some(
          item =>
            item.slug ===
            initialPackage,
        )
          ? initialPackage
          : 'store'
      ) as PackageSlug,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState(
      '',
    );

  const [
    success,
    setSuccess,
  ] =
    useState(
      false,
    );

  const requestType:
    ProductRequestType =
      intent ===
      'demo'
        ? 'DEMO'
        : 'ORDER';

  const selected =
    useMemo(
      () =>
        copy.packages.find(
          item =>
            item.slug ===
            pkg,
        )!,
      [
        copy.packages,
        pkg,
      ],
    );

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(
      '',
    );

    if (
      !MARKETSOFT_PRODUCT_KEY
    ) {
      setError(
        copy.order.missingKey,
      );

      return;
    }

    const data =
      new FormData(
        event.currentTarget,
      );

    if (
      data.get(
        'privacy',
      ) !==
      'on'
    ) {
      setError(
        copy.order.fields.privacy,
      );

      return;
    }

    setLoading(
      true,
    );

    try {
      const userMessage =
        String(
          data.get(
            'message',
          ) ??
            '',
        ).trim();

      const message =
        `MarketSoft | Package: ${selected.name} | Intent: ${requestType}\n\n${
          userMessage ||
          'Demande MarketSoft envoyée depuis le site.'
        }`;

      await createPublicProductRequest(
        {
          productKey:
            MARKETSOFT_PRODUCT_KEY,

          requestType,

          locale,

          firstName:
            String(
              data.get(
                'firstName',
              ) ??
                '',
            ).trim(),

          lastName:
            String(
              data.get(
                'lastName',
              ) ??
                '',
            ).trim(),

          companyName:
            String(
              data.get(
                'company',
              ) ??
                '',
            ).trim(),

          email:
            String(
              data.get(
                'email',
              ) ??
                '',
            ).trim(),

          phoneNumber:
            String(
              data.get(
                'phone',
              ) ??
                '',
            ).trim(),

          message:
            message.length <
            10
              ? message.padEnd(
                  10,
                  '.',
                )
              : message,

          sourceUrl:
            window.location.href,

          privacyConsent:
            true,

          website:
            '',
        },
      );

      trackEvent(
        requestType ===
          'DEMO'
          ? ANALYTICS_EVENTS.PRODUCT_DEMO_CLICK
          : ANALYTICS_EVENTS.PRODUCT_ORDER_CLICK,
        {
          entity_slug:
            pkg,
          cta_location:
            'marketsoft_request_form',
        },
      );

      setSuccess(
        true,
      );

      event.currentTarget.reset();
    } catch (
      err
    ) {
      setError(
        err instanceof
          PublicProductRequestApiError
          ? err.message
          : copy.order.genericError,
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  if (
    success
  ) {
    return (
      <div className="ms-request-success">
        <CheckCircle2 />

        <h2>
          {copy.order.success}
        </h2>

        <p>
          {selected.name}
        </p>
      </div>
    );
  }

  const firstYearIsNumeric =
    /\d/.test(
      selected.firstYearPrice,
    );

  const annualIsNumeric =
    /\d/.test(
      selected.annualSupportPrice,
    );

  return (
    <form
      className="ms-request-form"
      onSubmit={
        submit
      }
    >
      <div className="ms-request-form__grid">
        <label className="ms-request-form__package-field">
          <span>
            {copy.order.fields.package}
          </span>

          <select
            value={
              pkg
            }
            onChange={
              event =>
                setPkg(
                  event.target
                    .value as PackageSlug,
                )
            }
          >
            {copy.packages.map(
              item => (
                <option
                  key={
                    item.slug
                  }
                  value={
                    item.slug
                  }
                >
                  {item.name}
                </option>
              ),
            )}
          </select>

          <div className="ms-request-form__package-summary">
            <span>
              {copy.pricing.firstYearShort}
            </span>

            <strong
              dir={
                firstYearIsNumeric
                  ? 'ltr'
                  : undefined
              }
            >
              {selected.firstYearPrice}
            </strong>

            {
              selected.slug !==
              'custom'
                ? (
                    <>
                      <span className="ms-request-form__package-separator">
                        ·
                      </span>

                      <span>
                        {copy.pricing.thenShort}
                      </span>

                      <strong
                        dir={
                          annualIsNumeric
                            ? 'ltr'
                            : undefined
                        }
                      >
                        {selected.annualSupportPrice}
                      </strong>
                    </>
                  )
                : null
            }
          </div>
        </label>

        <label>
          <span>
            {copy.order.fields.company}
            {' *'}
          </span>

          <input
            name="company"
            required
            minLength={
              2
            }
          />
        </label>

        <label>
          <span>
            {copy.order.fields.firstName}
          </span>

          <input
            name="firstName"
          />
        </label>

        <label>
          <span>
            {copy.order.fields.lastName}
          </span>

          <input
            name="lastName"
          />
        </label>

        <label>
          <span>
            {copy.order.fields.email}
            {' *'}
          </span>

          <input
            name="email"
            type="email"
            required
          />
        </label>

        <label>
          <span>
            {copy.order.fields.phone}
            {' *'}
          </span>

          <input
            name="phone"
            type="tel"
            required
          />
        </label>

        <label className="ms-request-form__full">
          <span>
            {copy.order.fields.message}
          </span>

          <textarea
            name="message"
            rows={
              6
            }
            placeholder={
              selected.target
            }
          />
        </label>
      </div>

      <label className="ms-request-form__privacy">
        <input
          name="privacy"
          type="checkbox"
          required
        />

        <span>
          {copy.order.fields.privacy}
        </span>
      </label>

      {
        error
          ? (
              <p className="ms-request-form__error">
                {error}
              </p>
            )
          : null
      }

      <button
        className="ms-button ms-button--primary"
        type="submit"
        disabled={
          loading
        }
      >
        {
          loading
            ? '…'
            : intent ===
                'demo'
              ? copy.order.submitDemo
              : copy.order.submitOrder
        }
      </button>
    </form>
  );
}
