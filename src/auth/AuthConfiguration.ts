import { ClientRegistry } from './ClientRegistry';
import { ProviderRegistry } from './ProviderRegistry';
import { ResourceServer } from './ResourceServer';

export interface AuthConfiguration {
  providerRegistry: ProviderRegistry;
  clientRegistry: ClientRegistry;
  resourceServers: ResourceServer[];
}
