import { ClientConfiguration } from './ClientConfiguration';

/**
 * Registry containing client configuration for each client registration id.
 */
export interface ClientRegistry {
  [clientRegistrationId: string]: ClientConfiguration;
}
