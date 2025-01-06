import { Service, Event, FieldGroup } from '../../../shared/Workflow';

export const ListenEventGcalendar: Event = {
  type: 'action',
  id_node: 'listenEventGcalendar',
  name: 'Listen Event Google Calendar',
  description: 'Listen Event Google Calendar',
  serviceName: 'gcalendar',
  fieldGroups: [],
  check: async (parameters: FieldGroup[]) => {
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;
    const workflowId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'workflow_id')?.value;

    console.log('Checking Google Calendar event:', userId, workflowId);
    return false;
  },
};

export const gcalendarService: Service = {
  id: 'gcalendar',
  name: 'Google Calendar',
  description: 'Google Calendar service',
  Event: [ListenEventGcalendar],
  image: 'https://www.svgrepo.com/show/353803/google-calendar.svg',
  loginRequired: true,
  auth: {
    uri: '/auth/google/redirect/gcalendar',
    callback_uri: '/auth/google/callback/gcalendar',
  },
};
