'use client';

import dynamic from 'next/dynamic';

import {
  useEffect,
  useState,
} from 'react';

const Agentation =
  dynamic(
    () =>
      import(
        'agentation'
      ).then(
        (
          module,
        ) =>
          module.Agentation,
      ),
    {
      ssr:
        false,
    },
  );

const DESKTOP_MEDIA_QUERY =
  '(min-width: 1024px)';

export function AdminAgentation() {
  const [
    isDesktop,
    setIsDesktop,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      if (
        process.env.NODE_ENV !==
        'development'
      ) {
        return;
      }

      const mediaQuery =
        window.matchMedia(
          DESKTOP_MEDIA_QUERY,
        );

      const updateDesktopState =
        () => {
          setIsDesktop(
            mediaQuery.matches,
          );
        };

      updateDesktopState();

      mediaQuery.addEventListener(
        'change',
        updateDesktopState,
      );

      return () => {
        mediaQuery.removeEventListener(
          'change',
          updateDesktopState,
        );
      };
    },
    [],
  );

  if (
    process.env.NODE_ENV !==
      'development' ||
    !isDesktop
  ) {
    return null;
  }

  return (
    <Agentation
      endpoint={
        process.env
          .NEXT_PUBLIC_AGENTATION_ENDPOINT ??
        'http://localhost:4747'
      }
      className="admin-agentation"
      onSessionCreated={
        (
          sessionId,
        ) => {
          console.info(
            '[Agentation] Session créée :',
            sessionId,
          );
        }
      }
      onSubmit={
        (
          annotations,
        ) => {
          console.info(
            '[Agentation] Annotations envoyées :',
            annotations,
          );
        }
      }
    />
  );
}