import {Service, Event} from '../../../shared/Workflow';
import {DiscordService} from '../app-discord/discord-app.service';
import {FieldGroup} from '../../../shared/Users';
import {PrismaService} from '../prisma/prisma.service';
import {ConfigService} from '@nestjs/config';
import {HttpService} from '@nestjs/axios';
import {UsersService} from '../users/users.service';
import {firstValueFrom} from 'rxjs';
import {HttpException, HttpStatus} from "@nestjs/common";
import axios from 'axios';

const prismaService = new PrismaService();
const configService = new ConfigService();
const httpService = new HttpService();

class TwitchServices {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService,
        private httpService: HttpService,
    ) {
    }

    private readonly userService: UsersService = new UsersService(
        this.prismaService,
    );


    async getToken(userId: string) {
        const accessToken = await this.prismaService.token.findUnique({
            where: {userId_provider: {userId, provider: 'twitch'}},
            select: {accessToken: true},
        });


        return accessToken;
    }

    async listenToNewFollowers(broadcasterUserId: string, userId: string, callback_uri: string) {
        const token = await this.getToken(userId);
        const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';

        const body = {
            type: 'stream.online',
            version: '1',
            condition: {
                broadcaster_user_id: broadcasterUserId,
            },
            transport: {
                method: 'webhook',
                callback: callback_uri,
                secret: process.env.TWITCH_CLIENT_SECRET,
            },
        };
        console.log('Body:', body);
        const headers = {
            'Client-Id': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
        };

        const {data} = await firstValueFrom(
            this.httpService.post(url, body, {headers}),
        );

        console.log('Subscription created for stream.online', data);
    }

    async getBroadcasterIdByLogin(login: string, accessToken: string): Promise<string> {
        try {
            const response = await axios.get('https://api.twitch.tv/helix/users', {
                params: {
                    login,
                },
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userData = response.data.data;

            if (userData.length === 0) {
                throw new HttpException('Streamer not found', HttpStatus.NOT_FOUND);
            }

            return userData[0].id; // Retourne l'ID du premier utilisateur trouvé
        } catch (error) {
            console.error('Error fetching broadcaster ID:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data?.message || 'Failed to fetch broadcaster ID',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async startWatchStream(userId: string, workflowId: string, broadcasterUserId: string) {
        const ipRedirect = process.env.IP_BACK;
        const token = await this.getToken(userId);

        if (!broadcasterUserId) {
            console.error('broadcasterUserId not found');
            return false;
        }

        console.log('userName =  ', broadcasterUserId);
        broadcasterUserId = await this.getBroadcasterIdByLogin(broadcasterUserId, token.accessToken);
        console.log('broadcasterUserId =  ', broadcasterUserId);

        const createWebHook = await this.userService.createWebhook(userId, {
            workflowId,
            channelId: broadcasterUserId,
            service: 'twitch',
        });
        if (!createWebHook) {
            return false;
        }
        console.log('Webhook id created:', createWebHook.id);
        const url = `${ipRedirect}/webhooks/twitch/${createWebHook.id}`;
        await this.listenToNewFollowers(broadcasterUserId, userId, url);
        console.log('Watch response:');
    }

    async writeInBroadcasterChat(
        userId: string,
        broadcasterName: string,
        userName: string,
        message: string
    ): Promise<void> {
        try {
            const token = await this.getToken(userId);
            const broadcasterId = await this.getBroadcasterIdByLogin(
                broadcasterName,
                token.accessToken
            );
            const twitchUserId = await this.getBroadcasterIdByLogin(
                userName,
                token.accessToken
            );
            const urlChat = `https://api.twitch.tv/helix/chat/messages`;
            const body = {
                broadcaster_id: broadcasterId,
                sender_id: twitchUserId,
                message,
            };
            const config = {
                headers: {
                    'Client-Id': process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json',
                },
            };
            const { data } = await firstValueFrom(
                this.httpService.post(urlChat, body, config)
            );
            console.log('Message sent:', data);
        } catch (error) {
            console.error('Error sending message to chat:', error.message);
            throw new Error('Failed to send message to broadcaster chat');
        }
    }
}

//New follower to broadcasterUserId
export const EventStreamerOnline: Event = {
    type: 'action',
    id_node: 'streamerOnline',
    name: 'streamer Online',
    description: 'Check if a streamer is online',
    serviceName: 'twitch',
    fieldGroups: [
        {
            id: 'streamerDetails',
            name: 'Streamer Details',
            description: 'Information about the streamer',
            type: 'group',
            fields: [
                {
                    id: 'broadcasterName',
                    type: 'string',
                    required: true,
                    description: 'The streamer NAME',
                },
            ],
        },
    ],
    check: async (parameters: FieldGroup[]) => {
        const broadcasterDetails = parameters.find(
            (param) => param.id === 'streamerDetails',
        );
        if (!broadcasterDetails) {
            console.error('broadcaster details not found');
            return false;
        }

        const userId = parameters
            .find((group) => group.id === 'workflow_information')
            ?.fields.find((field) => field.id === 'user_id')?.value;
        const workflowId = parameters
            .find((group) => group.id === 'workflow_information')
            ?.fields.find((field) => field.id === 'workflow_id')?.value;

        const broadcasterUserId = broadcasterDetails?.fields.find(
            (field) => field.id === 'broadcasterName',
        )?.value;
        const twitchService = new TwitchServices(prismaService, configService, httpService);
        await twitchService.startWatchStream(userId, workflowId, broadcasterUserId);
        return false;
    }
}

export const EventLogTerm: Event = {
    type: 'reaction',
    id_node: 'logTerm',
    name: 'Log Term',
    description: 'Log a term',
    serviceName: 'twitch',
    fieldGroups: [
        {
            id: 'termDetails',
            name: 'Term Details',
            description: 'Information about the term',
            type: 'group',
            fields: [
                {
                    id: 'term',
                    type: 'string',
                    required: true,
                    description: 'The term to log',
                },
            ],
        },
    ],
    execute: async (parameters: FieldGroup[]) => {
        const termDetails = parameters.find(
            (param) => param.id === 'termDetails',
        );
        if (!termDetails) {
            console.error('term details not found');
            return false;
        }

        const term = termDetails?.fields.find(
            (field) => field.id === 'term',
        )?.value;

        console.log('Term logged:', term);
        return true;
    }
}

export const EventWriteInBroadcasterChat: Event = {
    type: 'reaction',
    id_node: 'writeInBroadcasterChat',
    name: 'Write in Broadcaster Chat (admin only)',
    description: 'Write a message in the broadcaster chat if you have access',
    serviceName: 'twitch',
    fieldGroups: [
        {
            id: 'messageDetails',
            name: 'Message Details',
            description: 'Information about the message',
            type: 'group',
            fields: [
                {
                    id: 'message',
                    type: 'string',
                    required: true,
                    description: 'The message to write',
                },
                {
                    id: 'broadcasterName',
                    type: 'string',
                    required: true,
                    description: 'The streamer NAME',
                },
                {
                    id: 'userName',
                    type: 'string',
                    required: true,
                    description: 'The user NAME',
                }
            ],
        },
    ],

    execute: async (parameters: FieldGroup[]) => {
        const messageDetails = parameters.find(
            (param) => param.id === 'messageDetails',
        );
        if (!messageDetails) {
            console.error('message details not found');
            return false;
        }

        const message = messageDetails?.fields.find(
            (field) => field.id === 'message',
        )?.value;
        const broadcasterName = messageDetails?.fields.find(
            (field) => field.id === 'broadcasterName',
        )?.value;
        const userName = messageDetails?.fields.find(
            (field) => field.id === 'userName',
        )?.value;
        const userId = parameters
            .find((group) => group.id === 'workflow_information')
            ?.fields.find((field) => field.id === 'user_id')?.value;

        const twitchService = new TwitchServices(prismaService, configService, httpService);
        await twitchService.writeInBroadcasterChat(userId, broadcasterName, userName, message);
        console.log('Message written in chat:', message, 'by', userName, 'in', broadcasterName);

        return true;
    }
}

export const twitchService: Service = {
    id: 'twitch',
    name: 'Twitch',
    description: 'Service to interact with Twitch API',
    loginRequired: true,
    image: 'https://raw.githubusercontent.com/get-icon/geticon/fc0f660daee147afb4a56c64e12bde6486b73e39/icons/twitch.svg',
    Event: [],
    auth: {
        uri: '/auth/twitch/redirect',
        callback_uri: '/auth/twitch/callback',
    },
}