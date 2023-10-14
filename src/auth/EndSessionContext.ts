import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';

export interface EndSessionContext {
  url: URL;
  idToken: string;
  clientRegistrationId: string;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
}
