/**
 * Interface for service authentication responses
 */
interface ServiceAuth {
  redirectUrl: string;  // URL to redirect the user for service authentication
}

export type {
  ServiceAuth
};
