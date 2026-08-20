'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';

const slides = [
  { src: '/screenshots/dashboard-01.svg', key: 'dashboard' },
  { src: '/screenshots/storefront-01.svg', key: 'storefront' },
  { src: '/screenshots/orders-01.svg', key: 'orders' },
] as const;

export function ScreenshotGallery({ locale = 'fr' }: { locale?: AppLocale }) {
  const copy = getMarketSoftCopy(locale);
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previous = () => setIndex((value) => (value - 1 + slides.length) % slides.length);
  const next = () => setIndex((value) => (value + 1) % slides.length);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="ms-gallery__viewer">
      <Image
        src={slides[index].src}
        alt={`MarketSoft — ${copy.galleryControls.slide} ${index + 1}`}
        width={1600}
        height={900}
        priority={index === 0}
      />
      <button type="button" className="ms-gallery__nav ms-gallery__nav--left" onClick={previous} aria-label={copy.galleryControls.previous}><ChevronLeft /></button>
      <button type="button" className="ms-gallery__nav ms-gallery__nav--right" onClick={next} aria-label={copy.galleryControls.next}><ChevronRight /></button>
      {full ? (
        <button type="button" className="ms-gallery__close" onClick={() => setFull(false)} aria-label={copy.galleryControls.close}><X /></button>
      ) : (
        <button type="button" className="ms-gallery__expand" onClick={() => setFull(true)} aria-label={copy.galleryControls.fullscreen}><Maximize2 /></button>
      )}
    </div>
  );

  return (
    <div className="ms-gallery">
      {content}
      <div className="ms-gallery__dots">
        {slides.map((slide, itemIndex) => (
          <button
            key={slide.key}
            type="button"
            data-active={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
            aria-label={`${copy.galleryControls.slide} ${itemIndex + 1}`}
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
