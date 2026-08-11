'use client';

import {
  useMemo,
  useState,
} from 'react';

import type {
  PointerEvent as ReactPointerEvent,
} from 'react';

import type {
  PublicHomepageClient,
} from '@/lib/homepage-clients-api';

type HomeClientsSectionProps = {
  title:
    string;

  /*
   * Ces propriétés restent acceptées afin de ne pas
   * modifier l’interface utilisée par la page d’accueil.
   * Elles ne sont pas affichées visuellement.
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
    isPressed,
    setIsPressed,
  ] =
    useState(
      false,
    );

  /*
   * La répétition ne duplique les clients que dans
   * la même ligne pour obtenir une animation continue.
   *
   * Elle n’a aucune incidence sur la répartition
   * entre la première et la deuxième ligne.
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

function pauseAnimation(
  event:
    ReactPointerEvent<HTMLButtonElement>,
) {
  /*
   * Sur mobile, un contact tactile fait partie
   * du scroll naturel de la page.
   *
   * Il ne doit donc jamais être interprété
   * comme une demande de mise en pause
   * du carrousel.
   */
  if (
    event.pointerType ===
    'touch'
  ) {
    return;
  }

  /*
   * Avec une souris, seul le bouton principal
   * peut mettre l'animation en pause.
   */
  if (
    event.pointerType ===
      'mouse' &&
    event.button !==
      0
  ) {
    return;
  }

  event.currentTarget.setPointerCapture(
    event.pointerId,
  );

  setIsPressed(
    true,
  );
}

  function resumeAnimation(
    event:
      ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    setIsPressed(
      false,
    );
  }

  function cancelPause() {
    setIsPressed(
      false,
    );
  }

  return (
    <div className="home-clients__row-shell">
      <button
        type="button"
        className="home-clients__row"
        data-direction={
          direction
        }
        data-paused={
          isPressed
        }
        aria-label={
          isPressed
            ? resumeLabel
            : pauseLabel
        }
        aria-pressed={
          isPressed
        }
        onPointerDown={
          pauseAnimation
        }
        onPointerUp={
          resumeAnimation
        }
        onPointerCancel={
          cancelPause
        }
        onLostPointerCapture={
          cancelPause
        }
        onContextMenu={
          event =>
            event.preventDefault()
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
  /*
   * La liste reçue par cette section provient déjà
   * de l’endpoint public des clients visibles sur la home.
   */
  if (
    clients.length <
    3
  ) {
    return null;
  }

  const shouldDisplaySecondRow =
    clients.length >
    6;

  /*
   * Entre 3 et 6 clients :
   * tous les clients apparaissent dans l’unique ligne.
   *
   * Au-delà de 6 clients :
   * on sépare la liste en deux groupes distincts.
   * slice garantit qu’un client ne peut appartenir
   * qu’à une seule ligne.
   */
  const firstRowClients =
    shouldDisplaySecondRow
      ? clients.slice(
          0,
          Math.ceil(
            clients.length /
              2,
          ),
        )
      : clients;

  const secondRowClients =
    shouldDisplaySecondRow
      ? clients.slice(
          Math.ceil(
            clients.length /
              2,
          ),
        )
      : [];

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

      <div
        className="home-clients__rows"
        data-row-count={
          shouldDisplaySecondRow
            ? '2'
            : '1'
        }
      >
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

        {
          shouldDisplaySecondRow
            ? (
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
              )
            : null
        }
      </div>
    </section>
  );
}