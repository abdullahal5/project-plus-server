import { Module } from '@nestjs/common';
import { AuthServices } from './auth.service';
import { AuthController } from './auth.controller';
import { CoreModule } from 'src/core/core.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [CoreModule],
  providers: [AuthServices, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
