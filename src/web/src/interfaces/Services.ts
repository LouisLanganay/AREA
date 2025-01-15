import { Event } from '@/interfaces/Workflows';

/**
 * Interface representing a service integration
 */
interface Service {
  id: string;                       // Unique identifier for the service
  name: string;                     // Display name of the service (e.g., "Slack")
  description: string;              // Brief description of the service (e.g., "Message")
  loginRequired: boolean;           // Whether authentication is required to use the service
  image?: string;                   // Optional URL to service's logo/icon
  Event?: Event[];                  // Optional array of events associated with the service
  enabled?: boolean;                // Optional flag indicating if service is active
  auth?: {
    uri: string;                    // Authentication endpoint (e.g., "api/auth/discord")
    callback_uri: string;           // OAuth callback endpoint (e.g., "api/auth/discord/callback")
  };
}

export type {
  Service
};
