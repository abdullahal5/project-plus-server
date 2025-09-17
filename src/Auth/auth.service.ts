import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import bcrypt from 'bcrypt';
import { JwtUtil } from 'src/common/utilities';

@Injectable()
export class AuthServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async login(dto: LoginUserDto) {
    const isExistUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!isExistUser) {
      throw new HttpException(
        'User not found. Please Register',
        HttpStatus.NOT_FOUND,
      );
    }

    const isMatch = bcrypt.compareSync(dto.password, isExistUser.password);

    if (!isMatch) {
      throw new HttpException('Password not match', HttpStatus.BAD_GATEWAY);
    }

    const payload = {
      id: isExistUser.id,
      email: isExistUser.email,
      role: isExistUser.role,
    };

    // Generate tokens
    const accessToken = this.jwtUtil.generateToken(payload, '15m');
    const refreshToken = this.jwtUtil.generateToken(payload, '7d');

    return { accessToken, refreshToken, role: payload.role };
  }
}
