import { Controller, Post, Body } from '@nestjs/common';
import { DiscordWebhookService } from './discord-webhook.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@Controller('discord')
export class DiscordController {
    constructor(private readonly discordWebhookService: DiscordWebhookService) {}

    @Post('queue')
    @ApiOperation({ summary: 'Queue a message for the Discord webhook' })
    @ApiBody({
        type: String,
        examples: {
            example1: {
                summary: 'Example message',
                value: 'Hello, world!',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Message queued for Discord webhook',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request.',
    })
    async queueMessage(@Body('content') content: string) {
        await this.discordWebhookService.queueMessage(content);
        return { message: 'Message queued for Discord webhook' };
    }
}
