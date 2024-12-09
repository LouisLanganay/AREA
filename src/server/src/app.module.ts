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
import { WorkflowModule } from './workflow/workflow.module';
import { BullModule } from '@nestjs/bullmq';
import { WebhookModule } from './discordWebhook/discord-webhook.module';
import {DiscordModule} from "./app-discord/discord-app.module";
import { ServiceController } from "./service/route/service.controller";
import { ServiceModule } from "./service/route/service.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WorkflowModule,
    ServiceModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    WebhookModule,
    DiscordModule
  ],
  controllers: [AppController, AboutController, ServiceController],
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
