import { AuthorizationContext } from './AuthorizationContext';
import { ClientConfiguration } from './ClientConfiguration';
import { ProviderConfiguration } from './ProviderConfiguration';
import refreshToken from './refreshToken';
import withBearer from './withBearer';

interface HandleUnauthorizedParams {
  clientRegistrationId: string;
  authorizationContext: AuthorizationContext;
  clientConfig: ClientConfiguration;
  providerConfig: ProviderConfiguration;
  authorizationContexts: Map<string, AuthorizationContext>;
  request: Request;
  response?: Response;
  error?: any;
}

const UNAUTHORIZED_RESPONSE = new Response(
  JSON.stringify({ status: '401', title: 'Unauthorized' }),
  {
    status: 401,
    statusText: '401',
  },
);

const handleUnauthorized = (params: HandleUnauthorizedParams) => {
  const {
    clientRegistrationId,
    authorizationContext,
    clientConfig,
    providerConfig,
    authorizationContexts,
    request,
    response,
    error,
  } = params;
  if (
    (error || response?.statusText === '401') &&
    authorizationContext?.tokenResponse?.refreshToken
  ) {
    return refreshToken({
      clientRegistrationId,
      request: {
        refreshToken: authorizationContext?.tokenResponse?.refreshToken,
        authorizationRequest: authorizationContext.authorizationRequest,
      },
      clientConfig,
      providerConfig,
      authorizationContexts,
    }).then((refreshedAuthorizationContext) => {
      if (refreshedAuthorizationContext?.tokenResponse?.accessToken) {
        return fetch(
          withBearer(request, authorizationContext?.tokenResponse?.accessToken),
        );
      }
      return response ?? UNAUTHORIZED_RESPONSE;
    });
  }
  return response ?? UNAUTHORIZED_RESPONSE;
};

export default handleUnauthorized;
