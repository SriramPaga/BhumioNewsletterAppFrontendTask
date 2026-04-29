import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  organizationId?: string;
}

@Injectable()
export class AuthTokenService {
  private readonly accessSecret =
    process.env.JWT_ACCESS_SECRET;
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET;

  constructor() {
    if (
      !this.accessSecret ||
      !this.refreshSecret
    ) {
      throw new Error(
        'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in environment variables',
      );
    }
  }

  signAccessToken(
    payload: AuthTokenPayload,
  ): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: '15m',
    });
  }

  signRefreshToken(
    payload: AuthTokenPayload,
  ): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: '7d',
    });
  }

  verifyAccessToken(
    token: string,
  ): AuthTokenPayload {
    try {
      return jwt.verify(
        token,
        this.accessSecret,
      ) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException(
        'Invalid access token',
      );
    }
  }

  verifyRefreshToken(
    token: string,
  ): AuthTokenPayload {
    try {
      return jwt.verify(
        token,
        this.refreshSecret,
      ) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }
  }
}
