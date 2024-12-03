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
    provider: string;
  }) {
    return this.prismaService.user.create({
      data: {
        email: Data.email,
        username: Data.username,
        displayName: Data.displayName,
        avatarUrl: Data.avatarUrl,
        provider: Data.provider,
      },
    });
  }

  async findByEmail(email: string, provider?: string) {
    if (!provider) provider = 'local';
    return this.prismaService.user.findFirst({
      where: {
        AND: [
          {
            email: email,
          },
          {
            provider: provider,
          },
        ],
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
        provider: true,
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

  async checkUserEmailExist(
    email: string,
    provider?: string,
  ): Promise<boolean> {
    if (!provider) provider = 'local';
    const user = await this.prismaService.user.findFirst({
      where: {
        AND: [
          {
            email: email,
          },
          {
            provider: provider,
          },
        ],
      },
      select: {
        id: true,
      },
    });
    return !!user;
  }

  async checkUserUsernameExist(username: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
      },
    });
    return !!user;
  }

  async getUserInfo(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        lastConnection: true,
      },
    });
  }

  async getUnusedUsername(username: string) {
    let user = await this.checkUserUsernameExist(username);
    while (user) {
      username = username + Math.floor(Math.random() * 100);
      user = await this.checkUserUsernameExist(username);
    }
    return username;
  }
}
