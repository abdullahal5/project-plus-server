import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    const isExistUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (isExistUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const saltRounds =
      Number(this.configService.get<string>('BCRYPT_ROUND_NUM')) || 10;

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
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
    return user;
  }

  async getAllUser() {
    return await this.prisma.user.findMany();
  }

  async getSingleUserById(id: string) {
    const findUser = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return findUser;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const isExist = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
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

    return updatedUser;
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
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

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }
}
