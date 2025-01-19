import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DiscordAuthService {
  constructor(private httpService: HttpService) {}

  async exchangeCodeForTokensDiscord(code: string): Promise<any> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';
    const tokenData = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      scope: 'identify email',
    });

    // console.log('Exchanging code for tokens:', tokenData.toString());
    console.log('Discord token url:', tokenData.toString());

    try {
      const tokenResponse = await this.httpService.axiosRef.post(
          tokenUrl,
          tokenData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
      );
      console.log('Discord token response:', tokenResponse.data);
      return tokenResponse.data; // { access_token, refresh_token, expires_in, ... }
    } catch (error) {
      console.error(
          'Error exchanging code for tokens:',
          error.response?.data || error.message,
      );
      throw new BadRequestException({
        err_code: 'DISCORD_TOKEN_EXCHANGE_FAILED',
        details: error.response?.data || error.message,
      });
    }
  }


  async getUserInfoDiscord(accessToken: string) {
    const userInfoUrl = 'https://discord.com/api/v10/users/@me';

    const response = await this.httpService.axiosRef.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Discord user info:', response.data);

    return response.data;
  }
  async loginDiscord(code: string) {
    console.log('Logging in with Discord code:', code);
    const token = await this.exchangeCodeForTokensDiscord(code);
    return this.getUserInfoDiscord(token.access_token);
  }
}
