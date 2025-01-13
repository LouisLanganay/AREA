import { Injectable, BadRequestException } from '@nestjs/common';
import fetch from 'node-fetch';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SpotifyAuthService {
    constructor(private prisma: PrismaService) {}

    generateAuthUrl(): string {
        const baseUrl = process.env.SPOTIFY_AUTH_URL || 'https://accounts.spotify.com/authorize';
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const scopes = ['user-read-email', 'playlist-read-private', 'user-read-private'].join(' ');

        const url = `${baseUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
            '[REDIRECT_URI]'
        )}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;

        console.log('Spotify auth URL generated:', url);
        return url;
    }

    async getAccessToken(authCode: string, userId: string): Promise<void> {
        console.log('SPOTIFY: Exchanging code for tokens');
        const tokenUrl = process.env.SPOTIFY_TOKEN_URL || 'https://accounts.spotify.com/api/token';

        const body = new URLSearchParams({
            client_id: process.env.SPOTIFY_CLIENT_ID!,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
            grant_type: 'authorization_code',
            code: authCode,
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

            console.log('Tokens received:', data);

            await this.prisma.token.create({
                data: {
                    provider: 'spotify',
                    userId,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresAt: new Date(Date.now() + data.expires_in * 1000),
                },
            });
        } catch (error) {
            console.error('Error exchanging code for tokens:', error.message);
            throw new BadRequestException({
                err_code: 'SPOTIFY_TOKEN_EXCHANGE_FAILED',
                details: error.message,
            });
        }
    }
}
