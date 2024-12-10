import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DiscordWebhookProcessor } from './discord-webhook.processor';
import { DiscordWebhookService } from './discord-webhook.service';
import { DiscordController } from './discord-webhook.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'discord-webhook',
            connection: {
                host: '127.0.0.1',
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'discord-webhook',
        }),
    ],
    providers: [DiscordWebhookProcessor, DiscordWebhookService],
    controllers: [DiscordController],
    exports: [DiscordWebhookService],
})
export class WebhookModule {}
