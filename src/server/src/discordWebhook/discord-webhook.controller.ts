import { Controller, Post, Body } from '@nestjs/common';
import { DiscordWebhookService } from './discord-webhook.service';

@Controller('discord')
export class DiscordController {
    constructor(private readonly discordWebhookService: DiscordWebhookService) {}

    @Post('queue')
    async queueMessage(@Body('content') content: string) {
        await this.discordWebhookService.queueMessage(content);
        return { message: 'Message queued for Discord webhook' };
    }
}
