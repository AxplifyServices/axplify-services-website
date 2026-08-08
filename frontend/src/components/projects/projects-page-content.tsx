'use client';

import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ProjectExpertiseCode,
  PublicProject,
} from '@/lib/public-projects-api';

type ExpertiseOption = {
  code:
    ProjectExpertiseCode;

  label:
    string;
};

type ProjectsPageContentProps = {
  locale:
    'fr' |
    'en' |
    'ar';

  hero: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;
  };

  filters: {
    label:
      string;

    all:
      string;

    results:
      string;

    singleResult:
      string;

    open:
      string;

    close:
      string;
  };

  emptyState: {
    title:
      string;

    description:
      string;
  };

  projects:
    PublicProject[];

  expertiseOptions:
    ExpertiseOption[];
};

const PROJECTS_PER_PAGE = 10;

type ProjectsFiltersProps = {
  selectedExpertise:
    ProjectExpertiseCode |
    'all';

  filters:
    ProjectsPageContentProps['filters'];

  expertiseOptions:
    ExpertiseOption[];

  onSelect:
    (
      expertise:
        ProjectExpertiseCode |
        'all',
    ) =>
      void;

  onClose?:
    () =>
      void;

  mobile?:
    boolean;
};

function ProjectsFilters({
  selectedExpertise,
  filters,
  expertiseOptions,
  onSelect,
  onClose,
  mobile = false,
}: ProjectsFiltersProps) {

  return (
    <div className="projects-filters">
<header className="projects-filters__header">
  <h2>
    {
      filters.label
    }
  </h2>

        {
          mobile &&
          onClose
            ? (
                <button
                  type="button"
                  className="projects-filters__close"
                  aria-label={
                    filters.close
                  }
                  onClick={
                    onClose
                  }
                >
                  <X
                    size={
                      20
                    }
                    aria-hidden="true"
                  />
                </button>
              )
            : null
        }
      </header>

      <div
        className="projects-filters__list"
        role="group"
        aria-label={
          filters.label
        }
      >
        <button
          type="button"
          data-active={
            selectedExpertise ===
            'all'
          }
          aria-pressed={
            selectedExpertise ===
            'all'
          }
          onClick={
            () =>
              onSelect(
                'all',
              )
          }
        >
          <span className="projects-filters__check">
            {
              selectedExpertise ===
              'all'
                ? (
                    <Check
                      size={
                        14
                      }
                      aria-hidden="true"
                    />
                  )
                : null
            }
          </span>

          <span>
            {
              filters.all
            }
          </span>
        </button>

        {
          expertiseOptions.map(
            option => {
              const isActive =
                selectedExpertise ===
                option.code;

              return (
                <button
                  key={
                    option.code
                  }
                  type="button"
                  data-active={
                    isActive
                  }
                  aria-pressed={
                    isActive
                  }
                  onClick={
                    () =>
                      onSelect(
                        option.code,
                      )
                  }
                >
                  <span className="projects-filters__check">
                    {
                      isActive
                        ? (
                            <Check
                              size={
                                14
                              }
                              aria-hidden="true"
                            />
                          )
                        : null
                    }
                  </span>

                  <span>
                    {
                      option.label
                    }
                  </span>
                </button>
              );
            },
          )
        }
      </div>
    </div>
  );
}

