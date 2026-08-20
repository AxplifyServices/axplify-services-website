'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';

const AUTOPLAY_DELAY_MS = 5000;

const slides = [
  { src: '/screenshots/marketsoft-commerce-rental.png', key: 'commerce-rental' },
  { src: '/screenshots/marketsoft-commerce-marketplace.png', key: 'commerce-marketplace' },
  { src: '/screenshots/marketsoft-commerce-products.png', key: 'commerce-products' },
  { src: '/screenshots/marketsoft-dashboard-operations.png', key: 'dashboard-operations' },
  { src: '/screenshots/marketsoft-marketing-promotions.png', key: 'marketing-promotions' },
  { src: '/screenshots/marketsoft-sales-overview.png', key: 'sales-overview' },
] as const;

export function ScreenshotGallery({ locale = 'fr' }: { locale?: AppLocale }) {
  const copy = getMarketSoftCopy(locale);
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const previous = () => setIndex((value) => (value - 1 + slides.length) % slides.length);
  const next = () => setIndex((value) => (value + 1) % slides.length);

  useEffect(() => {
    setMounted(true);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReduceMotion(media.matches);

    syncPreference();
    media.addEventListener('change', syncPreference);

    return () => media.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  useEffect(() => {
    if (!full) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFull(false);
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [full]);

  const content = (
    <div
      className="ms-gallery__viewer"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Image
        key={slides[index].key}
        src={slides[index].src}
        alt={`MarketSoft — ${copy.galleryControls.slide} ${index + 1}`}
        width={1672}
        height={941}
        priority={index === 0}
        sizes={full ? '96vw' : '(min-width: 1024px) 55vw, 100vw'}
      />

      <button
        type="button"
        className="ms-gallery__nav ms-gallery__nav--left"
        onClick={previous}
        aria-label={copy.galleryControls.previous}
      >
        <ChevronLeft />
      </button>

      <button
        type="button"
        className="ms-gallery__nav ms-gallery__nav--right"
        onClick={next}
        aria-label={copy.galleryControls.next}
      >
        <ChevronRight />
      </button>

      {full ? (
        <button
          type="button"
          className="ms-gallery__close"
          onClick={() => setFull(false)}
          aria-label={copy.galleryControls.close}
        >
          <X />
        </button>
      ) : (
        <button
          type="button"
          className="ms-gallery__expand"
          onClick={() => setFull(true)}
          aria-label={copy.galleryControls.fullscreen}
        >
          <Maximize2 />
        </button>
      )}
    </div>
  );

  return (
    <div className="ms-gallery" aria-roledescription="carousel">
      {content}

      <div className="ms-gallery__dots">
        {slides.map((slide, itemIndex) => (
          <button
            key={slide.key}
            type="button"
            data-active={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
            aria-label={`${copy.galleryControls.slide} ${itemIndex + 1}`}
            aria-current={itemIndex === index ? 'true' : undefined}
          />
        ))}
      </div>

      {mounted && full
        ? createPortal(
            <div
              className="ms-gallery__modal"
              role="dialog"
              aria-modal="true"
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
