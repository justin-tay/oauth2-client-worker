import { AuthConfiguration } from './AuthConfiguration';
import { ResourceServerContext } from './ResourceServerContext';
import getResourceServer from './getResourceServer';

interface GetResourceServerContextParams {
  url: URL;
  authConfiguration: AuthConfiguration;
}

const getResourceServerContext = (
  params: GetResourceServerContextParams,
): ResourceServerContext | undefined => {
  const { url, authConfiguration } = params;
  const resourceServer = getResourceServer({ url, authConfiguration });
  if (resourceServer) {
    const clientConfig =
      authConfiguration.clientRegistry[resourceServer.clientRegistrationId];
    const providerConfig =
      authConfiguration.providerRegistry[clientConfig.providerRegistrationId];
    return {
      clientRegistrationId: resourceServer.clientRegistrationId,
      providerRegistrationId: clientConfig.providerRegistrationId,
      resourceServer,
      clientConfig,
      providerConfig,
    };
  }
  return undefined;
};

export default getResourceServerContext;
