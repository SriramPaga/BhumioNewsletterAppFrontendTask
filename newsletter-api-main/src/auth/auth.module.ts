import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/users.module';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [AuthService, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
