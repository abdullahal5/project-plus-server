/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: Record<string, any>, expiresIn = '1h'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  verifyToken(token: string): Record<string, any> {
    try {
      return this.jwtService.verify(token);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Token verification failed: ${error.message}`);
      }
      throw new Error('Invalid or expired token');
    }
  }
}
