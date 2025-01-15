import { Service, Event, FieldGroup } from '../../../shared/Workflow';
import { BadRequestException } from '@nestjs/common';
// src/services/CalendarService.ts
import { google } from 'googleapis';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as process from 'node:process';
import { Cron } from '@nestjs/schedule';

export class CalendarService {
  private calendar: any;
  private readonly prismaService: PrismaService = new PrismaService();
  private readonly userService: UsersService = new UsersService(
    this.prismaService,
  );
  private tokenIsSet: boolean = false;

  constructor() {
    // Initialisez l'authentification Google ici
  }

  async setToken(userId: string) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    const accessToken = await this.getAccessToken(userId);

    if (!accessToken) {
      throw new BadRequestException('Access token not found');
    }

    oAuth2Client.setCredentials({
      access_token: accessToken.accessToken,
      refresh_token: accessToken.refreshToken,
    });

    this.calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  }

  private async getAccessToken(userId: string) {
    return await this.userService.getTokenService(userId, 'gcalendar');
  }

  // Méthode pour ajouter un événement
  async addEvent(calendarId: string, event: any, userId: string): Promise<any> {
    try {
      await this.setToken(userId);
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });
      return response.data;
    } catch (error: any) {
      console.error(
        'Error adding event to Google Calendar:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to add event to Google Calendar');
    }
  }

  async startWatch(userId: string, workflowId: string, calendarId: string) {
    await this.setToken(userId);
    const ipRedirect = process.env.IP_BACK;

    const createWebHook = await this.userService.createWebhook(userId, {
      workflowId,
      channelId: calendarId,
      service: 'gcalendar',
    });
    if (!createWebHook) {
      return false;
    }
    const url = `${ipRedirect}/webhooks/${createWebHook.id}`;
    const watchResponse = await this.calendar.events.watch({
      calendarId: calendarId,
      requestBody: {
        id: createWebHook.id, // ID unique pour le channel
        type: 'webhook',
        address: url,
        token: process.env.SECRET_WEBHOOK,
      },
    });
    const listResponse = await this.calendar.events.list({
      calendarId: calendarId,
      showDeleted: true,
    });
    if (!listResponse) return false;

    // const expiration = new Date(watchResponse.data.expiration / 100);
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
    const syncToken = await this.getSyncToken(listResponse, calendarId);
    await this.userService.updateWebhook(userId, createWebHook.id, {
      expiration,
      params: {
        syncToken,
      },
    });
    return false;
  }

  async getSyncToken(listResponse: any, calendarId: string) {
    let token = listResponse.data.nextSyncToken;
    while (listResponse.data.nextPageToken && !token) {
      listResponse = await this.calendar.events.list({
        calendarId,
        pageToken: listResponse.data.nextPageToken,
        showDeleted: true,
      });
      token = listResponse.data.nextSyncToken;
    }
    return token;
  }

  @Cron('0 0 * * *')
  async dayliWebhookCheck() {
    const now = new Date();
    const dateToOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      const webhooks = await this.prismaService.webhook.findMany({
        where: {
          expiration: {
            lte: dateToOneDay,
          },
          service: 'gcalendar',
        },
      });

      for (const webhook of webhooks) {
        await this.startWatch(
          webhook.id,
          webhook.workflowId,
          webhook.channelId,
        );
        await this.prismaService.webhook.delete({
          where: {
            id: webhook.id,
          },
        });
      }
    } catch (error) {
      console.error('Error checking webhooks:', error);
    }
  }

  async getEventsTypeWithSyncToken(webhook) {
    await this.setToken(webhook.userId);
    const listResponse = await this.calendar.events.list({
      calendarId: webhook.channelId,
      syncToken: webhook.params.syncToken,
    });
    await this.prismaService.webhook.update({
      where: {
        id: webhook.id,
      },
      data: {
        params: {
          syncToken: listResponse.data.nextSyncToken,
        },
      },
    });
    console.log('Events:', listResponse.data.items[0]);
    const actionNode = await this.prismaService.node.findFirst({
      where: {
        workflowId: webhook.workflowId,
        type: 'action',
      },
    });
    console.log(listResponse.data);
    const status = listResponse.data.items[0].status;
    let finalStatus = '';
    if (status === 'cancelled') {
      finalStatus = 'cancelled';
    }
    if (status === 'confirmed') {
      const updated = new Date(listResponse.data.items[0].updated);
      const created = new Date(listResponse.data.items[0].created);
      const diff = Math.abs(updated.getTime() - created.getTime());
      console.log(diff);
      if (diff < 1000) {
        finalStatus = 'created';
      } else {
        finalStatus = 'updated';
      }
    }
    console.log('Status:', finalStatus);
    if (finalStatus === '') return false;
    if (
      finalStatus === 'cancelled' &&
      actionNode.id_node === 'listenDeleteEventGcalendar'
    )
      return true;
    if (
      finalStatus === 'created' &&
      actionNode.id_node === 'listenCreateEventGcalendar'
    )
      return true;
    return (
      finalStatus === 'updated' &&
      actionNode.id_node === 'listenUpdateEventGcalendar'
    );
  }
}

