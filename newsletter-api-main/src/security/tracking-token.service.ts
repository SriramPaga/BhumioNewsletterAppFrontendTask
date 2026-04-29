import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHmac,
  timingSafeEqual,
} from 'crypto';

export interface TrackingTokenPayload {
  campaignId: string;
  listId: string;
  subscriberId: string;
  linkId: number;
  organizationId: string;
  url?: string;
  eventType: 'click' | 'open';
  iat: number;
  exp: number;
}

@Injectable()
export class TrackingTokenService {
  private readonly secret =
    process.env.TRACKING_TOKEN_SECRET;

  constructor() {
    if (!this.secret) {
      throw new Error(
        'TRACKING_TOKEN_SECRET must be defined in environment variables',
      );
    }
  }

  createToken(
    payload: Omit<
      TrackingTokenPayload,
      'iat' | 'exp'
    >,
    expiresInSeconds = 60 * 60 * 24 * 7,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: TrackingTokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };
    const encodedPayload = Buffer.from(
      JSON.stringify(fullPayload),
    ).toString('base64url');
    const signature = this.sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  verifyToken(
    token: string,
  ): TrackingTokenPayload {
    const [encodedPayload, providedSignature] =
      token.split('.');
    if (!encodedPayload || !providedSignature) {
      throw new UnauthorizedException(
        'Invalid tracking token format',
      );
    }

    const expectedSignature = this.sign(
      encodedPayload,
    );
    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expectedSignature);
    if (
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      throw new UnauthorizedException(
        'Invalid tracking token signature',
      );
    }

    let payload: TrackingTokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(
          encodedPayload,
          'base64url',
        ).toString('utf8'),
      ) as TrackingTokenPayload;
    } catch {
      throw new UnauthorizedException(
        'Malformed tracking token payload',
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      throw new UnauthorizedException(
        'Tracking token expired',
      );
    }

    return payload;
  }

  private sign(encodedPayload: string): string {
    return createHmac('sha256', this.secret)
      .update(encodedPayload)
      .digest('base64url');
  }
}
