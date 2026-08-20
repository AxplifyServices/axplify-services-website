'use client';

import { MessageCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Link, usePathname } from '@/i18n/navigation';

export function FloatingContactButton({
  label,
}: {
  label: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isContactPage =
    pathname === '/contact';

  const isDemoRequestPage =
    pathname === '/order' &&
    searchParams.get('intent') === 'demo';

  if (
    isContactPage ||
    isDemoRequestPage
  ) {
    return null;
  }

  return (
    <Link
      href="/contact"
      className="ms-floating-contact"
      aria-label={label}
    >
      <MessageCircle aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
