'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  useEffect,
  useState,
} from 'react';

import {
  toast,
} from 'sonner';

import {
  useAuth,
} from '@/components/admin/auth-provider';

const SIDEBAR_STORAGE_KEY =
  'axplify-admin-sidebar-collapsed';

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router =
    useRouter();

const pathname =
  usePathname();    

  const {
    user,
    logout,
  } =
    useAuth();

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] =
    useState(
      false,
    );

  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] =
    useState(
      false,
    );

  const [
    isSidebarReady,
    setIsSidebarReady,
  ] =
    useState(
      false,
    );    

  useEffect(
    () => {
      const storedValue =
        window.localStorage.getItem(
          SIDEBAR_STORAGE_KEY,
        );

      setIsSidebarCollapsed(
        storedValue ===
          'true',
      );

      setIsSidebarReady(
        true,
      );
    },
    [],
  );

  useEffect(
    () => {
      if (
        !isSidebarReady
      ) {
        return;
      }

      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(
          isSidebarCollapsed,
        ),
      );
    },
    [
      isSidebarCollapsed,
      isSidebarReady,
    ],
  );

  useEffect(
    () => {
      if (
        !isMobileMenuOpen
      ) {
        return;
      }

      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        'hidden';

      return () => {
        document.body.style.overflow =
          previousOverflow;
      };
    },
    [
      isMobileMenuOpen,
    ],
  );

  async function handleLogout() {
    try {
      await logout();

      toast.success(
        'Vous êtes déconnecté.',
      );
    } finally {
      router.replace(
        '/admin/login',
      );
    }
  }

  function toggleDesktopSidebar() {
    setIsSidebarCollapsed(
      (
        currentValue,
      ) =>
        !currentValue,
    );
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

  const userInitial =
    displayName
      .charAt(
        0,
      )
      .toUpperCase();

  const primaryRole =
    user?.roles[
      0
    ] ??
    'Administrateur';

  return (
    <div
      className="admin-app"
      data-sidebar-collapsed={
        isSidebarCollapsed
      }
    >
      <aside
        className="admin-sidebar"
        data-mobile-open={
          isMobileMenuOpen
        }
        data-collapsed={
          isSidebarCollapsed
        }
      >
        <div className="admin-sidebar__brand">
          <Link
            href="/admin"
            className="admin-sidebar__brand-link"
            aria-label="Accéder au tableau de bord Axplify Services"
          >
            <Image
              src="/brand/logo_axplify_-_V1_icone-removebg-preview.png"
              alt="Axplify Services"
              width={
                500
              }
              height={
                500
              }
              priority
            />
          </Link>

          <button
            type="button"
            className="admin-sidebar__mobile-close"
            aria-label="Fermer le menu"
            onClick={
              () =>
                setIsMobileMenuOpen(
                  false,
                )
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

        <button
          type="button"
          className="admin-sidebar__collapse-toggle"
          aria-label={
            isSidebarCollapsed
              ? 'Déployer la barre latérale'
              : 'Réduire la barre latérale'
          }
          title={
            isSidebarCollapsed
              ? 'Déployer la barre latérale'
              : 'Réduire la barre latérale'
          }
          onClick={
            toggleDesktopSidebar
          }
        >
          {isSidebarCollapsed ? (
            <ChevronRight
              size={20}
              aria-hidden="true"
            />
          ) : (
            <ChevronLeft
              size={20}
              aria-hidden="true"
            />
          )}
        </button>        

        <div className="admin-sidebar__navigation-scroll">
          <nav
            className="admin-sidebar__nav"
            aria-label="Navigation de l’administration"
          >
<Link
  href="/admin"
  className="admin-sidebar__link"
  data-active={
    pathname ===
    '/admin'
  }
  title={
    isSidebarCollapsed
      ? 'Tableau de bord'
      : undefined
  }
  onClick={
    () =>
      setIsMobileMenuOpen(
        false,
      )
  }
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
</Link>

<Link
  href="/admin/brochures"
  className="admin-sidebar__link"
  data-active={
    pathname ===
    '/admin/brochures'
  }
  title={
    isSidebarCollapsed
      ? 'Brochures'
      : undefined
  }
  onClick={
    () =>
      setIsMobileMenuOpen(
        false,
      )
  }
>
  <Images
    size={
      20
    }
    aria-hidden="true"
  />

  <span>
    Brochures
  </span>
</Link>

<Link
  href="/admin/clients"
  className="admin-sidebar__link"
  data-active={
    pathname ===
      '/admin/clients' ||
    pathname.startsWith(
      '/admin/clients/',
    )
  }
  title={
    isSidebarCollapsed
      ? 'Clients'
      : undefined
  }
  onClick={
    () =>
      setIsMobileMenuOpen(
        false,
      )
  }
>
  <Building2
    size={
      20
    }
    aria-hidden="true"
  />

  <span>
    Clients
  </span>
</Link>

<Link
  href="/admin/projects"
  className="admin-sidebar__link"
  data-active={
    pathname ===
      '/admin/projects' ||
    pathname.startsWith(
      '/admin/projects/',
    )
  }
  title={
    isSidebarCollapsed
      ? 'Réalisations'
      : undefined
  }
  onClick={
    () =>
      setIsMobileMenuOpen(
        false,
      )
  }
>
  <BriefcaseBusiness
    size={
      20
    }
    aria-hidden="true"
  />

  <span>
    Réalisations
  </span>
</Link>

          </nav>
        </div>

        <div className="admin-sidebar__footer">

          <div className="admin-sidebar__account">
            <div className="admin-sidebar__avatar">
              {
                userInitial
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
                  primaryRole
                }
              </span>
            </div>

            <button
              type="button"
              className="admin-sidebar__logout"
              aria-label="Se déconnecter"
              title="Se déconnecter"
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
        </div>
      </aside>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="admin-sidebar__backdrop"
          aria-label="Fermer le menu"
          onClick={
            () =>
              setIsMobileMenuOpen(
                false,
              )
          }
        />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__mobile-menu"
            aria-label="Ouvrir le menu"
            onClick={
              () =>
                setIsMobileMenuOpen(
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