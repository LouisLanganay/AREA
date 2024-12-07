import { Module } from '@nestjs/common';
import { DiscordController } from './discord-app.controller';
import { DiscordService } from './discord-app.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [DiscordController],
    providers: [DiscordService, PrismaService],
})
export class DiscordModule {}
