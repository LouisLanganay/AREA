import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as process from 'node:process';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_TOKEN, // Remplacez par une clé plus sécurisée
      signOptions: { expiresIn: '4h' },
    }),
  ],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
