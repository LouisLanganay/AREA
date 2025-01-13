import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { Cron } from '@nestjs/schedule';
import {
  CalendarService,
  gcalendarService,
} from '../service/gcalendar.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prismaService: PrismaService,
    private workflowService: WorkflowService,
  ) {}

  async handleWebhook(id: string, body: any) {
    try {
      const webhook = await this.prismaService.webhook.findUnique({
        where: { id },
      });
      if (!webhook || !webhook.workflowId) {
        return;
      }
      if (webhook.service === 'gcalendar') {
        const tokenG = body['x-goog-channel-token'];
        if (!tokenG || tokenG != process.env.SECRET_WEBHOOK) return;
      }
      body['webhook'] = webhook;
      console.log('webhook', body);
      this.workflowService.runWorkflowById(webhook.workflowId, body);
    } catch (error) {
      console.error('Error finding workflow:', error);
    }
  }
}
