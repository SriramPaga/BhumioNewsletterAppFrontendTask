import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
      message:
        'password is too weak. Should contain uppercase, lowercase, number and symbol',
    },
  )
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  role?: UserRole;

  @IsNotEmpty()
  @IsUUID()
  organizationId: string;
}
