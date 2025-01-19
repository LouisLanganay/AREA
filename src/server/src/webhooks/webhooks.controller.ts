import { Req, Controller, Param, Post, Get, Body, Res , Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {
  }

  @Post(':id')
  @ApiOperation({ summary: 'Handle webhook with POST method' })
  async handleWebhook(@Param('id') id: string, @Req() req: any) {
    return this.webhooksService.handleWebhook(id, req.headers);
  }

  @Get(':id')
    @ApiOperation({ summary: 'Handle webhook with GET method' })
  async handleWebhookGet(@Param('id') id: string, @Req() req: any) {
    return this.webhooksService.handleWebhook(id, req.headers);
  }

  @ApiOperation({ summary: 'Handle Twitch webhook' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('twitch/:webhookId')
  async handleTwitchWebhook(
      @Param('webhookId') webhookId: string,
      @Headers('Twitch-Eventsub-Message-Type') messageType: string,
      @Body() body: any,
      @Res() res: Response,
  ) {
    return this.webhooksService.handleTwitchWebhook(
      webhookId,
      messageType,
      body,
      res,
    );
  }
}
