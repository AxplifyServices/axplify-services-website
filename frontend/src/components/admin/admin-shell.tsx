'use client';

import Image
  from 'next/image';

import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useState,
} from 'react';

import {
  toast,
} from 'sonner';

import {
  useAuth,
} from '@/components/admin/auth-provider';

export function AdminShell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const router =
    useRouter();

  const {
    user,
    logout,
  } =
    useAuth();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] =
    useState(
      false,
    );

  async function handleLogout() {
    try {
      await logout();

      router.replace(
        '/admin/login',
      );

      toast.success(
        'Vous êtes déconnecté.',
      );
    } catch {
      router.replace(
        '/admin/login',
      );
    }
  }

  const displayName =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(
        Boolean,
      )
      .join(
        ' ',
      ) ||
    user?.email ||
    'Administrateur';

  return (
    <div className="admin-app">
      <aside
        className="admin-sidebar"
        data-open={
          isMenuOpen
        }
      >
        <div className="admin-sidebar__brand">
          <Image
            src="/brand/axplify-logo.svg"
            alt="Axplify Services"
            width={
              190
            }
            height={
              64
            }
            priority
          />

          <button
            type="button"
            className="admin-sidebar__close"
            aria-label="Fermer le menu"
            onClick={
              () =>
                setIsMenuOpen(
                  false,
                )
            }
          >
            <X
              size={
                22
              }
              aria-hidden="true"
            />
          </button>
        </div>

        <nav
          className="admin-sidebar__nav"
          aria-label="Navigation de l’administration"
        >
          <a
            href="/admin"
            className="admin-sidebar__link"
            data-active="true"
          >
            <LayoutDashboard
              size={
                20
              }
              aria-hidden="true"
            />

            <span>
              Tableau de bord
            </span>
          </a>
        </nav>

        <div className="admin-sidebar__account">
          <div className="admin-sidebar__avatar">
            {
              displayName
                .charAt(
                  0,
                )
                .toUpperCase()
            }
          </div>

          <div className="admin-sidebar__identity">
            <strong>
              {
                displayName
              }
            </strong>

            <span>
              {
                user?.roles[
                  0
                ] ??
                'Administrateur'
              }
            </span>
          </div>

          <button
            type="button"
            className="admin-sidebar__logout"
            aria-label="Se déconnecter"
            onClick={
              () =>
                void handleLogout()
            }
          >
            <LogOut
              size={
                19
              }
              aria-hidden="true"
            />
          </button>
        </div>
      </aside>

      {isMenuOpen ? (
        <button
          type="button"
          className="admin-sidebar__backdrop"
          aria-label="Fermer le menu"
          onClick={
            () =>
              setIsMenuOpen(
                false,
              )
          }
        />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            aria-label="Ouvrir le menu"
            onClick={
              () =>
                setIsMenuOpen(
                  true,
                )
            }
          >
            <Menu
              size={
                22
              }
              aria-hidden="true"
            />
          </button>

          <div className="admin-topbar__title">
            <span>
              Administration
            </span>

            <strong>
              Axplify Services
            </strong>
          </div>

          <button
            type="button"
            className="admin-topbar__logout"
            onClick={
              () =>
                void handleLogout()
            }
          >
            <LogOut
              size={
                18
              }
              aria-hidden="true"
            />

            <span>
              Déconnexion
            </span>
          </button>
        </header>

        <main className="admin-content">
          {
            children
          }
        </main>
      </div>
    </div>
  );
}