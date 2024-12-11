import { BadRequestException, Injectable } from '@nestjs/common';
import fetch from 'node-fetch'; // Importation de node-fetch
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Méthode pour échanger le code d'autorisation contre des tokens
  async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ) {
    const tokenUrl = 'https://discord.com/api/oauth2/token';

    // Corps de la requête pour échanger le code contre des tokens
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      scope: 'identify email',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to get tokens from Discord');
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  }

  // Méthode pour récupérer les informations du compte Discord de l'utilisateur
  async getUserInfo(accessToken: string) {
    const userInfoUrl = 'https://discord.com/api/v10/users/@me';

    const response = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Discord');
    }

    const data = await response.json();

    return data;
  }

  async getUserGuilds(accessToken: string): Promise<any> {
    const userGuildsUrl = 'https://discord.com/api/v10/users/@me/guilds';

    const response = await fetch(userGuildsUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user guilds from Discord');
    }

    const data = await response.json();

    return data;
  }

  // Méthode pour écrire dans un channel Discord
  async sendMessageToChannel(
    channelId: string,
    message: string,
    userBddId: string,
  ): Promise<void> {
    const sendMessageUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;

    const accessToken = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userBddId, provider: 'discord' } },
      select: { accessToken: true },
    });

    if (!accessToken) {
      throw new BadRequestException('Access token not found');
    }

    const response = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Discord channel');
    }
  }

  async getRedirectUrl(): Promise<string> {
    // Return l'url d'autehenfication de Discord
    const base = 'https://discord.com/oauth2/authorize';
    const params = new URLSearchParams({
      client_id: this.configService.get<string>('DISCORD_CLIENT_ID'),
      response_type: 'code',
      permissions: '8',
      integration_type: '0',
      scope: 'bot applications.commands identify email',
      redirect_uri: `${this.configService.get<string>('IP_FRONT_REDIRECT')}services`,
    });
    console.log(
      'Redirecting to Discord OAuth:',
      `${base}?${params.toString()}`,
    );
    return `${base}?${params.toString()}`;
  }

  async discordCallback(code: string, req: any): Promise<any> {
    console.log('Discord OAuth callback received:', code);
    if (!code) {
      throw new BadRequestException('Code or userId is missing');
    }

    console.log(
      'DISCORD_CLIENT_ID:',
      this.configService.get<string>('DISCORD_CLIENT_ID'),
    );
    console.log(
      'DISCORD_CLIENT_SECRET:',
      this.configService.get<string>('DISCORD_CLIENT_SECRET'),
    );
    console.log(
      'IP_REDIRECT:',
      `${this.configService.get<string>('IP_REDIRECT')}auth/discord/callback`,
    );

    const tokens = await this.exchangeCodeForTokens(
      code,
      this.configService.get<string>('DISCORD_CLIENT_ID'),
      this.configService.get<string>('DISCORD_CLIENT_SECRET'),
      `${this.configService.get<string>('IP_REDIRECT')}auth/discord/callback`,
    );

    console.log('tokens:', tokens);

    const userData = await this.getUserInfo(tokens.access_token);
    const userBddId = req.user.id;
    const email: string = userData.email;
    console.log('User data email:', email);

    if (!email) {
      throw new Error('Email not found in the Discord token response.');
    }

    await this.storeTokens(
      userBddId,
      userData.id,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
    );

    return { message: 'Tokens stored in the database' };
  }

  // Méthode pour stocker les tokens dans la base de données
  async storeTokens(
    userBddId: string,
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    provider: string = 'discord',
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000); // Calculer la date d'expiration du token
    const newToken: Prisma.TokenUncheckedCreateInput = {
      provider,
      userId,
      accessToken,
      refreshToken,
      expiresAt,
    };

    const user = await this.prisma.user.findUnique({
      where: { id: userBddId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.token.upsert({
      where: { userId_provider: { userId: userBddId, provider: 'discord' } },
      update: newToken,
      create: newToken,
    });
  }
}
