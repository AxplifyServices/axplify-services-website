import type {
  Metadata,
} from 'next';

import {
  Toaster,
} from 'sonner';

import {
  AuthProvider,
} from '@/components/admin/auth-provider';

import {
  AdminAgentation,
} from '@/components/admin/admin-agentation';

import '../globals.css';
import './admin.css';

export const metadata:
  Metadata = {
    title:
      'Administration | Axplify Services',

    description:
      'Espace d’administration sécurisé du site Axplify Services.',

    robots: {
      index:
        false,

      follow:
        false,

      nocache:
        true,
    },
  };

export default function AdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
    >
      <body className="admin-body">
<AuthProvider>
  {
    children
  }

  <AdminAgentation />
</AuthProvider>

<Toaster
  position="top-right"
  richColors
  closeButton
/>
      </body>
    </html>
  );
}