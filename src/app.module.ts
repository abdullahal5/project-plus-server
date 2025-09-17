import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { PrismaModule } from './Prisma/prisma.module';
import { AuthModule } from './Auth/auth.module';
import { CoreModule } from './core/core.module';

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
    AuthModule,
    CoreModule,
  ],
  controllers: [RootController],
})
export class AppModule {}
