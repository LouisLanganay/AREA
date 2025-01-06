import { Body, Controller, Param, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':id')
  async handleWebhook(@Param('id') id: string, @Body() body: any) {
    return this.webhooksService.handleWebhook(id, body);
  }
}
