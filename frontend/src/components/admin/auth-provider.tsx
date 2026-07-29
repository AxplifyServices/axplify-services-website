'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  adminApi,
  AdminApiError,
} from '@/lib/admin-api';

import type {
  AdminUser,
  LoginCredentials,
} from '@/lib/admin-api';

type AuthenticationStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

type AuthContextValue = {
  user:
    AdminUser | null;

  status:
    AuthenticationStatus;

  accessToken:
    string | null;

  login: (
    credentials:
      LoginCredentials,
  ) => Promise<AdminUser>;

  logout:
    () => Promise<void>;

  refreshSession:
    () => Promise<string | null>;

  authorizedFetch: <T>(
    endpoint:
      string,

    options?:
      RequestInit,
  ) => Promise<T>;
};

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<
      AdminUser | null
    >(
      null,
    );

  const [
    accessToken,
    setAccessToken,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    status,
    setStatus,
  ] =
    useState<
      AuthenticationStatus
    >(
      'loading',
    );

  const accessTokenRef =
    useRef<
      string | null
    >(
      null,
    );

  const refreshPromiseRef =
    useRef<
      Promise<
        string | null
      > | null
    >(
      null,
    );

  const updateAccessToken =
    useCallback(
      (
        token:
          string | null,
      ) => {
        accessTokenRef.current =
          token;

        setAccessToken(
          token,
        );
      },
      [],
    );

  const clearSession =
    useCallback(
      () => {
        updateAccessToken(
          null,
        );

        setUser(
          null,
        );

        setStatus(
          'unauthenticated',
        );
      },
      [
        updateAccessToken,
      ],
    );

  const loadCurrentUser =
    useCallback(
      async (
        token:
          string,
      ) => {
        const response =
          await adminApi
            .getCurrentUser(
              token,
            );

        setUser(
          response.user,
        );

        setStatus(
          'authenticated',
        );

        return response.user;
      },
      [],
    );

  const refreshSession =
    useCallback(
      async ():
        Promise<
          string | null
        > => {
        if (
          refreshPromiseRef
            .current
        ) {
          return refreshPromiseRef
            .current;
        }

        const refreshPromise =
          (async () => {
            try {
              const response =
                await adminApi
                  .refresh();

              updateAccessToken(
                response.accessToken,
              );

              await loadCurrentUser(
                response.accessToken,
              );

              return response.accessToken;
            } catch {
              clearSession();

              return null;
            } finally {
              refreshPromiseRef.current =
                null;
            }
          })();

        refreshPromiseRef.current =
          refreshPromise;

        return refreshPromise;
      },
      [
        clearSession,
        loadCurrentUser,
        updateAccessToken,
      ],
    );

  const login =
    useCallback(
      async (
        credentials:
          LoginCredentials,
      ):
        Promise<
          AdminUser
        > => {
        const response =
          await adminApi
            .login(
              credentials,
            );

        updateAccessToken(
          response.accessToken,
        );

        setUser(
          response.user,
        );

        setStatus(
          'authenticated',
        );

        return response.user;
      },
      [
        updateAccessToken,
      ],
    );

  const logout =
    useCallback(
      async () => {
        try {
          await adminApi
            .logout();
        } finally {
          clearSession();
        }
      },
      [
        clearSession,
      ],
    );

  const authorizedFetch =
    useCallback(
      async <T,>(
        endpoint:
          string,

        options:
          RequestInit = {},
      ):
        Promise<T> => {
        let token =
          accessTokenRef
            .current;

        if (
          !token
        ) {
          token =
            await refreshSession();
        }

        if (
          !token
        ) {
          throw new AdminApiError(
            'Session expirée.',
            401,
          );
        }

        try {
          return await adminApi
            .request<T>(
              endpoint,
              {
                ...options,

                headers: {
                  ...options.headers,

                  Authorization:
                    `Bearer ${token}`,
                },
              },
            );
        } catch (
          error
        ) {
          if (
            !(
              error instanceof
              AdminApiError
            ) ||
            error.status !==
              401
          ) {
            throw error;
          }

          const refreshedToken =
            await refreshSession();

          if (
            !refreshedToken
          ) {
            throw error;
          }

          return adminApi
            .request<T>(
              endpoint,
              {
                ...options,

                headers: {
                  ...options.headers,

                  Authorization:
                    `Bearer ${refreshedToken}`,
                },
              },
            );
        }
      },
      [
        refreshSession,
      ],
    );

  useEffect(
    () => {
      void refreshSession();
    },
    [
      refreshSession,
    ],
  );

  const value =
    useMemo<
      AuthContextValue
    >(
      () => ({
        user,
        status,
        accessToken,
        login,
        logout,
        refreshSession,
        authorizedFetch,
      }),
      [
        user,
        status,
        accessToken,
        login,
        logout,
        refreshSession,
        authorizedFetch,
      ],
    );

  return (
    <AuthContext.Provider
      value={
        value
      }
    >
      {
        children
      }
    </AuthContext.Provider>
  );
}

export function useAuth():
  AuthContextValue
{
  const context =
    useContext(
      AuthContext,
    );

  if (
    !context
  ) {
    throw new Error(
      'useAuth doit être utilisé dans AuthProvider.',
    );
  }

  return context;
}