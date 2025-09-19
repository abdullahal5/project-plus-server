import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../Prisma/prisma.service';

jest.mock('bcrypt');

describe('UserService.create', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock<any, any>;
      create: jest.Mock<any, any>;
    };
  };
  let config: {
    get: jest.Mock<any, any>;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    config = {
      get: jest.fn().mockReturnValue('10'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should throw HttpException if user already exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: '1',
      email: 'test@test.com',
    });

    await expect(
      service.create({
        name: 'John',
        email: 'test@test.com',
        password: '123456',
      }),
    ).rejects.toThrow(HttpException);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@test.com' },
    });
  });

  it('should create a new user successfully', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

    const mockUser = {
      id: '1',
      name: 'John',
      email: 'john@test.com',
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.create.mockResolvedValueOnce(mockUser);

    const result = await service.create({
      name: 'John',
      email: 'john@test.com',
      password: '123456',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'John',
        email: 'john@test.com',
        password: 'hashedPassword',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(result).toEqual(mockUser);
  });
});
