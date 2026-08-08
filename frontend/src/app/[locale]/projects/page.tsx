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

import type {
  ProjectExpertiseCode,
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

  searchParams:
    Promise<{
      page?:
        string;

      expertise?:
        string;
    }>;
};

function resolvePage(
  value:
    string |
    undefined,
) {
  const parsedPage =
    Number.parseInt(
      value ??
        '1',
      10,
    );

  if (
    !Number.isFinite(
      parsedPage,
    ) ||
    parsedPage <
      1
  ) {
    return 1;
  }

  return parsedPage;
}

function resolveExpertise(
  value:
    string |
    undefined,
):
  ProjectExpertiseCode |
  undefined
{
  if (
    !value
  ) {
    return undefined;
  }

  return PROJECT_EXPERTISE_CODES.includes(
    value as ProjectExpertiseCode,
  )
    ? value as ProjectExpertiseCode
    : undefined;
}

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
  searchParams,
}: PageProps) {
  const [
    resolvedParams,
    resolvedSearchParams,
  ] =
    await Promise.all([
      params,
      searchParams,
    ]);

  const {
    locale,
  } =
    resolvedParams;

  const requestedPage =
    resolvePage(
      resolvedSearchParams.page,
    );

  const selectedExpertise =
    resolveExpertise(
      resolvedSearchParams.expertise,
    );

  setRequestLocale(
    locale,
  );

  const [
    projectsResponse,
    t,
  ] =
    await Promise.all([
      getPublicProjects({
        locale,

        page:
          requestedPage,

        limit:
          10,

        expertise:
          selectedExpertise,
      }),

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
        projectsResponse.items
      }
      expertiseOptions={
        expertiseOptions
      }
      selectedExpertise={
        selectedExpertise ??
        'all'
      }
      currentPage={
        projectsResponse.pagination.page
      }
      totalPages={
        projectsResponse.pagination.totalPages
      }
      totalResults={
        projectsResponse.pagination.total
      }
    />
  );
}