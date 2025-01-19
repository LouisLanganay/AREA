import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ServiceRegister } from '../register.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceRegister: ServiceRegister) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({
    status: 200,
    description: 'Return all services',
    schema: {
      example: {
        id: 'discord',
        name: 'Discord',
        description: 'Messaging service for teams',
        loginRequired: true,
        image: 'https://www.svgrepo.com/show/353655/discord-icon.svg',
        Event: [
          {
            type: 'action',
            id_node: 'listenMessageDiscord',
            name: 'listen Message',
            description: 'listen a message from a Discord channel',
            serviceName: 'discord',
            fieldGroups: [
              {
                id: 'channelDetails',
                name: 'Channel Details',
                description: 'Information about the Discord channel',
                type: 'group',
                fields: [
                  {
                    id: 'channelId',
                    type: 'string',
                    required: true,
                    description: 'The channel ID',
                  },
                  {
                    id: 'message',
                    type: 'string',
                    required: true,
                    description: 'The message content',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })
  async getAllServices(@Req() req) {
    return this.serviceRegister.getAllServicesEnabled(req.user.id);
  }
}
