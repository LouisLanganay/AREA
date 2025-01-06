import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CreateUserDto) {
    if (await this.checkUserEmailExist(user.email))
      throw new ConflictException({ err_code: 'EMAIL_ALREADY_USE' });
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
        lastConnection: new Date(),
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
        AND: [
          {
            provider: 'local',
          },
          {
            OR: [{ username: UsernameOrEmail }, { email: UsernameOrEmail }],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        password: true,
        provider: true,
        status: true,
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

  async resetOtherResetRequest(userID: string) {
    await this.prismaService.passwordReset.updateMany({
      where: {
        userId: userID,
        used: false,
      },
      data: {
        used: true,
      },
    });
  }

  async createResetPassword(userId: string, token: string) {
    await this.prismaService.passwordReset.create({
      data: {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
        token,
        userId: userId,
        used: false,
      },
    });
  }

  async findToken(token: string) {
    return this.prismaService.passwordReset.findUnique({
      where: {
        token,
      },
    });
  }

  async resetToken(token: string) {
    this.prismaService.passwordReset.update({
      where: { token: token },
      data: { used: true },
    });
  }

  async resetPassword(userId: string, newPassword: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });
  }

  async updateUser(data: updateUserDto, id: string) {
    if (data.email != null) {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        select: { provider: true },
      });
      if (!user) throw new NotFoundException({ err_code: 'NOT_FOUND_USER' });
      if (user.provider !== 'local')
        throw new ForbiddenException({ err_code: 'THIRD_PART_CHANGE_EMAIL' });
    }
    const updatedUser = await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  async deleteUser(id: string) {
    await this.prismaService.user.delete({ where: { id } });
  }

  async addTokenService(
    userId: string,
    provider: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number,
  ) {
    const exists = await this.prismaService.token.findFirst({
      where: {
        userId: userId,
        provider: provider,
      },
    });

    if (exists) {
      return this.prismaService.token.update({
        where: {
          userId_provider: {
            userId,
            provider,
          },
        },
        data: {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + expiresIn * 1000),
        },
      });
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return this.prismaService.token.create({
      data: {
        userId,
        provider,
        accessToken,
        refreshToken,
        expiresAt,
      },
    });
  }

  async checkRole(id: string, role: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        role: true,
      },
    });
    if (!user) throw new NotFoundException({ err_code: 'NOT_FOUND_USER' });
    return user.role === role;
  }

  async getAllUsers() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastConnection: true,
        provider: true,
      },
    });
  }

  async setRole(id: string, role: string) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        role,
        updatedAt: new Date(),
      },
    });
  }

  async setStatus(id: string, status: string) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}
