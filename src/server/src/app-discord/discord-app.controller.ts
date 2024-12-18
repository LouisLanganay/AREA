import {Controller, Get, Body, Req, Post, Query, BadRequestException, Res} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {Response} from 'express';
import {AuthGuard} from '@nestjs/passport';
import {UseGuards} from '@nestjs/common';
import {DiscordService} from './discord-app.service';
import {ConfigService} from '@nestjs/config';

@Controller('discord-app')
export class DiscordController {
    constructor(
        private prisma: PrismaService,
        private readonly discordService: DiscordService,
        private configService: ConfigService,
    ) {}

    @Get('authorize')
    generateAuthUrl(@Res() res: Response): void {
        const base = 'https://discord.com/oauth2/authorize';
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.configService.get('DISCORD_CLIENT_ID'),
            permissions: '8',
            integration_type: '0',
            redirect_uri: 'http://127.0.0.1:8080/auth/discord/callback',
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
        return;
    }

    @Post('send-message')
    @UseGuards(AuthGuard('jwt'))
    async sendMessage(
        @Body('message') message: string,
        @Body('channelId') channelId: string,
        @Req() req: any,
    ) {
        await this.discordService.sendMessageToChannel(channelId, message, req);
        return;
    }

    @Post('listen-to-channel')
    @UseGuards(AuthGuard('jwt'))
    async listenToChannel(
        @Body('channelId') channelId: string,
        @Body('looking') lookingFor: string,
        @Req() req: any,
    ) {
        await this.discordService.listenToChannel(channelId, req, lookingFor);
        return;
    }

    @Post('banne-user')
    @UseGuards(AuthGuard('jwt'))
    async banneUser(
        @Body('guildId') guildId: string,
        @Body('userId') userId: string,
        @Body('reason') reason: string,
        @Req() req: any,
    ) {
        await this.discordService.banUser(guildId, userId, reason);
        return;
    }
}
