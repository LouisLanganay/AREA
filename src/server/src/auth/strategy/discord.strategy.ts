import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import * as process from 'node:process';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    console.log('url: s', `${process.env.IP_REDIRECT}auth/discord/redirect`);
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${process.env.IP_REDIRECT}auth/discord/redirect`,
      scope: ['identify', 'email'], // Scopes demandés
    });
    console.log(
      'callbackURL: --' + `${process.env.IP_REDIRECT}auth/discord/redirect`,
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, avatar, email } = profile;
    return {
      id,
      username,
      avatar,
      email,
      accessToken,
      refreshToken,
    };
  }
}