export const ListenCreateEventGcalendar: Event = {
  type: 'action',
  id_node: 'listenCreateEventGcalendar',
  name: 'Listen Create Event Google Calendar',
  description: 'Listen Create Event Google Calendar',
  serviceName: 'gcalendar',
  fieldGroups: [
    {
      id: 'calendar_details',
      name: 'Calendar Information',
      description: 'Information about the Calendar',
      type: 'group',
      fields: [
        //set calendar
        {
          id: 'calendar',
          type: 'string',
          required: true,
          description: 'Calendar ID',
          value: 'primary',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;
    const workflowId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'workflow_id')?.value;

    const eventGroup = parameters.find(
      (group) => group.id === 'calendar_details',
    );

    if (!eventGroup) {
      console.error('Event details group not found');
      throw new BadRequestException('Event details are missing');
    }
    const calendar = eventGroup.fields.find((field) => field.id === 'calendar');
    const calendarService = new CalendarService(); // Assurez-vous que ce service est correctement implémenté
    await calendarService.startWatch(userId, workflowId, calendar.value);
    return false;
  },
};

export const ListenDeleteEventGcalendar: Event = {
  type: 'action',
  id_node: 'listenDeleteEventGcalendar',
  name: 'Listen Delete Event Google Calendar',
  description: 'Listen Delete Event Google Calendar',
  serviceName: 'gcalendar',
  fieldGroups: [
    {
      id: 'calendar_details',
      name: 'Calendar Information',
      description: 'Information about the Calendar',
      type: 'group',
      fields: [
        //set calendar
        {
          id: 'calendar',
          type: 'string',
          required: true,
          description: 'Calendar ID',
          value: 'primary',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;
    const workflowId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'workflow_id')?.value;

    const eventGroup = parameters.find(
      (group) => group.id === 'calendar_details',
    );

    if (!eventGroup) {
      console.error('Event details group not found');
      throw new BadRequestException('Event details are missing');
    }
    const calendar = eventGroup.fields.find((field) => field.id === 'calendar');
    const calendarService = new CalendarService(); // Assurez-vous que ce service est correctement implémenté
    await calendarService.startWatch(userId, workflowId, calendar.value);
    return false;
  },
};

export const ListenUpdateEventGcalendar: Event = {
  type: 'action',
  id_node: 'listenUpdateEventGcalendar',
  name: 'Listen Update Event Google Calendar',
  description: 'Listen Update Event Google Calendar',
  serviceName: 'gcalendar',
  fieldGroups: [
    {
      id: 'calendar_details',
      name: 'Calendar Information',
      description: 'Information about the Calendar',
      type: 'group',
      fields: [
        //set calendar
        {
          id: 'calendar',
          type: 'string',
          required: true,
          description: 'Calendar ID',
          value: 'primary',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;
    const workflowId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'workflow_id')?.value;

    const eventGroup = parameters.find(
      (group) => group.id === 'calendar_details',
    );

    if (!eventGroup) {
      console.error('Event details group not found');
      throw new BadRequestException('Event details are missing');
    }
    const calendar = eventGroup.fields.find((field) => field.id === 'calendar');
    const calendarService = new CalendarService(); // Assurez-vous que ce service est correctement implémenté
    await calendarService.startWatch(userId, workflowId, calendar.value);
    return false;
  },
};

// src/events/EventAddGoogleCalendar.ts

export const EventAddGoogleCalendar: Event = {
  type: 'reaction',
  id_node: 'addGoogleCalendarEvent',
  name: 'Add Google Calendar Event',
  description: 'Adds a new event to Google Calendar',
  serviceName: 'gcalendar',
  fieldGroups: [
    {
      id: 'event_details',
      name: 'Event Details',
      description: 'Details of the Google Calendar event',
      type: 'group',
      fields: [
        {
          id: 'calendarId',
          type: 'string',
          required: false,
          description:
            'The ID of the calendar to add the event to (default: primary)',
          value: 'primary',
        },
        {
          id: 'summary',
          type: 'string',
          required: true,
          description: 'Title of the event',
        },
        {
          id: 'location',
          type: 'string',
          required: false,
          description: 'Location of the event',
        },
        {
          id: 'description',
          type: 'string',
          required: false,
          description: 'Description of the event',
        },
        {
          id: 'startDateTime',
          type: 'string',
          required: true,
          description: 'Start date and time of the event (RFC3339 format)',
        },
        {
          id: 'TimeZone',
          type: 'select',
          required: true,
          description: 'Time zone',
          value: 'Europe/Paris',
          options: [
            { label: 'UTC', value: 'UTC' },
            { label: 'Europe/London', value: 'Europe/London' },
            { label: 'Europe/Paris', value: 'Europe/Paris' },
            { label: 'Europe/Berlin', value: 'Europe/Berlin' },
            { label: 'Europe/Moscow', value: 'Europe/Moscow' },
            { label: 'America/New_York', value: 'America/New_York' },
            { label: 'America/Chicago', value: 'America/Chicago' },
            { label: 'America/Denver', value: 'America/Denver' },
            { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
            { label: 'America/Toronto', value: 'America/Toronto' },
            { label: 'America/Sao_Paulo', value: 'America/Sao_Paulo' },
            { label: 'America/Vancouver', value: 'America/Vancouver' },
            { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
            { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
            { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
            { label: 'Asia/Dubai', value: 'Asia/Dubai' },
            { label: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong' },
            { label: 'Asia/Seoul', value: 'Asia/Seoul' },
            { label: 'Australia/Sydney', value: 'Australia/Sydney' },
            { label: 'Australia/Melbourne', value: 'Australia/Melbourne' },
          ],
        },
        {
          id: 'endDateTime',
          type: 'string',
          required: true,
          description: 'End date and time of the event (RFC3339 format)',
        },
        {
          id: 'attendees',
          type: 'string',
          required: false,
          description: 'Comma-separated list of attendee emails',
        },
        {
          id: 'reminders',
          type: 'string',
          required: false,
          description:
            'JSON string of reminders (e.g., [{"method":"email","minutes":1440},{"method":"popup","minutes":10}])',
        },
      ],
    },
  ],
  execute: async (parameters: FieldGroup[]) => {
    const calendarService = new CalendarService(); // Assurez-vous que ce service est correctement implémenté
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    const eventGroup = parameters.find((group) => group.id === 'event_details');

    if (!eventGroup) {
      console.error('Event details group not found');
      throw new BadRequestException('Event details are missing');
    }

    const calendarIdField = eventGroup.fields.find(
      (field) => field.id === 'calendarId',
    );
    const summaryField = eventGroup.fields.find(
      (field) => field.id === 'summary',
    );
    const locationField = eventGroup.fields.find(
      (field) => field.id === 'location',
    );
    const descriptionField = eventGroup.fields.find(
      (field) => field.id === 'description',
    );
    const startDateTimeField = eventGroup.fields.find(
      (field) => field.id === 'startDateTime',
    );
    const TimeZone = eventGroup.fields.find(
      (field) => field.id === 'startTimeZone',
    );
    const endDateTimeField = eventGroup.fields.find(
      (field) => field.id === 'endDateTime',
    );
    const attendeesField = eventGroup.fields.find(
      (field) => field.id === 'attendees',
    );
    const remindersField = eventGroup.fields.find(
      (field) => field.id === 'reminders',
    );

    if (
      !summaryField ||
      !startDateTimeField ||
      !TimeZone ||
      !endDateTimeField
    ) {
      console.error('Missing required event fields');
      throw new BadRequestException('Required event fields are missing');
    }

    const calendarId = calendarIdField?.value || 'primary';
    const summary = summaryField.value;
    const location = locationField?.value;
    const description = descriptionField?.value;
    const startDateTime = startDateTimeField.value;
    const timeZone = TimeZone.value;
    const endDateTime = endDateTimeField.value;
    const attendees = attendeesField?.value
      ? attendeesField.value.split(',').map((email) => email.trim())
      : [];
    let reminders = undefined;
    if (remindersField?.value) {
      try {
        reminders = JSON.parse(remindersField.value);
      } catch (e) {
        console.error('Invalid reminders JSON', e);
        throw new BadRequestException('Invalid reminders format');
      }
    }

    const event = {
      summary,
      location,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone,
      },
      attendees: attendees.map((email: string) => ({ email })),
      reminders: reminders
        ? { useDefault: false, overrides: reminders }
        : { useDefault: true },
    };

    try {
      await calendarService.addEvent(calendarId, event, userId);
      console.log('Event added successfully');
    } catch (error) {
      console.error('Failed to add event:', error);
      throw new BadRequestException('Failed to add event to Google Calendar');
    }
  },
};

export const gcalendarService: Service = {
  id: 'gcalendar',
  name: 'Google Calendar',
  description: 'Google Calendar service',
  Event: [],
  image: 'https://www.svgrepo.com/show/353803/google-calendar.svg',
  loginRequired: true,
  auth: {
    uri: '/auth/google/redirect/gcalendar',
    callback_uri: '/auth/google/callback/gcalendar',
  },
};
