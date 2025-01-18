import { Service } from '../../../shared/Workflow';

export const MailerService: Service = {
  id: 'mailer',
  name: 'Mailer Service',
  description: 'This service allows you to send emails to your contacts',
  loginRequired: false,
  image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_(2020).svg',
  Event: [],
  enabled: true,
};
