import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  IsString,
} from 'class-validator';

const UserRoleValues = ['ADMIN', 'MANAGER', 'MEMBER'] as const;

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(UserRoleValues, {
    message: 'Role must be either ADMIN, MANAGER, or MEMBER',
  })
  role?: UserRole = 'MEMBER';
}
