import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';

export interface EndSessionEvent {
  idToken: string;
  clientRegistrationId: string;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
}
