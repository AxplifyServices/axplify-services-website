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

export default function AdminDashboardPage() {
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
      <section className="admin-dashboard">
        <div className="admin-dashboard__heading">
          <div>
            <p>
              Tableau de bord
            </p>

            <h1>
              Bonjour
              {
                user.firstName
                  ? ` ${user.firstName}`
                  : ''
              }
            </h1>

            <span>
              Votre espace d’administration est prêt.
            </span>
          </div>
        </div>

        <div className="admin-dashboard__empty">
          <div className="admin-dashboard__empty-mark">
            AX
          </div>

          <h2>
            Le tableau de bord est prêt
          </h2>

          <p>
            Les indicateurs et les modules de gestion apparaîtront ici au fur et à mesure de leur création.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}