import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { MailerService } from '../mailer/mailer.service';
import * as process from 'node:process';
import { GoogleStrategy } from './strategy/google.strategy';
import { DiscordStrategy } from './strategy/discord.strategy';
import { DiscordService } from '../app-discord/discord-app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { GoogleAuthService } from './external-services/google.auth.service';
import { DiscordAuthService } from './external-services/discord.auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Remplacez par une clé plus sécurisée
      signOptions: { expiresIn: '1h' },
      global: true,
    }),
    UsersModule, // Module pour la gestion des utilisateurs
    PassportModule,
    PrismaModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailerService,
    GoogleStrategy,
    DiscordStrategy,
    DiscordService,
    GoogleAuthService,
    DiscordAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
