import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import * as process from 'node:process';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Remplacez par une clé plus sécurisée
      signOptions: { expiresIn: '1h' },
      global: true,
    }),
    UsersModule, // Module pour la gestion des utilisateurs
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailerService],
  exports: [AuthService],
})
export class AuthModule {}
