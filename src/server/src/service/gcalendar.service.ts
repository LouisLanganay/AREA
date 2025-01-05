import { Service, Event } from '../../../shared/Workflow';
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
