import { Req, Controller, Param, Post, Res, Get, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':id')
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
      console.log('Validation token received:', validationToken);
      res.status(200).send(validationToken);
      return;
    }

    console.log('==========recu============', id);
    console.log('body = ', body);

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
      console.log('Validation token received:', validationToken);
      res.status(200).send(validationToken);
    } else {
      console.error('No validation token found in request');
      res.status(400).send('Validation token is missing');
    }
  }
}
