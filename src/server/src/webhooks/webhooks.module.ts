import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService, WorkflowService],
})
export class WebhooksModule {}
