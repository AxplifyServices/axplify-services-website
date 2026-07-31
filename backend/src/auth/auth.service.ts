import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt
  from 'bcrypt';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  PrismaService,
} from '../database/prisma.service';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

import {
  LoginDto,
} from './dto/login.dto';

const MAX_FAILED_ATTEMPTS =
  5;

const LOCK_DURATION_MINUTES =
  15;

const PASSWORD_SALT_ROUNDS =
  12;

type RequestMetadata = {
  ipAddress:
    string | null;

  userAgent:
    string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly jwtService:
      JwtService,

    private readonly configService:
      ConfigService,
  ) {}

  async login(
    dto:
      LoginDto,

    metadata:
      RequestMetadata,
  ) {
    const user =
      await this.prisma
        .users
        .findFirst({
          where: {
            email:
              dto.email,

            deleted_at:
              null,
          },

          include: {
            user_roles_user_roles_user_idTousers: {
              include: {
                roles:
                  true,
              },
            },
          },
        });

    if (
      !user
    ) {
      await this.logAuthenticationEvent({
        email:
          dto.email,

        eventType:
          'LOGIN',

        success:
          false,

        failureReason:
          'INVALID_CREDENTIALS',

        metadata,
      });

      throw new UnauthorizedException(
        'Identifiants invalides.',
      );
    }

    if (
      user.status !==
      'ACTIVE'
    ) {
      await this.logAuthenticationEvent({
        userId:
          user.id,

        email:
          user.email,

        eventType:
          'LOGIN',

        success:
          false,

        failureReason:
          'ACCOUNT_INACTIVE',

        metadata,
      });

      throw new UnauthorizedException(
        'Compte indisponible.',
      );
    }

    if (
      user.locked_until &&
      user.locked_until >
        new Date()
    ) {
      await this.logAuthenticationEvent({
        userId:
          user.id,

        email:
          user.email,

        eventType:
          'LOGIN',

        success:
          false,

        failureReason:
          'ACCOUNT_LOCKED',

        metadata,
      });

      throw new UnauthorizedException(
        'Compte temporairement verrouillé. Réessaie plus tard.',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        dto.password,
        user.password_hash,
      );

    if (
      !passwordMatches
    ) {
      const failedAttempts =
        user
          .failed_login_attempts +
        1;

      const shouldLock =
        failedAttempts >=
        MAX_FAILED_ATTEMPTS;

      const lockedUntil =
        shouldLock
          ? new Date(
              Date.now() +
                LOCK_DURATION_MINUTES *
                  60_000,
            )
          : null;

      await this.prisma
        .users
        .update({
          where: {
            id:
              user.id,
          },

          data: {
            failed_login_attempts:
              shouldLock
                ? 0
                : failedAttempts,

            locked_until:
              lockedUntil,

            updated_at:
              new Date(),
          },
        });

      await this.logAuthenticationEvent({
        userId:
          user.id,

        email:
          user.email,

        eventType:
          'LOGIN',

        success:
          false,

        failureReason:
          shouldLock
            ? 'ACCOUNT_LOCKED'
            : 'INVALID_CREDENTIALS',

        metadata,
      });

      throw new UnauthorizedException(
        'Identifiants invalides.',
      );
    }

    const roles =
      user
        .user_roles_user_roles_user_idTousers
        .map(
          (
            userRole,
          ) =>
            userRole
              .roles
              .code,
        );

    if (
      roles.length ===
      0
    ) {
      throw new UnauthorizedException(
        'Aucun rôle autorisé n’est associé au compte.',
      );
    }

    const refreshToken =
      this.generateRefreshToken();

    const refreshTokenHash =
      this.hashToken(
        refreshToken,
      );

    const refreshExpiresAt =
      this.getRefreshExpirationDate();

    const now =
      new Date();

    await this.prisma
      .$transaction([
        this.prisma
          .users
          .update({
            where: {
              id:
                user.id,
            },

            data: {
              failed_login_attempts:
                0,

              locked_until:
                null,

              last_login_at:
                now,

              updated_at:
                now,
            },
          }),

        this.prisma
          .refresh_sessions
          .create({
            data: {
              user_id:
                user.id,

              token_hash:
                refreshTokenHash,

              user_agent:
                metadata.userAgent,

              ip_address:
                metadata.ipAddress,

              expires_at:
                refreshExpiresAt,
            },
          }),

        this.prisma
          .authentication_events
          .create({
            data: {
              user_id:
                user.id,

              email:
                user.email,

              event_type:
                'LOGIN',

              success:
                true,

              ip_address:
                metadata.ipAddress,

              user_agent:
                metadata.userAgent,
            },
          }),
      ]);

    return {
      accessToken:
        await this.createAccessToken(
          user.id,
          user.email,
        ),

      refreshToken,

      refreshExpiresAt,

      user: {
        id:
          user.id,

        email:
          user.email,

        firstName:
          user.first_name,

        lastName:
          user.last_name,

        roles,

        mustChangePassword:
          user.must_change_password,
      } satisfies AuthenticatedUser,
    };
  }

  async refresh(
    refreshToken:
      string | undefined,

    metadata:
      RequestMetadata,
  ) {
    if (
      !refreshToken
    ) {
      throw new UnauthorizedException(
        'Session absente.',
      );
    }

    const tokenHash =
      this.hashToken(
        refreshToken,
      );

    const session =
      await this.prisma
        .refresh_sessions
        .findUnique({
          where: {
            token_hash:
              tokenHash,
          },

          include: {
            users: {
              include: {
                user_roles_user_roles_user_idTousers: {
                  include: {
                    roles:
                      true,
                  },
                },
              },
            },
          },
        });

    const now =
      new Date();

    if (
      !session ||
      session.revoked_at ||
      session.expires_at <=
        now ||
      session.users
        .deleted_at ||
      session.users
        .status !==
        'ACTIVE'
    ) {
      throw new UnauthorizedException(
        'Session expirée ou révoquée.',
      );
    }

    const newRefreshToken =
      this.generateRefreshToken();

    const newRefreshTokenHash =
      this.hashToken(
        newRefreshToken,
      );

    const newRefreshExpiresAt =
      this.getRefreshExpirationDate();

    await this.prisma
      .$transaction([
        this.prisma
          .refresh_sessions
          .update({
            where: {
              id:
                session.id,
            },

            data: {
              revoked_at:
                now,

              last_used_at:
                now,

              revoke_reason:
                'ROTATED',
            },
          }),

        this.prisma
          .refresh_sessions
          .create({
            data: {
              user_id:
                session.user_id,

              token_hash:
                newRefreshTokenHash,

              user_agent:
                metadata.userAgent,

              ip_address:
                metadata.ipAddress,

              expires_at:
                newRefreshExpiresAt,
            },
          }),

        this.prisma
          .authentication_events
          .create({
            data: {
              user_id:
                session.user_id,

              email:
                session
                  .users
                  .email,

event_type:
  'REFRESH_TOKEN',

              success:
                true,

              ip_address:
                metadata.ipAddress,

              user_agent:
                metadata.userAgent,
            },
          }),
      ]);

    return {
      accessToken:
        await this.createAccessToken(
          session
            .users
            .id,

          session
            .users
            .email,
        ),

      refreshToken:
        newRefreshToken,

      refreshExpiresAt:
        newRefreshExpiresAt,
    };
  }

  async logout(
    refreshToken:
      string | undefined,

    metadata:
      RequestMetadata,
  ):
    Promise<void>
  {
    if (
      refreshToken
    ) {
      await this.prisma
        .refresh_sessions
        .updateMany({
          where: {
            token_hash:
              this.hashToken(
                refreshToken,
              ),

            revoked_at:
              null,
          },

          data: {
            revoked_at:
              new Date(),

            revoke_reason:
              'LOGOUT',
          },
        });
    }

    await this.logAuthenticationEvent({
      eventType:
        'LOGOUT',

      success:
        true,

      metadata,
    });
  }

  async changePassword(
    user:
      AuthenticatedUser,

    dto:
      ChangePasswordDto,

    metadata:
      RequestMetadata,
  ):
    Promise<void>
  {
    if (
      dto.currentPassword ===
      dto.newPassword
    ) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent de l’ancien.',
      );
    }

    const databaseUser =
      await this.prisma
        .users
        .findUnique({
          where: {
            id:
              user.id,
          },

          select: {
            password_hash:
              true,
          },
        });

    if (
      !databaseUser
    ) {
      throw new UnauthorizedException(
        'Compte indisponible.',
      );
    }

    const currentPasswordMatches =
      await bcrypt.compare(
        dto.currentPassword,
        databaseUser.password_hash,
      );

    if (
      !currentPasswordMatches
    ) {
      throw new UnauthorizedException(
        'Mot de passe actuel incorrect.',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        dto.newPassword,
        PASSWORD_SALT_ROUNDS,
      );

    const now =
      new Date();

    await this.prisma
      .$transaction([
        this.prisma
          .users
          .update({
            where: {
              id:
                user.id,
            },

            data: {
              password_hash:
                passwordHash,

              must_change_password:
                false,

              password_changed_at:
                now,

              updated_at:
                now,
            },
          }),

        this.prisma
          .refresh_sessions
          .updateMany({
            where: {
              user_id:
                user.id,

              revoked_at:
                null,
            },

            data: {
              revoked_at:
                now,

              revoke_reason:
                'PASSWORD_CHANGED',
            },
          }),

        this.prisma
          .authentication_events
          .create({
            data: {
              user_id:
                user.id,

              email:
                user.email,

event_type:
  'PASSWORD_CHANGE',

              success:
                true,

              ip_address:
                metadata.ipAddress,

              user_agent:
                metadata.userAgent,
            },
          }),
      ]);
  }

  private async createAccessToken(
    userId:
      string,

    email:
      string,
  ):
    Promise<string>
  {
    const expiresIn =
      this.configService
        .get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        );

    return this.jwtService
      .signAsync(
        {
          sub:
            userId,

          email,

          type:
            'access',
        },

        {
          secret:
            this.configService
              .getOrThrow<string>(
                'JWT_ACCESS_SECRET',
              ),

          expiresIn:
            expiresIn as never,
        },
      );
  }

  private generateRefreshToken():
    string
  {
    return randomBytes(
      64,
    ).toString(
      'base64url',
    );
  }

  private hashToken(
    token:
      string,
  ):
    string
  {
    return createHash(
      'sha256',
    )
      .update(
        token,
      )
      .digest(
        'hex',
      );
  }

  private getRefreshExpirationDate():
    Date
  {
    const rawDuration =
      this.configService
        .get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        );

    const match =
      /^(\d+)([mhd])$/.exec(
        rawDuration,
      );

    if (
      !match
    ) {
      throw new Error(
        'JWT_REFRESH_EXPIRES_IN doit utiliser le format 15m, 24h ou 7d.',
      );
    }

    const value =
      Number(
        match[1],
      );

    const unit =
      match[2];

    const multipliers:
      Record<
        string,
        number
      > = {
        m:
          60_000,

        h:
          3_600_000,

        d:
          86_400_000,
      };

    return new Date(
      Date.now() +
        value *
          multipliers[
            unit
          ],
    );
  }

  private async logAuthenticationEvent(
    input: {
      userId?:
        string;

      email?:
        string;

      eventType:
        string;

      success:
        boolean;

      failureReason?:
        string;

      metadata:
        RequestMetadata;
    },
  ):
    Promise<void>
  {
    await this.prisma
      .authentication_events
      .create({
        data: {
          user_id:
            input.userId,

          email:
            input.email,

          event_type:
            input.eventType,

          success:
            input.success,

          failure_reason:
            input.failureReason,

          ip_address:
            input
              .metadata
              .ipAddress,

          user_agent:
            input
              .metadata
              .userAgent,
        },
      });
  }
}