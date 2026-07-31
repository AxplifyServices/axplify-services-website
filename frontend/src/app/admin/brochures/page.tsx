'use client';

import {
  LoaderCircle,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useEffect,
} from 'react';

import {
  AdminShell,
} from '@/components/admin/admin-shell';

import {
  useAuth,
} from '@/components/admin/auth-provider';

import {
  HomepageBrochuresManager,
} from '@/components/admin/homepage-brochures-manager';

export default function AdminBrochuresPage() {
  const router =
    useRouter();

  const {
    user,
    status,
  } =
    useAuth();

  useEffect(
    () => {
      if (
        status ===
        'unauthenticated'
      ) {
        router.replace(
          '/admin/login',
        );
      }
    },
    [
      router,
      status,
    ],
  );

  if (
    status !==
      'authenticated' ||
    !user
  ) {
    return (
      <main className="admin-auth-loading">
        <LoaderCircle
          size={
            32
          }
          className="admin-spinner"
          aria-hidden="true"
        />

        <span>
          Vérification de la session…
        </span>
      </main>
    );
  }

  return (
    <AdminShell>
      <HomepageBrochuresManager />
    </AdminShell>
  );
}