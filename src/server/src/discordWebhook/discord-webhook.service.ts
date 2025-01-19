import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DiscordWebhookService {
  constructor(
    @InjectQueue('discord-webhook') private discordWebhookQueue: Queue,
  ) {}

  async queueMessage(content: string): Promise<void> {
    console.log('Queueing message for Discord webhook:', content);
    const job = await this.discordWebhookQueue.add('send-message', { content });
    console.log('Message queued:', job.id);
  }
}
