import { AuthorizationContext } from './AuthorizationContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import handleUnauthorized from './handleUnauthorized';
import withBearer from './withBearer';

interface FetchWithBearerParams {
  request: Request;
  clientRegistrationId: string;
  authorizationContext: AuthorizationContext;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
  authorizationContexts: Map<string, AuthorizationContext>;
}

const fetchWithBearer = (params: FetchWithBearerParams) => {
  const {
    request,
    clientRegistrationId,
    authorizationContext,
    clientConfig,
    providerConfig,
    authorizationContexts,
  } = params;

  const requestWithBearer = withBearer(
    request,
    authorizationContext?.tokenResponse?.accessToken,
  );
  return fetch(requestWithBearer).then(
    (response) =>
      handleUnauthorized({
        clientRegistrationId,
        authorizationContext,
        clientConfig,
        providerConfig,
        authorizationContexts,
        request,
        response,
      }),
    (error) =>
      handleUnauthorized({
        clientRegistrationId,
        authorizationContext,
        clientConfig,
        providerConfig,
        authorizationContexts,
        request,
        error,
      }),
  );
};

export default fetchWithBearer;
