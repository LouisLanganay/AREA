import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleWebhook(id: string, body: any) {
    // Handle webhook
    console.log('Webhook received:', id, body);

  }
}
