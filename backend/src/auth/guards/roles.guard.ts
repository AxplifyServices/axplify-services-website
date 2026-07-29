import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import {
  Reflector,
} from '@nestjs/core';

import type {
  Request,
} from 'express';

import type {
  AuthenticatedUser,
} from '../../common/types/authenticated-user.type';

import {
  ROLES_KEY,
} from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector:
      Reflector,
  ) {}

  canActivate(
    context:
      ExecutionContext,
  ):
    boolean
  {
    const requiredRoles =
      this.reflector
        .getAllAndOverride<
          string[]
        >(
          ROLES_KEY,
          [
            context.getHandler(),
            context.getClass(),
          ],
        );

    if (
      !requiredRoles?.length
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<
          Request & {
            user?:
              AuthenticatedUser;
          }
        >();

    const user =
      request.user;

    if (
      !user
    ) {
      return false;
    }

    return requiredRoles.some(
      (
        requiredRole,
      ) =>
        user.roles.includes(
          requiredRole,
        ),
    );
  }
}