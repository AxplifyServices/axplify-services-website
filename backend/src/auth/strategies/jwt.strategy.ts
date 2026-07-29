import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import type {
  AuthenticatedUser,
} from '../../common/types/authenticated-user.type';

import {
  PrismaService,
} from '../../database/prisma.service';

type AccessTokenPayload = {
  sub:
    string;

  email:
    string;

  type:
    'access';
};

@Injectable()
export class JwtStrategy
  extends PassportStrategy(
    Strategy,
  )
{
  constructor(
    configService:
      ConfigService,

    private readonly prisma:
      PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt
          .fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        configService
          .getOrThrow<string>(
            'JWT_ACCESS_SECRET',
          ),
    });
  }

  async validate(
    payload:
      AccessTokenPayload,
  ):
    Promise<AuthenticatedUser>
  {
    if (
      payload.type !==
      'access'
    ) {
      throw new UnauthorizedException(
        'Jeton invalide.',
      );
    }

    const user =
      await this.prisma
        .users
        .findFirst({
          where: {
            id:
              payload.sub,

            status:
              'ACTIVE',

            deleted_at:
              null,
          },

          select: {
            id:
              true,

            email:
              true,

            first_name:
              true,

            last_name:
              true,

            must_change_password:
              true,

            user_roles_user_roles_user_idTousers: {
              select: {
                roles: {
                  select: {
                    code:
                      true,
                  },
                },
              },
            },
          },
        });

    if (
      !user
    ) {
      throw new UnauthorizedException(
        'Compte indisponible.',
      );
    }

    return {
      id:
        user.id,

      email:
        user.email,

      firstName:
        user.first_name,

      lastName:
        user.last_name,

      mustChangePassword:
        user.must_change_password,

      roles:
        user
          .user_roles_user_roles_user_idTousers
          .map(
            (
              userRole,
            ) =>
              userRole
                .roles
                .code,
          ),
    };
  }
}