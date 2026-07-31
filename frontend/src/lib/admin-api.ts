export type AdminUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  mustChangePassword: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export type RefreshResponse = {
  accessToken: string;
};

export type CurrentUserResponse = {
  user: AdminUser;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);

    this.name =
      'AdminApiError';
  }
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      'content-type',
    );

  if (
    !contentType?.includes(
      'application/json',
    )
  ) {
    return null;
  }

  return response.json();
}

function getErrorMessage(
  payload: unknown,
): string {
  if (
    payload &&
    typeof payload ===
      'object' &&
    'message' in payload
  ) {
    const message =
      payload.message;

    if (
      Array.isArray(
        message,
      )
    ) {
      return message.join(
        ' ',
      );
    }

    if (
      typeof message ===
      'string'
    ) {
      return message;
    }
  }

  return 'Une erreur est survenue.';
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        credentials:
          'include',

headers: {
  Accept:
    'application/json',

  ...(
    options.body &&
    !(options.body instanceof FormData)
      ? {
          'Content-Type':
            'application/json',
        }
      : {}
  ),

  ...options.headers,
},
      },
    );

  const payload =
    await parseResponseBody(
      response,
    );

  if (
    !response.ok
  ) {
    throw new AdminApiError(
      getErrorMessage(
        payload,
      ),
      response.status,
    );
  }

  return payload as T;
}

export const adminApi = {
  login(
    credentials:
      LoginCredentials,
  ) {
    return request<LoginResponse>(
      '/auth/login',
      {
        method:
          'POST',

        body:
          JSON.stringify(
            credentials,
          ),
      },
    );
  },

  refresh() {
    return request<RefreshResponse>(
      '/auth/refresh',
      {
        method:
          'POST',
      },
    );
  },

  getCurrentUser(
    accessToken:
      string,
  ) {
    return request<CurrentUserResponse>(
      '/auth/me',
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );
  },

  async logout():
    Promise<void>
  {
    await request<null>(
      '/auth/logout',
      {
        method:
          'POST',
      },
    );
  },

  request,
};