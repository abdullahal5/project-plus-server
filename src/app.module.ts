import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
  ],
  controllers: [RootController],
})
export class AppModule {}
