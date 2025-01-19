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
    const data = req.headers;
    return this.webhooksService.handleWebhook(id, data);
  }

  @Post('outlook/:id')
  async handleWebhookOutlook(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
    @Body() body: any,
  ) {
    const validationToken = req.query.validationToken;

    if (validationToken) {
      res.status(200).send(validationToken);
      return;
    }

    const clientState = body.value[0]?.clientState;
    if (clientState !== 'secureClientState') {
      console.error('Invalid clientState, ignoring notification');
      res.status(400).send('Invalid clientState');
      return;
    }

    try {
      const data = req.headers;
      data['body'] = body;
      res.status(200).send('Notification received and processed successfully');
      const result = await this.webhooksService.handleWebhook(id, data);
      return result;
    } catch (error) {
      console.error('Error processing notification:', error.message);
      res.status(500).send('Error processing notification');
    }
  }


  @Get('outlook/:id')
  async checkWebhook(@Param('id') id: string, @Req() req: any, @Res() res: any) {
      const validationToken = req.query.validationToken;

    if (validationToken) {
      res.status(200).send(validationToken);
    } else {
      console.error('No validation token found in request');
      res.status(400).send('Validation token is missing');
    }
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
