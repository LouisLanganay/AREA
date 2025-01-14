import { Req, Controller, Param, Post, Res, Get } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':id')
  async handleWebhook(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    // OUTLOOK: Handle validation token
    const validationToken = req.query.validationToken;

    if (validationToken) {
      console.log('Validation token received:', validationToken);
      res.status(200).send(validationToken);
    } 


    return this.webhooksService.handleWebhook(id, req.headers);
  }

  @Get(':id')
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
