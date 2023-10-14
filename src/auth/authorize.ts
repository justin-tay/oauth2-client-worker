import { AuthorizationRequestContext } from './AuthorizationRequestContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import getAuthorizationRequest from './getAuthorizationRequest';
import getAuthorizationRequestUrl from './getAuthorizationRequestUrl';

interface AuthorizeParams {
  authorizationRequests: Map<string, AuthorizationRequestContext>;
  clientRegistrationId: string;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
}

const authorize = async (params: AuthorizeParams) => {
  const {
    authorizationRequests,
    clientRegistrationId,
    clientConfig,
    providerConfig,
  } = params;
  const authorizationRequest = getAuthorizationRequest();
  authorizationRequests.set(authorizationRequest.state, {
    authorizationRequest,
    clientRegistrationId,
  });
  const authorizationRequestUrl = await getAuthorizationRequestUrl(
    authorizationRequest,
    clientConfig,
    providerConfig,
  );
  console.log(
    'Redirecting to authorization endpoint: ',
    authorizationRequestUrl,
  );
  return new Response('Unauthorized', {
    headers: { Location: authorizationRequestUrl },
    statusText: '401',
    status: 401,
  });
};

export default authorize;
