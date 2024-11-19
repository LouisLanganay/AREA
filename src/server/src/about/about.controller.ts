import { Controller, Get, Ip, Req } from '@nestjs/common';

@Controller()
export class AboutController {
  @Get('/about.json')
  getAbout(@Req() request: Request, @Ip() ip: string): any {
    return {
      client: {
        host: ip, // Remplacez par la valeur dynamique si nécessaire
      },
      server: {
        current_time: Math.floor(Date.now() / 1000), // Temps actuel en timestamp Unix
        services: [
          {
            name: 'facebook',
            actions: [
              {
                name: 'new_message_in_group',
                description: 'A new message is posted in the group',
              },
              {
                name: 'new_message_inbox',
                description: 'A new private message is received by the user',
              },
              {
                name: 'new_like',
                description: 'The user gains a like from one of their messages',
              },
            ],
            reactions: [
              {
                name: 'like_message',
                description: 'The user likes a message',
              },
            ],
          },
        ],
      },
    };
  }
}
