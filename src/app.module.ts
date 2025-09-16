import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { PrismaModule } from './Prisma/prisma.module';

@Controller()
class RootController {
  @Get('/')
  check() {
    return { message: 'Hello from NestJS 🚀' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UserModule,
  ],
  controllers: [RootController],
})
export class AppModule {}
