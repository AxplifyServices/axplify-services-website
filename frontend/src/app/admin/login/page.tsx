'use client';

import Image
  from 'next/image';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  Eye,
  EyeOff,
  Languages,
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
  useMemo,
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

type AdminLanguage =
  | 'fr'
  | 'en'
  | 'ar';

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

const translations = {
  fr: {
    security:
      'Espace sécurisé',

    title:
      'Bienvenue dans votre espace Axplify',

    description:
      'Connectez-vous pour gérer progressivement les contenus et les fonctionnalités de votre site.',

    email:
      'Adresse e-mail',

    emailPlaceholder:
      'vous@axplify-services.com',

    password:
      'Mot de passe',

    passwordPlaceholder:
      'Saisissez votre mot de passe',

    showPassword:
      'Afficher le mot de passe',

    hidePassword:
      'Masquer le mot de passe',

    login:
      'Se connecter',

    connecting:
      'Connexion en cours…',

    protected:
      'Votre connexion est protégée et surveillée.',

    back:
      'Retour au site public',

    invalid:
      'Identifiants invalides.',

    error:
      'Impossible de se connecter pour le moment.',
  },

  en: {
    security:
      'Secure area',

    title:
      'Welcome to your Axplify workspace',

    description:
      'Sign in to progressively manage your website content and features.',

    email:
      'Email address',

    emailPlaceholder:
      'you@axplify-services.com',

    password:
      'Password',

    passwordPlaceholder:
      'Enter your password',

    showPassword:
      'Show password',

    hidePassword:
      'Hide password',

    login:
      'Sign in',

    connecting:
      'Signing in…',

    protected:
      'Your connection is protected and monitored.',

    back:
      'Back to public website',

    invalid:
      'Invalid credentials.',

    error:
      'Unable to sign in right now.',
  },

  ar: {
    security:
      'مساحة آمنة',

    title:
      'مرحباً بك في مساحة إدارة Axplify',

    description:
      'سجّل الدخول لإدارة محتوى وخصائص موقعك تدريجياً.',

    email:
      'البريد الإلكتروني',

    emailPlaceholder:
      'you@axplify-services.com',

    password:
      'كلمة المرور',

    passwordPlaceholder:
      'أدخل كلمة المرور',

    showPassword:
      'إظهار كلمة المرور',

    hidePassword:
      'إخفاء كلمة المرور',

    login:
      'تسجيل الدخول',

    connecting:
      'جارٍ تسجيل الدخول…',

    protected:
      'اتصالك محمي وتتم مراقبته.',

    back:
      'العودة إلى الموقع',

    invalid:
      'بيانات الدخول غير صحيحة.',

    error:
      'تعذر تسجيل الدخول حالياً.',
  },
} satisfies Record<
  AdminLanguage,
  Record<
    string,
    string
  >
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
    language,
    setLanguage,
  ] =
    useState<
      AdminLanguage
    >(
      'fr',
    );

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );

  const t =
    useMemo(
      () =>
        translations[
          language
        ],
      [
        language,
      ],
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
      const savedLanguage =
        window.localStorage
          .getItem(
            'axplify-admin-language',
          );

      if (
        savedLanguage ===
          'fr' ||
        savedLanguage ===
          'en' ||
        savedLanguage ===
          'ar'
      ) {
        setLanguage(
          savedLanguage,
        );
      }
    },
    [],
  );

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

  function changeLanguage(
    nextLanguage:
      AdminLanguage,
  ) {
    setLanguage(
      nextLanguage,
    );

    window.localStorage
      .setItem(
        'axplify-admin-language',
        nextLanguage,
      );
  }

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
          t.invalid,
        );

        return;
      }

      toast.error(
        error instanceof
          AdminApiError
          ? error.message
          : t.error,
      );
    }
  }

  const direction =
    language ===
      'ar'
      ? 'rtl'
      : 'ltr';

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
          Chargement…
        </span>
      </main>
    );
  }

  return (
    <main
      className="admin-login"
      dir={
        direction
      }
    >
      <section className="admin-login__visual">
        <div className="admin-login__visual-glow" />

        <div className="admin-login__visual-content">
          <Image
            src="/brand/axplify-logo.svg"
            alt="Axplify Services"
            width={
              230
            }
            height={
              76
            }
            priority
            className="admin-login__visual-logo"
          />

          <div className="admin-login__visual-copy">
            <span className="admin-login__visual-eyebrow">
              {
                t.security
              }
            </span>

            <h1>
              {
                t.title
              }
            </h1>

            <p>
              {
                t.description
              }
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
              {
                t.protected
              }
            </span>
          </div>
        </div>
      </section>

      <section className="admin-login__form-side">
        <div className="admin-login__language">
          <Languages
            size={
              17
            }
            aria-hidden="true"
          />

          <div
            className="admin-login__language-options"
            role="group"
            aria-label="Langue"
          >
            {(
              [
                'fr',
                'en',
                'ar',
              ] as const
            ).map(
              (
                item,
              ) => (
                <button
                  key={
                    item
                  }
                  type="button"
                  data-active={
                    language ===
                    item
                  }
                  onClick={
                    () =>
                      changeLanguage(
                        item,
                      )
                  }
                >
                  {
                    item.toUpperCase()
                  }
                </button>
              ),
            )}
          </div>
        </div>

        <div className="admin-login__card">
          <div className="admin-login__mobile-brand">
            <Image
              src="/brand/axplify-logo.svg"
              alt="Axplify Services"
              width={
                205
              }
              height={
                68
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
                {
                  t.security
                }
              </p>

              <h2>
                {
                  t.login
                }
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
              <label
                htmlFor="admin-email"
              >
                {
                  t.email
                }
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
                  placeholder={
                    t.emailPlaceholder
                  }
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
              <label
                htmlFor="admin-password"
              >
                {
                  t.password
                }
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
                  placeholder={
                    t.passwordPlaceholder
                  }
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
                      ? t.hidePassword
                      : t.showPassword
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
                    ? t.connecting
                    : t.login
                }
              </span>
            </button>
          </form>

          <a
            href="/fr"
            className="admin-login__public-link"
          >
            {
              t.back
            }
          </a>
        </div>
      </section>
    </main>
  );
}