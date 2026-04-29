import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { UserService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.userService.create(
      createUserDto,
    );
    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ) {
    const user =
      await this.authService.validateUser(
        loginUserDto.email,
        loginUserDto.password,
      );
    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }
    return await this.authService.login(user);
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is required',
      );
    }
    return await this.authService.refreshTokens(
      refreshToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    return await this.authService.logout(
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return await this.userService.update(
      id,
      updateUserDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/:id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
