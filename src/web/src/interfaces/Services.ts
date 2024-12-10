import { Event } from '@/interfaces/Workflows';

interface Service {
  id: string;
  name: string;                     // ex: "Slack"
  description: string;              // ex: "Message"
  loginRequired: boolean;           // ex: true
  image?: string;                   // ex: "https://slack.com/img/logos/slack-logo-horizontal.png"
  Event?: Event[];
  enabled?: boolean;
  auth?: {
    uri: string;                    // ex: "api/auth/discord"
    callback_uri: string;           // ex: "api/auth/discord/callback"
  };
}

export type {
  Service
};
