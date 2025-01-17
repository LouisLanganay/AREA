import { Req, Controller, Param, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Handle webhook' })
  async handleWebhook(@Param('id') id: string, @Req() req: any) {
    return this.webhooksService.handleWebhook(id, req.headers);
  }
}
