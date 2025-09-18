import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsIn,
} from 'class-validator';
import { UserRole } from '@prisma/client';

const UserRoles = Object.values(UserRole);

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

  @IsIn(UserRoles, { message: 'Role must be ADMIN, MANAGER, or MEMBER' })
  role?: UserRole = UserRole.MEMBER;
}
