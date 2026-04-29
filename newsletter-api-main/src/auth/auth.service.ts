import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { AuthTokenService } from '../security/auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<any> {
    const user =
      await this.userService.findByEmailForAuth(
        email,
      );
    if (
      user &&
      user.password &&
      (await bcrypt.compare(
        password,
        user.password,
      ))
    ) {
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id || user.sub,
      role: user.role,
      organizationId:
        user.organization?.id ||
        user.organizationId,
    };

    const accessToken =
      this.authTokenService.signAccessToken(
        payload,
      );
    const refreshToken =
      this.authTokenService.signRefreshToken(
        payload,
      );

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      10,
    );
    await this.userService.updateRefreshToken(
      payload.sub,
      refreshTokenHash,
    );

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload =
      this.authTokenService.verifyRefreshToken(
        refreshToken,
      );
    const user =
      await this.userService.getUserIfRefreshTokenMatches(
        payload.sub,
        refreshToken,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    return this.login(user);
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(
      userId,
      null,
    );
    return { message: 'Logged out successfully' };
  }
}
