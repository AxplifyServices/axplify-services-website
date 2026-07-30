'use client';

import Image from 'next/image';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useEffect,
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  toast,
} from 'sonner';

import {
  z,
} from 'zod';

import {
  useAuth,
} from '@/components/admin/auth-provider';

import {
  AdminApiError,
} from '@/lib/admin-api';

const loginSchema =
  z.object({
    email:
      z
        .string()
        .trim()
        .min(
          1,
          'L’adresse e-mail est obligatoire.',
        )
        .email(
          'Saisis une adresse e-mail valide.',
        ),

    password:
      z
        .string()
        .min(
          1,
          'Le mot de passe est obligatoire.',
        )
        .max(
          128,
          'Le mot de passe est trop long.',
        ),
  });

type LoginFormValues =
  z.infer<
    typeof loginSchema
  >;

export default function AdminLoginPage() {
  const router =
    useRouter();

  const {
    login,
    status,
  } =
    useAuth();

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<
      LoginFormValues
    >({
      resolver:
        zodResolver(
          loginSchema,
        ),

      defaultValues: {
        email:
          '',

        password:
          '',
      },
    });

  useEffect(
    () => {
      if (
        status ===
        'authenticated'
      ) {
        router.replace(
          '/admin',
        );
      }
    },
    [
      router,
      status,
    ],
  );

  async function onSubmit(
    values:
      LoginFormValues,
  ) {
    try {
      const user =
        await login({
          email:
            values.email
              .trim()
              .toLowerCase(),

          password:
            values.password,
        });

      if (
        user.mustChangePassword
      ) {
        toast.warning(
          'Vous devrez définir un nouveau mot de passe.',
        );
      } else {
        toast.success(
          'Connexion réussie.',
        );
      }

      router.replace(
        '/admin',
      );
    } catch (
      error
    ) {
      if (
        error instanceof
          AdminApiError &&
        error.status ===
          401
      ) {
        toast.error(
          'Identifiants invalides.',
        );

        return;
      }

      toast.error(
        error instanceof
          AdminApiError
          ? error.message
          : 'Impossible de se connecter pour le moment.',
      );
    }
  }

  if (
    status ===
    'loading'
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
    <main className="admin-login">
      <section className="admin-login__visual">
        <div className="admin-login__visual-glow" />

        <div className="admin-login__visual-content">
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
            className="admin-login__visual-logo"
          />

          <div className="admin-login__visual-copy">
            <span className="admin-login__visual-eyebrow">
              Espace administrateur
            </span>

            <h1>
              Pilotez votre site Axplify
            </h1>

            <p>
              Connectez-vous pour gérer les contenus et les fonctionnalités de votre site depuis un espace centralisé.
            </p>
          </div>

          <div className="admin-login__security-note">
            <ShieldCheck
              size={
                21
              }
              aria-hidden="true"
            />

            <span>
              Votre connexion est protégée et surveillée.
            </span>
          </div>
        </div>
      </section>

      <section className="admin-login__form-side">
        <div className="admin-login__card">
          <div className="admin-login__mobile-brand">
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
          </div>

          <div className="admin-login__heading">
            <span className="admin-login__heading-icon">
              <LockKeyhole
                size={
                  21
                }
                aria-hidden="true"
              />
            </span>

            <div>
              <p>
                Espace administrateur
              </p>

              <h2>
                Connexion
              </h2>
            </div>
          </div>

          <form
            className="admin-login__form"
            onSubmit={
              handleSubmit(
                onSubmit,
              )
            }
            noValidate
          >
            <div className="admin-field">
              <label htmlFor="admin-email">
                Adresse e-mail
              </label>

              <div
                className="admin-field__control"
                data-invalid={
                  Boolean(
                    errors.email,
                  )
                }
              >
                <Mail
                  size={
                    19
                  }
                  aria-hidden="true"
                />

                <input
                  id="admin-email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="vous@axplify-services.com"
                  aria-invalid={
                    Boolean(
                      errors.email,
                    )
                  }
                  {...register(
                    'email',
                  )}
                />
              </div>

              {errors.email ? (
                <p className="admin-field__error">
                  {
                    errors.email
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">
                Mot de passe
              </label>

              <div
                className="admin-field__control"
                data-invalid={
                  Boolean(
                    errors.password,
                  )
                }
              >
                <LockKeyhole
                  size={
                    19
                  }
                  aria-hidden="true"
                />

                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="current-password"
                  placeholder="Saisissez votre mot de passe"
                  aria-invalid={
                    Boolean(
                      errors.password,
                    )
                  }
                  {...register(
                    'password',
                  )}
                />

                <button
                  type="button"
                  className="admin-field__password-toggle"
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  onClick={
                    () =>
                      setShowPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={
                        19
                      }
                      aria-hidden="true"
                    />
                  ) : (
                    <Eye
                      size={
                        19
                      }
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>

              {errors.password ? (
                <p className="admin-field__error">
                  {
                    errors.password
                      .message
                  }
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="admin-login__submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting ? (
                <LoaderCircle
                  size={
                    20
                  }
                  className="admin-spinner"
                  aria-hidden="true"
                />
              ) : (
                <LockKeyhole
                  size={
                    19
                  }
                  aria-hidden="true"
                />
              )}

              <span>
                {
                  isSubmitting
                    ? 'Connexion en cours…'
                    : 'Se connecter'
                }
              </span>
            </button>
          </form>

          <a
            href="/fr"
            className="admin-login__public-link"
          >
            Retour au site public
          </a>
        </div>
      </section>
    </main>
  );
}