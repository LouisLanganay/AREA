import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CreateUserDto) {
    return await this.prismaService.user.create({ data: user });
  }

  async registerExternal(Data: {
    email: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  }) {
    return this.prismaService.user.create({
      data: {
        email: Data.email,
        username: Data.username,
        displayName: Data.displayName,
        avatarUrl: Data.avatarUrl,
      },
    });
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

  async checkUserEmailExist(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }
}