export function ProjectsPageContent({
  locale,
  hero,
  filters,
  emptyState,
  projects,
  expertiseOptions,
}: ProjectsPageContentProps) {
  const [
    selectedExpertise,
    setSelectedExpertise,
  ] =
    useState<
      ProjectExpertiseCode |
      'all'
    >(
      'all',
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(
      false,
    );

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(
      1,
    );

  const filteredProjects =
    useMemo(
      () => {
        if (
          selectedExpertise ===
          'all'
        ) {
          return projects;
        }

        return projects.filter(
          project =>
            project
              .expertiseCodes
              .includes(
                selectedExpertise,
              ),
        );
      },
      [
        projects,
        selectedExpertise,
      ],
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProjects.length /
        PROJECTS_PER_PAGE,
      ),
    );

  const paginatedProjects =
    useMemo(
      () => {
        const startIndex =
          (
            currentPage -
            1
          ) *
          PROJECTS_PER_PAGE;

        return filteredProjects.slice(
          startIndex,
          startIndex +
            PROJECTS_PER_PAGE,
        );
      },
      [
        currentPage,
        filteredProjects,
      ],
    );

  const paginationLabels =
    locale ===
    'fr'
      ? {
          previous:
            'Page précédente',
          next:
            'Page suivante',
          page:
            'Page',
          of:
            'sur',
        }
      : locale ===
          'ar'
        ? {
            previous:
              'الصفحة السابقة',
            next:
              'الصفحة التالية',
            page:
              'الصفحة',
            of:
              'من',
          }
        : {
            previous:
              'Previous page',
            next:
              'Next page',
            page:
              'Page',
            of:
              'of',
          };

  const expertiseLabelByCode =
    useMemo(
      () =>
        new Map(
          expertiseOptions.map(
            option => [
              option.code,
              option.label,
            ],
          ),
        ),
      [
        expertiseOptions,
      ],
    );

  useEffect(
    () => {
      setCurrentPage(
        1,
      );
    },
    [
      selectedExpertise,
      projects,
    ],
  );

  useEffect(
    () => {
      if (
        currentPage >
        totalPages
      ) {
        setCurrentPage(
          totalPages,
        );
      }
    },
    [
      currentPage,
      totalPages,
    ],
  );

  useEffect(
    () => {
      if (
        !filtersOpen
      ) {
        return;
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          setFiltersOpen(
            false,
          );
        }
      }

      document.body.style.overflow =
        'hidden';

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body.style.overflow =
          '';

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      filtersOpen,
    ],
  );

  function selectExpertise(
    expertise:
      ProjectExpertiseCode |
      'all',
  ) {
    setSelectedExpertise(
      expertise,
    );

    setFiltersOpen(
      false,
    );
  }

  return (
    <main
      className="projects-page"
      dir={
        locale ===
        'ar'
          ? 'rtl'
          : 'ltr'
      }
    >
      <section className="projects-page__hero">
        <div className="site-container">
          <div className="projects-page__hero-content">
            <span className="projects-page__eyebrow">
              {
                hero.eyebrow
              }
            </span>

            <h1>
              {
                hero.title
              }
            </h1>

            <div className="projects-page__mobile-toolbar">
              <button
                type="button"
                className="projects-page__filter-trigger"
                aria-expanded={
                  filtersOpen
                }
                aria-controls="projects-mobile-filters"
                onClick={
                  () =>
                    setFiltersOpen(
                      true,
                    )
                }
              >
                <Filter
                  size={
                    18
                  }
                  aria-hidden="true"
                />

                <span>
                  {
                    filters.open
                  }
                </span>

                {
                  selectedExpertise !==
                    'all'
                    ? (
                        <span className="projects-page__filter-indicator">
                          1
                        </span>
                      )
                    : null
                }
              </button>
            </div>

            <p>
              {
                hero.description
              }
            </p>
          </div>
        </div>
      </section>

      <section className="projects-page__content">
        <div className="site-container">

          <div className="projects-page__layout">
            <aside className="projects-page__sidebar">
              <ProjectsFilters
                selectedExpertise={
                  selectedExpertise
                }
                filters={
                  filters
                }
                expertiseOptions={
                  expertiseOptions
                }
                onSelect={
                  selectExpertise
                }
              />
            </aside>

            <div className="projects-page__results">
              {
                filteredProjects.length ===
                0
                  ? (
                      <div className="projects-page__empty">
                        <BriefcaseBusiness
                          size={
                            44
                          }
                          aria-hidden="true"
                        />

                        <h2>
                          {
                            emptyState.title
                          }
                        </h2>

                        <p>
                          {
                            emptyState.description
                          }
                        </p>
                      </div>
                    )
                  : (
                      <div className="projects-page__grid">
                        {
                          paginatedProjects.map(
                            project => (
                              <article
                                key={
                                  project.id
                                }
                                className="project-card"
                              >
                                <header className="project-card__client">
                                  <div className="project-card__logo">
                                    <img
                                      src={
                                        project.client.logoUrl
                                      }
                                      alt={
                                        project.client.logoAlt
                                      }
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  </div>

                                  <div className="project-card__client-copy">
                                    <strong>
                                      {
                                        project.client.name
                                      }
                                    </strong>

                                    {
                                      project.client.industry
                                        ? (
                                            <span>
                                              {
                                                project.client.industry
                                              }
                                            </span>
                                          )
                                        : null
                                    }
                                  </div>
                                </header>

                                <div className="project-card__body">
                                  <div className="project-card__expertises">
                                    {
                                      project.expertiseCodes.map(
                                        expertiseCode => (
                                          <span
                                            key={
                                              expertiseCode
                                            }
                                          >
                                            {
                                              expertiseLabelByCode.get(
                                                expertiseCode,
                                              ) ??
                                              expertiseCode
                                            }
                                          </span>
                                        ),
                                      )
                                    }
                                  </div>

                                  <h2>
                                    {
                                      project.title
                                    }
                                  </h2>

                                  <p>
                                    {
                                      project.description
                                    }
                                  </p>
                                </div>
                              </article>
                            ),
                          )
                        }
                      </div>
                    )
              }

              {
                filteredProjects.length >
                  PROJECTS_PER_PAGE
                  ? (
                      <nav
                        className="projects-page__pagination"
                        aria-label={
                          paginationLabels.page
                        }
                      >
                        <button
                          type="button"
                          className="projects-page__pagination-arrow"
                          aria-label={
                            paginationLabels.previous
                          }
                          disabled={
                            currentPage ===
                            1
                          }
                          onClick={
                            () =>
                              setCurrentPage(
                                page =>
                                  Math.max(
                                    1,
                                    page -
                                      1,
                                  ),
                              )
                          }
                        >
                          {
                            locale ===
                            'ar'
                              ? (
                                  <ChevronRight
                                    size={
                                      18
                                    }
                                    aria-hidden="true"
                                  />
                                )
                              : (
                                  <ChevronLeft
                                    size={
                                      18
                                    }
                                    aria-hidden="true"
                                  />
                                )
                          }
                        </button>

                        <div className="projects-page__pagination-pages">
                          {
                            Array.from(
                              {
                                length:
                                  totalPages,
                              },
                              (
                                _,
                                index,
                              ) => {
                                const page =
                                  index +
                                  1;

                                return (
                                  <button
                                    key={
                                      page
                                    }
                                    type="button"
                                    data-active={
                                      currentPage ===
                                      page
                                    }
                                    aria-current={
                                      currentPage ===
                                      page
                                        ? 'page'
                                        : undefined
                                    }
                                    aria-label={
                                      `${paginationLabels.page} ${page} ${paginationLabels.of} ${totalPages}`
                                    }
                                    onClick={
                                      () =>
                                        setCurrentPage(
                                          page,
                                        )
                                    }
                                  >
                                    {
                                      page
                                    }
                                  </button>
                                );
                              },
                            )
                          }
                        </div>

                        <button
                          type="button"
                          className="projects-page__pagination-arrow"
                          aria-label={
                            paginationLabels.next
                          }
                          disabled={
                            currentPage ===
                            totalPages
                          }
                          onClick={
                            () =>
                              setCurrentPage(
                                page =>
                                  Math.min(
                                    totalPages,
                                    page +
                                      1,
                                  ),
                              )
                          }
                        >
                          {
                            locale ===
                            'ar'
                              ? (
                                  <ChevronLeft
                                    size={
                                      18
                                    }
                                    aria-hidden="true"
                                  />
                                )
                              : (
                                  <ChevronRight
                                    size={
                                      18
                                    }
                                    aria-hidden="true"
                                  />
                                )
                          }
                        </button>
                      </nav>
                    )
                  : null
              }
            </div>
          </div>
        </div>
      </section>

      {
        filtersOpen
          ? (
              <div
                className="projects-page__filter-overlay"
                role="presentation"
                onMouseDown={
                  event => {
                    if (
                      event.target ===
                      event.currentTarget
                    ) {
                      setFiltersOpen(
                        false,
                      );
                    }
                  }
                }
              >
                <aside
                  id="projects-mobile-filters"
                  className="projects-page__filter-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-label={
                    filters.label
                  }
                >
                  <ProjectsFilters
                    mobile
                    selectedExpertise={
                      selectedExpertise
                    }
                    filters={
                      filters
                    }
                    expertiseOptions={
                      expertiseOptions
                    }
                    onSelect={
                      selectExpertise
                    }
                    onClose={
                      () =>
                        setFiltersOpen(
                          false,
                        )
                    }
                  />
                </aside>
              </div>
            )
          : null
      }
    </main>
  );
}