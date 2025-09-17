import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { sendResponse } from 'src/common/utilities';
import type { Response } from 'express';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async create(@Body() dto: CreateUserDto, @Res() res: Response) {
    const result = await this.userService.create(dto);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User created successfully',
      data: result,
    });
  }

  @Get('/')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers(@Res() res: Response) {
    const result = await this.userService.getAllUser();

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User created successfully',
      data: result,
    });
  }

  @Get('/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSingleUserById(@Res() res: Response, @Param('id') id: string) {
    const result = await this.userService.getSingleUserById(id);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Users fetched successfully',
      data: result,
    });
  }

  @Patch('/:id')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUser(
    @Res() res: Response,
    @Body() dto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    const result = await this.userService.updateUser(id, dto);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Users fetched successfully',
      data: result,
    });
  }

  @Patch('/:id/toggle-active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async toggleActive(@Res() res: Response, @Param('id') id: string) {
    const result = await this.userService.toggleActive(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User status toggled successfully',
      data: result,
    });
  }

  @Delete('/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteUser(@Res() res: Response, @Param('id') id: string) {
    const result = await this.userService.deleteUser(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
}
