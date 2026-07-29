import {
  getTranslations,
} from 'next-intl/server';

import {
  Link,
} from '@/i18n/navigation';

export default async function NotFoundPage() {
  const t =
    await getTranslations(
      'notFound',
    );

  return (
    <section className="placeholder-page">
      <div className="site-container placeholder-page__content">
        <p className="eyebrow">
          404
        </p>

        <h1>
          {
            t(
              'title',
            )
          }
        </h1>

        <p>
          {
            t(
              'description',
            )
          }
        </p>

        <Link
          href="/"
          className="button button--primary"
        >
          {
            t(
              'backHome',
            )
          }
        </Link>
      </div>
    </section>
  );
}