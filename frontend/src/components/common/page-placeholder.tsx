import {
  getTranslations,
} from 'next-intl/server';

export async function PagePlaceholder({
  namespace,
}: {
  namespace: string;
}) {
  const t =
    await getTranslations(
      `pages.${namespace}`,
    );

  return (
    <section className="placeholder-page">
      <div
        className="placeholder-page__glow"
        aria-hidden="true"
      />

      <div className="site-container placeholder-page__content">
        <p className="eyebrow">
          {
            t(
              'eyebrow',
            )
          }
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

        <div
          className="placeholder-page__marker"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}