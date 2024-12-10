import {Controller, Get, Query, BadRequestException, Res} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import fetch from 'node-fetch';

@Controller('discord-app')
export class DiscordController {
    constructor(private prisma: PrismaService) {}

    private readonly clientId = "1314144283053522974";
    private readonly redirectUri = 'http://127.0.0.1:8080/auth/discord/callback';
    private readonly clientSecret = "7cwRsrTAddfOx996as3VuNnjISJE1YGe";
    private readonly discordUrl = "https://discord.com/oauth2/authorize?client_id=" + this.clientId + "&redirect_uri=" + this.redirectUri + "&response_type=code&scope=identify%20email";
    // "https://discord.com/oauth2/authorize?client_id=1314144283053522974&redirect_uri=http://127.0.0.1:8080/auth/discord/callback&response_type=code&scope=identify%20email"
    @Get('authorize')
    generateAuthUrl(@Res() res: Response): void {
        const base = 'https://discord.com/oauth2/authorize';
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            permissions: '8',
            integration_type: '0',
            redirect_uri: this.redirectUri,
            scope: 'bot applications.commands identify email',
        });

        console.log('Redirecting to Discord OAuth:', `${base}?${params.toString()}`);
        res.redirect(`${base}?${params.toString()}`);
    }

    @Get('callback')
    async handleDiscordCallback(
        @Query('code') code: string,
    ): Promise<any> {
        console.log('Discord OAuth callback received:', code);
        if (!code) {
            throw new BadRequestException('Code or userId is missing');
        }

        // Get the user ID from the session
        const userId = '1234';
        const tokenUrl = 'https://discord.com/api/oauth2/token';
        const body = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch token: ${response.statusText}`);
            }

            const tokens = await response.json();

            const expiresAt = new Date(Date.now() + tokens.expires_in * 1000); // Token expiration time in ms

            console.log('tokens:', tokens);
            console.log('Token expires at:', expiresAt);

            const accessToken = tokens.access_token;
            const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userData = await userResponse.json();
            const email: string = userData.email;
            console.log('User data email:', email);
            if (!email) {
                throw new Error("Email not found in the Discord token response.");
            }

            await this.prisma.token.upsert({
                where: {
                    userId_provider: { userId, provider: 'discord' }
                },
                update: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt,
                },
                create: {
                    userId,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt,
                    provider: 'discord',
                },
            });


            return 'Authentication successful! Your Discord account is now linked.';
        } catch (error) {
            console.error('Error during Discord OAuth process:', error);
            throw new BadRequestException('Authentication failed');
        }
    }
}
