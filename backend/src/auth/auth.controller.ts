import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  Throttle,
} from '@nestjs/throttler';

import type {
  Request,
  Response,
} from 'express';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  AuthService,
} from './auth.service';

import {
  CurrentUser,
} from './decorators/current-user.decorator';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

import {
  LoginDto,
} from './dto/login.dto';

import {
  JwtAuthGuard,
} from './guards/jwt-auth.guard';

const REFRESH_COOKIE_NAME =
  'axplify_refresh_token';

@Controller(
  'auth',
)
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,

    private readonly configService:
      ConfigService,
  ) {}

  @Post(
    'login',
  )
  @HttpCode(
    HttpStatus.OK,
  )
  @Throttle({
    default: {
      limit:
        10,

      ttl:
        60_000,
    },
  })
  async login(
    @Body()
    dto:
      LoginDto,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService
        .login(
          dto,
          this.getRequestMetadata(
            request,
          ),
        );

    this.setRefreshCookie(
      response,
      result.refreshToken,
      result.refreshExpiresAt,
    );

    return {
      accessToken:
        result.accessToken,

      user:
        result.user,
    };
  }

  @Post(
    'refresh',
  )
  @HttpCode(
    HttpStatus.OK,
  )
  @Throttle({
    default: {
      limit:
        30,

      ttl:
        60_000,
    },
  })
  async refresh(
    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const refreshToken =
      request.cookies?.[
        REFRESH_COOKIE_NAME
      ] as
        | string
        | undefined;

    const result =
      await this.authService
        .refresh(
          refreshToken,
          this.getRequestMetadata(
            request,
          ),
        );

    this.setRefreshCookie(
      response,
      result.refreshToken,
      result.refreshExpiresAt,
    );

    return {
      accessToken:
        result.accessToken,
    };
  }

  @Post(
    'logout',
  )
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  async logout(
    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ):
    Promise<void>
  {
    const refreshToken =
      request.cookies?.[
        REFRESH_COOKIE_NAME
      ] as
        | string
        | undefined;

    await this.authService
      .logout(
        refreshToken,
        this.getRequestMetadata(
          request,
        ),
      );

    response.clearCookie(
      REFRESH_COOKIE_NAME,
      this.getCookieBaseOptions(),
    );
  }

  @Get(
    'me',
  )
  @UseGuards(
    JwtAuthGuard,
  )
  me(
    @CurrentUser()
    user:
      AuthenticatedUser,
  ) {
    return {
      user,
    };
  }

  @Post(
    'change-password',
  )
  @UseGuards(
    JwtAuthGuard,
  )
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  async changePassword(
    @CurrentUser()
    user:
      AuthenticatedUser,

    @Body()
    dto:
      ChangePasswordDto,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ):
    Promise<void>
  {
    await this.authService
      .changePassword(
        user,
        dto,
        this.getRequestMetadata(
          request,
        ),
      );

    response.clearCookie(
      REFRESH_COOKIE_NAME,
      this.getCookieBaseOptions(),
    );
  }

  private getRequestMetadata(
    request:
      Request,
  ) {
    return {
      ipAddress:
        request.ip ||
        request
          .socket
          .remoteAddress ||
        null,

      userAgent:
        request.get(
          'user-agent',
        ) ||
        null,
    };
  }

  private setRefreshCookie(
    response:
      Response,

    token:
      string,

    expires:
      Date,
  ):
    void
  {
    response.cookie(
      REFRESH_COOKIE_NAME,
      token,
      {
        ...this.getCookieBaseOptions(),

        expires,
      },
    );
  }

  private getCookieBaseOptions() {
    const secure =
      this.configService
        .get<string>(
          'COOKIE_SECURE',
          'false',
        ) ===
      'true';

    const configuredSameSite =
      this.configService
        .get<string>(
          'COOKIE_SAME_SITE',
          'lax',
        );

    const sameSite =
      configuredSameSite ===
        'strict' ||
      configuredSameSite ===
        'none' ||
      configuredSameSite ===
        'lax'
        ? configuredSameSite
        : 'lax';

    return {
      httpOnly:
        true,

      secure,

      sameSite,

      path:
        '/api/auth',
    } as const;
  }
}