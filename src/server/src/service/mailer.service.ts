import { Service } from '../../../shared/Workflow';

export const MailerService: Service = {
  id: 'mailer',
  name: 'Mailer Service',
  description: 'Service to send emails',
  loginRequired: false,
  image: 'https://www.svgrepo.com/show/533194/mail-alt.svg',
  Event: [],
  enabled: false,
};
