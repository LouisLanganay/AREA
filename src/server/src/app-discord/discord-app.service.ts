import {BadRequestException, Injectable} from '@nestjs/common';
import fetch from 'node-fetch';  // Importation de node-fetch
import { PrismaService } from '../prisma/prisma.service'
import {Prisma} from '@prisma/client';
import process from "node:process";


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

    async discordCallback(code: string, req:any): Promise<any> {
        console.log('Discord OAuth callback received:', code);
        if (!code) {
            throw new BadRequestException('Code or userId is missing');
        }

        const tokens = await this.exchangeCodeForTokens(
            code,
            process.env.DISCORD_CLIENT_ID,
            process.env.DISCORD_CLIENT_SECRET,
            `${process.env.IP_REDIRECT}auth/discord/redirect`
        );

        console.log('tokens:', tokens);

        const userData = await this.getUserInfo(tokens.access_token);
        const userBddId = req.user.id;
        const email: string = userData.email;
        console.log('User data email:', email);

        if (!email) {
            throw new Error("Email not found in the Discord token response.");
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
        }

        const user = await this.prisma.user.findUnique({
            where: {id: userBddId},
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        await this.prisma.token.upsert({
            where: {userId_provider: {userId: userBddId, provider: 'discord'}},
            update: newToken,
            create: newToken,
        });
    }
}
