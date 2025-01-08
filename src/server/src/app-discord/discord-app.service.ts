import { BadRequestException, Injectable } from '@nestjs/common';
import fetch from 'node-fetch'; // Importation de node-fetch
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Client, GatewayIntentBits, Guild } from 'discord.js';

@Injectable()
export class DiscordService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  public messages: string[] = [];
  public newMembers: string[] = [];

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
      code: code,
      redirect_uri: redirectUri,
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
    user_id: string,
  ): Promise<void> {
    const sendMessageUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;

    const userBddId = user_id;
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
        Authorization: `Bot ${this.configService.get<string>('DISCORD_BOT_TOKEN')}`,
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
      redirect_uri: `[REDIRECT_URI]`,
    });
    console.log(
      'Redirecting to Discord OAuth:',
      `${base}?${params.toString()}`,
    );
    return `${base}?${params.toString()}`;
  }

  async discordCallback(code: string, req: any): Promise<any> {
    console.log('Discord OAuth callback received:', code);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deletedTokens = await this.prisma.token.deleteMany(); // Supprime toutes les entrées de la table `Token`
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
      this.configService.get<string>('DISCORD_REDIRECT_URI_SERVICE'),
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

  async banUser(
    guildId: string,
    userId: string,
    reason: string = 'Aucune raison spécifiée',
  ): Promise<string> {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds, // Pour accéder aux guildes (serveurs)
        GatewayIntentBits.GuildMembers, // Pour gérer les membres de la guilde
      ],
    });

    const BOT_TOKEN = this.configService.get<string>('DISCORD_BOT_TOKEN');

    if (!BOT_TOKEN) {
      throw new BadRequestException('Le token du bot Discord est manquant.');
    }

    try {
      console.log('Bot connecté avec succès.');
      await client.login(BOT_TOKEN);
      console.log('Bot connecté avec succès.');
      // Récupérer la guilde (serveur)
      console.log('guildId:', guildId);
      const guilds = await client.guilds.fetch();
      console.log('Guildes accessibles :');
      guilds.forEach((g) => console.log(`ID: ${g.id} | Nom: ${g.name}`));
      const guild: Guild = await client.guilds.fetch(guildId);

      if (!guild) {
        throw new BadRequestException(
          `Serveur introuvable avec l'ID : ${guildId}`,
        );
      }

      // Bannir l'utilisateur
      await guild.members.kick(userId);
      console.log(`Utilisateur ${userId} banni avec succès.`);

      return `L'utilisateur ${userId} a été banni avec succès pour la raison : "${reason}".`;
    } catch (error) {
      console.error("Erreur lors du bannissement de l'utilisateur :", error);
      throw new BadRequestException(
        `Impossible de bannir l'utilisateur : ${error.message}`,
      );
    } finally {
      // Déconnexion propre du bot après traitement
      console.log('Déconnexion du bot...');
      await client.destroy();
      console.log('Bot déconnecté.');
    }
  }

  async listenToChannel(
    channelId: string,
    lookingFor: string,
    user_id: string,
  ): Promise<boolean> {
    const userBddId = user_id;

    console.log('User Bdd Id:', userBddId);
    console.log('Channel ID:', channelId);
    console.log('Looking for:', lookingFor);
    const accessToken = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userBddId, provider: 'discord' } },
      select: { accessToken: true },
    });

    if (!accessToken) {
      throw new BadRequestException('Access token not found');
    }

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.on('messageCreate', async (message) => {
      if (message.channel.id === channelId) {
        // console.log('Message received:', message);
        if (message.content.includes(lookingFor)) {
          // console.log('Message found:', message);
          this.messages.push(message.content);
          return true;
        }
      }
    });

    if (this.messages.length > 0) {
      console.log('Messages found:', this.messages);
      this.messages = [];
      return true;
    }

    client.login(this.configService.get<string>('DISCORD_BOT_TOKEN'));
    return false;
  }

  async listenToNewMembers(guildId: string, user_id: string): Promise<boolean> {
    console.log('New members:');
    const userBddId = user_id;

    console.log('User Bdd Id:', userBddId);
    console.log('Guild ID:', guildId);
    const accessToken = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userBddId, provider: 'discord' } },
      select: { accessToken: true },
    });

    if (!accessToken) {
      throw new BadRequestException('Access token not found');
    }

    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    client.on('guildMemberAdd', async (member) => {
      if (member.guild.id === guildId) {
        console.log('New member:', member.user.username);
        this.newMembers.push(member.user.username);
        return true;
      }
    });

    if (this.newMembers.length > 0) {
      console.log('New members found:', this.newMembers);
      this.newMembers = [];
      return true;
    }

    client.login(this.configService.get<string>('DISCORD_BOT_TOKEN'));
    return false;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newToken: Prisma.TokenUncheckedCreateInput = {
      provider,
      userId,
      accessToken,
      refreshToken,
      expiresAt,
    };
    const users = await this.prisma.user.findMany();

    // Affiche les utilisateurs dans la console
    console.log('Liste des utilisateurs:', users);
    console.log('User Bdd Id:', userBddId);

    const user = await this.prisma.user.findUnique({
      where: { id: userBddId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = await this.prisma.token.upsert({
      where: {
        userId_provider: { userId, provider },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
      },
      create: {
        provider,
        accessToken,
        refreshToken,
        expiresAt,
        userId: userBddId,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userToken = await this.prisma.user.update({
      where: { id: userBddId },
      data: {
        tokens: {
          connect: {
            id: token.id,
          },
        },
      },
    });

    const listUser = await this.prisma.user.findMany();
    console.log('Liste des utilisateurs:', listUser);
    const tokens = await this.prisma.token.findMany();
    console.log('Liste des tokens:', tokens);
  }
}
