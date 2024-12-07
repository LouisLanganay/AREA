import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';  // Importation de node-fetch
import { PrismaService } from '../prisma/prisma.service';
import { Token } from '@prisma/client';


@Injectable()
export class DiscordService {
    constructor(private prisma: PrismaService) {}

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
            scope: 'identify email', // Tu peux ajuster les scopes selon tes besoins
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

    // Méthode pour stocker les tokens dans la base de données
    async storeTokens(
        userId: string,
        accessToken: string,
        refreshToken: string,
        expiresIn: number,
        provider: string = 'discord',
    ): Promise<Token> {
        const expiresAt = new Date(Date.now() + expiresIn * 1000); // Calculer la date d'expiration du token

        return await this.prisma.token.upsert({
            where: { userId_provider: { userId, provider } },
            update: {
                accessToken,
                refreshToken,
                expiresAt,
            },
            create: {
                userId,
                accessToken,
                refreshToken,
                expiresAt,
                provider,
            },
        });
    }
}
