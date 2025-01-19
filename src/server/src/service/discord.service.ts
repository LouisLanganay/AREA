import { Service, Event } from '../../../shared/Workflow';
import { DiscordService } from '../app-discord/discord-app.service';
import { FieldGroup } from '../../../shared/Users';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

const prismaService = new PrismaService();
const configService = new ConfigService();
const httpService = new HttpService(); // Instanciez ou injectez si nécessaire
const discordServiceMethodes = new DiscordService(
  prismaService,
  configService,
  httpService,
);

export const EventjoinGuildDiscord: Event = {
  type: 'action',
  id_node: 'joinGuildDiscord',
  name: 'Join Guild',
  description: 'Join a Discord server',
  serviceName: 'discord',
  fieldGroups: [
    {
      id: 'guildDetails',
      name: 'Guild Details',
      description: 'Information about the Discord server',
      type: 'group',
      fields: [
        {
          id: 'guildId',
          type: 'string',
          required: true,
          description: 'The guild ID',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const guildDetails = parameters.find(
      (param) => param.id === 'guildDetails',
    );
    if (!guildDetails) {
      console.error('Guild details not found');
      return false;
    }

    const guildId = guildDetails?.fields.find(
      (field) => field.id === 'guildId',
    )?.value;
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    return await discordServiceMethodes.listenToNewMembers(guildId, userId);
  },
};

export const EventlistenMessageDiscord: Event = {
  type: 'action',
  id_node: 'listenMessageDiscord',
  name: 'listen Message',
  description: 'listen a message from a Discord channel',
  serviceName: 'discord',
  fieldGroups: [
    {
      id: 'channelDetails',
      name: 'Channel Details',
      description: 'Information about the Discord channel',
      type: 'group',
      fields: [
        {
          id: 'channelId',
          type: 'string',
          required: true,
          description: 'The channel ID',
        },
        {
          id: 'message',
          type: 'string',
          required: true,
          description: 'The message content',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const channelDetails = parameters.find(
      (param) => param.id === 'channelDetails',
    );
    if (!channelDetails) {
      console.error('Channel details not found');
      return false;
    }

    const channelId = channelDetails?.fields.find(
      (field) => field.id === 'channelId',
    )?.value;
    const message = channelDetails?.fields.find(
      (field) => field.id === 'message',
    )?.value;

    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;
    return await discordServiceMethodes.listenToChannel(
      channelId,
      message,
      userId,
    );
  },
};

export const EventnotifyUserDiscord: Event = {
  type: 'action',
  id_node: 'notifyUserDiscord',
  name: 'Notify User',
  description: 'Send a notification to a user',
  serviceName: 'discord',
  fieldGroups: [
    {
      id: 'userDetails',
      name: 'User Details',
      description: 'Information about the user to notify',
      type: 'group',
      fields: [
        {
          id: 'userId',
          type: 'string',
          required: true,
          description: 'The user ID',
        },
      ],
    },
  ],
  check: async () => {
    return false;
  },
};

export const EventsendMessageDiscord: Event = {
  type: 'reaction',
  id_node: 'sendMessageDiscord',
  name: 'Send Message',
  description: 'Send a message to a Discord channel',
  serviceName: 'discord',
  fieldGroups: [
    {
      id: 'channelDetails',
      name: 'Channel Details',
      description: 'Information about the Discord channel',
      type: 'group',
      fields: [
        {
          id: 'channelId',
          type: 'string',
          required: true,
          description: 'The channel ID',
        },
        {
          id: 'message',
          type: 'string',
          required: true,
          description: 'The message content',
        },
      ],
    },
  ],
  execute: (parameters: FieldGroup[]) => {

    console.log("Executing 'Send Message' reaction for Discord");
    const channelDetails = parameters.find(
      (param) => param.id === 'channelDetails',
    );

    if (!channelDetails) {
      console.error('Channel details not found');
      return false;
    }

    const channelId = channelDetails?.fields.find(
      (field) => field.id === 'channelId',
    )?.value;
    const message = channelDetails?.fields.find(
      (field) => field.id === 'message',
    )?.value;
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    console.log('userId', userId);
    if (channelId && message) {
      discordServiceMethodes.sendMessageToChannel(channelId, message, userId);
      return true;
    } else {
      console.error('Missing required parameters: channelId or message');
      return false;
    }
  },
};

export const EventBanUserDiscord: Event = {
  type: 'reaction',
  id_node: 'banUserDiscord',
  name: 'Ban User',
  description: 'Ban a user from a Discord server',
  serviceName: 'discord',
  fieldGroups: [
    {
      id: 'userDetails',
      name: 'User Details',
      description: 'Information about the user to ban',
      type: 'group',
      fields: [
        {
          id: 'guildId',
          type: 'string',
          required: true,
          description: 'The guild ID',
        },
        {
          id: 'userId',
          type: 'string',
          required: true,
          description: 'The user ID',
        },
        {
          id: 'reason',
          type: 'string',
          required: false,
          description: 'The reason for the ban',
        },
      ],
    },
  ],
  execute: (parameters: FieldGroup[]) => {
    console.log("Executing 'Ban User' reaction for Discord");
    const userDetails = parameters.find(
      (param) => param.id === 'channelDetails',
    );

    if (!userDetails) {
      console.error('User details not found');
      return false;
    }

    const userId = userDetails?.fields.find(
      (field) => field.id === 'userId',
    )?.value;
    const guildId = userDetails?.fields.find(
      (field) => field.id === 'guildId',
    )?.value;
    const reason = userDetails?.fields.find(
      (field) => field.id === 'reason',
    )?.value;

    if (userId) {
      discordServiceMethodes.banUser(guildId, userId, reason);
      return true;
    } else {
      console.error('Missing required parameter: userId');
      return false;
    }
  },
};

export const discordService: Service = {
  id: 'discord',
  name: 'Discord',
  description: 'Messaging service for gaming communities',
  loginRequired: true,
  image: 'https://www.svgrepo.com/show/353655/discord-icon.svg',
  Event: [],
  auth: {
    uri: '/auth/discord/redirect',
    callback_uri: '/auth/discord/callback',
  },
};
