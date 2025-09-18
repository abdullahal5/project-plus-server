import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { NotificationsService } from './notifications.service';
import * as client from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import { sendResponse } from 'src/common/utilities';
import { GetUser } from 'src/Auth/decorators/get-user.decorators';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER)
  async sendNotification(
    @Body()
    body: { userId: string; message: string; type: client.NotificationType },
    @Res() res: Response,
  ) {
    const notification = await this.notificationsService.createNotification(
      body.userId,
      body.message,
      body.type,
    );

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Notification sent successfully',
      data: notification,
    });
  }

  @Get('/')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER, client.UserRole.MEMBER)
  async getMyNotifications(@GetUser() user: client.User, @Res() res: Response) {
    const notifications = await this.notificationsService.getUserNotifications(
      user.id,
    );

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  }

  @Patch('/:id/read')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER, client.UserRole.MEMBER)
  async markOneAsRead(
    @Param('id') id: string,
    @GetUser() user: client.User,
    @Res() res: Response,
  ) {
    const notification = await this.notificationsService.markAsRead(
      id,
      user.id,
    );

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  }

  @Patch('/read-all')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER, client.UserRole.MEMBER)
  async markAllAsRead(
    @Req() @GetUser() user: client.User,
    @Res() res: Response,
  ) {
    const notifications = await this.notificationsService.markAllAsRead(
      user.id,
    );

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'All notifications marked as read',
      data: notifications,
    });
  }
}
