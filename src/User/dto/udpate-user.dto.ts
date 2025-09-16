import { IsEmail, IsOptional, MinLength, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  // @IsOptional()
  // @IsEmail({}, { message: 'Invalid email address' })
  // email?: string;

  // @IsOptional()
  // @MinLength(6, { message: 'Password must be at least 6 characters' })
  // password?: string;
}
