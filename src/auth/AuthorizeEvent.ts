import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';

export interface AuthorizeEvent {
  idToken: string;
  clientRegistrationId: string;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
}
