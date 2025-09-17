import { Module } from '@nestjs/common';
import { AuthServices } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthServices],
  controllers: [AuthController],
})
export class AuthModule {}
