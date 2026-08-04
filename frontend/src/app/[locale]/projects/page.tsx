import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ProjectsPageContent,
} from '@/components/projects/projects-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPublicProjects,
  PROJECT_EXPERTISE_CODES,
} from '@/lib/public-projects-api';

import {
  createPageMetadata,
} from '@/lib/seo';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;
    }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  return createPageMetadata(
    locale,
    'projects',
    '/projects',
  );
}

export default async function ProjectsPage({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const [
    projects,
    t,
  ] =
    await Promise.all([
      getPublicProjects(
        locale,
      ),

      getTranslations({
        locale,

        namespace:
          'pages.projects',
      }),
    ]);

  const expertiseOptions =
    PROJECT_EXPERTISE_CODES.map(
      code => ({
        code,

        label:
          t(
            `expertise.${code}`,
          ),
      }),
    );

  return (
    <ProjectsPageContent
      locale={
        locale
      }
      hero={{
        eyebrow:
          t(
            'hero.eyebrow',
          ),

        title:
          t(
            'hero.title',
          ),

        description:
          t(
            'hero.description',
          ),
      }}
filters={{
  label:
    t(
      'filters.label',
    ),

  all:
    t(
      'filters.all',
    ),

  results:
    t(
      'filters.results',
    ),

  singleResult:
    t(
      'filters.singleResult',
    ),

  open:
    t(
      'filters.open',
    ),

  close:
    t(
      'filters.close',
    ),
}}
      emptyState={{
        title:
          t(
            'empty.title',
          ),

        description:
          t(
            'empty.description',
          ),
      }}
      projects={
        projects
      }
      expertiseOptions={
        expertiseOptions
      }
    />
  );
}