import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authTokenService: AuthTokenService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();
    const token =
      this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Missing authentication token',
      );
    }

    try {
      const payload =
        this.authTokenService.verifyAccessToken(
          token,
        );

      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    return true;
  }

  private extractTokenFromHeader(
    request: any,
  ): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ??
      [];
    return type === 'Bearer' ? token : undefined;
  }
}
