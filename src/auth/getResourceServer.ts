import { AuthConfiguration } from './AuthConfiguration';

interface GetResourceServerParams {
  url: URL;
  authConfiguration: AuthConfiguration;
}

function getResourceServer(params: GetResourceServerParams) {
  const { url, authConfiguration } = params;
  return authConfiguration.resourceServers.find((resourceServer) =>
    resourceServer.path.test(url.origin + url.pathname),
  );
}

export default getResourceServer;
