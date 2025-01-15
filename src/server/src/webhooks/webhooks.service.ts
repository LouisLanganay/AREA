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
        await this.gCalendarManager(webhook, body);
        return;
      }
      body['webhook'] = webhook;
      this.workflowService.runWorkflowById(webhook.workflowId, body);
    } catch (error) {
      console.error('Error finding workflow:', error);
    }
  }

  private async gCalendarManager(webhook: any, body: string) {
    const type = body['x-goog-resource-state'];
    if (type === 'sync') return;
    const tokenG = body['x-goog-channel-token'];
    if (!tokenG || tokenG != process.env.SECRET_WEBHOOK) return;
    const calendarService = new CalendarService();
    const execute = await calendarService.getEventsTypeWithSyncToken(webhook);
    //executer le nombre de fois que l'on veut
    console.log('execute', execute);
    for (let i = 0; i < execute; i++) {
      this.workflowService.runWorkflowById(webhook.workflowId, body);
    }
  }
}
