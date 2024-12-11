import { Service, Event } from '../../../shared/Workflow';
import { DiscordService } from '../app-discord/discord-app.service';
import {FieldGroup} from "../../../shared/Users";
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const prismaService = new PrismaService();
const configService = new ConfigService();
const discordServiceMethodes = new DiscordService(prismaService, configService);

export const EventgetMessageDiscord: Event = {
    type: "Action",
    id: "getMessageDiscord",
    name: "Get Message",
    description: "Retrieve a message from a Discord channel",
    parameters: [
        {
            id: "channelDetails",
            name: "Channel Details",
            description: "Information about the Discord channel",
            type: "group",
            fields: [
                { id: "channelId", type: "string", required: true, description: "The channel ID" }
            ]
        },
        {
            id: "messageDetails",
            name: "Message Details",
            description: "Information about the message to retrieve",
            type: "group",
            fields: [
                { id: "message", type: "string", required: true, description: "The message content" }
            ]
        }
        ],
    execute: () => {
        console.log("Executing 'Get Message' action for Discord");
        return true;
    }
}

export const EventnotifyUserDiscord: Event = {
    type: "Reaction",
    id: "notifyUserDiscord",
    name: "Notify User",
    description: "Send a notification to a user",
    parameters: [
    {
        id: "userDetails",
        name: "User Details",
        description: "Information about the user to notify",
        type: "group",
        fields: [
            { id: "userId", type: "string", required: true, description: "The user ID" }
        ]
    },
    {
        id: "notificationDetails",
        name: "Notification Details",
        description: "Details of the notification message",
        type: "group",
        fields: [
            { id: "message", type: "string", required: true, description: "The notification message" }
        ]
    }
    ],
    execute: () => {
        console.log("Executing 'Notify User' reaction for Discord");
        return false;
    }
}

export const EventsendMessageDiscord: Event = {
    type: "Reaction",
    id: "sendMessageDiscord",
    name: "Send Message",
    description: "Send a message to a Discord channel",
    parameters: [
        {
            id: "channelDetails",
            name: "Channel Details",
            description: "Information about the Discord channel",
            type: "group",
            fields: [
                { id: "channelId", type: "string", required: true, description: "The channel ID" }
            ]
        },
        {
            id: "messageDetails",
            name: "Message Details",
            description: "Details of the message to send",
            type: "group",
            fields: [
                { id: "message", type: "string", required: true, description: "The message content" }
            ]
        }
    ],
    execute: (parameters: FieldGroup[]) => {
        console.log("Executing 'Send Message' reaction for Discord");
        const channelId = parameters.find(param => param.id === "channelDetails")?.fields.find(field => field.id === "channelId")?.value;
        const message = parameters.find(param => param.id === "messageDetails")?.fields.find(field => field.id === "message")?.value;

        if (channelId && message) {
            discordServiceMethodes.sendMessageToChannel(channelId, message, "userId");
            return true;
        } else {
            console.error("Missing required parameters: channelId or message");
            return false;
        }
    }
}

export const discordService: Service = {
    id: "discord",
    name: "Discord",
    description: "Messaging service for teams",
    loginRequired: true,
    image: "https://discord.com/img/logo.png",
    Event: [],
    auth: {
        uri: "/auth/discord",
        callback_uri: "/auth/discord/callback"
    }
};
