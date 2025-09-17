import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (info) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }

      if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
