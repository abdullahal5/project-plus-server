import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { sendResponse } from 'src/common/utilities';
import { AuthServices } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Request, Response } from 'express';

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

  @Post('/refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, role } =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.authService.refreshAccessToken(refreshToken);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Access token refreshed successfully',
      data: { accessToken, role },
    });
  }
}
