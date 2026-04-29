import { Global, Module } from '@nestjs/common';
import { AuthTokenService } from './auth-token.service';
import { TrackingTokenService } from './tracking-token.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  providers: [
    AuthTokenService,
    TrackingTokenService,
    JwtAuthGuard,
  ],
  exports: [
    AuthTokenService,
    TrackingTokenService,
    JwtAuthGuard,
  ],
})
export class SecurityModule {}
