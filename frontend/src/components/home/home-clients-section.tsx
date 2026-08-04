'use client';

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

  /*
   * Ces propriétés restent temporairement acceptées afin de ne pas
   * casser l’appel existant dans la page d’accueil.
   * Elles ne sont plus affichées dans l’interface.
   */
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
   * Chaque ligne possède ses propres clients.
   * La répétition ci-dessous sert uniquement à assurer
   * une animation continue dans cette ligne.
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
  pauseLabel,
  resumeLabel,
  clients,
}: HomeClientsSectionProps) {
  if (
    clients.length <
    3
  ) {
    return null;
  }

  /*
   * Répartition unique :
   * - indices pairs dans la première ligne ;
   * - indices impairs dans la seconde.
   *
   * Un même client ne peut donc jamais apparaître
   * simultanément dans les deux lignes.
   */
  const firstRowClients =
    clients.filter(
      (
        _client,
        index,
      ) =>
        index %
          2 ===
        0,
    );

  const secondRowClients =
    clients.filter(
      (
        _client,
        index,
      ) =>
        index %
          2 ===
        1,
    );

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
        </header>
      </div>

      <div className="home-clients__rows">
        <LogoRow
          clients={
            firstRowClients
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
            secondRowClients
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