import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { PrismaService } from 'src/Prisma/prisma.service';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [NotificationsGateway, NotificationsService, PrismaService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
