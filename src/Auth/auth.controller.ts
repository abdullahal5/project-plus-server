import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { sendResponse } from 'src/common/utilities';
import { AuthServices } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthServices) {}

  @Post('/login')
  async create(@Body() dto: LoginUserDto, @Res() res: Response) {
    const { accessToken, refreshToken, role } =
      await this.authService.login(dto);

    // Set refresh token in httpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User logged in successfully',
      data: {
        accessToken,
        role,
      },
    });
  }
}
