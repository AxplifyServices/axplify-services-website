'use client';

import {
  Pause,
  Play,
} from 'lucide-react';

import {
  useMemo,
  useState,
} from 'react';

import type {
  PublicHomepageClient,
} from '@/lib/homepage-clients-api';

type HomeClientsSectionProps = {
  title:
    string;

  introduction:
    string;

  pauseLabel:
    string;

  resumeLabel:
    string;

  clients:
    PublicHomepageClient[];
};

type LogoRowProps = {
  clients:
    PublicHomepageClient[];

  direction:
    'left' |
    'right';

  pauseLabel:
    string;

  resumeLabel:
    string;
};

function LogoRow({
  clients,
  direction,
  pauseLabel,
  resumeLabel,
}: LogoRowProps) {
  const [
    isPaused,
    setIsPaused,
  ] =
    useState(
      false,
    );

  /*
   * La répétition est purement visuelle.
   * Les clients ne sont pas dupliqués dans les données
   * et restent uniques côté API et administration.
   */
  const repeatedClients =
    useMemo(
      () => [
        ...clients,
        ...clients,
        ...clients,
      ],
      [
        clients,
      ],
    );

  const actionLabel =
    isPaused
      ? resumeLabel
      : pauseLabel;

  return (
    <div className="home-clients__row-shell">
      <button
        type="button"
        className="home-clients__row"
        data-direction={
          direction
        }
        data-paused={
          isPaused
        }
        aria-label={
          actionLabel
        }
        aria-pressed={
          isPaused
        }
        onClick={
          () =>
            setIsPaused(
              currentValue =>
                !currentValue,
            )
        }
      >
        <span className="home-clients__row-action">
          {
            isPaused
              ? (
                  <Play
                    size={
                      16
                    }
                    aria-hidden="true"
                  />
                )
              : (
                  <Pause
                    size={
                      16
                    }
                    aria-hidden="true"
                  />
                )
          }

          <span>
            {
              actionLabel
            }
          </span>
        </span>

        <span className="home-clients__track">
          {
            repeatedClients.map(
              (
                client,
                index,
              ) => (
                <span
                  key={
                    `${direction}-${client.id}-${index}`
                  }
                  className="home-clients__logo-card"
                  aria-hidden={
                    index >=
                    clients.length
                  }
                >
                  <img
                    src={
                      client.logoUrl
                    }
                    alt={
                      index <
                      clients.length
                        ? client.logoAlt
                        : ''
                    }
                    loading="lazy"
                    decoding="async"
                  />

                  <span className="home-clients__client-copy">
                    <strong>
                      {
                        client.name
                      }
                    </strong>

                    {
                      client.industry
                        ? (
                            <small>
                              {
                                client.industry
                              }
                            </small>
                          )
                        : null
                    }
                  </span>
                </span>
              ),
            )
          }
        </span>
      </button>
    </div>
  );
}

export function HomeClientsSection({
  title,
  introduction,
  pauseLabel,
  resumeLabel,
  clients,
}: HomeClientsSectionProps) {
  /*
   * Le backend retourne déjà un tableau vide sous trois clients.
   * Cette seconde protection évite tout affichage accidentel
   * si le contrat de l’API change plus tard.
   */
  if (
    clients.length <
    3
  ) {
    return null;
  }

  return (
    <section
      className="home-clients"
      aria-labelledby="home-clients-title"
    >
      <div className="site-container">
        <header className="home-clients__heading">
          <h2 id="home-clients-title">
            {
              title
            }
          </h2>

          <p>
            {
              introduction
            }
          </p>
        </header>
      </div>

      <div className="home-clients__rows">
        <LogoRow
          clients={
            clients
          }
          direction="right"
          pauseLabel={
            pauseLabel
          }
          resumeLabel={
            resumeLabel
          }
        />

        <LogoRow
          clients={
            clients
          }
          direction="left"
          pauseLabel={
            pauseLabel
          }
          resumeLabel={
            resumeLabel
          }
        />
      </div>
    </section>
  );
}