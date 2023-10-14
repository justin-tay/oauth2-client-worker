import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import { ResourceServer } from './ResourceServer';

export interface ResourceServerContext {
  clientRegistrationId: string;
  providerRegistrationId: string;
  resourceServer: ResourceServer;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
}
