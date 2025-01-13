import { Service } from '../../../shared/Workflow';

// faire classe avec méthodes à appeler dans les actions/reactions + authentification

export const OutlookService: Service = {
  id: 'outlook',
  name: 'Outlook Service',
  description: 'Service to send emails',
  loginRequired: false,
  image: 'https://www.svgrepo.com/show/533194/mail-alt.svg',
  Event: [],
  auth: {
    uri: '/auth/outlook/redirect',
    callback_uri: '/auth/outlook/callback',
  }
};
