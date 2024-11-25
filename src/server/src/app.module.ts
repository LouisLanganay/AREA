import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutController } from './about/about.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientErrorFilter } from './prisma/prismaHandlerError';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true, // Rendre les variables accessibles globalement
    }),
  ],
  controllers: [AppController, AboutController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: PrismaClientErrorFilter,
    },
  ],
})
export class AppModule {}
