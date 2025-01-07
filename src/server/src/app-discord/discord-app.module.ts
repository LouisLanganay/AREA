import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordController } from './discord-app.controller';
import { DiscordService } from './discord-app.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Rendre les variables disponibles globalement
            envFilePath: '../../.env', // Chemin vers votre fichier .env
        }),
        HttpModule,
    ],
    controllers: [DiscordController],
    providers: [DiscordService, PrismaService],
})
export class DiscordModule {}
