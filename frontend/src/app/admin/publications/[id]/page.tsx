'use client';

import {
  LoaderCircle,
} from 'lucide-react';

import {
  useParams,
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
  PublicationEditor,
} from '@/components/admin/publication-editor';

export default function EditPublicationPage() {
  const router =
    useRouter();

  const params =
    useParams<{
      id:
        string;
    }>();

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
      <PublicationEditor
        publicationId={
          params.id
        }
      />
    </AdminShell>
  );
}