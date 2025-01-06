import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DiscordAuthService {
  constructor(private httpService: HttpService) {}

  async exchangeCodeForTokensDiscord(code: string): Promise<any> {
    const tokenUrl = 'https://discord.com/api/oauth2/token';

    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    });

    try {
      const tokenResponse = await this.httpService.axiosRef.post(
        tokenUrl,
        tokenData.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: {
            username: process.env.DISCORD_CLIENT_ID,
            password: process.env.DISCORD_CLIENT_SECRET,
          },
        },
      );

      return tokenResponse.data; // access_token, refresh_token, etc.
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

    return response.data;
  }
  async loginDiscord(code: string) {
    const token = await this.exchangeCodeForTokensDiscord(code);
    return this.getUserInfoDiscord(token.access_token);
  }
}
