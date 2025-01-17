import { Req, Controller, Param, Post, Get, Body, Res , Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Response } from 'express';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {
  }

  @Post(':id')
  async handleWebhook(@Param('id') id: string, @Req() req: any) {
    return this.webhooksService.handleWebhook(id, req.headers);
  }

  @Get(':id')
  async handleWebhookGet(@Param('id') id: string, @Req() req: any) {
    return this.webhooksService.handleWebhook(id, req.headers);
  }

  @Post('twitch/:webhookId')
  async handleTwitchWebhook(
      @Param('webhookId') webhookId: string,
      @Headers('Twitch-Eventsub-Message-Type') messageType: string,
      @Body() body: any,
      @Res() res: Response,
  ) {
    console.log('JE SUIS LA');
    return this.webhooksService.handleTwitchWebhook(
      webhookId,
      messageType,
      body,
      res,
    );
  }
}
