import {HttpStatus, Injectable, Param, Res} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { Response } from 'express';
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

  async handleTwitchWebhook(
      webhookId: string,
      messageType: string,
      body: any,
      res: Response,
  ) {
    // Exemple de logs pour voir ce qu'on reçoit
    console.log(`Webhook ${webhookId} received messageType: ${messageType}`, body);

    const webhook = await this.prismaService.webhook.findUnique({
      where: { id: webhookId },
    });

    if (messageType === 'webhook_callback_verification') {
      console.log(
        'Twitch is verifying the subscription. Challenge =',
        body.challenge,
      );
      return res.status(200).send(body.challenge);
    }

    // Gérer les notifications
    if (messageType === 'notification') {
      const { subscription, event } = body;
      console.log('Received event:', subscription.type, event);
      await this.workflowService.runWorkflowById(webhook.workflowId, body);
      return res.status(200).send('ok');
    }

    console.log('Unknown message type:', messageType);
  }
}
