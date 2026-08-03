'use client';

import {
  BriefcaseBusiness,
  Check,
} from 'lucide-react';

import {
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

  const resultLabel =
    filteredProjects.length ===
      1
      ? filters.singleResult
      : filters.results;

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
          <div className="projects-page__filters">
            <div className="projects-page__filters-heading">
              <span>
                {
                  filters.label
                }
              </span>

              <strong>
                {
                  filteredProjects.length
                }{' '}
                {
                  resultLabel
                }
              </strong>
            </div>

            <div
              className="projects-page__filter-list"
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
                    setSelectedExpertise(
                      'all',
                    )
                }
              >
                {
                  selectedExpertise ===
                  'all'
                    ? (
                        <Check
                          size={
                            15
                          }
                          aria-hidden="true"
                        />
                      )
                    : null
                }

                {
                  filters.all
                }
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
                            setSelectedExpertise(
                              option.code,
                            )
                        }
                      >
                        {
                          isActive
                            ? (
                                <Check
                                  size={
                                    15
                                  }
                                  aria-hidden="true"
                                />
                              )
                            : null
                        }

                        {
                          option.label
                        }
                      </button>
                    );
                  },
                )
              }
            </div>
          </div>

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
                      filteredProjects.map(
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
        </div>
      </section>
    </main>
  );
}