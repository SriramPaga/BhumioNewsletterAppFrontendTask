import { Module } from '@nestjs/common';
import { StatsGateway } from './stats.gateway';
import { AuthTokenService } from '../security/auth-token.service';

@Module({
  providers: [StatsGateway, AuthTokenService],
  exports: [StatsGateway],
})
export class RealtimeModule {}
