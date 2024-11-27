import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CreateUserDto) {
    await this.prismaService.user.create({ data: user });
    console.log(user);
    return { message: 'User registered successfully', data: user };
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prismaService.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  async findByUsenameOrEmail(UsernameOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: UsernameOrEmail,
          },
          {
            email: UsernameOrEmail,
          },
        ],
      },
    });
  }

  async findForLogin(UsernameOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: UsernameOrEmail,
          },
          {
            email: UsernameOrEmail,
          },
        ],
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }

  async setLastConnection(id: string) {
    return this.prismaService.user.update({
      where: {
        id: id,
      },
      data: {
        lastConnection: new Date(),
      },
    });
  }
}
