import { Injectable, BadRequestException } from '@nestjs/common';
import fetch from 'node-fetch';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TwitchAuthService {
    constructor(private prisma: PrismaService) {}

    /**
     * Génère l'URL d'authentification Twitch
     * @returns {string} L'URL de redirection vers Twitch
     */
    generateAuthUrl(): string {
        const baseUrl = "https://id.twitch.tv/oauth2/authorize";
        const clientId = process.env.TWITCH_CLIENT_ID;
        const redirectUri = '[REDIRECT_URI]';
        const scopes = [
            'user:read:email',
            'chat:read',
            'chat:edit',
            'channel:read:subscriptions',
            'user:write:chat',
            'user:bot',
        ].join(' ');

        const url = `${baseUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

        console.log('Twitch auth URL generated:', url);
        return url;
    }

    /**
     * Échange le code d'authentification contre un token et stocke le token en BDD
     * @param authCode Le code d'authentification renvoyé par Twitch (req.query.code)
     * @param userId L'ID de l'utilisateur dans ta BDD
     */
    async getAccessToken(authCode: string, userId: string): Promise<void> {
        console.log('TWITCH: Exchanging code for tokens');
        const tokenUrl = "https://id.twitch.tv/oauth2/token"

        const body = new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID!,
            client_secret: process.env.TWITCH_CLIENT_SECRET!,
            code: authCode,
                grant_type: 'client_credentials',
            redirect_uri: process.env.TWITCH_REDIRECT_URI!,
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body,
            });

            const responseBody = await response.text();

            if (!response.ok) {
                console.error('Failed to exchange code for tokens:', response.status, response.statusText);
                console.error('Response body:', responseBody);
                throw new BadRequestException('Failed to exchange code for tokens');
            }

            const data = JSON.parse(responseBody);
            console.log('Twitch Tokens received:', data);

            await this.prisma.token.create({
                data: {
                    provider: 'twitch',
                    userId,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresAt: new Date(Date.now() + data.expires_in * 1000),
                },
            });

        } catch (error) {
            console.error('Error exchanging code for tokens:', error.message);
            throw new BadRequestException({
                err_code: 'TWITCH_TOKEN_EXCHANGE_FAILED',
                details: error.message,
            });
        }
    }
}
