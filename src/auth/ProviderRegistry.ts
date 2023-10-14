import { ProviderConfiguration } from './ProviderConfiguration';

/**
 * Registry containing provider configuration for each provider registration id.
 */
export interface ProviderRegistry {
  [providerRegistrationId: string]: ProviderConfiguration;
}
